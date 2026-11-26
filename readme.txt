=== AxG AI Store Sales & Support Assistant for Woo ===
Contributors: mathiasax
Tags: woocommerce, chatbot, ai assistant, product recommendations, gemini
Requires at least: 5.0
Tested up to: 7.0.3
Stable tag: 2.0.30
Requires PHP: 7.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Intelligent floating AI Sales & Support Assistant for WooCommerce + AxG Flow Omnichannel Helpdesk. Real-time product carousels, 1-click Add-to-Cart, Live Takeover, Meta Omnichannel (IG DM, Messenger, WhatsApp, Email) with 24/7 AI Auto-Reply, Order Tracking, and ROI Insights!

== Description ==

**AxG AI Store Sales & Support Assistant for Woo** turns your WooCommerce store into a 24/7 conversion engine and modern omnichannel helpdesk powered by **Gemini 2.5 Flash**.

By scanning your active WooCommerce catalog (titles, categories, descriptions, stock status, and prices) in real time, the assistant guides shoppers with interactive product carousels, 1-click Add-to-Cart, visual photo search, voice input, and instant 2-factor order tracking.

= AxG Flow Live Takeover & Meta Omnichannel Helpdesk =
Jump directly from your WordPress Admin into **AxG Flow** with **1-Click Passwordless SSO** ("Open AxG Flow Inbox"):
*   **Live Human Takeover (0-Token AI Pause):** Take over any active storefront chat in real time. The AI pauses immediately while your human reply streams directly into the customer's chat window.
*   **Full Meta Omnichannel & Support Email:** Manage **Web Chat, Instagram DM, Facebook Messenger, WhatsApp Cloud API, and Support Email (IMAP/SMTP)** in one unified, store-isolated inbox.
*   **24/7 Per-Channel AI Auto-Reply Pilot:** Choose per channel (Instagram DM, Facebook Messenger, WhatsApp Cloud API, Support Email) whether your store's AI Assistant should automatically answer incoming customer messages using your live WooCommerce product catalog — and auto-pause whenever a human takes over.
*   **1-Click WooCommerce Order Actions:** Trigger instant refunds, order cancellations, order confirmation resends, and internal notes directly from the chat sidebar.

= AI-Assisted Revenue (ROI) & 1-Click AI Training =
Track attributed orders, AI-generated revenue, and support hours saved inside **Conversation Insights**. Identify unanswered customer questions and add permanent Q&A rules to your AI instructions with a single click.

= Key Features =
*   **Real-Time Product Carousels & 1-Click Add to Cart:** Displays rich product cards with cover images, live prices, stock badges, and native WooCommerce AJAX cart additions.
*   **Live 2-Factor Order & Shipment Tracking:** Verifies Order ID + Billing Email/Phone and generates clickable tracking links for PostNord, DHL, DB Schenker, Bring, and more.
*   **Multimodal Visual Photo Search & Voice Input:** Customers can upload a photo to find visually matching products or speak directly using the built-in microphone button.
*   **25s Smart Cart Abandonment Nudge & Proactive Triggers:** Proactively assists shoppers on `/cart` and `/checkout` after 25 seconds, plus Exit-Intent, Deep Scroll, and Inactivity triggers.
*   **AI-to-AI & Agentic Commerce Ready (`0-Token`):** Makes your product catalog machine-readable (`llms.txt` & JSON Agent Catalog API) for external AI shopping agents (ChatGPT, Perplexity, Claude, Google AI).
*   **12 Launcher Button Effects, Mouse-Tracking Animated Eyes & 4 AI Personas:** Customize button shapes, 12 visual effects (Radar, Pulse, Neon, Frosted Glass, Aurora, etc.), Light/Dark themes, and 1-click AI personality presets (Jane, Leo, Sofia, Alex).
*   **Zero-Config 1-Click Auto-Connect & 13+ Languages:** Connects your domain automatically on activation with native support for English, Swedish, German, French, Spanish, Dutch, Danish, Polish, Italian, Portuguese, Arabic, Turkish, Russian, and Persian.

