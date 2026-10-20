<?php
// Exit if accessed directly
// Ensure that this code runs only when the plugin is uninstalled
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    die;
}

function wise_campaign_plugin_uninstall() {
    global $wpdb;

    // Define the table name (adjust the table name if necessary)
    $table_name = $wpdb->prefix . 'wc_banners';

    // Drop the table
    $wpdb->query( "DROP TABLE IF EXISTS $table_name" );

    // wiseBanner analytics
    $wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}wc_banner_stats" );
    delete_option( 'wisecampaign_banner_stats_db_version' );
    delete_option( 'wc-wisebanner-v2-analytics' );

    // The banner table is only created when this version flag is missing, so a reinstall needs it gone
    delete_option( 'wisecampaign_banner_table_version' );

    // Store-wide analytics
    $wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}wisecampaign_stats" );
    $wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}wisecampaign_orders" );
    delete_option( 'wisecampaign_analytics_db_version' );
    delete_option( 'wisecampaign_analytics_since' );
    delete_option( 'wisecampaign_analytics_settings' );

    // Module on/off switches
    delete_option( 'wisecampaign_modules' );
}

// Execute the uninstall logic
wise_campaign_plugin_uninstall();
