<?php

namespace WISECAMPAIGN\Classes;

use Exception;
use WISECAMPAIGN\Traits\SingletonTrait;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Class Banner
 *
 * Handles banner data operations, including REST API endpoints for saving and retrieving banner data.
 */
class Banner
{
    use SingletonTrait;

    protected $table_name;

    /**
     * Banner constructor.
     * Initializes the class and sets up the table name and REST API routes.
     */
    public function __construct()
    {
        global $wpdb;
        $this->table_name = $wpdb->prefix.'wc_banners';
        add_action('rest_api_init', [$this, 'register_rest_routes']);
    }

    /**
     * Registers the REST API routes for banner operations.
     */
    public function register_rest_routes()
    {
        $routes = [
            [
                'route' => '/banner/save/', 'methods' => 'POST', 'callback' => 'save_banner_data'
            ], [
                'route' => '/banner/(?P<id>\d+)/update/', 'methods' => 'POST', 'callback' => 'update_banner_data'
            ], [
                'route' => '/banner/data/', 'methods' => 'GET', 'callback' => 'get_banner_data'
            ], [
                'route' => '/banner/selected/', 'methods' => 'GET', 'callback' => 'get_active_banner_data'
            ],
        ];

        foreach ($routes as $route) {
            register_rest_route('wise-campaign-plugin/v1', $route['route'], [
                'methods' => $route['methods'], 'callback' => [$this, $route['callback']],
                'permission_callback' => '__return_true',
            ]);
        }
    }

    /**
     * Handles saving banner data from a POST request.
     *
     * @param  WP_REST_Request  $request  The REST request object.
     * @return WP_REST_Response Response indicating the result of the operation.
     */
    public function save_banner_data(WP_REST_Request $request)
    {
        return $this->handle_banner_data($request, 'insert');
    }

    /**
     * Common method to handle banner data (insert/update).
     *
     * @param  WP_REST_Request  $request  The REST request object.
     * @param  string  $operation  The type of operation (insert/update).
     * @return WP_REST_Response Response indicating the result of the operation.
     */
    private function handle_banner_data(WP_REST_Request $request, $operation)
    {

        $data = $this->sanitize_inputs($request);

        global $wpdb;
        $id = $request->get_param('id') ?? null;

        try {

            $this->check_and_set_active($data);

            $bg_image = isset($_FILES['bg_image']) ? $_FILES['bg_image'] : (isset($_POST['bg_image']) ? $_POST['bg_image'] : null);

            if (is_array($bg_image)) {
                // If bg_image is an uploaded file, handle the image upload.
                $image_url = $this->handle_image_upload($bg_image);
                $data['bg_image'] = $image_url ? $image_url : null;
            } else {
                // If bg_image is a link or null, directly assign it.
                $data['bg_image'] = $request->get_param('bg_image');
            }

            $bogo_img_src = isset($_FILES['bogo_img_src']) ? $_FILES['bogo_img_src'] : null;


            if ($bogo_img_src) {
                $bogo_img_src_url = $this->handle_image_upload($bogo_img_src);
                if ($bogo_img_src_url) {
                    $data['bogo_img_src'] = $bogo_img_src_url;
                }
            }

            if ($operation === 'insert') {
                $result = $wpdb->insert($this->table_name, $data);
            } else {
                $result = $wpdb->update($this->table_name, $data, ['id' => $id]);
            }

            if ($result === false) {
                throw new Exception('Database operation failed: '.$wpdb->last_error);
            }

            return new WP_REST_Response(ucfirst($operation).' successful', 200);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return new WP_REST_Response('Error '.$operation.' data: '.$e->getMessage(), 500);
        }
    }