= Plans & 30-Day Free Trial =
Every store starts with a **30-day free trial** (no lock-in, cancel anytime with 1 click):
*   **Bronze / Starter (€9.99/mo):** 1,500 AI msgs/mo, 1 read-only inbox seat, 1 store, real-time catalog carousels, 2FA order tracking, visual photo search, voice input & 25s cart nudge.
*   **Silver / AxG Flow (€29.99/mo — Most Popular):** 5,000 AI msgs/mo, 2 operator seats, 1 store, AxG Flow Live Takeover Inbox (1-Click SSO, AI Copilot `Cmd+J`), AI-to-AI Agentic Commerce (`0-token`), and Conversation Insights.
*   **Gold / Omnichannel Pro (€99.00/mo):** 25,000 AI msgs/mo, 8 operator seats, up to 5 stores, Full Meta Omnichannel (Instagram DM, Messenger, WhatsApp Cloud API & Support Email), **24/7 Per-Channel AI Auto-Reply**, 1-Click WooCommerce Order Actions & optional white-label.
*   **Scale / Agency (€249.00/mo):** 75,000 AI msgs/mo, 25 operator seats, up to 15 stores, outbound CRM/ERP Webhooks (Klaviyo, HubSpot, Zapier), CSV/Excel Export API & Priority SLA. (+€9/mo per extra seat on Silver/Gold/Scale).

== Installation ==

1.  Upload the `axg-store-sales-assistant` folder to your `/wp-content/plugins/` directory, or search and install it via **Plugins > Add New**.
2.  Activate the plugin through the **Plugins** menu.
3.  Go to **AxG AI Woo** in your WordPress admin sidebar.
4.  Enter your **Agent ID** and **Client Slug**, select your primary language, customize your bot persona, and click **Save Settings**.
5.  *(Optional)* Head over to **Conversation Insights** to see what your visitors are asking for in real-time!

== External services ==

This plugin connects to a third-party API to process and relay your website chat conversations securely.

