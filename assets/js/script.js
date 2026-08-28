/* 
 * AxG AI WooCommerce Chatbot & Product Recommender - Frontend Script
 * Stateful chat flows, localized quota-budget limits, and real-time page context mapping
 */

// 1. Persistent Session ID via sessionStorage
let axWooSid = sessionStorage.getItem('ax_woo_sid');
if (!axWooSid) {
    axWooSid = 'sess_woo_' + Math.random().toString(36).substring(2, 12);
    sessionStorage.setItem('ax_woo_sid', axWooSid);
}

function axWooTriggerProactive(message) {
    const box = document.getElementById('ax-woo-chat-box');
    const wrapper = document.getElementById('ax-woo-chat-wrapper');
    if (!box) return;
    
    // Check if chat is already open or already has messages to avoid interrupting
    if (box.style.display === 'flex') return;
    const history = JSON.parse(sessionStorage.getItem('ax_woo_chat_history') || '[]');
    if (history.length > 0) return; // Don't interrupt existing conversation

    // Open chat box
    box.style.display = 'flex';
    if (window.innerWidth <= 480) {
        document.body.classList.add('ax-no-scroll');
        if (wrapper) wrapper.classList.add('ax-active');
        if (window.visualViewport) {
            axWooAdjustViewport();
        }
    }
    const input = document.getElementById('ax-woo-chat-input');
    if (input) input.focus();

    // Append and save the proactive greeting
    axWooAppend(message, 'bot');
}

// 2. Initialize and Restore Chat History on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Register Visual Viewport resize handlers for mobile virtual keyboards
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', axWooAdjustViewport);
        window.visualViewport.addEventListener('scroll', axWooAdjustViewport);
    }

    // Check premium state from localStorage and toggle branding
    const isPremium = localStorage.getItem('ax_woo_is_premium') === '1';
    const branding = document.getElementById('ax-woo-chat-branding');
    if (branding) {
        branding.style.display = isPremium ? 'none' : 'block';
    }

    const history = JSON.parse(sessionStorage.getItem('ax_woo_chat_history') || '[]');
    if (history.length > 0) {
        const logs = document.getElementById('ax-woo-chat-logs');
        if (logs) {
            logs.innerHTML = ''; // Clear default greeting
            history.forEach(msg => {
                axWooAppend(msg.text, msg.sender, false);
            });
        }
    }

    // Check and initialize Proactive Sales Triggers
    const lang = axgaists_settings.language || 'en';

    // A. Inactivity Trigger (45 seconds)
    if (parseInt(axgaists_settings.trigger_inactivity, 10) === 1) {
        let inactivityTimer;
        let inactivity_greeting = "Hello! Do you need help finding anything today? Feel free to ask!";
        if (lang === 'sv') {
            inactivity_greeting = "Hej! Behöver du hjälp med att hitta något idag? Fråga mig gärna!";
        } else if (lang === 'de') {
            inactivity_greeting = "Hallo! Brauchen Sie Hilfe beim Finden von etwas heute? Fragen Sie mich gerne!";
        }

        const resetInactivityTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                axWooTriggerProactive(inactivity_greeting);
            }, 45000); // 45 seconds
        };

        // Reset on any user activity
        window.addEventListener('mousemove', resetInactivityTimer);
        window.addEventListener('keypress', resetInactivityTimer);
        window.addEventListener('scroll', resetInactivityTimer);
        window.addEventListener('click', resetInactivityTimer);
        resetInactivityTimer(); // Start the timer
    }

    // B. Deep Scroll Trigger (>75%)
    if (parseInt(axgaists_settings.trigger_scroll, 10) === 1) {
        let scroll_greeting = "It looks like you're reading up! Let me know if you have any questions about our products, shipping, or returns.";
        if (lang === 'sv') {
            scroll_greeting = "Det ser ut som att du läser på! Säg till om du har några funderingar kring våra produkter, frakt eller villkor.";
        } else if (lang === 'de') {
            scroll_greeting = "Es sieht so aus, als ob Sie aufmerksam lesen! Lassen Sie mich wissen, wenn Sie Fragen zu unseren Produkten, dem Versand oder den Rücksendungen haben.";
        }

        const handleScrollTrigger = () => {
            const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
            if (scrollPercent > 0.75) {
                axWooTriggerProactive(scroll_greeting);
                window.removeEventListener('scroll', handleScrollTrigger); // Trigger once per load
            }
        };
        window.addEventListener('scroll', handleScrollTrigger);
    }

    // C. Exit Intent Trigger
    if (parseInt(axgaists_settings.trigger_exit, 10) === 1) {
        let exit_greeting = "Wait! Did you know you can get 10% off your first order? Ask me for a discount code and I'll hook you up!";
        if (lang === 'sv') {
            exit_greeting = "Vänta lite! Visste du att du kan få 10% rabatt på din beställning? Fråga mig om en rabattkod så fixar jag det!";
        } else if (lang === 'de') {
            exit_greeting = "Warten Sie mal! Wussten Sie, dass Sie 10% Rabatt auf Ihre Bestellung erhalten können? Fragen Sie mich nach einem Rabattcode!";
        }

        const handleExitIntent = (e) => {
            if (e.clientY < 10) { // Mouse leaves at the top boundary
                axWooTriggerProactive(exit_greeting);
                document.removeEventListener('mouseleave', handleExitIntent); // Trigger once per load
            }
        };
        document.addEventListener('mouseleave', handleExitIntent);
    }
});

