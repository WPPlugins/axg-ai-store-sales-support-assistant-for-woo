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
function axgaists_uninstall_plugin() {
    global $wpdb;

    // 1. Delete registered options
    $options = array(
        'axgaists_agent_id',
        'axgaists_slug',
        'axgaists_language',
        'axgaists_chat_title',
        'axgaists_color_theme',
        'axgaists_contact_email',
        'axgaists_persona'
    );

    foreach ( $options as $option ) {
        delete_option( $option );
    }

    // 2. Drop the custom conversation logs table
    $table_name = $wpdb->prefix . 'axgaists_conversations';
    // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange, PluginCheck.Security.DirectDB.UnescapedDBParameter
    $wpdb->query( "DROP TABLE IF EXISTS " . esc_sql( $table_name ) );
}

axgaists_uninstall_plugin();