    /**
     * Sanitizes the inputs received from the REST request.
     *
     * @param  WP_REST_Request  $request  The REST request object.
     * @return array Sanitized input data.
     */
    private function sanitize_inputs(WP_REST_Request $request)
    {
        $fields = [
            'width', 'height', 'wise_campaign_url', 'is_selected', 'banner_color', 'headline_text',
            'headline_text_color', 'headline_text_align', 'headline_font_size', 'headline_font_family',
            'headline_font_weight', 'headline_font_style', 'sub_headline_text', 'sub_headline_text_color',
            'sub_headline_text_align', 'sub_headline_font_size', 'sub_headline_font_family', 'sub_headline_font_weight',
            'sub_headline_font_style', 'bogo_alt', 'bogo_width', 'bogo_height', 'countdown_text', 'countdown_timer',
            'countdown_color', 'countdown_font_size', 'countdown_component', 'countdown_font_family',
            'countdown_font_weight', 'countdown_font_style', 'button_width', 'button_height', 'button_text',
            'button_text_color', 'button_padding', 'button_bg_color', 'button_border_color', 'button_border_radius',
            'button_hover_bg_color', 'button_hover_border_color', 'button_hover_text_color', 'button_link',
            'button_font_size', 'button_font_family', 'button_font_weight', 'button_font_style', 'is_selected'
        ];
        $sanitized_data = [];


        foreach ($fields as $field) {
            $value = $request->get_param($field);

            if ($field === 'is_selected') {
                if ($value) {
                    $sanitized_data[$field] = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                }
            } elseif (strpos($field, 'color') !== false || strpos($field, 'url') !== false) {
                $sanitized_data[$field] = esc_url_raw($value);
            } else {
                $sanitized_data[$field] = sanitize_text_field($value);
            }

        }
        $request_params = $request->get_json_params();
        if (!$request_params) {
            $request_params = $_POST;
        }
        // Filter sanitized_data to keep only those keys that exist in request_params,
        // but ensure to keep false and null values as valid entries.
        return array_filter($sanitized_data, function ($key) use ($request_params) {
            // Check if the key exists in request_params
            if ($key == 'is_selected') {
                return true;
            }
            return array_key_exists($key, $request_params);
        }, ARRAY_FILTER_USE_KEY);
    }

    /**
     * Checks if the 'is_selected' parameter is set to true, and sets all 'is_selected' to false if so.
     *
     * @param  array  $data  The sanitized input data.
     */
    private function check_and_set_active($data)
    {
        global $wpdb;

        if (isset($data['is_selected']) && $data['is_selected'] === true) {
            $result = $wpdb->update($this->table_name, ['is_selected' => false], ['is_selected' => true]);
            if ($result === false) {
                throw new Exception('Database operation failed: '.esc_html($wpdb->last_error));
            }
        }
    }

    private function handle_image_upload($image_file)
    {
        require_once(ABSPATH.'wp-admin/includes/file.php');
        require_once(ABSPATH.'wp-admin/includes/image.php');
        require_once(ABSPATH.'wp-admin/includes/media.php');

        if (!empty($image_file) && isset($image_file['tmp_name'])) {
            // Upload the image
            $upload = wp_handle_upload($image_file, ['test_form' => false]);

            if (isset($upload['error']) && !empty($upload['error'])) {
                throw new Exception('Image upload failed: '.esc_html($upload['error']));
            }

            // Get the attachment ID
            $attachment_id = wp_insert_attachment([
                'guid' => $upload['url'], 'post_mime_type' => $upload['type'],
                'post_title' => sanitize_file_name($upload['file']), 'post_content' => '', 'post_status' => 'inherit',
            ], $upload['file']);

            // Generate attachment metadata and update the attachment
            require_once(ABSPATH.'wp-admin/includes/image.php');
            $attach_data = wp_generate_attachment_metadata($attachment_id, $upload['file']);
            wp_update_attachment_metadata($attachment_id, $attach_data);

            // Get the URL of the uploaded image
            $image_url = wp_get_attachment_url($attachment_id);

            return esc_url(wp_make_link_relative($image_url)); // Escaping URL before returning it
        }

        return null;
    }


    /**
     * Handles updating banner data from a POST request.
     *
     * @param  WP_REST_Request  $request  The REST request object.
     * @return WP_REST_Response Response indicating the result of the operation.
     */
    public function update_banner_data(WP_REST_Request $request)
    {
        return $this->handle_banner_data($request, 'update');
    }