function axWooAdjustViewport() {
    const box = document.getElementById('ax-woo-chat-box');
    if (box && box.style.display === 'flex' && window.innerWidth <= 480) {
        const vv = window.visualViewport;
        box.style.height = vv.height + 'px';
        box.style.top = vv.offsetTop + 'px';
        
        const logs = document.getElementById('ax-woo-chat-logs');
        if (logs) {
            logs.scrollTop = logs.scrollHeight;
        }
    }
}

function axWooToggleChat() {
    const box = document.getElementById('ax-woo-chat-box');
    const wrapper = document.getElementById('ax-woo-chat-wrapper');
    if (!box) return;
    
    const isOpening = box.style.display === 'none' || box.style.display === '';
    
    if (isOpening) {
        box.style.display = 'flex';
        if (window.innerWidth <= 480) {
            document.body.classList.add('ax-no-scroll');
            if (wrapper) wrapper.classList.add('ax-active');
            setTimeout(() => {
                const input = document.getElementById('ax-woo-chat-input');
                if (input) input.focus();
                if (window.visualViewport) {
                    axWooAdjustViewport();
                }
            }, 100);
        } else {
            const input = document.getElementById('ax-woo-chat-input');
            if (input) input.focus();
        }
        
        // Check if we already have this product greeting in our active history to avoid double greetings
        const history = JSON.parse(sessionStorage.getItem('ax_woo_chat_history') || '[]');
        const hasGreetingInHistory = history.some(msg => msg.sender === 'bot' && msg.text.includes(axgaists_settings.cur_product ? axgaists_settings.cur_product.title : '__none__'));
        
        // Dynamic contextual greeting if on single product page
        if (axgaists_settings.cur_product && !window.axgaists_greeted && !hasGreetingInHistory) {
            window.axgaists_greeted = true;
            const p = axgaists_settings.cur_product;
            let contextual_msg = `I see you're looking at "${p.title}" (${p.price}). How can I help you with this product?`;
            
            if (axgaists_settings.language === 'sv') {
                contextual_msg = `Jag ser att du tittar på "${p.title}" (${p.price}). Hur kan jag hjälpa dig med den här produkten?`;
            } else if (axgaists_settings.language === 'de') {
                contextual_msg = `Ich sehe, Sie schauen sich "${p.title}" (${p.price}) an. Wie kann ich Ihnen bei diesem Produkt helfen?`;
            } else if (axgaists_settings.language === 'fr') {
                contextual_msg = `Je vois que vous regardez "${p.title}" (${p.price}). Comment puis-je vous aider avec ce produit ?`;
            } else if (axgaists_settings.language === 'es') {
                contextual_msg = `Veo que estás mirando "${p.title}" (${p.price}). ¿Cómo puedo ayudarte con este producto?`;
            } else if (axgaists_settings.language === 'pl') {
                contextual_msg = `Widzę, że patrzysz na "${p.title}" (${p.price}). Jak mogę pomóc Ci w wyborze tego produktu?`;
            } else if (axgaists_settings.language === 'it') {
                contextual_msg = `Vedo que stai guardando "${p.title}" (${p.price}). Come posso aiutarti con questo produkt?`;
            } else if (axgaists_settings.language === 'nl') {
                contextual_msg = `Ik zie dat je kijkt naar "${p.title}" (${p.price}). Hoe kan ik je helpen met dit product?`;
            } else if (axgaists_settings.language === 'pt') {
                contextual_msg = `Vejo que está olhando para "${p.title}" (${p.price}). Como posso ajudar você com este produto?`;
            } else if (axgaists_settings.language === 'ru') {
                contextual_msg = `Я вижу, вы смотрите на "${p.title}" (${p.price}). Как я могу помочь вам с этим товаром?`;
            } else if (axgaists_settings.language === 'tr') {
                contextual_msg = `Şu anda "${p.title}" (${p.price}) ürününe baktığınızı görüyorum. Bu ürünle ilgili size nasıl yardımcı olabilirim?`;
            } else if (axgaists_settings.language === 'fa') {
                contextual_msg = `من متوجه شدم که شما در حال مشاهده محصول "${p.title}" (${p.price}) هستید. چطور می‌توانم در مورد این محصول به شما کمک کنم؟`;
            } else if (axgaists_settings.language === 'ar') {
                contextual_msg = `أرى أنك تبحث في "${p.title}" (${p.price}). كيف يمكنني مساعدتك في هذا المنتج?`;
            }
            
            setTimeout(() => {
                axWooAppend(contextual_msg, 'bot');
            }, 600);
        }
    } else {
        box.style.display = 'none';
        if (window.innerWidth <= 480) {
            document.body.classList.remove('ax-no-scroll');
            if (wrapper) wrapper.classList.remove('ax-active');
            box.style.height = '';
            box.style.top = '';
        }
    }
}

