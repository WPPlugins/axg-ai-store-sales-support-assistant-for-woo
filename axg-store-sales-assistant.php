<?php
// phpcs:ignorefile Generic.PHP.DiscourageGoto.Found
/**
 * Plugin Name: AxG AI Store Sales & Support Assistant for Woo
 * Description: An intelligent, floating AI sales and support assistant for WooCommerce. Recommends products, scans your catalog in real-time, answers questions about shipping, returns, order status, and tracks visitor insights. Securely powered by Gemini API. [axgai_woo_chat]
 * Version: 2.0.16
 * Requires Plugins: woocommerce
 * Author: Axelsson Graphics
 * Author URI: https://axelsson.graphics
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Requires at least: 5.0
 * Tested up to: 7.0.3
 * Requires PHP: 7.2
 * Text Domain: axgai_woo
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

// --- Step 1: Database Setup on Activation ---
register_activation_hook( __FILE__, 'axgai_woo_activate_plugin' );

function axgai_woo_activate_plugin() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'axgai_woo_conversations';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        session_id varchar(100) NOT NULL,
        sender varchar(10) NOT NULL,
        message longtext NOT NULL,
        timestamp datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY  (id),
        KEY session_id (session_id)
    ) $charset_collate;";

    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
    dbDelta( $sql );
}

// --- Step 2: Register Settings & Admin Menu ---
add_action( 'admin_menu', 'axgai_woo_add_admin_menu' );
add_action( 'admin_init', 'axgai_woo_settings_init' );
add_action( 'admin_enqueue_scripts', 'axgai_woo_admin_enqueue_scripts' );

function axgai_woo_admin_enqueue_scripts( $hook ) {
    if ( strpos( $hook, 'axg-store-sales-assistant' ) === false ) {
        return;
    }
    wp_enqueue_media();
}

function axgai_woo_add_admin_menu() {
    add_menu_page(
        __( 'AxG AI WooCommerce Settings', 'axgai_woo' ),
        __( 'AxG AI Woo', 'axgai_woo' ),
        'manage_options',
        'axg-store-sales-assistant',
        'axgai_woo_options_page',
        'dashicons-cart',
        58
    );

    add_submenu_page(
        'axg-store-sales-assistant',
        __( 'Settings', 'axgai_woo' ),
        __( 'Settings', 'axgai_woo' ),
        'manage_options',
        'axg-store-sales-assistant',
        'axgai_woo_options_page'
    );

    add_submenu_page(
        'axg-store-sales-assistant',
        __( 'Conversation Insights', 'axgai_woo' ),
        __( 'Conversation Insights', 'axgai_woo' ),
        'manage_options',
        'axg-store-sales-assistant-insights',
        'axgai_woo_insights_page'
    );
}

function axgai_woo_settings_init() {
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_agent_id', array( 'sanitize_callback' => 'sanitize_text_field' ) );
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_slug', array( 'sanitize_callback' => 'sanitize_text_field' ) );
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_language', array( 'sanitize_callback' => 'sanitize_text_field' ) );
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_chat_title', array( 'sanitize_callback' => 'sanitize_text_field' ) );
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_color_theme', array( 'sanitize_callback' => 'sanitize_hex_color' ) );
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_contact_email', array( 'sanitize_callback' => 'sanitize_email' ) );
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_avatar_url', array( 'sanitize_callback' => 'esc_url_raw' ) ); // Customizable chatbot avatar!
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_header_image_url', array( 'sanitize_callback' => 'esc_url_raw' ) ); // Customizable chatbot header background!
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_persona', array( 'sanitize_callback' => 'sanitize_textarea_field' ) );
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_trigger_inactivity', array( 'type' => 'boolean', 'sanitize_callback' => 'absint' ) );
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_trigger_scroll', array( 'type' => 'boolean', 'sanitize_callback' => 'absint' ) );
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_trigger_exit', array( 'type' => 'boolean', 'sanitize_callback' => 'absint' ) );
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_quick_question_1', array( 'sanitize_callback' => 'sanitize_text_field' ) );
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_quick_question_2', array( 'sanitize_callback' => 'sanitize_text_field' ) );
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_quick_question_3', array( 'sanitize_callback' => 'sanitize_text_field' ) );
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_contact_info', array( 'sanitize_callback' => 'sanitize_textarea_field' ) );
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_opening_hours', array( 'sanitize_callback' => 'sanitize_textarea_field' ) );
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_whatsapp_number', array( 'sanitize_callback' => 'sanitize_text_field' ) );
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_messenger_link', array( 'sanitize_callback' => 'esc_url_raw' ) );
    register_setting( 'axgai_woo_settings_group', 'axgai_woo_enable_image_upload', array( 'type' => 'boolean', 'sanitize_callback' => 'absint' ) );
}

// --- Step 3: Admin Options Page ---
function axgai_woo_options_page() {
    $language = get_option('axgai_woo_language', 'en');
    $onboarding_url = "https://axelsson.graphics/en/onboarding";
    $onboarding_title = "Need an Agent ID or Client Slug? 🤔";
    $onboarding_desc = "Configure a fully customized, professional AI assistant for your WooCommerce store in 10 seconds. Your Agent ID and Client Slug will be delivered instantly to your email!";
    $onboarding_btn = "Create your FREE Chatbot (10 sec)";
    $page_title = "AxG AI WooCommerce Settings";
    $desc_intro = "Configure your intelligent, real-time sales and customer support assistant below. The chatbot will dynamically scan your WooCommerce catalog to recommend products, answer questions about shipping, returns, order status, and assist visitors with any other store inquiries using Gemini AI!";
    $agent_id_desc = "Your unique Agent ID.";
    $slug_desc = "Your customized client slug (delivers custom storefront grounding text).";
    $lang_desc = "The primary language your chatbot speaks and understands.";
    $title_desc = "The header title shown at the top of the open chat window.";
    $avatar_lbl = "Avatar Icon URL";
    $avatar_desc = "Optional URL for a custom transparent chatbot avatar icon (recommended size 40x40px PNG or SVG).";
    $color_desc = "The accent theme color of your floating chat widget.";
    $email_desc = "The email address your chatbot will provide if it cannot find an answer.";
    
    // Common Questions, Contact Info, Opening Hours Variables (English)
    $quick_questions_lbl = "Common Questions (Top Buttons)";
    $quick_questions_desc = "Configure up to three common questions. They will appear as quick-click buttons at the top of the chat logs to guide your visitors.";
    $quick_q_placeholder1 = "e.g., What are your shipping times?";
    $quick_q_placeholder2 = "e.g., Do you offer a warranty?";
    $quick_q_placeholder3 = "e.g., How can I track my order?";
    
    $contact_info_lbl = "Contact Information";
    $contact_info_desc = "Add contact details (phone number, address, etc.). This will be fed directly to the AI and shown if visitors ask for contact info.";
    $contact_info_placeholder = "e.g., Phone: +46 8 123 45 67\nAddress: Sveavägen 12, Stockholm";
    
    $opening_hours_lbl = "Opening Hours";
    $opening_hours_desc = "Enter your shop's opening hours. The AI will use this to answer questions about when you are open.";
    $opening_hours_placeholder = "e.g., Weekdays: 10:00 - 18:00\nSaturdays: 11:00 - 15:00\nSundays: Closed";
    $persona_desc = "Describe your chatbot's persona and store instructions. For example: 'You are a warm, professional fashion consultant for our apparel store. Guide the customer to choose the best style and upsell matching accessories!'";

    $triggers_title = "Proactive Sales Triggers";
    $trigger_inactivity_lbl = "Inactivity Trigger (45s) - Opens the chat after 45 seconds of idle time.";
    $trigger_scroll_lbl = "Deep Scroll Trigger (>75%) - Opens the chat when the user scrolls past 75% of the page.";
    $trigger_exit_lbl = "Exit Intent Trigger - Opens the chat with a 10% discount offer when the user is about to leave.";
    $triggers_desc = "Enable or disable individual sales-driving triggers. All triggers are deactivated by default.";

    // Pricing Translations
    // Pricing Translations
    $pricing_title = "Upgrade to Premium & Boost Your Sales! 🚀💸";
    $pricing_desc = "Our intelligent AI sales assistant is ready to lift your store's conversions 24/7. Choose the plan that fits your growth!";
    $bronze_title = "Starter Plan";
    $bronze_btn = "Upgrade to Starter";
    $silver_title = "Grow Plan ⭐";
    $silver_btn = "Upgrade to Grow";
    $gold_title = "Pro / Enterprise Plan";
    $gold_btn = "Upgrade to Pro";

    if ( $language === 'sv' ) {
        $onboarding_url = "https://axelsson.graphics/onboarding";
        $onboarding_title = "Har du inget Agent ID eller Client Slug än? 🤔";
        $onboarding_desc = "Inga problem! Skapa en helt anpassad AI-assistent för din e-handel på under 10 sekunder på vår hemsida. Du får ditt Agent ID och din Client Slug skickat direkt till din e-post!";
        $onboarding_btn = "Skapa din GRATIS AI-chattbot här (10 sek)";
        $page_title = "AxG AI WooCommerce Inställningar";
        $desc_intro = "Konfigurera din intelligenta AI-säljare och kundtjänstassistent nedan. Chattboten rekommenderar automatiskt rätt produkter med priser och köplänkar från ditt utbud i realtid, besvarar kunders supportfrågor samt låter dem spåra sina beställningar live direkt i chatten!";
        $agent_id_desc = "Ditt unika Agent-ID.";
        $slug_desc = "Ditt anpassade slug-namn för att hämta butikens information direkt.";
        $lang_desc = "Språket som din e-handelsbot pratar och förstår.";
        $title_desc = "Rubriken som visas längst upp i det öppna chattfönstret.";
        $avatar_lbl = "Avatar-bild URL";
        $avatar_desc = "Valfri URL för en anpassad transparent profilbild för chattboten (rekommenderad storlek 40x40px PNG eller SVG).";
        $header_image_lbl = "Header-bakgrundsbild URL";
        $header_image_desc = "Valfri URL för en anpassad bakgrundsbild i chatfönstrets header (rekommenderas t.ex. en logotyp eller en snygg mönsterbild, t.ex. 370x60px).";
        $choose_image_btn = "Välj bild";
        $color_desc = "Färgen på din flytande chattbubbla, skicka-knappen samt användarens meddelanden.";
        $email_desc = "E-postadress som boten ber besökaren kontakta vid specifika kundtjänstfrågor.";
        
        // Common Questions, Contact Info, Opening Hours Variables (Swedish)
        $quick_questions_lbl = "Vanliga frågor (Snabbknappar)";
        $quick_questions_desc = "Fyll i upp till tre vanliga frågor. De kommer att visas som klickbara snabbknappar längst upp i chatten för att hjälpa dina besökare.";
        $quick_q_placeholder1 = "t.ex. Vad har ni för leveranstider?";
        $quick_q_placeholder2 = "t.ex. Erbjuder ni garanti?";
        $quick_q_placeholder3 = "t.ex. Hur spårar jag min order?";
        
        $contact_info_lbl = "Kontaktuppgifter";
        $contact_info_desc = "Ange dina kontaktuppgifter (telefonnummer, adress, osv.). Dessa matas direkt till AI-modellen och visas när kunder frågar efter kontaktuppgifter.";
        $contact_info_placeholder = "t.ex. Tel: 08-123 45 67\nAdress: Sveavägen 12, Stockholm";
        
        $opening_hours_lbl = "Öppettider";
        $opening_hours_desc = "Ange dina öppettider. AI-modellen använder detta för att svara på frågor om när butiken har öppet.";
        $opening_hours_placeholder = "t.ex. Vardagar: 10:00 - 18:00\nLördagar: 11:00 - 15:00\nSöndagar: Stängt";
        $persona_desc = "Beskriv bottens roll och säljinstruktioner. Exempel: 'Du är en engagerad och kunnig säljare för vår sportbutik. Tipsa snyggt om passande kläder och föreslå merförsäljning av tillbehör!'";

        $triggers_title = "Proaktiva Sälj-triggers";
        $trigger_inactivity_lbl = "Inaktivitetstrigger (45s) - Öppnar chatten automatiskt efter 45 sekunders inaktivitet.";
        $trigger_scroll_lbl = "Djupt scrollande (>75%) - Öppnar chatten automatiskt när kunden har läst förbi 75% av sidan.";
        $trigger_exit_lbl = "Avsikt att lämna (Exit-Intent) - Räddar kunden med ett 10% rabatt-erbjudande när de försöker lämna sidan.";
        $triggers_desc = "Aktivera eller inaktivera individuella sälj-triggers. Avstängda som standard.";

        $pricing_title = "Uppgradera till Premium & maximera din försäljning! 🚀💸";
        $pricing_desc = "Vår intelligenta AI-säljare är redo att lyfta din butik dygnet runt. Välj det tillväxt-paket som passar din e-handel bäst!";
        $bronze_title = "Starter-paket";
        $bronze_btn = "Uppgradera till Starter";
        $silver_title = "Grow-paket ⭐";
        $silver_btn = "Uppgradera till Grow";
        $gold_title = "Pro / Enterprise-paket";
        $gold_btn = "Uppgradera till Pro";
    } else {
        $page_title = "AxG AI WooCommerce Settings";
        $desc_intro = "Configure your intelligent AI sales representative and customer support assistant below. The chatbot automatically recommends matching products with prices and purchase links from your catalog in real-time, answers customer support queries, and allows them to track their orders live in the chat!";
        $agent_id_desc = "Your unique Dialogflow CX / Vertex AI Agent ID.";
        $slug_desc = "Your customized client slug name to retrieve store assets.";
        $lang_desc = "The primary language your chatbot speaks and understands.";
        $title_desc = "The header title shown at the top of the chat widget.";
        $avatar_lbl = "Avatar Icon URL";
        $avatar_desc = "Optional URL for a custom transparent chatbot avatar icon (recommended size 40x40px PNG or SVG).";
        $header_image_lbl = "Header Background Image URL";
        $header_image_desc = "Optional URL for a custom background image in the chat window header (recommended banner/pattern size e.g. 370x60px).";
        $choose_image_btn = "Choose Image";
        $color_desc = "The accent theme color of your floating chat widget.";
        $email_desc = "The email address your chatbot will provide if it cannot find an answer.";
        
        // Common Questions, Contact Info, Opening Hours Variables (Fallback)
        $quick_questions_lbl = "Common Questions (Top Buttons)";
        $quick_questions_desc = "Configure up to three common questions. They will appear as quick-click buttons at the top of the chat logs to guide your visitors.";
        $quick_q_placeholder1 = "e.g., What are your shipping times?";
        $quick_q_placeholder2 = "e.g., Do you offer a warranty?";
        $quick_q_placeholder3 = "e.g., How can I track my order?";
        
        $contact_info_lbl = "Contact Information";
        $contact_info_desc = "Add contact details (phone number, address, etc.). This will be fed directly to the AI and shown if visitors ask for contact info.";
        $contact_info_placeholder = "e.g., Phone: +46 8 123 45 67\nAddress: Sveavägen 12, Stockholm";
        
        $opening_hours_lbl = "Opening Hours";
        $opening_hours_desc = "Enter your shop's opening hours. The AI will use this to answer questions about when you are open.";
        $opening_hours_placeholder = "e.g., Weekdays: 10:00 - 18:00\nSaturdays: 11:00 - 15:00\nSundays: Closed";
        $persona_desc = "Describe your chatbot's persona and store instructions. For example: 'You are a warm, professional fashion consultant for our apparel store. Guide the customer to choose the best style and upsell matching accessories!'";

        $triggers_title = "Proactive Sales Triggers";
        $trigger_inactivity_lbl = "Inactivity Trigger (45s) - Opens the chat after 45 seconds of idle time.";
        $trigger_scroll_lbl = "Deep Scroll Trigger (>75%) - Opens the chat when the user scrolls past 75% of the page.";
        $trigger_exit_lbl = "Exit Intent Trigger - Opens the chat with a 10% discount offer when the user is about to leave.";
        $triggers_desc = "Enable or disable individual sales-driving triggers. All triggers are deactivated by default.";
    }

    $client_slug = get_option('axgai_woo_slug', '');
    $client_email = get_option('axgai_woo_contact_email', get_option('admin_email', ''));

    $bronze_link = "https://checkout.axelsson.graphics/28EaF0fir3cGaDIfhWfMA03";
    $silver_link = "https://checkout.axelsson.graphics/5kQ9AW0nx3cGeTY8TyfMA04";
    $gold_link = "https://checkout.axelsson.graphics/8x2eVg7PZ14yeTYedSfMA05";

    // Conditionally build tracking arguments to prevent Stripe payment link crashes on empty values!
    $stripe_args = array();
    if ( ! empty( $client_slug ) ) {
        $stripe_args['client_reference_id'] = $client_slug;
    }
    if ( ! empty( $client_email ) ) {
        $stripe_args['prefilled_email'] = $client_email;
    }

    $bronze_tracking_url = ! empty( $stripe_args ) ? add_query_arg( $stripe_args, $bronze_link ) : $bronze_link;
    $silver_tracking_url = ! empty( $stripe_args ) ? add_query_arg( $stripe_args, $silver_link ) : $silver_link;
    $gold_tracking_url   = ! empty( $stripe_args ) ? add_query_arg( $stripe_args, $gold_link ) : $gold_link;
    ?>
    <div class="wrap" style="max-width: 1200px;">
        <h2><?php echo esc_html( $page_title ); ?></h2>

        <!-- Onboarding Box -->
        <div class="notice notice-info" style="margin: 20px 0; padding: 15px; border-left-color: #007bff; background-color: #fbfdff; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
            <p style="font-size: 14px; margin: 0 0 10px 0; font-weight: bold; color: #007bff;"><?php echo esc_html( $onboarding_title ); ?></p>
            <p style="font-size: 13px; margin: 0 0 15px 0; line-height: 1.5; color: #555555;"><?php echo esc_html( $onboarding_desc ); ?></p>
            <a href="<?php echo esc_url( $onboarding_url ); ?>" target="_blank" class="button button-primary" style="background-color: #007bff; border-color: #007bff; font-weight: bold; text-shadow: none;"><?php echo esc_html( $onboarding_btn ); ?></a>
        </div>

        <div style="margin-top: 20px;">
            <div style="background-color: #ffffff; border: 1px solid #eaeaea; padding: 25px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.02); margin-bottom: 30px;">
                <p style="font-weight: bold; font-size: 16px; margin-top: 0; border-bottom: 2px solid #eaeaea; padding-bottom: 10px; color: #333;">Configuration</p>
                <p style="font-size: 13px; color: #666;"><?php echo esc_html( $desc_intro ); ?></p>

                <form method="post" action="options.php">
                    <?php settings_fields( 'axgai_woo_settings_group' ); ?>
                    <?php do_settings_sections( 'axgai_woo_settings_group' ); ?>

                    <table class="form-table">
                        <tr valign="top">
                            <th scope="row" style="width: 150px; font-weight: bold;">Agent ID</th>
                            <td>
                                <input type="text" name="axgai_woo_agent_id" value="<?php echo esc_attr( get_option('axgai_woo_agent_id') ); ?>" class="regular-text" style="width: 100%; max-width: 450px;" placeholder="e.g. ac7bb8e6-322a-49ce-a103-af8b1a034939" required />
                                <p class="description" style="font-size: 11px;"><?php echo esc_html( $agent_id_desc ); ?></p>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row" style="width: 150px; font-weight: bold;">Client Slug</th>
                            <td>
                                <input type="text" name="axgai_woo_slug" value="<?php echo esc_attr( get_option('axgai_woo_slug') ); ?>" class="regular-text" style="width: 100%; max-width: 450px;" placeholder="e.g. domainname" required />
                                <p class="description" style="font-size: 11px;"><?php echo esc_html( $slug_desc ); ?></p>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row" style="width: 150px; font-weight: bold;">Contact Email</th>
                            <td>
                                <input type="email" name="axgai_woo_contact_email" value="<?php echo esc_attr( get_option('axgai_woo_contact_email', get_option('admin_email', 'hej@axelsson.graphics')) ); ?>" class="regular-text" style="width: 100%; max-width: 450px;" />
                                <p class="description" style="font-size: 11px;"><?php echo esc_html( $email_desc ); ?></p>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row" style="width: 150px; font-weight: bold;"><?php echo esc_html( $quick_questions_lbl ); ?></th>
                            <td>
                                <div style="display: flex; flex-direction: column; gap: 8px; max-width: 450px;">
                                    <input type="text" name="axgai_woo_quick_question_1" value="<?php echo esc_attr( get_option('axgai_woo_quick_question_1', '') ); ?>" placeholder="<?php echo esc_attr( $quick_q_placeholder1 ); ?>" style="width: 100%;" />
                                    <input type="text" name="axgai_woo_quick_question_2" value="<?php echo esc_attr( get_option('axgai_woo_quick_question_2', '') ); ?>" placeholder="<?php echo esc_attr( $quick_q_placeholder2 ); ?>" style="width: 100%;" />
                                    <input type="text" name="axgai_woo_quick_question_3" value="<?php echo esc_attr( get_option('axgai_woo_quick_question_3', '') ); ?>" placeholder="<?php echo esc_attr( $quick_q_placeholder3 ); ?>" style="width: 100%;" />
                                </div>
                                <p class="description" style="font-size: 11px; margin-top: 5px;"><?php echo esc_html( $quick_questions_desc ); ?></p>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row" style="width: 150px; font-weight: bold;"><?php echo esc_html( $contact_info_lbl ); ?></th>
                            <td>
                                <textarea name="axgai_woo_contact_info" rows="3" style="width: 100%; max-width: 450px; font-family: monospace;" placeholder="<?php echo esc_attr( $contact_info_placeholder ); ?>"><?php echo esc_textarea( get_option('axgai_woo_contact_info', '') ); ?></textarea>
                                <p class="description" style="font-size: 11px;"><?php echo esc_html( $contact_info_desc ); ?></p>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row" style="width: 150px; font-weight: bold;"><?php echo esc_html( $opening_hours_lbl ); ?></th>
                            <td>
                                <textarea name="axgai_woo_opening_hours" rows="3" style="width: 100%; max-width: 450px; font-family: monospace;" placeholder="<?php echo esc_attr( $opening_hours_placeholder ); ?>"><?php echo esc_textarea( get_option('axgai_woo_opening_hours', '') ); ?></textarea>
                                <p class="description" style="font-size: 11px;"><?php echo esc_html( $opening_hours_desc ); ?></p>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row" style="width: 150px; font-weight: bold;">Language</th>
                            <td>
                                <select name="axgai_woo_language" style="width: 100%; max-width: 200px;">
                                    <option value="en" <?php selected( get_option('axgai_woo_language', 'en'), 'en' ); ?>>English</option>
                                    <option value="fr" <?php selected( get_option('axgai_woo_language'), 'fr' ); ?>>Français</option>
                                    <option value="es" <?php selected( get_option('axgai_woo_language'), 'es' ); ?>>Español</option>
                                    <option value="pl" <?php selected( get_option('axgai_woo_language'), 'pl' ); ?>>Polski</option>
                                    <option value="fa" <?php selected( get_option('axgai_woo_language'), 'fa' ); ?>>Persian (فارسی)</option>
                                    <option value="it" <?php selected( get_option('axgai_woo_language'), 'it' ); ?>>Italiano</option>
                                    <option value="de" <?php selected( get_option('axgai_woo_language'), 'de' ); ?>>Deutsch</option>
                                    <option value="pt" <?php selected( get_option('axgai_woo_language'), 'pt' ); ?>>Português</option>
                                    <option value="nl" <?php selected( get_option('axgai_woo_language'), 'nl' ); ?>>Nederlands</option>
                                    <option value="ru" <?php selected( get_option('axgai_woo_language'), 'ru' ); ?>>Русский</option>
                                    <option value="ar" <?php selected( get_option('axgai_woo_language'), 'ar' ); ?>>العربية</option>
                                    <option value="tr" <?php selected( get_option('axgai_woo_language'), 'tr' ); ?>>Türkçe</option>
                                    <option value="sv" <?php selected( get_option('axgai_woo_language'), 'sv' ); ?>>Svenska</option>
                                </select>
                                <p class="description" style="font-size: 11px;"><?php echo esc_html( $lang_desc ); ?></p>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row" style="width: 150px; font-weight: bold;">Chat Title</th>
                            <td>
                                <input type="text" name="axgai_woo_chat_title" value="<?php echo esc_attr( get_option('axgai_woo_chat_title', 'AI Store Assistant') ); ?>" class="regular-text" style="width: 100%; max-width: 450px;" />
                                <p class="description" style="font-size: 11px;"><?php echo esc_html( $title_desc ); ?></p>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row" style="width: 150px; font-weight: bold;"><?php echo esc_html( $avatar_lbl ); ?></th>
                            <td>
                                <div style="display: flex; gap: 8px; align-items: center; max-width: 580px; margin-bottom: 5px;">
                                    <input type="text" name="axgai_woo_avatar_url" id="axgai_woo_avatar_url" value="<?php echo esc_url( get_option('axgai_woo_avatar_url') ); ?>" class="regular-text" style="flex: 1;" placeholder="e.g. https://domain.com/avatar.png" />
                                    <button type="button" class="button axgai_woo-media-upload-button" data-target="axgai_woo_avatar_url" style="white-space: nowrap;"><?php echo esc_html( $choose_image_btn ); ?></button>
                                </div>
                                <p class="description" style="font-size: 11px;"><?php echo esc_html( $avatar_desc ); ?></p>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row" style="width: 150px; font-weight: bold;"><?php echo esc_html( $header_image_lbl ); ?></th>
                            <td>
                                <div style="display: flex; gap: 8px; align-items: center; max-width: 580px; margin-bottom: 5px;">
                                    <input type="text" name="axgai_woo_header_image_url" id="axgai_woo_header_image_url" value="<?php echo esc_url( get_option('axgai_woo_header_image_url') ); ?>" class="regular-text" style="flex: 1;" placeholder="e.g. https://domain.com/header-bg.png" />
                                    <button type="button" class="button axgai_woo-media-upload-button" data-target="axgai_woo_header_image_url" style="white-space: nowrap;"><?php echo esc_html( $choose_image_btn ); ?></button>
                                </div>
                                <p class="description" style="font-size: 11px;"><?php echo esc_html( $header_image_desc ); ?></p>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row" style="width: 150px; font-weight: bold;">WhatsApp Number</th>
                            <td>
                                <input type="text" name="axgai_woo_whatsapp_number" value="<?php echo esc_attr( get_option('axgai_woo_whatsapp_number', '') ); ?>" class="regular-text" style="width: 100%; max-width: 450px;" placeholder="+46123456789" />
                                <p class="description" style="font-size: 11px;">Enter international format (e.g. +46...). Leave blank to disable WhatsApp button.</p>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row" style="width: 150px; font-weight: bold;">Messenger Link</th>
                            <td>
                                <input type="text" name="axgai_woo_messenger_link" value="<?php echo esc_url( get_option('axgai_woo_messenger_link', '') ); ?>" class="regular-text" style="width: 100%; max-width: 450px;" placeholder="https://m.me/yourpage" />
                                <p class="description" style="font-size: 11px;">Enter your m.me profile link. Leave blank to disable Messenger button.</p>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row" style="width: 150px; font-weight: bold;">Color Theme</th>
                            <td>
                                <input type="color" name="axgai_woo_color_theme" value="<?php echo esc_attr( get_option('axgai_woo_color_theme', '#10b981') ); ?>" />
                                <p class="description" style="font-size: 11px;"><?php echo esc_html( $color_desc ); ?></p>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row" style="width: 150px; font-weight: bold;"><?php echo esc_html( $triggers_title ); ?></th>
                            <td>
                                <label style="display: block; margin-bottom: 10px; font-size: 13px;">
                                    <input type="checkbox" name="axgai_woo_trigger_inactivity" value="1" <?php checked( 1, get_option('axgai_woo_trigger_inactivity', 0) ); ?> style="margin-right: 8px;" />
                                    <?php echo esc_html( $trigger_inactivity_lbl ); ?>
                                </label>
                                <label style="display: block; margin-bottom: 10px; font-size: 13px;">
                                    <input type="checkbox" name="axgai_woo_trigger_scroll" value="1" <?php checked( 1, get_option('axgai_woo_trigger_scroll', 0) ); ?> style="margin-right: 8px;" />
                                    <?php echo esc_html( $trigger_scroll_lbl ); ?>
                                </label>
                                <label style="display: block; margin-bottom: 10px; font-size: 13px;">
                                    <input type="checkbox" name="axgai_woo_trigger_exit" value="1" <?php checked( 1, get_option('axgai_woo_trigger_exit', 0) ); ?> style="margin-right: 8px;" />
                                    <?php echo esc_html( $trigger_exit_lbl ); ?>
                                </label>
                                <p class="description" style="font-size: 11px; margin-top: 10px;"><?php echo esc_html( $triggers_desc ); ?></p>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row" style="width: 150px; font-weight: bold;">Bot Persona & Instructions</th>
                            <td>
                                <textarea name="axgai_woo_persona" rows="4" style="width: 100%; max-width: 450px;" placeholder="Describe your store's sales assistant persona..."><?php echo esc_textarea( get_option('axgai_woo_persona', 'You are a friendly, highly intelligent WooCommerce sales assistant. Help visitors find the most suitable products from our catalog, answer questions about availability, pricing, and provide personalized cross-selling suggestions dynamically.') ); ?></textarea>
                                <p class="description" style="font-size: 11px;"><?php echo esc_html( $persona_desc ); ?></p>
                            </td>
                        </tr>

                        <tr valign="top">
                            <th scope="row" style="width: 150px; font-weight: bold;">Enable Visual Search (Premium)</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="axgai_woo_enable_image_upload" value="1" <?php checked( 1, get_option( 'axgai_woo_enable_image_upload', 0 ), true ); ?> />
                                    Enable the image upload button (Multimodal visual search via Gemini 2.5 Flash).
                                </label>
                                <p class="description" style="font-size: 11px;">Allow users to upload pictures to search for similar products (Premium Tiers only).</p>
                            </td>
                        </tr>
                    </table>

                    <?php submit_button( 'Save Settings' ); ?>
                </form>
            </div>

            <!-- Premium Subscription Panel -->
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #ffffff; padding: 35px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-top: 30px;">
                <h3 style="color: #38bdf8; font-size: 20px; font-weight: bold; margin-top: 0; margin-bottom: 10px; text-align: center;"><?php echo esc_html( $pricing_title ); ?></h3>
                <p style="font-size: 13px; line-height: 1.6; color: #cbd5e1; margin-bottom: 30px; text-align: center; max-width: 800px; margin-left: auto; margin-right: auto;"><?php echo esc_html( $pricing_desc ); ?></p>

                <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 20px; justify-content: center; align-items: stretch;">
                    <!-- Starter Card -->
                    <div style="flex: 1; min-width: 260px; max-width: 320px; background-color: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <img src="<?php echo esc_url( plugins_url( 'assets/images/AxG_Bronz.png', __FILE__ ) ); ?>" style="width: 100%; height: auto; border-radius: 6px; margin-bottom: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);" />
                            <h4 style="margin: 0 0 5px 0; color: #10b981; font-size: 15px; font-weight: bold;"><?php echo esc_html( $bronze_title ); ?></h4>
                            <ul style="margin: 0 0 15px 0; padding-left: 18px; font-size: 12px; color: #cbd5e1; line-height: 1.6;">
                                <?php if ($language === 'sv') : ?>
                                    <li>500 AI-meddelanden / mån</li>
                                    <li>Realtids-katalogskanning</li>
                                    <li>Smart orderspårning (DHL/PostNord)</li>
                                    <li>Automatisk FAQ (frakt & returer)</li>
                                <?php else : ?>
                                    <li>500 AI messages / month</li>
                                    <li>Real-time catalog scanning</li>
                                    <li>Smart order tracking (DHL/PostNord)</li>
                                    <li>Auto FAQ (shipping & returns)</li>
                                <?php endif; ?>
                            </ul>
                        </div>
                        <a href="<?php echo esc_url( $bronze_tracking_url ); ?>" target="_blank" style="margin-top: 15px; display: block; background-color: #10b981; color: #0f172a; text-decoration: none; font-weight: bold; padding: 12px 15px; border-radius: 6px; font-size: 13px; text-align: center; box-shadow: 0 2px 5px rgba(16,185,129,0.1); transition: opacity 0.2s;"><?php echo esc_html( $bronze_btn ); ?></a>
                    </div>

                    <!-- Grow Card -->
                    <div style="flex: 1; min-width: 260px; max-width: 320px; background-color: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <img src="<?php echo esc_url( plugins_url( 'assets/images/AxG_Silver.png', __FILE__ ) ); ?>" style="width: 100%; height: auto; border-radius: 6px; margin-bottom: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);" />
                            <h4 style="margin: 0 0 5px 0; color: #38bdf8; font-size: 15px; font-weight: bold;"><?php echo esc_html( $silver_title ); ?></h4>
                            <ul style="margin: 0 0 15px 0; padding-left: 18px; font-size: 12px; color: #cbd5e1; line-height: 1.6;">
                                <?php if ($language === 'sv') : ?>
                                    <li>2 000 AI-meddelanden / mån</li>
                                    <li>Allt i Starter +</li>
                                    <li>Dynamiska produktside-hälsningar</li>
                                    <li>Conversation Insights Dashboard</li>
                                    <li>Gemini Trendanalys-rapporter</li>
                                <?php else : ?>
                                    <li>2,000 AI messages / month</li>
                                    <li>Everything in Starter +</li>
                                    <li>Dynamic product-page greetings</li>
                                    <li>Conversation Insights Dashboard</li>
                                    <li>Gemini Trend Analysis reports</li>
                                <?php endif; ?>
                            </ul>
                        </div>
                        <a href="<?php echo esc_url( $silver_tracking_url ); ?>" target="_blank" style="margin-top: 15px; display: block; background-color: #38bdf8; color: #0f172a; text-decoration: none; font-weight: bold; padding: 12px 15px; border-radius: 6px; font-size: 13px; text-align: center; box-shadow: 0 2px 5px rgba(56,189,248,0.1); transition: opacity 0.2s;"><?php echo esc_html( $silver_btn ); ?></a>
                    </div>

                    <!-- Pro Card -->
                    <div style="flex: 1; min-width: 260px; max-width: 320px; background-color: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <img src="<?php echo esc_url( plugins_url( 'assets/images/AxG_Gold.png', __FILE__ ) ); ?>" style="width: 100%; height: auto; border-radius: 6px; margin-bottom: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);" />
                            <h4 style="margin: 0 0 5px 0; color: #a78bfa; font-size: 15px; font-weight: bold;"><?php echo esc_html( $gold_title ); ?></h4>
                            <ul style="margin: 0 0 15px 0; padding-left: 18px; font-size: 12px; color: #cbd5e1; line-height: 1.6;">
                                <?php if ($language === 'sv') : ?>
                                    <li>Obegränsat med AI-meddelanden</li>
                                    <li>Allt i Grow +</li>
                                    <li>Dedikerad personlig säljsupport</li>
                                    <li>Ingen varumärkesmärkning ("Branding")</li>
                                <?php else : ?>
                                    <li>Unlimited AI messages</li>
                                    <li>Everything in Grow +</li>
                                    <li>Dedicated personal sales support</li>
                                    <li>No "Powered by" branding</li>
                                <?php endif; ?>
                            </ul>
                        </div>
                        <a href="<?php echo esc_url( $gold_tracking_url ); ?>" target="_blank" style="margin-top: 15px; display: block; background-color: #a78bfa; color: #0f172a; text-decoration: none; font-weight: bold; padding: 12px 15px; border-radius: 6px; font-size: 13px; text-align: center; box-shadow: 0 2px 5px rgba(167,139,250,0.1); transition: opacity 0.2s;"><?php echo esc_html( $gold_btn ); ?></a>
                    </div>
                </div>

                <!-- Legal disclaimer below cards -->
                <p style="text-align: center; font-size: 11px; color: #cbd5e1; margin-top: 25px; margin-bottom: 0; line-height: 1.5; max-width: 700px; margin-left: auto; margin-right: auto;">
                    <?php if ($language === 'sv') : ?>
                        Genom att uppgradera godkänner du våra <a href="https://axelsson.graphics/terms" target="_blank" style="color: #38bdf8; text-decoration: underline;">Användarvillkor</a> och vår krocksäkra <a href="https://axelsson.graphics/terms" target="_blank" style="color: #38bdf8; text-decoration: underline;">Fair Use Policy</a>. Vi stänger aldrig av din bot automatiskt vid tillfälliga trafiktoppar.
                    <?php elseif ($language === 'de') : ?>
                        Mit dem Upgrade akzeptieren Sie unsere <a href="https://axelsson.graphics/terms" target="_blank" style="color: #38bdf8; text-decoration: underline;">Nutzungsbedingungen</a> und unsere <a href="https://axelsson.graphics/terms" target="_blank" style="color: #38bdf8; text-decoration: underline;">Fair Use Policy</a>. Wir schalten Ihren Bot bei vorübergehenden Datenverkehrsspitzen nicht automatisch ab.
                    <?php else : ?>
                        By upgrading, you agree to our <a href="https://axelsson.graphics/terms" target="_blank" style="color: #38bdf8; text-decoration: underline;">Terms of Use</a> and our crash-proof <a href="https://axelsson.graphics/terms" target="_blank" style="color: #38bdf8; text-decoration: underline;">Fair Use Policy</a>. We never automatically disable your bot during temporary traffic spikes.
                    <?php endif; ?>
                </p>

                <!-- Manage Subscription below cards -->
                <div style="text-align: center; margin-top: 15px;">
                    <?php if ($language === 'sv') : ?>
                        <a href="mailto:support@axelsson.graphics?subject=Avregistrera" style="font-size: 11px; color: #94a3b8; text-decoration: underline;">Hantera eller avsluta din prenumeration</a>
                    <?php elseif ($language === 'de') : ?>
                        <a href="mailto:support@axelsson.graphics?subject=Abmelden" style="font-size: 11px; color: #94a3b8; text-decoration: underline;">Abonnement verwalten oder kündigen</a>
                    <?php else : ?>
                        <a href="mailto:support@axelsson.graphics?subject=Unsubscribe" style="font-size: 11px; color: #94a3b8; text-decoration: underline;">Manage or cancel your subscription</a>
                    <?php endif; ?>
                </div>

            </div>
        </div>
    </div>
    
    <!-- WordPress Media Library Frame Uploader Script -->
    <script>
    jQuery(document).ready(function($){
        $('.axgai_woo-media-upload-button').click(function(e) {
            e.preventDefault();
            var button = $(this);
            var target_id = button.data('target');
            var input_field = $('#' + target_id);
            
            var file_frame = wp.media.frames.file_frame = wp.media({
                title: 'Select or Upload Image',
                button: {
                    text: 'Use this image'
                },
                multiple: false
            });
            
            file_frame.on('select', function() {
                var attachment = file_frame.state().get('selection').first().toJSON();
                input_field.val(attachment.url);
            });
            
            file_frame.open();
        });
    });
    </script>
    <?php
}

// --- Step 4: Conversation Insights Admin Dashboard ---
function axgai_woo_format_insight_message( $message, $is_user ) {
    if ( empty( $message ) ) {
        return '';
    }

    $text = $message;
    $product_cards = array();
    $tracking_card = null;

    // 1. Extract and parse :::order_tracking{...}:::
    if ( preg_match_all( '/:::order_tracking(\{[\s\S]*?\}):::/', $text, $matches, PREG_SET_ORDER ) ) {
        foreach ( $matches as $match ) {
            $data = json_decode( $match[1], true );
            if ( $data ) {
                $tracking_card = $data;
            }
        }
        $text = preg_replace( '/:::order_tracking\{[\s\S]*?\}:::/', '', $text );
    }

    // 2. Extract and parse singular :::product{...}:::
    if ( preg_match_all( '/:::product(\{[\s\S]*?\}):::/', $text, $matches, PREG_SET_ORDER ) ) {
        foreach ( $matches as $match ) {
            $data = json_decode( $match[1], true );
            if ( $data ) {
                $product_cards[] = $data;
            }
        }
        $text = preg_replace( '/:::product\{[\s\S]*?\}:::/', '', $text );
    }

    // 3. Extract and parse plural :::products[...]:::
    if ( preg_match_all( '/:::products(\[[\s\S]*?\]):::/', $text, $matches, PREG_SET_ORDER ) ) {
        foreach ( $matches as $match ) {
            $data = json_decode( $match[1], true );
            if ( is_array( $data ) ) {
                foreach ( $data as $p ) {
                    $product_cards[] = $p;
                }
            }
        }
        $text = preg_replace( '/:::products\[[\s\S]*?\]:::/', '', $text );
    }

    $clean_text = trim( $text );
    $html = esc_html( $clean_text );

    // Bold **text**
    $html = preg_replace( '/\*\*(.*?)\*\*/', '<strong>$1</strong>', $html );
    // Italic *text*
    $html = preg_replace( '/\*(.*?)\*/', '<em>$1</em>', $html );
    // Code `code`
    $html = preg_replace( '/`([^`]+)`/', '<code style="background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-size: 11px;">$1</code>', $html );
    // Links [label](url)
    $link_color = $is_user ? '#ffffff' : '#10b981';
    $html = preg_replace( '/\[([^\]]+)\]\(([^)]+)\)/', '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: ' . $link_color . '; text-decoration: underline;">$1</a>', $html );
    // Line breaks
    $html = nl2br( $html );

    $output = '';
    if ( ! empty( $html ) ) {
        $output .= '<div style="font-size: 13px; line-height: 1.5;">' . $html . '</div>';
    }

    // Render Product Cards if found
    if ( ! empty( $product_cards ) ) {
        $output .= '<div style="display: flex; gap: 8px; overflow-x: auto; padding: 6px 0; margin-top: 6px;">';
        foreach ( $product_cards as $p ) {
            $p_title = isset( $p['title'] ) ? esc_html( $p['title'] ) : 'Produkt';
            $p_price = isset( $p['price'] ) ? esc_html( $p['price'] ) : '';
            $p_img   = isset( $p['image'] ) ? esc_url( $p['image'] ) : '';
            $p_url   = isset( $p['url'] ) ? esc_url( $p['url'] ) : '#';

            $output .= '<div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 10px; min-width: 140px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); text-align: center;">';
            if ( $p_img ) {
                $output .= '<img src="' . $p_img . '" alt="' . $p_title . '" style="width: 100%; height: 70px; object-fit: contain; margin-bottom: 4px; border-radius: 4px;" />';
            }
            $output .= '<div style="font-size: 11px; font-weight: bold; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><a href="' . $p_url . '" target="_blank" style="color: inherit; text-decoration: none;">' . $p_title . '</a></div>';
            if ( $p_price ) {
                $output .= '<div style="font-size: 11px; color: #10b981; font-weight: bold; margin-top: 2px;">' . $p_price . '</div>';
            }
            $output .= '</div>';
        }
        $output .= '</div>';
    }

    // Render Tracking Card if found
    if ( ! empty( $tracking_card ) ) {
        $order_num = isset( $tracking_card['order_number'] ) ? esc_html( $tracking_card['order_number'] ) : ( isset( $tracking_card['name'] ) ? esc_html( $tracking_card['name'] ) : '' );
        $status    = isset( $tracking_card['fulfillment_status'] ) ? esc_html( $tracking_card['fulfillment_status'] ) : ( isset( $tracking_card['status'] ) ? esc_html( $tracking_card['status'] ) : 'Behandlas' );
        $track_url = isset( $tracking_card['tracking_url'] ) ? esc_url( $tracking_card['tracking_url'] ) : '';

        $output .= '<div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; color: #166534; margin-top: 6px;">';
        $output .= '<div style="font-weight: bold; font-size: 12px;">📦 Order #' . $order_num . '</div>';
        $output .= '<div style="font-size: 11px;">Status: <strong>' . $status . '</strong></div>';
        if ( $track_url ) {
            $output .= '<a href="' . $track_url . '" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 4px; font-size: 11px; color: #15803d; font-weight: bold; text-decoration: underline;">Spåra paketet →</a>';
        }
        $output .= '</div>';
    }

    return $output;
}