- **Service Name:** Axelsson Graphics AI Platform
- **Endpoint URL:** `https://api.axelsson.graphics/v1/gateway`
- **Why it is used:** Relays the website visitor's chat messages to our secure AI Search platform to generate AI search responses securely, protecting your server credentials from being exposed in public front-end code.
- **Data sent:** Relays the raw chat messages typed by the visitor, their selected session ID, and the configured language code. No personal identifying information (PII) is sent unless typed by the user.
- **Terms of Service:** [Axelsson Graphics Terms of Service](https://axelsson.graphics/terms/)
- **Privacy Policy:** [Axelsson Graphics Privacy Policy](https://axelsson.graphics/privacy/)

== Frequently Asked Questions ==

= How does the real-time product scanning work? =
When a customer chats with the bot, the plugin queries your WooCommerce database in real-time to generate a compact JSON representation of your active product listings. This is securely parsed by Gemini AI to recommend matching, in-stock products.

= Is WooCommerce required? =
Yes, this plugin is specifically engineered for WooCommerce stores to retrieve and analyze catalog data. For non-shop websites, please use our general "AxG AI Site Assistant" plugin.

= Can I use it in multiple languages? =
Absolutely! The plugin has native, built-in support for 13 global languages. Simply select your desired language in the admin configuration panel and the chat bubble will translate seamlessly.

== Changelog ==

= 2.0.30 =
* Enhancement: Redesigned the admin Plans & AxG Flow Upgrades section into a clean, compact 4-tier Nordic Crisp grid (Bronze €9.99/mo, Silver €29.99/mo, Gold €99.00/mo, Scale €249.00/mo) with updated message quotas, operator seats, and 24/7 Per-Channel AI Auto-Reply features.

= 2.0.29 =
* Feature: Added 1-Click SSO button ("Open AxG Flow Inbox") in WordPress Admin to jump directly into the AxG Flow Live Takeover & Omnichannel Helpdesk without passwords.
* Feature: Added real-time Human Live Takeover support (`bot_muted` & `operator_name` streaming) in the storefront chat widget so human operators can take over active conversations seamlessly.
* Feature: Added HMAC-authenticated 1-Click Order Action REST endpoint (`/wp-json/axg-woo-chatbot/v1/order-action`) for refunds, order cancellations, and order confirmation resends from AxG Flow.
* Enhancement: Added explicit toggle for Mouse-Tracking Animated Eyes in the launcher button settings.

= 2.0.28 =
* Feature: Added customizable chat button shapes (Circle, Rounded, Square, Pill with custom text), button sizes, and 12 visual effects (Radar, Pulse, Wiggle, RGB Halo, Mirror Shine, Frosted Glass, Neon, Hologram, Sparkles, 3D Push, Liquid Blob).
* Feature: Added chat window theme selector (Light / Dark mode), configurable window widths (340px / 390px / 440px), frame styles (Frosted Glass, Aurora, Cyber), header gradients (Sunset, Ocean, Neon, Aurora), and entrance animations directly in WP Admin.

= 2.0.27 =
* Enhancement: Routed API gateway and AI-to-AI Agentic Commerce discovery manifests through `https://api.axelsson.graphics/v1/`.

= 2.0.26 =
* Enhancement: Improved mobile full-screen responsiveness and browser session storage compatibility in strict privacy modes.

= 2.0.25 =
* Feature: Added persistent visit session state across page navigations and visual product page context indicator in the chat header.
* Enhancement: Upgraded WooCommerce catalog caching and added automatic direct cloud connection fallback for instant, uninterrupted chat responses across all web hosts.

= 2.0.24 =
* Feature: Enhanced Zero-Config Auto-Connect with automatic WooCommerce catalog push and storefront self-healing on initial load.
* Enhancement: Improved domain isolation and faster cloud synchronization for product carousels.

= 2.0.23 =
* Feature: Added direct admin setting toggle for the 25-second Smart Cart Abandonment Nudge under Proactive Sales Triggers.
* Feature: Added always-visible 1-Click Custom Q&A AI Training box on both the main Settings page and Conversation Insights dashboard.
* Enhancement: General admin UI clarity and performance improvements.

= 2.0.22 =
* Feature: Zero-Config Auto-Connect on activation — automatically connects your store domain to your customized AI Agent, Client Slug, and Brand Theme Color with 1 click.
* Feature: AI-Assisted Revenue & ROI Dashboard inside Conversation Insights — tracks orders and revenue generated by AI chat interactions and 1-click cart additions.
* Feature: 1-Click Knowledge Gap Training in Admin Insights — turns unanswered customer questions into permanent AI instructions with a single click.
* Feature: Smart Cart Abandonment Nudge on cart/checkout pages and context-prefilled WhatsApp support handoff.
* Enhancement: General stability, conversion attribution, and performance improvements.

= 2.0.21 =
* Feature: Interactive Mouse-Tracking Animated Mascot Eyes with real-time cursor tracking.
* Feature: Web Speech API Voice Input microphone transcription button in chat input bar.
* Feature: Automatic toggle button fallback to classic circular theme button when mascot animation is disabled.
* Enhancement: General UI responsiveness, smooth pupil physics, and accessibility improvements.

= 2.0.19 =
* Feature: Introduced 4 out-of-the-box AI Personas (Jane – Professional Advisor, Leo – Enthusiastic Inspirer, Sofia – Technical Expert, Alex – Quick Fixer) with interactive card selection and custom profile editing.
* Value: Seamlessly tailor your WooCommerce assistant's selling tone and customer support style with 1-click presets.

= 2.0.18 =
* Feature: Visual product carousels with smooth arrow navigation, cover image prioritization, and indicator dots.
* Feature: Enhanced 1-click cart action integration with WooCommerce native cart drawer.
* Enhancement: Improved response speed and typing indicator animations.
* Enhancement: General UI stability, performance optimizations, and translation updates.

= 2.0.17 =
* Feature: Added visual product carousels, photo uploads, and typing indicator animations.
* Feature: Improved Conversation Insights dashboard with order tracking parsing.
* Enhancement: Optimized WooCommerce AJAX cart updates and seamless same-window product navigation.
* Enhancement: General UI responsiveness and layout stability improvements.

= 2.0.0 =
* Major Update: Next-generation AxG Chat Widget (v2) with Shadow DOM encapsulation.
* Feature: Added photo search, horizontal product carousels, and graphical order tracking.
* Feature: Added WhatsApp and Messenger direct customer support integration links.

= 1.1.0 =
* Feature: Added Proactive Sales Triggers (Inactivity, Scroll Depth, Exit Intent) for WooCommerce.
* Feature: Integrated custom contact info, opening hours, and WordPress Media Library uploader.
* Feature: Native support for 13 global languages and automated Stripe checkout tracking.

= 1.0.0 =
* Feature: Initial release of AxG AI Store Sales & Support Assistant for WooCommerce.
* Feature: Real-time WooCommerce catalog scanning, product recommender, and Conversation Insights.

