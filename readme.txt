=== AxG AI Store Sales & Support Assistant for Woo ===
Contributors: mathiasax
Tags: woocommerce, chatbot, ai assistant, product recommendations, gemini
Requires at least: 5.0
Tested up to: 7.0.3
Stable tag: 2.0.18
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
- **Endpoint URL:** `https://europe-west3-wp-vertex-chatbot.cloudfunctions.net`
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