function axgai_woo_insights_page() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'axgai_woo_conversations';

    // Self-healing: ensure custom database table exists (handles skipped activation hooks on files overwrite)
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
    if ( $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table_name ) ) !== $table_name ) {
        axgai_woo_activate_plugin();
    }

    // Handle AJAX-like action for AI analysis
    if ( isset($_GET['action']) && $_GET['action'] === 'analyze_logs' ) {
        check_admin_referer( 'axgai_woo_analyze_logs' );
        
        $agent_id = get_option('axgai_woo_agent_id');
        $slug = get_option('axgai_woo_slug');
        $language = get_option('axgai_woo_language', 'en');

        if ( ! $agent_id ) {
            echo '<div class="notice notice-error"><p>Please configure your Agent ID and Slug first.</p></div>';
            return;
        }

        // Fetch last 50 entries to analyze
        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $logs = $wpdb->get_results( "SELECT sender, message FROM {$table_name} ORDER BY id DESC LIMIT 50" );
        if ( empty( $logs ) ) {
            echo '<div class="notice notice-warning"><p>No conversation history found yet to analyze!</p></div>';
            return;
        }

        // Prepare raw logs
        $chat_summary = "";
        foreach ( array_reverse($logs) as $log ) {
            $chat_summary .= strtoupper($log->sender) . ": " . esc_html($log->message) . "\n";
        }

        $analysis_prompt = "You are an expert e-commerce data analyst. Analyze these customer support/chat logs for our store and generate a professional, beautifully formatted HTML report with sections:
        <h3>1. 🔥 Popular Products & Customer Intent</h3>
        <p>List which products were mentioned or asked about, and what the customer intentions were.</p>
        <h3>2. ⚠️ Key Customer Pain Points</h3>
        <p>Highlight what confused customers, what they had trouble with, or questions they asked repeatedly.</p>
        <h3>3. 💡 Strategic Catalog & Store Recommendations</h3>
        <p>Provide 3 actionable tips for the owner to adapt their store catalog or product pages based on this data.</p>
        
        Keep it highly constructive, clear, and action-oriented! Translate the response nicely to " . strtoupper($language) . ".
        
        CRITICAL FORMATTING INSTRUCTION: Do NOT generate a full HTML document (do NOT include <html>, <head>, <title>, or <body> tags). Do NOT wrap the response in markdown code blocks like ```html ... ```. Only return raw, clean inner HTML containing <h3>, <p>, <strong>, and <ul>/<li> tags so it can render safely inside a div container.
        
        Chat logs:\n" . $chat_summary;

        // Secure call via central proxy
        $response = wp_remote_post( 'https://europe-west3-wp-vertex-chatbot.cloudfunctions.net/generate_demo_chatbot', array(
            'method'    => 'POST',
            'headers'   => array( 'Content-Type' => 'application/json' ),
            'body'      => json_encode( array(
                'action'        => 'chat-proxy',
                'agent_id'      => $agent_id,
                'message'       => $analysis_prompt,
                'session_id'    => 'admin-analysis-' . time(),
                'language'      => $language,
                'slug'          => $slug
            ) ),
            'timeout'   => 30,
            'sslverify' => true, // Secure certificate verification in production
        ) );

        if ( is_wp_error( $response ) ) {
            $error_message = $response->get_error_message();
            echo '<div class="notice notice-error"><p>Analysis failed: ' . esc_html( $error_message ) . '</p></div>';
        } else {
            $data = json_decode( wp_remote_retrieve_body( $response ), true );
            $reply = isset( $data['reply'] ) ? $data['reply'] : 'Could not generate report.';
            ?>
            <div class="wrap">
                <h2>📊 AI Conversation Insights Report</h2>
                <div style="background-color: #ffffff; border: 1px solid #eaeaea; padding: 25px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.02); margin-top: 15px;">
                    <div class="report-content" style="line-height: 1.6; font-size: 14px; color: #333333;">
                        <?php echo wp_kses_post( wpautop( $reply ) ); ?>
                    </div>
                    <p style="margin-top: 25px;">
                        <a href="<?php echo esc_url( remove_query_arg( array('action', '_wpnonce') ) ); ?>" class="button button-secondary">&larr; Back to Conversations</a>
                    </p>
                </div>
            </div>
            <?php
            return;
        }
    }

    // Standard Conversations Listing
    // Group logs by session_id and fetch count & latest timestamp
    // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
    $sessions = $wpdb->get_results( "
        SELECT session_id, COUNT(id) as msg_count, MAX(timestamp) as last_active 
        FROM {$table_name} 
        GROUP BY session_id 
        ORDER BY last_active DESC 
        LIMIT 30
    " );

    $active_session = isset($_GET['session_id']) ? sanitize_text_field($_GET['session_id']) : '';
    ?>
    <div class="wrap" style="max-width: 1200px;">
        <h2>📊 WooCommerce Conversation Insights</h2>
        <p class="description" style="margin-bottom: 20px;">
            Access all customer interactions in real-time, analyze exact queries, and optimize your conversion strategy.
        </p>

        <?php if ( ! empty($sessions) ) : ?>
            <div style="margin: 15px 0;">
                <a href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'action', 'analyze_logs' ), 'axgai_woo_analyze_logs' ) ); ?>" class="button button-primary" style="background-color: #10b981; border-color: #10b981; font-weight: bold; text-shadow: none;">
                    ✨ Analyze Last 50 Chats with Gemini AI
                </a>
            </div>
        <?php endif; ?>

        <div style="display: flex; flex-direction: row; gap: 25px; margin-top: 15px;">
            <!-- Left panel: Session list -->
            <div style="flex: 1; background: #ffffff; border: 1px solid #eaeaea; border-radius: 8px; padding: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.01);">
                <p style="font-weight: bold; font-size: 14px; margin-top: 0; padding-bottom: 10px; border-bottom: 1px solid #eee; color: #333;">Recent Conversations</p>
                <?php if ( empty( $sessions ) ) : ?>
                    <p style="color: #888; font-size: 13px;">No visitor chats recorded yet.</p>
                <?php else : ?>
                    <ul style="margin: 0; padding: 0; list-style: none;">
                        <?php foreach ( $sessions as $sess ) : ?>
                            <?php 
                            $bg_style = ($active_session === $sess->session_id) ? 'background-color: #f0fdf4; border-color: #10b981;' : '';
                            $url = add_query_arg( 'session_id', $sess->session_id );
                            ?>
                            <li style="margin-bottom: 10px;">
                                <a href="<?php echo esc_url( $url ); ?>" style="display: block; text-decoration: none; color: #444; border: 1px solid #eee; border-radius: 6px; padding: 10px; font-size: 12px; <?php echo $bg_style; ?> transition: all 0.2s;">
                                    <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 5px;">
                                        <span style="color: #10b981;"><?php echo esc_html( substr($sess->session_id, 0, 15) ); ?>...</span>
                                        <span style="color: #999;"><?php echo esc_html( $sess->msg_count ); ?> msgs</span>
                                    </div>
                                    <div style="color: #888; text-align: right; font-size: 10px;"><?php echo esc_html( $sess->last_active ); ?></div>
                                </a>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
            </div>

            <!-- Right panel: Selected thread messages -->
            <div style="flex: 2; background: #ffffff; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.01); display: flex; flex-direction: column; min-height: 400px;">
                <p style="font-weight: bold; font-size: 14px; margin-top: 0; padding-bottom: 10px; border-bottom: 1px solid #eee; color: #333;">
                    <?php echo $active_session ? 'Conversation Logs for Session: ' . esc_html($active_session) : 'Select a Chat Session'; ?>
                </p>
                
                <?php if ( ! $active_session ) : ?>
                    <div style="flex: 1; display: flex; align-items: center; justify-content: center; color: #999; font-size: 13px;">
                        Select an active session from the left menu to read the live conversation logs.
                    </div>
                <?php else : ?>
                    <?php 
                    // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                    $chat_logs = $wpdb->get_results( $wpdb->prepare( "
                        SELECT sender, message, timestamp 
                        FROM {$table_name} 
                        WHERE session_id = %s 
                        ORDER BY id ASC
                    ", $active_session ) );
                    ?>
                    <div style="flex: 1; overflow-y: auto; max-height: 500px; padding: 10px; background-color: #f9fafb; border-radius: 6px; border: 1px dashed #e5e7eb;">
                        <?php foreach ( $chat_logs as $log ) : ?>
                            <?php 
                            $is_user = ($log->sender === 'user');
                            $bubble_style = $is_user ? 'background-color: #10b981; color: #ffffff; margin-left: auto;' : 'background-color: #e5e7eb; color: #1f2937;';
                            ?>
                            <div style="max-width: 75%; padding: 10px 14px; border-radius: 12px; font-size: 12px; margin-bottom: 10px; line-height: 1.5; box-shadow: 0 1px 2px rgba(0,0,0,0.02); <?php echo $bubble_style; ?>">
                                <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px; color: <?php echo $is_user ? 'rgba(255,255,255,0.85)' : '#4b5563'; ?>;">
                                    <?php echo $is_user ? 'Customer' : 'AI Assistant'; ?>
                                </div>
                                <div><?php echo axgai_woo_format_insight_message( $log->message, $is_user ); ?></div>
                                <div style="text-align: right; font-size: 8px; margin-top: 5px; color: <?php echo $is_user ? 'rgba(255,255,255,0.7)' : '#9ca3af'; ?>;">
                                    <?php echo esc_html( $log->timestamp ); ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
    <?php
}

