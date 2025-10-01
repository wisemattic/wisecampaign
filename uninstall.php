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

    error_log("Uninstalling Wise Campaign Plugin...");
    error_log("Dropping table: $table_name");
}

// Execute the uninstall logic
wise_campaign_plugin_uninstall();