function axWooSendQuickQuestion(btn) {
    const questionText = btn.textContent || btn.innerText;
    const input = document.getElementById('ax-woo-chat-input');
    if (input) {
        input.value = questionText;
        axWooSendMessage();
    }
}

function axWooParseMarkdown(text) {
    if (!text) return '';
    
    // Escape standard HTML tags for security
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
        
    // 1. Bold: **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 2. Italic: *text* -> <em>text</em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 3. Links: [text](url) -> anchor tags
    html = html.replace(/\[(.*?)\]\((https?:\/\/.*?)\)/g, '<a href="$2" target="_blank" class="ax-woo-chat-link" style="color: #06b6d4; text-decoration: underline; font-weight: bold;" rel="noopener noreferrer">$1</a>');
    
    // 4. Raw URLs -> clickable links (Safari-compatible masking logic, avoiding lookbehind)
    var tempLinks = [];
    html = html.replace(/<a [^>]*>.*?<\/a>/g, function(match) {
        tempLinks.push(match);
        return '___AX_LINK_PLACEHOLDER_' + (tempLinks.length - 1) + '___';
    });
    
    var urlRegex = /(https?:\/\/[^\s<]+)/g;
    html = html.replace(urlRegex, '<a href="$1" target="_blank" class="ax-woo-chat-link" style="color: #06b6d4; text-decoration: underline; font-weight: bold;" rel="noopener noreferrer">$1</a>');
    
    html = html.replace(/___AX_LINK_PLACEHOLDER_(\d+)___/g, function(match, id) {
        return tempLinks[parseInt(id)];
    });
    
    // 5. Bullet lists
    html = html.replace(/^\s*\*\s+(.*?)$/gm, '• $1');
    
    // 6. Line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

function axWooAppend(text, sender, save = true) {
    const logs = document.getElementById('ax-woo-chat-logs');
    if (!logs) return;
    
    const div = document.createElement('div');
    div.className = 'ax-woo-msg ax-woo-' + sender;
    if (sender === 'user') {
        div.style.backgroundColor = axgaists_settings.color_theme;
    }
    div.innerHTML = axWooParseMarkdown(text);
    logs.appendChild(div);
    logs.scrollTop = logs.scrollHeight;

    // Save message to sessionStorage if requested
    if (save) {
        const history = JSON.parse(sessionStorage.getItem('ax_woo_chat_history') || '[]');
        history.push({ text: text, sender: sender });
        if (history.length > 50) {
            history.shift();
        }
        sessionStorage.setItem('ax_woo_chat_history', JSON.stringify(history));
    }
}

async function axWooSendMessage() {
    const input = document.getElementById('ax-woo-chat-input');
    if (!input) return;
    
    const msg = input.value.trim();
    if (!msg) return;

    // Check premium state from localStorage
    const isPremium = localStorage.getItem('ax_woo_is_premium') === '1';

    // LOCAL PERSISTENT SECURE BUDGET ENFORCEMENT (50 requests per day, bypassed for Premium!)
    const todayStr = new Date().toISOString().split('T')[0];
    let lastDate = localStorage.getItem('ax_woo_budget_date') || todayStr;
    let budget = parseInt(localStorage.getItem('ax_woo_msg_budget') || '0');

    if (lastDate !== todayStr) {
        budget = 0;
        localStorage.setItem('ax_woo_budget_date', todayStr);
        localStorage.setItem('ax_woo_msg_budget', '0');
    }

    if (!isPremium && budget >= 50) {
        let errorMsg = "You have reached the daily limit of 50 messages for this demo bot. Please come back tomorrow or contact us to unlock the unlimited version!";
        
        // Dictionary of daily limit messages
        const limitDict = {
            'sv': "Du har nått gränsen på 50 testmeddelanden för idag för denna gratis-demo. Välkommen åter imorgon eller kontakta oss för att låsa upp fullversionen!",
            'de': "Sie haben das tägliche Limit von 50 Nachrichten für diesen Demo-Bot erreicht. Bitte kommen Sie morgen wieder oder kontaktieren Sie uns, um die unbegrenzte Version freizuschalten!",
            'fr': "Vous avez atteint la limite quotidienne de 50 messages pour ce bot de démonstration. Veuillez revenir demain ou nous contacter pour déverrouiller la version illimitée !",
            'es': "Has alcanzado el límite diario de 50 mensajes para este bot de demostración. ¡Vuelve mañana o contáctanos para desbloquear la versión ilimitada!",
            'pl': "Osiągnąłeś dzienny limit 50 wiadomości dla tego bota demonstracyjnego. Wróć jutro lub skontaktuj się z nami, aby odblokować wersję nielimitowaną!",
            'it': "Hai raggiunto il limite giornaliero di 50 messaggi per questo bot dimostrativo. Torna domani o contattaci per sbloccare la versione illimitata!",
            'pt': "Você atingiu o limite diário de 50 mensagens para este bot de demonstração. Volte amanhã ou entre em contato conosco para desbloquear a versão ilimitada!",
            'nl': "Je hebt de dagelijkse limiet van 50 berichten voor deze demo-bot bereikt. Kom morgen terug of neem contact met ons op om de onbeperkte versie te ontgrendelen!",
            'ru': "Вы достигли суточного лимита в 50 сообщений для этого демо-бота. Пожалуйста, вернитесь завтра или свяжитесь с нами, чтобы разблокировать безлимитную версию!",
            'ar': "لقد وصلت إلى الحد الأقصى اليومي البالغ 50 رسالة لهذا البوت التجريبي. يرجى العودة غداً أو الاتصال بنا لفتح النسخة غير المحدودة!",
            'tr': "Bu demo botu için günlük 50 mesaj sınırına ulaştınız. Lütfen yarın tekrar gelin veya sınırsız sürümü açmak için bizimle iletişime geçin!",
            'fa': "شما به حد مجاز روزانه ۵۰ پیام برای این بات دمو رسیده‌اید. لطفا فردا دوباره مراجعه کنید یا با ما تماس بگیرید تا نسخه نامحدود را فعال کنید!"
        };

        if (limitDict[axgaists_settings.language]) {
            errorMsg = limitDict[axgaists_settings.language];
        }

        axWooAppend(errorMsg, "bot");
        return;
    }

    axWooAppend(msg, 'user');
    input.value = '';
    
    if (!isPremium) {
        localStorage.setItem('ax_woo_msg_budget', (budget + 1).toString());
    }

    // Show loading spinner
    const loader = document.createElement('div');
    loader.className = 'ax-woo-msg ax-woo-bot';
    loader.id = 'ax-woo-loading';
    loader.textContent = '...';
    document.getElementById('ax-woo-chat-logs').appendChild(loader);
    document.getElementById('ax-woo-chat-logs').scrollTop = document.getElementById('ax-woo-chat-logs').scrollHeight;

    // Capture single product contextual view info
    let viewing_product_str = '';
    if (axgaists_settings.cur_product) {
        viewing_product_str = `${axgaists_settings.cur_product.title} (${axgaists_settings.cur_product.price})`;
    }

    // Build AJAX payload
    const formData = new FormData();
    formData.append('action', 'axgaists_chat_message');
    formData.append('nonce', axgaists_settings.nonce);
    formData.append('agent_id', axgaists_settings.agent_id);
    formData.append('message', msg);
    formData.append('session_id', axWooSid);
    formData.append('language', axgaists_settings.language);
    formData.append('slug', axgaists_settings.slug);
    formData.append('contact_email', axgaists_settings.contact_email);
    formData.append('viewing_product', viewing_product_str);

    try {
        const response = await fetch(axgaists_settings.ajax_url, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        const loaderNode = document.getElementById('ax-woo-loading');
        if (loaderNode) loaderNode.remove();

        if (data.success && data.data && data.data.reply) {
            axWooAppend(data.data.reply, 'bot');
            
            // Sync and persist premium state dynamically from Firestore proxy response
            if (data.data.is_premium !== undefined) {
                const newPremium = data.data.is_premium;
                localStorage.setItem('ax_woo_is_premium', newPremium ? '1' : '0');
                const branding = document.getElementById('ax-woo-chat-branding');
                if (branding) {
                    branding.style.display = newPremium ? 'none' : 'block';
                }
            }
        } else {
            let errorText = 'Connection error. Please try again.';
            if (axgaists_settings.language === 'sv') errorText = 'Anslutningsfel. Försök igen.';
            axWooAppend(errorText, 'bot');
        }
    } catch (e) {
        const loaderNode = document.getElementById('ax-woo-loading');
        if (loaderNode) loaderNode.remove();
        
        let errorText = 'Connection error.';
        if (axgaists_settings.language === 'sv') errorText = 'Anslutningsfel.';
        axWooAppend(errorText, 'bot');
    }
}