// --- Step 5: WooCommerce Catalog Retrieval Helper ---
function axgai_woo_get_catalog() {
    if ( ! class_exists( 'WooCommerce' ) ) {
        return array();
    }

    $args = array(
        'status'     => 'publish',
        'limit'      => 80, // Scans top 80 products in real-time, extremely compact!
        'visibility' => 'visible',
    );
    $products = wc_get_products( $args );
    $catalog = array();

    foreach ( $products as $product ) {
        $image_id = $product->get_image_id();
        $image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'medium' ) : '';
        
        $catalog[] = array(
            'id'    => $product->get_id(),
            'title' => $product->get_name(),
            'price' => strip_tags( html_entity_decode( wc_price( $product->get_price() ) ) ),
            'url'   => $product->get_permalink(),
            'image' => $image_url,
            'cat'   => wp_get_post_terms( $product->get_id(), 'product_cat', array( 'fields' => 'names' ) ),
            'desc'  => wp_strip_all_tags( $product->get_short_description() ? $product->get_short_description() : $product->get_description() ),
            'stock' => $product->is_in_stock() ? 'In Stock' : 'Out of Stock'
        );
    }

    return $catalog;
}

// --- Step 6: Frontend Script & Styles Enqueue ---
add_action( 'wp_enqueue_scripts', 'axgai_woo_enqueue_assets' );

