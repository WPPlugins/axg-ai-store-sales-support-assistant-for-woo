=== AxG AI Store Sales & Support Assistant for Woo ===
Contributors: mathiasax
Tags: woocommerce, chatbot, ai assistant, product recommendations, gemini
Requires at least: 5.0
Tested up to: 7.0.3
Stable tag: 1.1.16
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

= 1.1.16 =
*   Enhancement: Integrated your live Stripe Silver and Gold checkout links ('https://buy.stripe.com/5kQ9AW0nx3cGeTY8TyfMA04' and 'https://buy.stripe.com/8x2eVg7PZ14yeTYedSfMA05') across both WooCommerce admin dashboards!
*   Enhancement: Aligned plugin and asset versions to 1.1.16 for instant browser cache-busting.

= 1.1.15 =
*   Enhancement: Updated the Bronze / Starter package Stripe payment link to your live Checkout link 'https://buy.stripe.com/28EaF0fir3cGaDIfhWfMA03'.
*   Enhancement: Aligned plugin and asset versions to 1.1.15 for instant browser cache-busting.

= 1.1.14 =
*   Feature: Integrated premium visual product branding badges (AxG_Bronz.png, AxG_Silver.png, AxG_Gold.png) inside each of the Stripe checkout pricing cards to create a highly professional, cohesive WooCommerce dashboard.
*   Enhancement: Aligned plugin and asset versions to 1.1.14 for instant browser cache-busting.

= 1.1.13 =
*   Feature: Integrated a prominent, localized legal agreement and Fair Use Policy footer directly beneath the Stripe checkout pricing cards inside the WooCommerce admin panel.
*   Enhancement: Aligned plugin and asset versions to 1.1.13 for instant browser cache-busting.

= 1.1.12 =
*   Bug Fix: Added dynamic, conditional logic to build Stripe payment tracking parameters. This prevents the checkout link from crashing on empty values (such as an unconfigured Client Slug or Email) and guarantees the Stripe checkout page loads perfectly in 100% of cases.
*   Enhancement: Aligned plugin and asset versions to 1.1.12 for instant browser cache-busting.

= 1.1.11 =
*   Enhancement: Updated the free/trial chatbot branding link inside the WooCommerce widget footer from 'Powered by Axelsson Graphics' to 'Powered by AxG AI' for a cleaner and more focused branding experience.
*   Enhancement: Aligned plugin and asset versions to 1.1.11 for instant browser cache-busting.

= 1.1.10 =
*   Feature: Added support for three suggested quick questions (Vanliga frågor) appearing as interactive click-to-ask buttons at the top of the chat widget.
*   Feature: Added customizable Contact Information (Kontaktuppgifter) and Opening Hours (Öppettider) settings inside the WooCommerce admin options panel, dynamically fed securely into the AI's real-time knowledge base on the backend.
*   Enhancement: Aligned plugin and asset versions to 1.1.10 for instant browser cache-busting.

= 1.1.9 =
*   Enhancement: Rebuilt the mobile layout to provide a beautiful, native-like full-screen overlay experience on devices under 480px.
*   Enhancement: Solved the asymmetric 7px-vs-25px margin misalignment and iOS/Android viewport keyboard-clipping bugs.
*   Enhancement: Upgraded close button tap size with comfortable touch padding.
*   Enhancement: Aligned plugin and asset versions to 1.1.9 for instant cache-busting.

= 1.1.8 =
*   Feature: Integrated the native WordPress Media Library uploader directly into the admin options panel! Merchants can now click "Choose Image" next to both the Chatbot Avatar and Header Background Image fields to select or upload images securely and visually from their media library, rather than manually copying and pasting URLs.
*   Enhancement: Aligned plugin and asset versions to 1.1.8 for instant cache-busting.

= 1.1.7 =
*   Feature: Added customizable header background image support! Merchants can now customize the header of the chat window with a custom banner/pattern URL, providing seamless and professional brand integration.
*   Enhancement: Aligned plugin and asset versions to 1.1.7 for instant cache-busting.

= 1.1.6 =
*   Bug Fix: Parsed localized Proactive Sales Trigger settings to integers in frontend JS. This resolves type mismatch issues caused by wp_localize_script() natively serializing numeric options to strings, ensuring Inactivity, Scroll Depth, and Exit Intent triggers fire reliably on user interaction.
*   Enhancement: Aligned plugin and asset versions to 1.1.6 for instant cache-busting.

= 1.1.5 =
*   Feature: Added customizable chatbot avatar icon support (Avatar Icon URL setting) allowing merchants to configure their own transparent logo/icon.
*   Enhancement: Aligned plugin and asset versions to 1.1.5 for instant cache-busting.

= 1.1.4 =
*   Fix: Restored and corrected premium subscription payment links in the back-office dashboard cards to point directly to your live Stripe Checkout pages.
*   Feature: Synchronized the dynamic clients' custom slug metadata and pre-filled email passing inside the Stripe links on-the-fly.

= 1.1.3 =
*   New: Added subtle "Powered by Axelsson Graphics" branding link inside the chat widget for free/demo accounts (hidden automatically on upgraded premium versions).
*   Update: Fully tested and certified compatible with WordPress 7.0.3.
*   Enhancement: Bumped asset cache-busters to prevent browser caching.

= 1.1.2 =
*   New: Intelligent pro-active WooCommerce prompt engineering for precise recommendations.
*   New: Integrated secure automated order status and shipment tracking with post-purchase instructions.
*   New: Self-healing logs database tables creation dynamically on-the-fly.
*   New: Serverside HTML and stylesheet cleanup guardrail to prevent cutting off or layout issues.
*   Enhanced: Raised analytical report output limits to 4000 tokens for massive, detailed insights.

= 1.0.0 =
*   Initial official release.
*   Secure real-time WooCommerce catalog scanning & product recommender engine.
*   Floating responsive widget with product page viewing-context mapping.
*   Turn-key back-office Conversation Insights with one-click Gemini-powered trend analysis.
*   Native support for 13 global languages.
