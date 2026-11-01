/**
 * AxG Next-Gen Cloud AI Sales & Support Assistant Widget (v2.0-BETA)
 * Developed by Axelsson Graphics
 * 
 * Features:
 * - 100% Shadow DOM style encapsulation (zero CSS bleeding)
 * - Visual Product Cards & Horizontal Swipe Carousel
 * - 1-Click "Add to Cart" directly in chat (WooCommerce / Shopify)
 * - Multimodal Mobile Camera & Photo Upload (Client-side 800px auto-compression)
 * - Graphical Order Tracking Timeline (PostNord / DHL / DB Schenker)
 * - Direct WhatsApp Click-to-Chat Integration
 * - Mobile Virtual Keyboard Safe (Visual Viewport API)
 */

(function (window, document) {
    'use strict';

    if (window.AxgChatWidgetLoaded) return;
    window.AxgChatWidgetLoaded = true;

    // Default configuration
    const DEFAULT_CONFIG = {
        agent_id: '',
        slug: '',
        title: 'AxG AI Assistant',
        avatar: '',
        theme_color: '#06b6d4',
        language: 'sv',
        api_url: 'https://api.axelsson.graphics/v1/gateway',
        ajax_url: '',
        nonce: '',
        whatsapp_number: '',
        messenger_link: '',
        contact_email: 'support@axelsson.graphics',
        quick_questions: [],
        cur_product: null,
        is_woocommerce: true,
        enable_eye_tracking: true,
        enable_voice_input: true
    };

    class AxgChatWidget {
        constructor(userConfig = {}) {
            let pluginOpts = {};
            if (window.axgai_woo_settings) {
                pluginOpts = { ...window.axgai_woo_settings };
            } else if (window.axgai_settings) {
                pluginOpts = { ...window.axgai_settings };
            }
            if (pluginOpts.chat_title) pluginOpts.title = pluginOpts.chat_title;
            if (pluginOpts.color_theme) pluginOpts.theme_color = pluginOpts.color_theme;
            if (pluginOpts.avatar_url) pluginOpts.avatar = pluginOpts.avatar_url;
            if (typeof pluginOpts.enable_eye_tracking !== 'undefined') {
                pluginOpts.enable_eye_tracking = pluginOpts.enable_eye_tracking !== 0 && pluginOpts.enable_eye_tracking !== '0' && pluginOpts.enable_eye_tracking !== false;
            }
            if (typeof pluginOpts.enable_voice_input !== 'undefined') {
                pluginOpts.enable_voice_input = pluginOpts.enable_voice_input !== 0 && pluginOpts.enable_voice_input !== '0' && pluginOpts.enable_voice_input !== false;
            }
            this.config = Object.assign({}, DEFAULT_CONFIG, pluginOpts, window.AXG_WIDGET_CONFIG || {}, userConfig);
            this.isOpen = false;
            this.pendingImage = null; // { base64, previewUrl }
            this.sessionId = this.getOrCreateSessionId();
            this.history = this.loadHistory();
            this.init();
        }

        getOrCreateSessionId() {
            try {
                let sid = sessionStorage.getItem('axg_widget_sid');
                if (!sid) {
                    sid = 'axg_s_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
                    sessionStorage.setItem('axg_widget_sid', sid);
                }
                return sid;
            } catch (e) {
                return 'axg_s_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
            }
        }

        loadHistory() {
            try {
                return JSON.parse(sessionStorage.getItem('axg_chat_history') || '[]');
            } catch (e) {
                return [];
            }
        }

        saveHistory() {
            try {
                if (this.history.length > 50) this.history = this.history.slice(-50);
                sessionStorage.setItem('axg_chat_history', JSON.stringify(this.history));
            } catch (e) {}
        }

        init() {
            try {
                const storeSlug = this.config.slug || (this.config.agent_id || '').replace(/^axg-/, '') || window.location.hostname.replace(/^www\./, '').split('.')[0];
                const baseAgentApi = 'https://api.axelsson.graphics/v1';
                if (document.head && !document.head.querySelector('link[rel="ai-agent"]')) {
                    const agentLink = document.createElement('link');
                    agentLink.rel = 'ai-agent';
                    agentLink.type = 'application/json';
                    agentLink.href = `${baseAgentApi}/agent-shop?action=agent_shop&slug=${encodeURIComponent(storeSlug)}&site_url=${encodeURIComponent(window.location.origin)}`;
                    document.head.appendChild(agentLink);

                    const llmsLink = document.createElement('link');
                    llmsLink.rel = 'llms-txt';
                    llmsLink.type = 'text/plain';
                    llmsLink.href = `${baseAgentApi}/llms.txt?action=llms_txt&slug=${encodeURIComponent(storeSlug)}&site_url=${encodeURIComponent(window.location.origin)}`;
                    document.head.appendChild(llmsLink);
                }
            } catch (e) {}

            // Create root container
            this.container = document.createElement('div');
            this.container.id = 'axg-cloud-widget-root';
            document.body.appendChild(this.container);

            // Attach Shadow DOM for 100% CSS encapsulation
            this.shadow = this.container.attachShadow({ mode: 'open' });

            // Inject CSS and HTML structure
            this.shadow.innerHTML = this.getStyles() + this.getTemplate();

            // Cache DOM elements inside shadow
            this.bubble = this.shadow.getElementById('axg-bubble');
            this.eyesContainer = this.shadow.getElementById('axg-eyes-container');
            this.defaultIcon = this.shadow.getElementById('axg-default-icon');
            this.window = this.shadow.getElementById('axg-window');
            this.messagesContainer = this.shadow.getElementById('axg-messages');
            this.input = this.shadow.getElementById('axg-input');
            this.sendBtn = this.shadow.getElementById('axg-send-btn');
            this.micBtn = this.shadow.getElementById('axg-mic-btn');
            this.cameraBtn = this.shadow.getElementById('axg-camera-btn');
            this.fileInput = this.shadow.getElementById('axg-file-input');
            this.imagePreviewBar = this.shadow.getElementById('axg-image-preview-bar');
            this.imagePreviewImg = this.shadow.getElementById('axg-image-preview-img');
            this.imagePreviewCancel = this.shadow.getElementById('axg-image-preview-cancel');
            this.closeBtn = this.shadow.getElementById('axg-close-btn');
            this.waBtn = this.shadow.getElementById('axg-header-whatsapp');
            this.msgBtn = this.shadow.getElementById('axg-header-messenger');

            this.bindEvents();
            this.renderHistoryOrGreeting();
            try {
                if (sessionStorage.getItem('axg_chat_open') === '1') {
                    this.toggle(true);
                }
            } catch (e) {}
            this.checkExitIntent();
            this.checkCartAbandonmentNudge();
        }

        markAssistedSession() {
            try {
                document.cookie = 'axgai_assisted=1; path=/; max-age=604800; SameSite=Lax';
                if (this.sessionId) {
                    document.cookie = 'axgai_session_id=' + encodeURIComponent(this.sessionId) + '; path=/; max-age=604800; SameSite=Lax';
                }
            } catch (e) {}
        }

        getTranslations() {
            const lang = this.config.language || 'sv';
            const dict = {
                sv: {
                    placeholder: 'Ställ en fråga eller fota en produkt...',
                    greeting: 'Hej! 👋 Hur kan jag hjälpa dig idag? Fråga mig om produkter, storlekar eller din order.',
                    powered: 'Drivs av',
                    online: 'Svarar direkt',
                    send: 'Skicka',
                    whatsapp_tooltip: 'Fortsätt chatten i WhatsApp',
                    messenger_tooltip: 'Fortsätt chatten i Messenger',
                    order_status_title: 'Orderstatus',
                    order_received: 'Mottagen',
                    order_processing: 'Packas',
                    order_shipped: 'Skickad',
                    track_button: 'Spåra paket 📦',
                    add_to_cart: 'Lägg i varukorg',
                    added: '✓ Tillagd i varukorg!',
                    error_conn: 'Kunde inte nå assistenten. Försök igen om en stund.'
                },
                en: {
                    placeholder: 'Ask a question or snap a photo...',
                    greeting: 'Hello! 👋 How can I help you today? Ask about products, sizes or your order.',
                    powered: 'Powered by',
                    online: 'Replies instantly',
                    send: 'Send',
                    whatsapp_tooltip: 'Continue in WhatsApp',
                    messenger_tooltip: 'Continue in Messenger',
                    order_status_title: 'Order Status',
                    order_received: 'Received',
                    order_processing: 'Processing',
                    order_shipped: 'Shipped',
                    track_button: 'Track package 📦',
                    add_to_cart: 'Add to cart',
                    added: '✓ Added to cart!',
                    error_conn: 'Could not connect to assistant. Please try again.'
                },
                de: {
                    placeholder: 'Frage stellen oder Foto machen...',
                    greeting: 'Hallo! 👋 Wie kann ich Ihnen heute helfen? Fragen Sie nach Produkten oder Ihrer Bestellung.',
                    powered: 'Unterstützt von',
                    online: 'Antwortet sofort',
                    send: 'Senden',
                    whatsapp_tooltip: 'In WhatsApp fortsetzen',
                    messenger_tooltip: 'In Messenger fortsetzen',
                    order_status_title: 'Bestellstatus',
                    order_received: 'Eingegangen',
                    order_processing: 'In Bearbeitung',
                    order_shipped: 'Versandt',
                    track_button: 'Paket verfolgen 📦',
                    add_to_cart: 'In den Warenkorb',
                    added: '✓ Hinzugefügt!',
                    error_conn: 'Verbindungsfehler. Bitte versuchen Sie es später noch einmal.'
                }
            };
            return dict[lang] || dict.en;
        }

        getStyles() {
            const color = this.config.theme_color || '#06b6d4';
            return `
            <style>
                :host {
                    all: initial;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    font-size: 14px;
                    line-height: 1.5;
                    color: #1e293b;
                    box-sizing: border-box;
                    z-index: 9999999;
                }
                *, *:before, *:after { box-sizing: border-box; }

                /* Floating Bubble */
                #axg-bubble {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: ${color};
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0,0,0,0.1);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ffffff;
                    transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s;
                    z-index: 9999999;
                }
                #axg-bubble.axg-mascot-active {
                    width: 66px;
                    height: 66px;
                    background: transparent !important;
                    border-radius: 0;
                    box-shadow: none !important;
                    filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.22));
                }
                #axg-bubble:hover {
                    transform: scale(1.08);
                }
                #axg-bubble svg.axg-default-icon { width: 30px; height: 30px; fill: currentColor; }
                .axg-eyes-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    user-select: none;
                }
                .axg-mascot-svg {
                    width: 64px;
                    height: 64px;
                }
                .axg-pupil-group {
                    transition: transform 0.04s ease-out;
                }
                .axg-mic-btn.axg-listening {
                    color: #ef4444 !important;
                    animation: axgPulseMic 1.2s infinite;
                }
                @keyframes axgPulseMic {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    70% { transform: scale(1.15); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }

                /* Chat Window Container */
                #axg-window {
                    position: fixed;
                    bottom: 96px;
                    right: 24px;
                    width: 390px;
                    max-width: calc(100vw - 32px);
                    height: 600px;
                    max-height: calc(100vh - 120px);
                    background: #ffffff;
                    border-radius: 20px;
                    box-shadow: 0 16px 48px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.06);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    z-index: 9999999;
                    animation: axgFadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes axgFadeUp {
                    from { opacity: 0; transform: translateY(16px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                /* Mobile Fullscreen Mode */
                @media (max-width: 480px) {
                    #axg-window {
                        bottom: 0 !important;
                        right: 0 !important;
                        width: 100vw !important;
                        max-width: 100vw !important;
                        height: 100% !important;
                        max-height: 100% !important;
                        border-radius: 0 !important;
                    }
                    #axg-bubble {
                        bottom: 16px;
                        right: 16px;
                    }
                }

                /* Header */
                .axg-header {
                    background: linear-gradient(135deg, ${color}, #0f172a);
                    color: #ffffff;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-top-left-radius: 20px;
                    border-top-right-radius: 20px;
                }
                @media (max-width: 480px) {
                    .axg-header { border-radius: 0; }
                }
                .axg-header-left { display: flex; align-items: center; gap: 12px; }
                .axg-avatar {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    overflow: hidden;
                }
                .axg-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .axg-title-wrap { display: flex; flex-direction: column; }
                .axg-title { font-weight: 700; font-size: 15px; letter-spacing: -0.2px; }
                .axg-status { font-size: 11px; opacity: 0.9; display: flex; align-items: center; gap: 5px; }
                .axg-status-dot { width: 7px; height: 7px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 8px #22c55e; }
                .axg-header-actions { display: flex; align-items: center; gap: 8px; }
                .axg-icon-btn {
                    background: rgba(255, 255, 255, 0.15);
                    border: none;
                    color: #ffffff;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }
                .axg-icon-btn:hover { background: rgba(255, 255, 255, 0.3); }
                .axg-icon-btn svg { width: 18px; height: 18px; fill: currentColor; }
                .axg-wa-header-btn { background: #25D366 !important; }
                .axg-wa-header-btn:hover { background: #20ba59 !important; }

                /* Messages Body */
                .axg-messages {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    background: #f8fafc;
                }

                /* Quick Questions Pill Bar */
                .axg-quick-bar {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding-bottom: 4px;
                    scrollbar-width: none;
                }
                .axg-quick-bar::-webkit-scrollbar { display: none; }
                .axg-quick-pill {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 6px 12px;
                    font-size: 12px;
                    color: #334155;
                    white-space: nowrap;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                }
                .axg-quick-pill:hover {
                    background: #f1f5f9;
                    border-color: ${color};
                    color: ${color};
                }

                /* Message Bubbles */
                .axg-msg {
                    max-width: 85%;
                    padding: 12px 15px;
                    border-radius: 16px;
                    font-size: 13.5px;
                    line-height: 1.45;
                    word-break: break-word;
                    min-width: 0;
                }
                .axg-msg.axg-has-carousel {
                    max-width: 100% !important;
                    width: 100% !important;
                    box-sizing: border-box;
                    padding: 12px 10px 14px 10px;
                }
                .axg-msg-bot {
                    align-self: flex-start;
                    background: #ffffff;
                    color: #0f172a;
                    border: 1px solid #e2e8f0;
                    border-bottom-left-radius: 4px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                .axg-msg-user {
                    align-self: flex-end;
                    background: ${color};
                    color: #ffffff;
                    border-bottom-right-radius: 4px;
                }
                .axg-msg-user a { color: #ffffff !important; text-decoration: underline; }
                .axg-msg-bot a { color: ${color}; font-weight: 600; text-decoration: underline; }
                .axg-msg-img-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    margin-bottom: 8px;
                }
                .axg-msg-img-badge {
                    font-size: 10.5px;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.9);
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .axg-msg-img-user {
                    max-width: 100%;
                    max-height: 200px;
                    border-radius: 12px;
                    border: 2px solid rgba(255, 255, 255, 0.35);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    object-fit: cover;
                    display: block;
                }

                /* Typing Indicator */
                .axg-typing {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 18px;
                    border-bottom-left-radius: 4px;
                    width: fit-content;
                    margin: 6px 0;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    animation: axgFadeIn 0.25s ease-out;
                }
                .axg-typing-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #64748b;
                }
                .axg-typing-dots {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                }
                .axg-typing-dot {
                    width: 8px;
                    height: 8px;
                    min-width: 8px;
                    min-height: 8px;
                    flex-shrink: 0;
                    background: ${color};
                    border-radius: 50%;
                    display: inline-block;
                    animation: axgBlink 1.2s infinite ease-in-out both;
                }
                .axg-typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .axg-typing-dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes axgBlink {
                    0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
                    40% { opacity: 1; transform: scale(1.4); box-shadow: 0 0 8px ${color}; }
                }

                /* Product Carousel & Cards */
                .axg-carousel-wrapper {
                    position: relative;
                    width: 100%;
                    margin-top: 10px;
                }
                .axg-carousel {
                    display: flex;
                    gap: 12px;
                    overflow-x: auto;
                    overflow-y: hidden;
                    padding: 8px 10%;
                    scroll-snap-type: x mandatory;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    cursor: grab;
                    user-select: none;
                    -webkit-overflow-scrolling: touch;
                    scroll-behavior: smooth;
                }
                .axg-carousel::-webkit-scrollbar {
                    display: none;
                }
                .axg-carousel.axg-grabbing {
                    cursor: grabbing;
                    scroll-behavior: auto;
                    scroll-snap-type: none;
                }

                /* Nav arrows for Carousel */
                .axg-carousel-nav {
                    position: absolute;
                    top: 42%;
                    transform: translateY(-50%);
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #ffffff;
                    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.08);
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 10;
                    color: #0f172a;
                    transition: all 0.2s;
                    opacity: 0.95;
                }
                .axg-carousel-nav:hover {
                    opacity: 1;
                    transform: translateY(-50%) scale(1.08);
                    background: #f8fafc;
                }
                .axg-carousel-nav.prev {
                    left: -4px;
                }
                .axg-carousel-nav.next {
                    right: -4px;
                }
                .axg-carousel-nav.hidden {
                    display: none;
                }
                .axg-carousel-nav svg {
                    width: 18px;
                    height: 18px;
                    fill: currentColor;
                }

                /* Product Card Width & Alignment */
                .axg-product-card {
                    flex: 0 0 215px;
                    max-width: 82%;
                    scroll-snap-align: center;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.2s;
                }
                .axg-product-card:hover { transform: translateY(-2px); }

                /* Dots Pagination Below Carousel */
                .axg-carousel-dots {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    margin-top: 8px;
                }
                .axg-carousel-dots.hidden {
                    display: none;
                }
                .axg-carousel-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #cbd5e1;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }
                .axg-carousel-dot.active {
                    background: ${color};
                    width: 18px;
                    border-radius: 4px;
                }
                .axg-product-card:hover { transform: translateY(-2px); }
                .axg-card-img {
                    width: 100%;
                    height: 125px;
                    object-fit: contain;
                    background: #ffffff;
                    pointer-events: none;
                }
                .axg-card-body {
                    padding: 10px 12px;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    justify-content: space-between;
                }
                .axg-card-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 4px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-decoration: none;
                }
                .axg-card-price {
                    font-size: 14px;
                    font-weight: 800;
                    color: ${color};
                    margin-bottom: 8px;
                }
                .axg-card-btn {
                    background: ${color};
                    color: #ffffff;
                    border: none;
                    border-radius: 8px;
                    padding: 8px 10px;
                    font-size: 12px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    cursor: pointer;
                    transition: filter 0.2s;
                }
                .axg-card-btn:hover { filter: brightness(0.9); }
                .axg-card-btn.axg-btn-loading { opacity: 0.7; pointer-events: none; }
                .axg-card-btn.axg-btn-success { background: #10b981 !important; }
                .axg-card-btn.axg-btn-added {
                    background: #22c55e !important;
                    color: #ffffff !important;
                }

                /* Graphical Order Tracking Card */
                .axg-tracking-card {
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    border-radius: 14px;
                    padding: 14px;
                    margin-top: 6px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.04);
                }
                .axg-track-header {
                    font-weight: 700;
                    font-size: 14px;
                    margin-bottom: 12px;
                    display: flex;
                    justify-content: space-between;
                }
                .axg-timeline {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: relative;
                    margin: 16px 8px 16px 8px;
                }
                .axg-timeline:before {
                    content: '';
                    position: absolute;
                    top: 12px;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: #e2e8f0;
                    z-index: 1;
                }
                .axg-timeline-step {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }
                .axg-step-node {
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    background: #e2e8f0;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 700;
                }
                .axg-step-active .axg-step-node {
                    background: #22c55e;
                    color: #ffffff;
                    box-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
                }
                .axg-step-label { font-size: 10.5px; font-weight: 600; color: #64748b; }
                .axg-track-action {
                    display: block;
                    background: #0f172a;
                    color: #ffffff;
                    text-decoration: none;
                    text-align: center;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 12.5px;
                    font-weight: 700;
                    margin-top: 10px;
                    transition: background 0.2s;
                }
                .axg-track-action:hover { background: #334155; }

                /* Footer Input Bar */
                .axg-footer {
                    background: #ffffff;
                    border-top: 1px solid #e2e8f0;
                    padding: 10px 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .axg-image-preview-bar {
                    display: none;
                    align-items: center;
                    justify-content: space-between;
                    background: #f1f5f9;
                    border-radius: 8px;
                    padding: 4px 8px;
                }
                .axg-preview-thumb {
                    width: 40px;
                    height: 40px;
                    border-radius: 6px;
                    object-fit: cover;
                }
                .axg-input-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .axg-input {
                    flex: 1;
                    border: 1px solid #cbd5e1;
                    border-radius: 24px;
                    padding: 10px 16px;
                    font-size: 13.5px;
                    outline: none;
                    background: #f8fafc;
                    transition: border 0.2s, background 0.2s;
                }
                .axg-input:focus {
                    border-color: ${color};
                    background: #ffffff;
                }
                .axg-action-btn {
                    background: none;
                    border: none;
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    transition: all 0.2s;
                }
                .axg-action-btn:hover { background: #f1f5f9; color: ${color}; }
                .axg-send-btn {
                    background: ${color};
                    color: #ffffff;
                }
                .axg-send-btn:hover { background: ${color}; filter: brightness(1.1); color: #ffffff; }
                .axg-send-btn svg { width: 18px; height: 18px; fill: currentColor; }

                /* Branding */
                .axg-branding {
                    text-align: center;
                    font-size: 10.5px;
                    color: #94a3b8;
                    margin-top: 2px;
                }
                .axg-branding a { color: #64748b; text-decoration: none; font-weight: 600; }
            </style>
            `;
        }

        getTemplate() {
            const t = this.getTranslations();
            const color = this.config.theme_color || '#06b6d4';
            const waNumber = this.config.whatsapp_number ? this.config.whatsapp_number.replace(/[^0-9]/g, '') : '';
const msgLink = this.config.messenger_link || '';
            const msgButtonHtml = msgLink ? `
                <button id="axg-header-messenger" class="axg-icon-btn axg-wa-header-btn" title="${t.messenger_tooltip}">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.36 2 2 6.13 2 11.75c0 3.1 1.54 5.86 3.96 7.64v3.3L8.85 21.2a10.63 10.63 0 0 0 3.15.48c5.64 0 10-4.13 10-9.75S17.64 2 12 2zm1.09 13.91l-2.8-3-5.26 3 5.76-6.14 2.92 3.01 5.12-3.02-5.74 6.15z"/></svg>
                </button>
            ` : '';

            const waButtonHtml = waNumber ? `
                <button id="axg-header-whatsapp" class="axg-icon-btn axg-wa-header-btn" title="${t.whatsapp_tooltip}">
                    <svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 17.8c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.816 8.816 0 0 1-1.35-4.82c0-4.86 3.96-8.82 8.83-8.82 2.36 0 4.58.92 6.25 2.59a8.777 8.777 0 0 1 2.58 6.24c-.01 4.87-3.97 8.83-8.84 8.83zm4.84-6.61c-.27-.13-1.57-.77-1.81-.86-.24-.09-.42-.13-.59.13-.18.27-.69.86-.84 1.04-.15.18-.31.2-.58.07-.27-.13-1.14-.42-2.18-1.34-.81-.72-1.35-1.61-1.51-1.88-.16-.27-.02-.41.12-.55.12-.12.27-.31.4-.47.13-.15.18-.27.27-.44.09-.18.04-.34-.02-.47-.07-.13-.59-1.43-.81-1.96-.21-.51-.43-.44-.59-.45h-.51c-.18 0-.47.07-.71.34s-.94.92-.94 2.25c0 1.32.96 2.6 1.1 2.78.13.18 1.89 2.89 4.58 4.05.64.28 1.14.44 1.53.57.64.2 1.23.18 1.69.11.52-.08 1.57-.64 1.79-1.26.22-.62.22-1.16.15-1.27-.06-.12-.24-.19-.51-.32z"/></svg>
                </button>
            ` : '';

            return `
            <!-- Floating Bubble -->
            <div id="axg-bubble" role="button" aria-label="Open chat assistant">
                <div id="axg-eyes-container" class="axg-eyes-container" style="display:none;">
                    <svg class="axg-mascot-svg" width="36" height="36" viewBox="0 0 32 32" fill="none">
                      <path class="axg-mascot-bubble-path" d="M16 3C8.82 3 3 8.37 3 15C3 18.23 4.38 21.15 6.68 23.32L5 28.5L10.63 26.85C12.27 27.59 14.08 28 16 28C23.18 28 29 22.63 29 15C29 8.37 23.18 3 16 3Z" fill="${color}" />
                      <circle cx="11.5" cy="13.5" r="3.2" fill="white" />
                      <g class="axg-pupil-group">
                        <circle cx="11.5" cy="13.5" r="1.7" fill="#0f172a" />
                        <circle cx="12.2" cy="12.8" r="0.6" fill="white" />
                      </g>
                      <circle cx="20.5" cy="13.5" r="3.2" fill="white" />
                      <g class="axg-pupil-group">
                        <circle cx="20.5" cy="13.5" r="1.7" fill="#0f172a" />
                        <circle cx="21.2" cy="12.8" r="0.6" fill="white" />
                      </g>
                      <path d="M13.2 18.8 C 14.5 20.8, 17.5 20.8, 18.8 18.8" stroke="white" stroke-width="1.8" stroke-linecap="round" fill="none" />
                    </svg>
                </div>
                <svg id="axg-default-icon" class="axg-default-icon" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
            </div>

            <!-- Chat Window -->
            <div id="axg-window">
                <!-- Header -->
                <div class="axg-header">
                    <div class="axg-header-left">
                        <div class="axg-avatar">
                            ${this.config.avatar ? `<img src="${this.config.avatar}" alt="Avatar">` : '🤖'}
                        </div>
                        <div class="axg-title-wrap">
                            <span class="axg-title">${this.config.title}</span>
                            <span class="axg-status">
                                <span class="axg-status-dot"></span>
                                ${t.online}
                            </span>
                        </div>
                    </div>
                    <div class="axg-header-actions">
                        ${msgButtonHtml}
                        ${waButtonHtml}
                        <button id="axg-close-btn" class="axg-icon-btn" title="Close">
                            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        </button>
                    </div>
                </div>

                <!-- Messages -->
                <div id="axg-messages" class="axg-messages"></div>

                <!-- Footer Input Area -->
                <div class="axg-footer">
                    <!-- Image Preview Bar (Shown when camera snapped a photo) -->
                    <div id="axg-image-preview-bar" class="axg-image-preview-bar">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <img id="axg-image-preview-img" class="axg-preview-thumb" src="" alt="Selected photo">
                            <span style="font-size:12px; color:#475569; font-weight:600;">Foto bifogat</span>
                        </div>
                        <button id="axg-image-preview-cancel" class="axg-icon-btn" style="color:#ef4444; width:26px; height:26px;">
                            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        </button>
                    </div>

                    <div class="axg-input-row">
                        <!-- Camera / Photo Upload Button -->
                        ${this.config.enable_image_upload ? `
                        <button id="axg-camera-btn" class="axg-action-btn" title="Fota eller ladda upp bild">
                            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;"><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z"/></svg>
                        </button>
                        <input type="file" id="axg-file-input" accept="image/*" style="display:none;">
                        ` : ''}

                        <input type="text" id="axg-input" class="axg-input" placeholder="${t.placeholder}">

                        <button id="axg-mic-btn" class="axg-action-btn axg-mic-btn" type="button" title="Röstinmatning" style="display:none;">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" y1="19" x2="12" y2="22"></line>
                            </svg>
                        </button>

                        <button id="axg-send-btn" class="axg-action-btn axg-send-btn" title="${t.send}">
                            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                        </button>
                    </div>

                    <div class="axg-branding">
                        ${t.powered} <a href="https://axelsson.graphics" target="_blank" rel="noopener">AxG AI</a>
                    </div>
                </div>
            </div>
            `;
        }

        bindEvents() {
            // Toggle open / close
            this.bubble.addEventListener('click', () => this.toggle());
            this.closeBtn.addEventListener('click', () => this.toggle(false));

            // Send message on Enter
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            this.sendBtn.addEventListener('click', () => this.sendMessage());

            // Camera file input click
            if (this.cameraBtn) {
                this.cameraBtn.addEventListener('click', () => {
                    this.fileInput.click();
                });
            }

            // Camera file change handler (Downscale to 800px)
            if (this.fileInput) {
                this.fileInput.addEventListener('change', (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    this.compressAndSetImage(file);
                });
            }

            // Cancel image preview
            this.imagePreviewCancel.addEventListener('click', () => {
                this.clearPendingImage();
            });

            // WhatsApp button click in header
            if (this.waBtn) {
                this.waBtn.addEventListener('click', () => {
                    this.openWhatsApp();
                });
            }

// Messenger button click in header
            if (this.msgBtn) {
                this.msgBtn.addEventListener('click', () => {
                    this.openMessenger();
                });
            }
            // Mobile visualViewport handling
            if (window.visualViewport) {
                window.visualViewport.addEventListener('resize', () => {
                    if (this.isOpen && window.innerWidth <= 480) {
                        this.window.style.height = `${window.visualViewport.height}px`;
                    }
                });
            }

            this.updateToggleBtnState();
            this.initEyeTracking();
            this.initVoiceInput();
        }

        updateToggleBtnState() {
            const isMascotEnabled = !!this.config.enable_eye_tracking;
            if (isMascotEnabled) {
                this.bubble.classList.add('axg-mascot-active');
            } else {
                this.bubble.classList.remove('axg-mascot-active');
            }

            if (this.isOpen) {
                if (this.eyesContainer) this.eyesContainer.style.display = 'none';
                if (this.defaultIcon) this.defaultIcon.style.display = 'none';
            } else {
                if (isMascotEnabled) {
                    if (this.eyesContainer) this.eyesContainer.style.display = 'flex';
                    if (this.defaultIcon) this.defaultIcon.style.display = 'none';
                } else {
                    if (this.eyesContainer) this.eyesContainer.style.display = 'none';
                    if (this.defaultIcon) this.defaultIcon.style.display = 'block';
                }
            }
        }

        initEyeTracking() {
            if (!this.config.enable_eye_tracking) return;
            window.addEventListener('mousemove', (e) => {
                if (this.isOpen) {
                    const pupilGroups = this.shadow.querySelectorAll('.axg-pupil-group');
                    pupilGroups.forEach(group => group.style.transform = 'translate(0px, 0px)');
                    return;
                }

                const pupilGroups = this.shadow.querySelectorAll('.axg-pupil-group');
                pupilGroups.forEach(group => {
                    const rect = group.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;

                    const dx = e.clientX - centerX;
                    const dy = e.clientY - centerY;

                    const angle = Math.atan2(dy, dx);
                    const distance = Math.hypot(dx, dy);

                    const maxOffset = 1.4;
                    const offset = Math.min(distance / 20, maxOffset);

                    const pupilX = Math.cos(angle) * offset;
                    const pupilY = Math.sin(angle) * offset;

                    group.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
                });
            });
        }

        initVoiceInput() {
            if (!this.micBtn) return;
            if (!this.config.enable_voice_input) {
                this.micBtn.style.display = 'none';
                return;
            }
            this.micBtn.style.display = 'flex';

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                this.micBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    alert(this.config.language === 'sv' ? "Röstinmatning stöds inte i denna webbläsare." : "Voice input is not supported in this browser.");
                });
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;

            const lang = this.config.language || 'sv';
            if (lang === 'sv') recognition.lang = 'sv-SE';
            else if (lang === 'de') recognition.lang = 'de-DE';
            else recognition.lang = 'en-US';

            let isListening = false;

            recognition.onstart = () => {
                isListening = true;
                this.micBtn.classList.add('axg-listening');
                this.input.placeholder = lang === 'sv' ? 'Lyssnar...' : (lang === 'de' ? 'Hört zu...' : 'Listening...');
            };

            recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                this.input.value = transcript;
            };

            recognition.onerror = (event) => {
                console.warn("🎙️ Voice recognition error:", event.error);
                isListening = false;
                this.micBtn.classList.remove('axg-listening');
                const t = this.getTranslations();
                this.input.placeholder = t.placeholder;
            };

            recognition.onend = () => {
                isListening = false;
                this.micBtn.classList.remove('axg-listening');
                const t = this.getTranslations();
                this.input.placeholder = t.placeholder;
            };

            this.micBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (isListening) {
                    recognition.stop();
                } else {
                    try {
                        recognition.start();
                    } catch (err) {
                        console.warn("Voice start error:", err);
                    }
                }
            });
        }

        toggle(forceState) {
            this.isOpen = typeof forceState === 'boolean' ? forceState : !this.isOpen;
            this.window.style.display = this.isOpen ? 'flex' : 'none';
            this.updateToggleBtnState();
            try {
                sessionStorage.setItem('axg_chat_open', this.isOpen ? '1' : '0');
            } catch (e) {}
            if (this.isOpen) {
                this.scrollToBottom();
                setTimeout(() => this.input.focus(), 100);
            }
        }

        compressAndSetImage(file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxDim = 800; // Optimal 800px resolution for Gemini 2.5 Flash

                    if (width > height && width > maxDim) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else if (height > maxDim) {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                    this.pendingImage = {
                        base64: compressedBase64,
                        previewUrl: compressedBase64
                    };

                    this.imagePreviewImg.src = compressedBase64;
                    this.imagePreviewBar.style.display = 'flex';
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }

        clearPendingImage() {
            this.pendingImage = null;
            this.fileInput.value = '';
            this.imagePreviewBar.style.display = 'none';
            this.imagePreviewImg.src = '';
        }

        renderHistoryOrGreeting() {
            this.messagesContainer.innerHTML = '';
            const t = this.getTranslations();

            // Render Quick Questions if available
            if (this.config.quick_questions && this.config.quick_questions.length > 0) {
                const bar = document.createElement('div');
                bar.className = 'axg-quick-bar';
                this.config.quick_questions.forEach(q => {
                    if (!q) return;
                    const pill = document.createElement('div');
                    pill.className = 'axg-quick-pill';
                    pill.textContent = q;
                    pill.addEventListener('click', () => {
                        this.input.value = q;
                        this.sendMessage();
                    });
                    bar.appendChild(pill);
                });
                this.messagesContainer.appendChild(bar);
            }

            if (this.config.cur_product && this.config.cur_product.title) {
                const ctxBanner = document.createElement('div');
                ctxBanner.style.cssText = 'background:#eff6ff;border:1px solid #bfdbfe;color:#1e3a8a;padding:7px 11px;border-radius:8px;font-size:11.5px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:8px;';
                ctxBanner.innerHTML = `<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">📍 Du tittar på: <strong>${this.config.cur_product.title}</strong>${this.config.cur_product.price ? ' (' + this.config.cur_product.price + ')' : ''}</span>`;
                this.messagesContainer.appendChild(ctxBanner);
            }

            if (this.history.length > 0) {
                this.history.forEach(item => {
                    this.appendMessage(item.text, item.sender, item.image, false);
                });
            } else {
                // Default greeting
                let greetingText = t.greeting;
                if (this.config.cur_product) {
                    greetingText = `Jag ser att du tittar på **${this.config.cur_product.title}** (${this.config.cur_product.price}). Kan jag hjälpa dig med storlek, passform eller leverans?`;
                }
                this.appendMessage(greetingText, 'bot', null, true);
            }
        }

        appendMessage(text, sender, imageBase64 = null, save = true) {
            const div = document.createElement('div');
            div.className = `axg-msg axg-msg-${sender}`;

            // If user attached an image, display it inside message bubble with clear container & badge
            if (imageBase64) {
                const imgWrap = document.createElement('div');
                imgWrap.className = 'axg-msg-img-wrap';

                const badge = document.createElement('span');
                badge.className = 'axg-msg-img-badge';
                badge.textContent = '📷 Bifogad bild';

                const imgNode = document.createElement('img');
                imgNode.src = imageBase64;
                imgNode.className = 'axg-msg-img-user';

                imgWrap.appendChild(badge);
                imgWrap.appendChild(imgNode);
                div.appendChild(imgWrap);
            }

            // Parse Structured formats (Products, Order tracking, Markdown)
            const parsedNodes = this.parseContent(text);
            if (parsedNodes.classList.contains('axg-has-carousel')) {
                div.classList.add('axg-has-carousel');
            }
            div.appendChild(parsedNodes);

            this.messagesContainer.appendChild(div);
            this.scrollToBottom();

            if (save) {
                this.history.push({ text, sender, image: imageBase64 });
                this.saveHistory();
            }
        }

        showTyping() {
            if (this.shadow.getElementById('axg-typing-indicator')) return;
            this.typingStartTime = Date.now();
            const typing = document.createElement('div');
            typing.id = 'axg-typing-indicator';
            typing.className = 'axg-typing';
            const labelText = this.config.language === 'en' ? 'AI thinking...' : 'Svarar...';
            typing.innerHTML = `<span class="axg-typing-label">${labelText}</span><div class="axg-typing-dots"><div class="axg-typing-dot"></div><div class="axg-typing-dot"></div><div class="axg-typing-dot"></div></div>`;
            this.messagesContainer.appendChild(typing);
            this.scrollToBottom();
        }

        async hideTyping() {
            const minShowMs = 700;
            const elapsed = Date.now() - (this.typingStartTime || 0);
            if (elapsed < minShowMs) {
                await new Promise(r => setTimeout(r, minShowMs - elapsed));
            }
            const el = this.shadow.getElementById('axg-typing-indicator');
            if (el) el.remove();
        }

        scrollToBottom() {
            setTimeout(() => {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }, 30);
        }

        parseContent(rawText) {
            const container = document.createElement('div');
            if (!rawText) return container;

            let text = rawText;

            // 1. Check for Structured Order Tracking: :::order_tracking{...}:::
            const trackingRegex = /:::order_tracking(\{[\s\S]*?\}):::/g;
            let trackingMatch = trackingRegex.exec(text);
            let trackingCard = null;
            if (trackingMatch) {
                try {
                    const trackData = JSON.parse(trackingMatch[1]);
                    trackingCard = this.renderTrackingCard(trackData);
                    text = text.replace(trackingMatch[0], '');
                } catch (e) {
                    console.warn('Failed to parse order tracking JSON:', e);
                }
            }

            // 2. Check for Structured Products: :::product{...}:::
            const productRegex = /:::product(\{[\s\S]*?\}):::/g;
            const productList = [];
            let pMatch;
            while ((pMatch = productRegex.exec(text)) !== null) {
                try {
                    const pData = JSON.parse(pMatch[1]);
                    productList.push(pData);
                } catch (e) {}
            }
            // Strip products and collapse excessive newlines left behind
            text = text.replace(productRegex, '').replace(/(\n\s*){3,}/g, '\n\n').trim();

            // 3. Render clean Markdown text
            const textSpan = document.createElement('span');
            textSpan.innerHTML = this.markdownToHtml(text);
            container.appendChild(textSpan);

            // 4. Render Product Carousel if products were detected
            if (productList.length > 0) {
                container.classList.add('axg-has-carousel');
                const carouselWrap = this.renderProductCarousel(productList);
                container.appendChild(carouselWrap);
            }

            // 5. Append Tracking Card if detected
            if (trackingCard) {
                container.appendChild(trackingCard);
            }

            return container;
        }

        renderProductCarousel(productList) {
            const wrapper = document.createElement('div');
            wrapper.className = 'axg-carousel-wrapper';

            const carousel = document.createElement('div');
            carousel.className = 'axg-carousel';

            productList.forEach(prod => {
                carousel.appendChild(this.renderProductCard(prod));
            });

            // Dots pagination container
            const dotsBar = document.createElement('div');
            dotsBar.className = 'axg-carousel-dots';

            const dotEls = [];
            productList.forEach((_, idx) => {
                const dot = document.createElement('span');
                dot.className = `axg-carousel-dot${idx === 0 ? ' active' : ''}`;
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const cards = carousel.querySelectorAll('.axg-product-card');
                    if (cards[idx]) {
                        cards[idx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }
                });
                dotsBar.appendChild(dot);
                dotEls.push(dot);
            });

            // Prev & Next navigation buttons
            const prevBtn = document.createElement('button');
            prevBtn.className = 'axg-carousel-nav prev hidden';
            prevBtn.setAttribute('type', 'button');
            prevBtn.setAttribute('aria-label', 'Föregående produkt');
            prevBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';

            const nextBtn = document.createElement('button');
            nextBtn.className = 'axg-carousel-nav next';
            nextBtn.setAttribute('type', 'button');
            nextBtn.setAttribute('aria-label', 'Nästa produkt');
            nextBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';

            const updateNavState = () => {
                if (productList.length <= 1) {
                    dotsBar.classList.add('hidden');
                } else {
                    dotsBar.classList.remove('hidden');
                }

                const maxScroll = carousel.scrollWidth - carousel.clientWidth;
                if (carousel.clientWidth > 0 && maxScroll <= 4) {
                    prevBtn.classList.add('hidden');
                    nextBtn.classList.add('hidden');
                } else if (carousel.clientWidth > 0) {
                    if (carousel.scrollLeft <= 6) {
                        prevBtn.classList.add('hidden');
                    } else {
                        prevBtn.classList.remove('hidden');
                    }
                    if (carousel.scrollLeft >= maxScroll - 6) {
                        nextBtn.classList.add('hidden');
                    } else {
                        nextBtn.classList.remove('hidden');
                    }
                }

                // Determine active product card for dots
                const cards = carousel.querySelectorAll('.axg-product-card');
                if (cards.length > 0) {
                    const carouselCenter = carousel.scrollLeft + carousel.clientWidth / 2;
                    let closestIdx = 0;
                    let minDistance = Infinity;

                    cards.forEach((card, idx) => {
                        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                        const dist = Math.abs(carouselCenter - cardCenter);
                        if (dist < minDistance) {
                            minDistance = dist;
                            closestIdx = idx;
                        }
                    });

                    dotEls.forEach((dot, idx) => {
                        if (idx === closestIdx) {
                            dot.classList.add('active');
                        } else {
                            dot.classList.remove('active');
                        }
                    });
                }
            };

            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cardWidth = carousel.querySelector('.axg-product-card')?.offsetWidth || 215;
                carousel.scrollBy({ left: -(cardWidth + 12), behavior: 'smooth' });
                setTimeout(updateNavState, 250);
            });

            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cardWidth = carousel.querySelector('.axg-product-card')?.offsetWidth || 215;
                carousel.scrollBy({ left: cardWidth + 12, behavior: 'smooth' });
                setTimeout(updateNavState, 250);
            });

            carousel.addEventListener('scroll', updateNavState, { passive: true });

            // 1. Mouse Wheel Translation
            carousel.addEventListener('wheel', (e) => {
                if (carousel.scrollWidth > carousel.clientWidth) {
                    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                        carousel.scrollLeft += e.deltaY;
                        e.preventDefault();
                        updateNavState();
                    }
                }
            }, { passive: false });

            // 2. Mouse Grab-and-Drag
            let isDown = false;
            let startX = 0;
            let scrollStart = 0;
            let hasDragged = false;

            carousel.addEventListener('mousedown', (e) => {
                if (e.target.closest('button') || e.target.closest('a')) return;
                isDown = true;
                hasDragged = false;
                carousel.classList.add('axg-grabbing');
                startX = e.pageX - carousel.offsetLeft;
                scrollStart = carousel.scrollLeft;
            });

            const stopDrag = () => {
                if (!isDown) return;
                isDown = false;
                carousel.classList.remove('axg-grabbing');
                updateNavState();
                setTimeout(() => { hasDragged = false; }, 60);
            };

            window.addEventListener('mouseup', stopDrag);

            carousel.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - carousel.offsetLeft;
                const walk = (x - startX) * 1.5;
                if (Math.abs(walk) > 4) hasDragged = true;
                carousel.scrollLeft = scrollStart - walk;
            });

            // Prevent link/button clicks if user was actively dragging
            carousel.addEventListener('click', (e) => {
                if (hasDragged && (e.target.closest('a') || e.target.closest('.axg-card-btn'))) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, true);

            wrapper.appendChild(prevBtn);
            wrapper.appendChild(carousel);
            wrapper.appendChild(nextBtn);
            wrapper.appendChild(dotsBar);

            setTimeout(updateNavState, 150);
            setTimeout(updateNavState, 500);

            return wrapper;
        }

        renderProductCard(prod) {
            const card = document.createElement('div');
            card.className = 'axg-product-card';
            const t = this.getTranslations();

            const fallbackImg = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22 style=%22background:%23f1f5f9%22%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2214px%22 fill=%22%2364748b%22%3EBild saknas%3C/text%3E%3C/svg%3E";
            const imgUrl = prod.image || prod.image_url || prod.thumbnail || fallbackImg;
            const priceStr = prod.price || '';
            const prodUrl = prod.url || '#';
            const prodId = prod.id || '';

            card.innerHTML = `
                <img src="${imgUrl}" class="axg-card-img" alt="${prod.title}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';">
                <div class="axg-card-body">
                    <div>
                        <a href="${prodUrl}" target="_top" class="axg-card-title">${prod.title}</a>
                        <div class="axg-card-price">${priceStr}</div>
                    </div>
                    <button class="axg-card-btn" data-id="${prodId}" data-url="${prodUrl}">
                        <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;"><path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"/></svg>
                        <span>${t.add_to_cart}</span>
                    </button>
                </div>
            `;

            const titleLink = card.querySelector('.axg-card-title');
            if (titleLink) {
                titleLink.addEventListener('click', () => {
                    this.markAssistedSession();
                });
            }

            const btn = card.querySelector('.axg-card-btn');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.markAssistedSession();
                this.handleAddToCart(btn, prod);
            });

            return card;
        }

        async handleAddToCart(btn, prod) {
            this.markAssistedSession();
            const t = this.getTranslations();
            const originalText = btn.querySelector('span').textContent;
            btn.querySelector('span').textContent = 'Lägger till...';
            btn.disabled = true;

            try {
                // If on WooCommerce, run AJAX add-to-cart without reload
                if (this.config.is_woocommerce) {
                    let cartUrl = '/?wc-ajax=add_to_cart';
                    if (window.wc_add_to_cart_params && window.wc_add_to_cart_params.wc_ajax_url) {
                        cartUrl = window.wc_add_to_cart_params.wc_ajax_url.toString().replace('%%endpoint%%', 'add_to_cart');
                    } else if (window.axgai_woo_settings && window.axgai_woo_settings.ajax_url) {
                        cartUrl = window.axgai_woo_settings.ajax_url.replace('/wp-admin/admin-ajax.php', '/?wc-ajax=add_to_cart');
                    }

                    const reqData = new URLSearchParams({
                        product_id: (prod.id || '').toString(),
                        quantity: '1'
                    });

                    const res = await fetch(cartUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: reqData.toString()
                    });
                    
                    const data = await res.json();
                    
                    if (data.error && data.product_url) {
                        window.location.href = data.product_url;
                        return;
                    }

                    // Trigger standard WooCommerce fragment refresh
                    if (window.jQuery) {
                        window.jQuery(document.body).trigger('added_to_cart', [data.fragments, data.cart_hash, null]);
                    }
                } else if (window.Shopify) {
                    // Shopify native cart AJAX
                    await fetch('/cart/add.js', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: prod.id, quantity: 1 })
                    });
                } else {
                    // Fallback redirect to product or direct cart URL
                    if (prod.url) window.location.href = prod.url;
                }

                // Success visual state
                btn.classList.add('axg-btn-added');
                btn.querySelector('span').textContent = t.added;
                setTimeout(() => {
                    btn.classList.remove('axg-btn-added');
                    btn.querySelector('span').textContent = originalText;
                    btn.disabled = false;
                }, 2500);

            } catch (err) {
                console.warn('Add to cart fallback triggered:', err);
                if (prod.url) window.location.href = prod.url;
            }
        }

        renderTrackingCard(data) {
            const card = document.createElement('div');
            card.className = 'axg-tracking-card';
            const t = this.getTranslations();

            const isShipped = data.status === 'completed' || data.status === 'shipped';
            const isProcessing = data.status === 'processing' || isShipped;

            card.innerHTML = `
                <div class="axg-track-header">
                    <span>📦 Order #${data.order_id}</span>
                    <span style="color:#06b6d4;">${data.status_label || data.status}</span>
                </div>
                <div class="axg-timeline">
                    <div class="axg-timeline-step axg-step-active">
                        <div class="axg-step-node">✓</div>
                        <span class="axg-step-label">${t.order_received}</span>
                    </div>
                    <div class="axg-timeline-step ${isProcessing ? 'axg-step-active' : ''}">
                        <div class="axg-step-node">${isProcessing ? '✓' : '2'}</div>
                        <span class="axg-step-label">${t.order_processing}</span>
                    </div>
                    <div class="axg-timeline-step ${isShipped ? 'axg-step-active' : ''}">
                        <div class="axg-step-node">${isShipped ? '✓' : '3'}</div>
                        <span class="axg-step-label">${t.order_shipped}</span>
                    </div>
                </div>
                ${data.tracking_url ? `
                    <a href="${data.tracking_url}" target="_blank" rel="noopener" class="axg-track-action">
                        ${t.track_button} (${data.carrier || 'Spåra'})
                    </a>
                ` : ''}
            `;
            return card;
        }

        markdownToHtml(str) {
            if (!str) return '';
            let html = str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            // Bold **text**
            html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Italic *text*
            html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
            // Markdown Links [text](url)
            html = html.replace(/\[(.*?)\]\((https?:\/\/.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
            // Collapse excessive newlines
            html = html.replace(/(\n\s*){3,}/g, '\n\n');
            // Linebreaks
            html = html.replace(/\n/g, '<br>');
            return html;
        }

openMessenger() {
            if (!this.config.messenger_link) return;
            window.open(this.config.messenger_link, '_blank');
        }

        openWhatsApp() {
            const rawNumber = (this.config.whatsapp_number || '').replace(/[^0-9]/g, '');
            if (!rawNumber) return;
            const lastUserEntry = [...(this.history || [])].reverse().find(m => m && m.sender === 'user' && m.text);
            const lastQuestion = lastUserEntry ? lastUserEntry.text.trim() : '';
            const lang = this.config.language || 'sv';

            let prefill = lang === 'en' ? "Hi! I have a question about your store." : (lang === 'de' ? "Hallo! Ich habe eine Frage zu Ihrem Shop." : "Hej! Jag har en fråga om er butik.");
            if (this.config.cur_product && lastQuestion) {
                prefill = lang === 'en'
                    ? `Hi! I was chatting with your AI assistant about "${this.config.cur_product.title}" (${window.location.href}): "${lastQuestion}"`
                    : `Hej! Jag pratade med AI-chatten om "${this.config.cur_product.title}" (${window.location.href}): "${lastQuestion}"`;
            } else if (this.config.cur_product) {
                prefill = lang === 'en'
                    ? `Hi! I'm looking at "${this.config.cur_product.title}" (${window.location.href}) and have a question:`
                    : `Hej! Jag tittar på "${this.config.cur_product.title}" (${window.location.href}) och har en fråga:`;
            } else if (lastQuestion) {
                prefill = lang === 'en'
                    ? `Hi! I was chatting with your AI assistant on ${window.location.href}. My question: "${lastQuestion}"`
                    : `Hej! Jag pratade med er AI-chatt på ${window.location.href}. Min fråga: "${lastQuestion}"`;
            }
            const waUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent(prefill)}`;
            window.open(waUrl, '_blank');
        }

        async sendMessage() {
            const text = this.input.value.trim();
            const attachedImage = this.pendingImage;

            if (!text && !attachedImage) return;

            this.markAssistedSession();

            // Clear input and attachment state
            this.input.value = '';
            this.clearPendingImage();

            // Render user bubble
            this.appendMessage(text, 'user', attachedImage ? attachedImage.base64 : null, true);
            this.showTyping();

            try {
                // Determine destination: If running in WordPress plugin with local PHP proxy
                let responseData = null;
                const viewingProdStr = this.config.cur_product && this.config.cur_product.title
                    ? `${this.config.cur_product.title} (${this.config.cur_product.price || ''})`
                    : (document.querySelector('.product_title') ? `${document.querySelector('.product_title').textContent.trim()} (${window.location.href})` : '');
                const recentHistText = (this.history || [])
                    .slice(-10)
                    .map(h => `${h.sender === 'user' ? 'Kund' : 'Assistent'}: ${String(h.text || '').replace(/:::product[\s\S]*?:::/g, '').trim()}`)
                    .join('\n');

                if (this.config.ajax_url && this.config.nonce) {
                    try {
                        // Use URLSearchParams (application/x-www-form-urlencoded) to avoid ModSecurity WAF 403 on Multipart FormData
                        const formParams = new URLSearchParams();
                        formParams.append('action', 'axgai_woo_chat_message');
                        formParams.append('nonce', this.config.nonce);
                        formParams.append('agent_id', this.config.agent_id);
                        formParams.append('slug', this.config.slug || '');
                        formParams.append('contact_email', this.config.contact_email || '');
                        formParams.append('message', text);
                        formParams.append('session_id', this.sessionId);
                        formParams.append('language', this.config.language);
                        formParams.append('chat_history', recentHistText);
                        if (attachedImage) {
                            formParams.append('image_base64', attachedImage.base64);
                        }
                        if (viewingProdStr) {
                            formParams.append('viewing_product', viewingProdStr);
                        }

                        const res = await fetch(this.config.ajax_url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                            body: formParams.toString()
                        });
                        if (res.ok) {
                            const json = await res.json();
                            if (json && json.success && json.data && json.data.reply) {
                                responseData = json.data.reply;
                            }
                        }
                    } catch (ajaxErr) {
                        console.warn('Local WP AJAX notice, falling back to Cloud Direct Proxy:', ajaxErr);
                    }
                }

                if (!responseData) {
                    // Cloud Direct Proxy (Fallback if WP admin-ajax is blocked/slow, or on Shopify/Embeds/Demos)
                    const payload = {
                        agent_id: this.config.agent_id,
                        action: 'chat-proxy',
                        slug: this.config.slug,
                        site_url: window.location.origin,
                        contact_email: this.config.contact_email || '',
                        contact_info: this.config.contact_info || '',
                        opening_hours: this.config.opening_hours || '',
                        message: text,
                        session_id: this.sessionId,
                        language: this.config.language,
                        chat_history: recentHistText,
                        image_base64: attachedImage ? attachedImage.base64 : null,
                        viewing_product: viewingProdStr,
                        is_woocommerce: this.config.is_woocommerce
                    };

                    const res = await fetch(this.config.api_url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const json = await res.json();
                    responseData = json.reply;
                }

                await this.hideTyping();

                if (responseData) {
                    this.appendMessage(responseData, 'bot', null, true);
                } else {
                    const t = this.getTranslations();
                    this.appendMessage(t.error_conn, 'bot', null, false);
                }

            } catch (err) {
                console.error('Chat error:', err);
                await this.hideTyping();
                const t = this.getTranslations();
                this.appendMessage(t.error_conn, 'bot', null, false);
            }
        }

        checkExitIntent() {
            // Proactive sales trigger: If user moves mouse towards closing tab
            let exitTriggered = false;
            document.addEventListener('mouseleave', (e) => {
                if (e.clientY <= 10 && !exitTriggered && !this.isOpen && this.history.length === 1) {
                    exitTriggered = true;
                    this.toggle(true);
                    let exitMsg = "Tvekar du innan du beställer? Fråga mig om storlekar, leveranstider eller rabatter så hjälper jag dig direkt!";
                    if (this.config.language === 'en') {
                        exitMsg = "Hesitating before placing your order? Ask me about sizing, shipping or discounts and I'll help you right away!";
                    }
                    this.appendMessage(exitMsg, 'bot', null, true);
                }
            });
        }

        checkCartAbandonmentNudge() {
            try {
                if (sessionStorage.getItem('axg_cart_nudge_shown')) return;
                const path = (window.location.pathname || '').toLowerCase();
                const bodyCls = (document.body && document.body.className) ? document.body.className.toLowerCase() : '';
                const isCartOrCheckout = /\/(cart|varukorg|kassa|checkout|warenkorb|kurv|handlekurv)(\/|$)/i.test(path) ||
                    bodyCls.includes('woocommerce-cart') || bodyCls.includes('woocommerce-checkout');
                if (!isCartOrCheckout) return;

                setTimeout(() => {
                    if (this.isOpen || sessionStorage.getItem('axg_cart_nudge_shown')) return;
                    sessionStorage.setItem('axg_cart_nudge_shown', '1');
                    this.toggle(true);
                    const lang = this.config.language || 'sv';
                    let nudgeMsg = "Undrar du över leveranstid, retur eller storlek innan du slutför köpet? Fråga mig så hjälper jag dig direkt! 🛍️";
                    if (lang === 'en') {
                        nudgeMsg = "Have a quick question about shipping times, returns, or sizing before checking out? Ask me and I'll help you right away! 🛍️";
                    } else if (lang === 'de') {
                        nudgeMsg = "Haben Sie noch eine Frage zu Lieferzeit, Rückgabe oder Größe vor dem Kauf? Fragen Sie mich, ich helfe Ihnen sofort! 🛍️";
                    }
                    this.appendMessage(nudgeMsg, 'bot', null, true);
                }, 25000);
            } catch (e) {}
        }
    }

    // Expose global initializer
    window.initAxgWidget = function (config) {
        return new AxgChatWidget(config);
    };

    // Auto-initialize if AXG_WIDGET_CONFIG, axgai_woo_settings, or axgai_settings exists on page load
    const doInit = () => {
        if (!window.axgWidgetInstance && (window.AXG_WIDGET_CONFIG || window.axgai_woo_settings || window.axgai_settings)) {
            window.axgWidgetInstance = new AxgChatWidget();
        }
    };

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', doInit);
    } else {
        doInit();
    }

})(window, document);