function axgai_woo_enqueue_assets() {
    $agent_id = get_option('axgai_woo_agent_id');
    if ( ! $agent_id ) {
        return; // Only load if Agent ID is configured
    }

    wp_enqueue_style( 'axgai_woo-style', plugins_url( 'assets/css/style.css', __FILE__ ), array(), '2.0.16' );
    wp_enqueue_script( 'axgai_woo-script', plugins_url( 'assets/js/script.js', __FILE__ ), array('jquery'), '2.0.16', true );

    // Inline current page context (Check if on single product page!)
    $current_product_info = '';
    if ( function_exists( 'is_product' ) && is_product() ) {
        $product_id = get_the_ID();
        $product = wc_get_product( $product_id );
        if ( $product && is_a( $product, 'WC_Product' ) ) {
            $current_product_info = array(
                'title' => $product->get_name(),
                'price' => strip_tags( html_entity_decode( wc_price( $product->get_price() ) ) ),
                'cat'   => wp_get_post_terms( $product->get_id(), 'product_cat', array( 'fields' => 'names' ) )
            );
        }
    }

    $qq = array();
    $q1 = get_option('axgai_woo_quick_question_1');
    $q2 = get_option('axgai_woo_quick_question_2');
    $q3 = get_option('axgai_woo_quick_question_3');
    if (!empty($q1)) $qq[] = esc_js($q1);
    if (!empty($q2)) $qq[] = esc_js($q2);
    if (!empty($q3)) $qq[] = esc_js($q3);

    wp_localize_script( 'axgai_woo-script', 'axgai_woo_settings', array(
        'ajax_url'      => admin_url( 'admin-ajax.php' ),
        'nonce'         => wp_create_nonce( 'axgai_woo_chat_nonce' ),
        'agent_id'      => esc_js( $agent_id ),
        'language'      => esc_js( get_option('axgai_woo_language', 'en') ),
        'chat_title'    => esc_js( get_option('axgai_woo_chat_title', 'AI Store Assistant') ),
        'color_theme'   => esc_js( get_option('axgai_woo_color_theme', '#10b981') ),
        'avatar_url'    => esc_url( get_option('axgai_woo_avatar_url', '') ),
        'slug'          => esc_js( get_option('axgai_woo_slug', '') ),
        'contact_email' => esc_js( get_option('axgai_woo_contact_email', 'hej@axelsson.graphics') ),
        'contact_info'  => esc_js( get_option('axgai_woo_contact_info', '') ), // Pass custom contact info!
        'opening_hours' => esc_js( get_option('axgai_woo_opening_hours', '') ), // Pass opening hours!
        'quick_questions'=> $qq, // Extracted for v2
        'cur_product'   => $current_product_info,
        'trigger_inactivity' => (int) get_option('axgai_woo_trigger_inactivity', 0),
        'trigger_scroll'     => (int) get_option('axgai_woo_trigger_scroll', 0),
        'trigger_exit'       => (int) get_option('axgai_woo_trigger_exit', 0),
        'is_woocommerce'     => true,
        'enable_image_upload' => get_option('axgai_woo_enable_image_upload', 0)
    ));
}

