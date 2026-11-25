=== AxG AI Store Sales & Support Assistant for Woo ===
Contributors: mathiasax
Tags: woocommerce, chatbot, ai assistant, product recommendations, gemini
Requires at least: 5.0
Tested up to: 7.0.3
Stable tag: 2.0.29
Requires PHP: 7.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Intelligent floating AI Chatbot for WooCommerce. Real-time product scanning, support FAQs, and automated back-office Conversation Insights!

== Description ==

AxG AI WooCommerce Chatbot & Product Recommender is a modern, responsive AI sales assistant for your e-commerce store. 

By scanning your product titles, categories, short descriptions, and prices in real-time, it acts as a 24/7 dedicated personal shopper to guide visitors to the exact product they need, driving up to +15% conversion rates.

= Conversation Insights =
Get instant, valuable visibility into what your customers want. The plugin securely logs all discussions in your WordPress back-office, allowing you to run AI-powered analytics to identify popular products, user confusion, and strategic catalog improvements.

= Key Features =
*   **Intelligent Recommendations:** Scans and processes your store products to provide accurate recommendations.
*   **Contextual Greeting:** Greets visitors on single product pages with personalized help regarding the specific item they are viewing.
*   **Elegant & Responsive Interface:** Premium, modern floating bubble optimized for both mobile and desktop.
*   **Comprehensive Conversation Insights:** Direct log of customer chats with one-click Gemini AI trend analysis in your back-office.
*   **Cost Control Limits:** Built-in session message budgeting (50 requests/day per visitor) to safe-keep your quota.
*   **Native Multilingual Support:** Translated and ready in English, French, Spanish, Polish, Persian, Italian, German, Portuguese, Dutch, Russian, Arabic, Turkish, and Swedish.

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

