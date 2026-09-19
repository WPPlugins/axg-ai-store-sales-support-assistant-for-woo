<?php
/**
 * AxG AI WooCommerce Chatbot & Product Recommender - Uninstall Cleanup Script
 * Cleans up options and custom database tables during plugin deletion.
 */

// If uninstall not called from WordPress, exit
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// Wrap in a uniquely prefixed function to prevent global variable pollution and comply with guidelines
function axgai_woo_uninstall_plugin() {
    global $wpdb;

    // 1. Delete registered options
    $options = array(
        'axgai_woo_agent_id',
        'axgai_woo_slug',
        'axgai_woo_language',
        'axgai_woo_chat_title',
        'axgai_woo_color_theme',
        'axgai_woo_contact_email',
        'axgai_woo_persona'
    );

    foreach ( $options as $option ) {
        delete_option( $option );
    }

    // 2. Drop the custom conversation logs table
    $table_name = $wpdb->prefix . 'axgai_woo_conversations';
    // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, PluginCheck.Security.DirectDB.UnescapedDBParameter
    $wpdb->query( "DROP TABLE IF EXISTS " . esc_sql( $table_name ) );
}

axgai_woo_uninstall_plugin();