    /**
     * Handles retrieving banner data from a GET request.
     *
     * @param  WP_REST_Request  $request  The REST request object.
     * @return WP_REST_Response Response containing the banner data or an error message.
     */
    public function get_banner_data()
    {
        global $wpdb;
        try {
            $data = $wpdb->get_results("SELECT * FROM $this->table_name WHERE is_active = 1 ", ARRAY_A);
            if ($data === null) {
                throw new Exception('Database query failed: '.$wpdb->last_error);
            }

            return new WP_REST_Response($data ?: 'No data found', $data ? 200 : 404);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return new WP_REST_Response('Error retrieving data: '.$e->getMessage(), 500);
        }
    }

    public function get_active_banner_data()
    {
        global $wpdb;
        try {
            $data = $wpdb->get_row("SELECT * FROM $this->table_name where is_selected = true", ARRAY_A);
            if ($data === null) {
                throw new Exception('Database query failed: '.$wpdb->last_error);
            }

            return new WP_REST_Response($data ?: 'No data found', $data ? 200 : 404);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return new WP_REST_Response('Error retrieving data: '.$e->getMessage(), 500);
        }
    }

    /**
     * Creates the banner table in the database if it does not exist.
     */
    public function create_banner_table()
    {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS $this->table_name (
            id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            cat_id BIGINT(20) UNSIGNED NULL,
            width VARCHAR(255) NULL,
            height VARCHAR(255) NULL,
            wise_campaign_url VARCHAR(255) NULL,
            is_selected VARCHAR(100) NULL,
            bg_image TEXT NULL,
            banner_color VARCHAR(255) NULL,
            headline_text VARCHAR(255) NOT NULL,
            headline_text_color VARCHAR(255) NULL,
            headline_text_align VARCHAR(50) NULL,
            headline_font_size VARCHAR(50) NULL,
            headline_font_family VARCHAR(100) NULL,
            headline_font_weight VARCHAR(100) NULL,
            headline_font_style VARCHAR(100) NULL,
            sub_headline_text VARCHAR(255) NULL,
            sub_headline_text_color VARCHAR(255) NULL,
            sub_headline_text_align VARCHAR(50) NULL,
            sub_headline_font_size VARCHAR(50) NULL,
            sub_headline_font_family VARCHAR(100) NULL,
            sub_headline_font_weight VARCHAR(100) NULL,
            sub_headline_font_style VARCHAR(100) NULL,
            bogo_img_src TEXT NULL,
            bogo_alt VARCHAR(255) NULL,
            bogo_width VARCHAR(255) NULL,
            bogo_height VARCHAR(255) NULL,
            countdown_component VARCHAR(255) NULL,
            countdown_text VARCHAR(255) NULL,
            countdown_timer DATETIME NULL,
            countdown_color VARCHAR(255) NULL,
            countdown_font_size VARCHAR(255) NULL,
            countdown_font_family VARCHAR(100) NULL,
            countdown_font_weight VARCHAR(100) NULL,
            countdown_font_style VARCHAR(100) NULL,
            button_width VARCHAR(255) NULL,
            button_height VARCHAR(255) NULL,
            button_text VARCHAR(255) NULL,
            button_padding VARCHAR(255) NULL,
            button_text_color VARCHAR(255) NULL,
            button_bg_color VARCHAR(255) NULL,
            button_border_radius VARCHAR(255) NULL,
            button_border_color VARCHAR(255) NULL,
            button_hover_bg_color VARCHAR(255) NULL,
            button_hover_border_color VARCHAR(255) NULL,
            button_hover_text_color VARCHAR(255) NULL,
            button_link VARCHAR(255) NULL,
            button_font_size VARCHAR(255) NULL,
            button_font_family VARCHAR(100) NULL,
            button_font_weight VARCHAR(100) NULL,
            button_font_style VARCHAR(100) NULL,
            is_active TINYINT(1) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) $charset_collate;";

        require_once(ABSPATH.'wp-admin/includes/upgrade.php');
        dbDelta($sql);

        // Check if the table contains any rows
        $row_count = $wpdb->get_var("SELECT COUNT(*) FROM $this->table_name");

        // If the table is not empty, truncate it
        if ($row_count > 0) {
            $wpdb->query("TRUNCATE TABLE $this->table_name");
        }

        $json_file = site_url('wp-content/plugins/wisecampaign/includes/Database/banners.json');

        $banners = [];
        // Read the file contents
        $json_data = wp_remote_get($json_file);

        if (is_wp_error($json_data)) {
            // Handle the error
            $error_message = $json_data->get_error_message();
            echo "Something went wrong: ".esc_html($error_message);
        } else {
            $body = wp_remote_retrieve_body($json_data);
            $banners = json_decode($body, true);
        }

        foreach ($banners as $banner) {
            $existing_banner = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$this->table_name} WHERE id = %d",  $banner['id']));

            if ($existing_banner) {
                $wpdb->update($this->table_name, ['is_active' => 1], ['id' => $banner['id']]);
            } else {
                // Insert new default data
                $inserted = $wpdb->insert($this->table_name, array(
                        'id' => $banner['id'], 'cat_id' => $banner['cat_id'], 'width' => $banner['width'],
                        'height' => $banner['height'], 'wise_campaign_url' => $banner['wise_campaign_url'],
                        'is_selected' => $banner['is_selected'], 'bg_image' => $banner['bg_image'],
                        'banner_color' => $banner['banner_color'], 'headline_text' => $banner['headline_text'],
                        'headline_text_color' => $banner['headline_text_color'],
                        'headline_text_align' => $banner['headline_text_align'],
                        'headline_font_size' => $banner['headline_font_size'],
                        'headline_font_family' => $banner['headline_font_family'],
                        'headline_font_weight' => $banner['headline_font_weight'],
                        'headline_font_style' => $banner['headline_font_style'],
                        'sub_headline_text' => $banner['sub_headline_text'],
                        'sub_headline_text_color' => $banner['sub_headline_text_color'],
                        'sub_headline_text_align' => $banner['sub_headline_text_align'],
                        'sub_headline_font_size' => $banner['sub_headline_font_size'],
                        'sub_headline_font_family' => $banner['sub_headline_font_family'],
                        'sub_headline_font_weight' => $banner['sub_headline_font_weight'],
                        'sub_headline_font_style' => $banner['sub_headline_font_style'],
                        'bogo_img_src' => $banner['bogo_img_src'], 'bogo_alt' => $banner['bogo_alt'],
                        'bogo_width' => $banner['bogo_width'], 'bogo_height' => $banner['bogo_height'],
                        'countdown_component' => $banner['countdown_component'],
                        'countdown_text' => $banner['countdown_text'],
                        'countdown_timer' => gmdate('Y-m-d H:i:s', strtotime('+11 days')),
                        'countdown_color' => $banner['countdown_color'],
                        'countdown_font_size' => $banner['countdown_font_size'],
                        'countdown_font_family' => $banner['countdown_font_family'],
                        'countdown_font_weight' => $banner['countdown_font_weight'],
                        'countdown_font_style' => $banner['countdown_font_style'],
                        'button_width' => $banner['button_width'], 'button_height' => $banner['button_height'],
                        'button_text' => $banner['button_text'], 'button_padding' => $banner['button_padding'],
                        'button_text_color' => $banner['button_text_color'],
                        'button_bg_color' => $banner['button_bg_color'],
                        'button_border_radius' => $banner['button_border_radius'],
                        'button_border_color' => $banner['button_border_color'],
                        'button_hover_bg_color' => $banner['button_hover_bg_color'],
                        'button_hover_border_color' => $banner['button_hover_border_color'],
                        'button_hover_text_color' => $banner['button_hover_text_color'],
                        'button_link' => $banner['button_link'], 'button_font_size' => $banner['button_font_size'],
                        'button_font_family' => $banner['button_font_family'],
                        'button_font_weight' => $banner['button_font_weight'],
                        'button_font_style' => $banner['button_font_style'], 'is_active' => $banner['is_active'],
                        'created_at' => $banner['created_at'], 'updated_at' => $banner['updated_at'],
                    )

                );

                if ($inserted === false) {
                    error_log('Failed to insert banner with ID '.$banner['id'].': '.$wpdb->last_error);
                } else {
                    error_log('Successfully inserted banner with ID '.$banner['id']);
                }
            }
        }
    }
}