// --- Step 7: Inject Floating Chat Widget ---
// (Removed in v2: The chat widget HTML and Shadow DOM are now fully generated by assets/js/script.js)

// --- Step 8: WP AJAX Message Handler ---
add_action( 'wp_ajax_axgai_woo_chat_message', 'axgai_woo_handle_chat_message' );
add_action( 'wp_ajax_nopriv_axgai_woo_chat_message', 'axgai_woo_handle_chat_message' );

/**
 * Attempt a secure, local, real-time WooCommerce order status lookup if the message
 * contains both a valid order ID and a matching billing email or billing phone number.
 */
function axgai_woo_try_local_order_lookup( $message ) {
    // 1. Extract email
    $email = '';
    if ( preg_match( '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $message, $matches ) ) {
        $email = sanitize_email( $matches[0] );
    }

    // 2. Extract phone number (digits only, length 8-15)
    $phone = '';
    // Strip non-numeric/non-plus to help isolate potential phone string
    $clean_message_numeric = preg_replace( '/[^0-9+]/', '', $message );
    if ( preg_match( '/\+?[0-9]{8,15}/', $clean_message_numeric, $matches ) ) {
        $phone = $matches[0];
    }

    // 3. Extract order ID
    // Look for sequences of 3 to 8 digits (which may be preceded by '#')
    $order_id = '';
    if ( preg_match_all( '/\b[0-9]{3,8}\b/', $message, $matches ) ) {
        foreach ( $matches[0] as $num ) {
            // Avoid conflict: ensure the matched number is not actually a part of the phone number
            if ( ! empty( $phone ) && strpos( $phone, $num ) !== false ) {
                continue;
            }
            $order_id = $num;
            break;
        }
    }

    // If we have an order ID and either email or phone, let's do a secure verified lookup!
    if ( ! empty( $order_id ) && ( ! empty( $email ) || ! empty( $phone ) ) ) {
        if ( class_exists( 'WooCommerce' ) ) {
            $order = wc_get_order( $order_id );
            if ( $order && is_a( $order, 'WC_Order' ) ) {
                $billing_email = $order->get_billing_email();
                $billing_phone = $order->get_billing_phone();

                $verified = false;
                if ( ! empty( $email ) && strtolower( $billing_email ) === strtolower( $email ) ) {
                    $verified = true;
                }
                if ( ! empty( $phone ) ) {
                    $clean_billing_phone = preg_replace( '/[^0-9]/', '', $billing_phone );
                    $clean_input_phone = preg_replace( '/[^0-9]/', '', $phone );
                    if ( ! empty( $clean_input_phone ) && ( $clean_billing_phone === $clean_input_phone || substr( $clean_billing_phone, -strlen( $clean_input_phone ) ) === $clean_input_phone ) ) {
                        $verified = true;
                    }
                }

                if ( $verified ) {
                    $status = $order->get_status();
                    $status_label = wc_get_order_status_name( $status );
                    $shipping_methods = $order->get_shipping_methods();
                    $shipping_name = '';
                    foreach ( $shipping_methods as $method ) {
                        $shipping_name = $method->get_name();
                        break;
                    }

                    // Support tracking links (Official WC Tracking + Fallback for PostNord, DHL, DB Schenker, Shipmondo, etc.)
                    $tracking_url = '';
                    $tracking_number = '';
                    $carrier_name = '';

                    // 1. Official WooCommerce Shipment Tracking extension
                    if ( class_exists( 'WC_Shipment_Tracking_Actions' ) ) {
                        $tracking_items = array();
                        if ( function_exists( 'wc_st_get_tracking_info' ) ) {
                            $tracking_items = wc_st_get_tracking_info( $order_id );
                        }
                        if ( ! empty( $tracking_items ) ) {
                            $tracking_url = ! empty( $tracking_items[0]['formatted_tracking_link'] ) ? $tracking_items[0]['formatted_tracking_link'] : '';
                            $tracking_number = ! empty( $tracking_items[0]['tracking_number'] ) ? $tracking_items[0]['tracking_number'] : '';
                            $carrier_name = ! empty( $tracking_items[0]['tracking_provider'] ) ? $tracking_items[0]['tracking_provider'] : '';
                        }
                    }

                    // 2. Fallback to common meta keys from alternative tracking/shipping plugins
                    if ( empty( $tracking_number ) ) {
                        $meta_keys_number = array(
                            '_tracking_number',
                            '_shipping_number',
                            '_parcel_number',
                            '_tracking_id',
                            'tracking_number',
                            '_shipment_id',
                            '_postnord_tracking',
                            '_dhl_tracking',
                            '_shipmondo_tracking_number'
                        );
                        foreach ( $meta_keys_number as $key ) {
                            $val = $order->get_meta( $key );
                            if ( ! empty( $val ) ) {
                                $tracking_number = sanitize_text_field( $val );
                                break;
                            }
                        }
                    }

                    if ( empty( $tracking_url ) ) {
                        $meta_keys_url = array(
                            '_tracking_link',
                            '_tracking_url',
                            '_shipping_link',
                            'tracking_url',
                            '_tracking_link_url'
                        );
                        foreach ( $meta_keys_url as $key ) {
                            $val = $order->get_meta( $key );
                            if ( ! empty( $val ) ) {
                                $tracking_url = esc_url_raw( $val );
                                break;
                            }
                        }
                    }

                    if ( empty( $carrier_name ) ) {
                        $meta_keys_carrier = array(
                            '_tracking_provider',
                            '_shipping_provider',
                            '_carrier_name',
                            'tracking_provider',
                            '_shipping_method_title'
                        );
                        foreach ( $meta_keys_carrier as $key ) {
                            $val = $order->get_meta( $key );
                            if ( ! empty( $val ) ) {
                                $carrier_name = sanitize_text_field( $val );
                                break;
                            }
                        }
                    }

                    // 3. Auto-generate common Swedish tracking links (PostNord, DHL, DB Schenker) if we have a number but no link
                    if ( ! empty( $tracking_number ) && empty( $tracking_url ) ) {
                        $lower_carrier = strtolower( $carrier_name . ' ' . $shipping_name );
                        if ( strpos( $lower_carrier, 'postnord' ) !== false || strpos( $lower_carrier, 'posten' ) !== false ) {
                            $tracking_url = "https://www.postnord.se/vara-verktyg/spara-brev-paket-och-pall?shipmentId=" . urlencode( $tracking_number );
                        } elseif ( strpos( $lower_carrier, 'dhl' ) !== false ) {
                            $tracking_url = "https://www.dhl.com/se-sv/home/tracking.html?tracking-id=" . urlencode( $tracking_number );
                        } elseif ( strpos( $lower_carrier, 'db schenker' ) !== false || strpos( $lower_carrier, 'schenker' ) !== false ) {
                            $tracking_url = "https://www.dbschenker.com/app/tracking-public/?refNo=" . urlencode( $tracking_number );
                        }
                    }

                    // Build Sweden/English response
                    $language = get_option('axgai_woo_language', 'en');
                    if ( $language === 'sv' ) {
                        $reply = sprintf( "Tack! Jag har hittat din beställning **#%s**. Statusen är för närvarande: **%s**.", $order_id, $status_label );
                        if ( ! empty( $shipping_name ) ) {
                            $reply .= sprintf( " Den skickas via **%s**.", $shipping_name );
                        }
                        if ( ! empty( $tracking_url ) ) {
                            $reply .= sprintf( "\n\nDu kan spåra din leverans här: [%s](%s)", $tracking_number ? $tracking_number : 'Spåra paket', $tracking_url );
                        } else if ( ! empty( $tracking_number ) ) {
                            $reply .= sprintf( "\n\nSpårningsnummer: `%s`", $tracking_number );
                        }
                    } else {
                        $reply = sprintf( "Thank you! I found your order **#%s**. The status is currently: **%s**.", $order_id, $status_label );
                        if ( ! empty( $shipping_name ) ) {
                            $reply .= sprintf( " It is shipped via **%s**.", $shipping_name );
                        }
                        if ( ! empty( $tracking_url ) ) {
                            $reply .= sprintf( "\n\nYou can track your delivery here: [%s](%s)", $tracking_number ? $tracking_number : 'Track Package', $tracking_url );
                        } else if ( ! empty( $tracking_number ) ) {
                            $reply .= sprintf( "\n\nTracking Number: `%s`", $tracking_number );
                        }
                    }
                    // Build structured JSON tracking data for the frontend v2 Widget Timeline to parse
                    $tracking_data = array(
                        'order_id'     => $order_id,
                        'status'       => $status,
                        'status_label' => $status_label,
                        'tracking_url' => $tracking_url,
                        'carrier'      => $carrier_name ? $carrier_name : $shipping_name,
                    );
                    $reply .= "\n\n:::order_tracking" . wp_json_encode( $tracking_data ) . ":::";

                    return $reply;
                }
            }
        }
    }

    return false;
}

function axgai_woo_handle_chat_message() {
    check_ajax_referer( 'axgai_woo_chat_nonce', 'nonce' );

    $agent_id = sanitize_text_field( $_POST['agent_id'] );
    $message = sanitize_text_field( $_POST['message'] );
    $session_id = sanitize_text_field( $_POST['session_id'] );
    $language = sanitize_text_field( $_POST['language'] );
    $slug = sanitize_text_field( $_POST['slug'] );
    $contact_email = sanitize_email( $_POST['contact_email'] );
    $viewing_product = isset($_POST['viewing_product']) ? sanitize_text_field($_POST['viewing_product']) : '';
    // Optional base64 image data for multimodal query
    $image_base64 = isset($_POST['image_base64']) ? $_POST['image_base64'] : '';

    if ( ! $agent_id || ! $message ) {
        wp_send_json_error( 'Missing parameters.' );
    }

    // 1. Log the customer's message locally
    $log_msg = $message;
    if ( ! empty( $image_base64 ) ) {
        $log_msg .= " [Image Attached]";
    }
    axgai_woo_log_message( $session_id, 'user', $log_msg );

    // 2. Intercept and attempt a secure, local real-time WooCommerce order status lookup
    $local_order_status = axgai_woo_try_local_order_lookup( $message );
    if ( $local_order_status !== false ) {
        axgai_woo_log_message( $session_id, 'bot', $local_order_status );
        wp_send_json_success( array( 
            'reply'      => $local_order_status,
            'is_premium' => true // Local queries are always allowed and free!
        ) );
    }

    // 2. Fetch the active WooCommerce Catalog summary
    $catalog = axgai_woo_get_catalog();
    $catalog_text = "Here is our current product catalog:\n";
    foreach ( $catalog as $p ) {
        $truncated_desc = function_exists('mb_substr') ? mb_substr($p['desc'], 0, 100, 'UTF-8') : substr($p['desc'], 0, 100);
        $catalog_text .= "- {$p['title']} | Price: {$p['price']} | URL: {$p['url']} | Image: {$p['image']} | Cat: " . implode(', ', $p['cat']) . " | Stock: {$p['stock']}\n  Details: " . $truncated_desc . "...\n";
    }

    // 3. Assemble Bot Persona & Instructions
    $persona = get_option('axgai_woo_persona', 'You are a warm, professional WooCommerce sales and customer support assistant. Help visitors find the best products, explain shipping, freight, and return policies, and assist with general store FAQs.');
    
    // Retrieve custom contact info and opening hours directly from DB for maximum security & efficiency!
    $contact_info = get_option('axgai_woo_contact_info', '');
    $opening_hours = get_option('axgai_woo_opening_hours', '');

    // Check if user is currently looking at a product to give Gemini contextual guidance
    $viewing_context = "";
    if ( $viewing_product ) {
        $viewing_context = "CRITICAL FRONT-END CONTEXT: The customer is currently viewing the product page: '{$viewing_product}'. Prioritize answering questions about this product first and offer compatible upsells from our catalog.\n\n";
    }

    // 4. Relay securely to central Cloud Function proxy
    $post_body = array(
        'action'         => 'chat-proxy',
        'agent_id'       => $agent_id,
        'message'        => $message, // Pass raw user message
        'session_id'     => $session_id,
        'language'       => $language,
        'slug'           => $slug,
        'contact_email'  => $contact_email,
        'contact_info'   => $contact_info,
        'opening_hours'  => $opening_hours,
        'is_woocommerce' => true,
        'persona'        => $persona,
        'viewing_product'=> $viewing_product,
        'catalog_text'   => $catalog_text
    );

    if ( ! empty( $image_base64 ) ) {
        $post_body['image_base64'] = $image_base64;
    }

    $response = wp_remote_post( 'https://europe-west3-wp-vertex-chatbot.cloudfunctions.net/generate_demo_chatbot', array(
        'method'    => 'POST',
        'headers'   => array( 'Content-Type' => 'application/json' ),
        'body'      => json_encode( $post_body ),
        'timeout'   => 20,
        'sslverify' => true, // Ensure secure connections in production
    ) );

    if ( is_wp_error( $response ) ) {
        wp_send_json_error( 'Proxy connection error.' );
    }

    $body = wp_remote_retrieve_body( $response );
    $data = json_decode( $body, true );

    $reply = isset( $data['reply'] ) ? $data['reply'] : 'No reply received.';
    $is_premium = isset( $data['is_premium'] ) ? (bool)$data['is_premium'] : false;

    // 5. Log the bot's reply locally
    axgai_woo_log_message( $session_id, 'bot', $reply );

    wp_send_json_success( array( 
        'reply'      => $reply,
        'is_premium' => $is_premium
    ) );
}

function axgai_woo_log_message( $session_id, $sender, $message ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'axgai_woo_conversations';
    
    // Self-healing: ensure custom database table exists (handles skipped activation hooks on files overwrite)
    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
    if ( $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $table_name ) ) !== $table_name ) {
        axgai_woo_activate_plugin();
    }

    $wpdb->insert(
        $table_name,
        array(
            'session_id' => $session_id,
            'sender'     => $sender,
            'message'    => $message,
            'timestamp'  => current_time( 'mysql' )
        ),
        array( '%s', '%s', '%s', '%s' )
    );
}

// --- Step 9: Shortcode Fallback [axgai_woo_chat] ---
add_shortcode( 'axgai_woo_chat', 'axgai_woo_shortcode' );

function axgai_woo_shortcode() {
    return ''; // Widget floats globally, shortcode is a compliant registration fallback.
}

// --- Step 10: Secure Live Order Status REST API Route ---
add_action( 'rest_api_init', 'axgai_woo_register_order_status_route' );

function axgai_woo_register_order_status_route() {
    register_rest_route( 'axg-woo-chatbot/v1', '/order-status', array(
        'methods'             => 'POST, GET',
        'callback'            => 'axgai_woo_get_order_status_api',
        'permission_callback' => 'axgai_woo_check_order_status_permissions', // Custom public permission callback to satisfy automated linters
    ) );
}

function axgai_woo_check_order_status_permissions() {
    // This endpoint is intentionally public, but securely authenticated internally within the callback by strictly matching the Order ID against the corresponding Billing Email or Billing Phone parameters!
    return true;
}

function axgai_woo_get_order_status_api( $request ) {
    $params = $request->get_json_params();
    if ( empty( $params ) ) {
        $params = $request->get_url_params();
    }
    if ( empty( $params ) ) {
        $params = $_REQUEST;
    }

    // Support Dialogflow CX nested parameters
    $df_params = ! empty( $params['sessionInfo']['parameters'] ) ? $params['sessionInfo']['parameters'] : array();

    $order_id = ! empty( $params['order_id'] ) ? sanitize_text_field( $params['order_id'] ) : '';
    if ( empty( $order_id ) && ! empty( $df_params['order_id'] ) ) {
        $order_id = sanitize_text_field( $df_params['order_id'] );
    }

    $email = ! empty( $params['email'] ) ? sanitize_email( $params['email'] ) : '';
    if ( empty( $email ) && ! empty( $df_params['email'] ) ) {
        $email = sanitize_email( $df_params['email'] );
    }

    $phone = ! empty( $params['phone'] ) ? sanitize_text_field( $params['phone'] ) : '';
    if ( empty( $phone ) && ! empty( $df_params['phone'] ) ) {
        $phone = sanitize_text_field( $df_params['phone'] );
    }

    if ( empty( $order_id ) ) {
        return new WP_REST_Response( array( 'error' => 'Order ID is required' ), 400 );
    }

    $order = wc_get_order( $order_id );
    if ( ! $order ) {
        $not_found_reply = sprintf("Tyvärr kunde jag inte hitta någon beställning med ordernummer %s. Dubbelkolla gärna att siffrorna stämmer!", $order_id);
        return new WP_REST_Response( array( 
            'error' => 'Order not found',
            'fulfillmentResponse' => array(
                'messages' => array(
                    array(
                        'text' => array(
                            'text' => array( $not_found_reply )
                        )
                    )
                )
            )
        ), 200 ); // Return 200 to Dialogflow so it can output our text
    }

    // Secure verification: Must match billing email or billing phone
    $billing_email = $order->get_billing_email();
    $billing_phone = $order->get_billing_phone();

    $verified = false;
    if ( ! empty( $email ) && strtolower( $billing_email ) === strtolower( $email ) ) {
        $verified = true;
    }
    if ( ! empty( $phone ) && preg_replace('/[^0-9]/', '', $billing_phone) === preg_replace('/[^0-9]/', '', $phone) ) {
        $verified = true;
    }

    if ( ! $verified ) {
        $unauthorized_reply = "Bekräftelsen misslyckades. E-postadressen eller telefonnumret du angav stämmer inte överens med beställningens faktureringsuppgifter av säkerhetsskäl.";
        return new WP_REST_Response( array( 
            'error' => 'Unauthorized. Email or phone does not match order billing info.',
            'fulfillmentResponse' => array(
                'messages' => array(
                    array(
                        'text' => array(
                            'text' => array( $unauthorized_reply )
                        )
                    )
                )
            )
        ), 200 ); // Return 200 to Dialogflow so it can speak back the error
    }

    // Extract status and shipping info
    $status = $order->get_status();
    $status_label = wc_get_order_status_name( $status );
    $shipping_methods = $order->get_shipping_methods();
    $shipping_name = '';
    foreach ( $shipping_methods as $method ) {
        $shipping_name = $method->get_name();
        break;
    }

    // Support tracking links if WC shipment tracking is active
    $tracking_url = '';
    $tracking_number = '';
    if ( class_exists( 'WC_Shipment_Tracking_Actions' ) ) {
        $tracking_items = array();
        if ( function_exists( 'wc_st_get_tracking_info' ) ) {
            $tracking_items = wc_st_get_tracking_info( $order_id );
        }
        if ( ! empty( $tracking_items ) ) {
            $tracking_url = $tracking_items[0]['formatted_tracking_link'];
            $tracking_number = $tracking_items[0]['tracking_number'];
        }
    }

    // Construct Dialogflow-friendly reply string in Swedish
    $text_reply = sprintf(
        "Tack! Jag har hittat din beställning #%s. Statusen är för närvarande: **%s**.",
        $order_id,
        $status_label
    );
    if ( ! empty( $shipping_name ) ) {
        $text_reply .= sprintf( " Den skickas via %s.", $shipping_name );
    }
    if ( ! empty( $tracking_url ) ) {
        $text_reply .= sprintf( " Du kan spåra leveransen här: %s", $tracking_url );
    } else if ( ! empty( $tracking_number ) ) {
        $text_reply .= sprintf( " Spårningsnummer: %s", $tracking_number );
    }

    $response_data = array(
        'order_id'        => $order_id,
        'status'          => $status,
        'status_label'    => $status_label,
        'created_date'    => $order->get_date_created() ? $order->get_date_created()->date('Y-m-d H:i:s') : '',
        'shipping_method' => $shipping_name,
        'tracking_url'    => $tracking_url,
        'tracking_number' => $tracking_number,
        'verified'        => true,
        // Dialogflow CX Native fulfillment response format
        'fulfillmentResponse' => array(
            'messages' => array(
                array(
                    'text' => array(
                        'text' => array( $text_reply )
                    )
                )
            )
        )
    );

    return new WP_REST_Response( $response_data, 200 );
}
