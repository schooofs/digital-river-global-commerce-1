<?php
/**
 * The file that defines the core plugin class
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @link       https://www.digitalriver.com
 * @since      1.0.0
 *
 * @package    Digital_River_Global_Commerce
 * @subpackage Digital_River_Global_Commerce/includes
 */

class DRGC {

	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      DRGC_Loader    $loader    Maintains and registers all hooks for the plugin.
	 */
	protected $loader;

	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $drgc    The string used to uniquely identify this plugin.
	 */
	protected $drgc;

	/**
	 * The current version of the plugin.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @var      string    $version    The current version of the plugin.
	 */
	public $version;

	/**
	 * The instance of the class.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      object  $instance Instance of this class
	 */
	protected static $instance;

	/**
	 * Session instance.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @var      DRGC_Session
	 */
	public $session;

	/**
	 * Cart instance
	 *
	 * @since    1.0.0
	 * @access   public
	 * @var
	 */
	public $cart;

	/**
	 * Shopper instance
	 *
	 * @since    1.0.0
	 * @access   public
	 * @var
	 */
	public $shopper;

	/**
	 * Authenticator instance
	 * @since    1.0.0
	 * @access   public
	 * @var
	 */
	public $authenticator;

	/**
	 * Ajax handler instance
	 * @since    1.0.0
	 * @access   public
	 * @var
	 */
	public $drgc_ajx;

	/**
	 * DRGC main instance
	 *
	 * @since 1.0.0
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Define the core functionality of the plugin.
	 *
	 * @since    1.0.0
	 */
	public function __construct() {
		if ( defined( 'DRGC_VERSION' ) ) {
			$this->version = DRGC_VERSION;
		} else {
			$this->version = '1.0.0';
		}
		$this->drgc = 'digital-river-global-commerce';

		$this->load_dependencies();
		$this->start_api_handler();
		$this->set_locale();
		$this->define_admin_hooks();
		$this->define_public_hooks();
	}

	/**
	 * Load the required dependencies for this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function load_dependencies() {
		/**
		 * Core functions
		 */
		require_once DRGC_PLUGIN_DIR . 'includes/drgc-core-functions.php';

		/**
		 * Creates DB Tables
		 */
		require_once DRGC_PLUGIN_DIR . 'includes/class-drgc-tables.php';

		/**
		 * The class responsible for orchestrating the actions and filters of the
		 * core plugin.
		 */
		require_once DRGC_PLUGIN_DIR . 'includes/class-drgc-loader.php';

		/**
		 * The class responsible for handling the sessions
		 */
		require_once DRGC_PLUGIN_DIR . 'includes/class-drgc-session.php';

		require_once DRGC_PLUGIN_DIR . 'includes/abstract-http-service.php';

		/**
		 * The class responsible for create special kinds of content (e.g. forms, content generators)
		 * that users can attach to certain pages.
		 */
		require_once DRGC_PLUGIN_DIR . 'includes/shortcodes/class-dr-shortcode-cart.php';
		require_once DRGC_PLUGIN_DIR . 'includes/shortcodes/class-dr-shortcode-login.php';
		require_once DRGC_PLUGIN_DIR . 'includes/shortcodes/class-dr-shortcode-checkout.php';
		require_once DRGC_PLUGIN_DIR . 'includes/shortcodes/class-dr-shortcode-thank-you.php';
		require_once DRGC_PLUGIN_DIR . 'includes/class-drgc-shortcodes.php';

		require_once DRGC_PLUGIN_DIR . 'includes/class-drgc-authenticator.php';
		require_once DRGC_PLUGIN_DIR . 'includes/class-drgc-shopper.php';
		require_once DRGC_PLUGIN_DIR . 'includes/class-drgc-cart.php';

		/**
		 * The class responsible for defining internationalization functionality
		 * of the plugin.
		 */
		require_once DRGC_PLUGIN_DIR . 'includes/class-drgc-i18n.php';

		/**
		 * The class responsible for defining all actions that occur in the admin area.
		 */
		require_once DRGC_PLUGIN_DIR . 'admin/class-drgc-admin.php';
		require_once DRGC_PLUGIN_DIR . 'admin/class-drgc-post-types.php';

		require_once DRGC_PLUGIN_DIR . 'includes/class-drgc-ajx.php';
		require_once DRGC_PLUGIN_DIR . 'includes/class-drgc-ajx-importer.php';
		require_once DRGC_PLUGIN_DIR . 'includes/class-drgc-cron.php';

		require_once DRGC_PLUGIN_DIR . 'includes/class-drgc-product.php';
		require_once DRGC_PLUGIN_DIR . 'includes/class-drgc-category.php';

		/**
		 * The class responsible for defining all actions that occur in the public-facing
		 * side of the site.
		 */
		require_once DRGC_PLUGIN_DIR . 'public/class-drgc-public.php';

		/**
		 * Global variables and functions.
		 */
		require_once DRGC_PLUGIN_DIR . 'includes/drgc-locale-mapping.php';

		// Start the loader
		$this->loader = new DRGC_Loader();

		// Initialize ajax handler
		$this->drgc_ajx = new DRGC_Ajx( array( 'instance_id' => 'DR Ajax' ) );
	}

	private function start_api_handler() {
		$domain = get_option( 'drgc_domain' );
		$api_key = get_option( 'drgc_api_key' );
		$api_secret = get_option( 'drgc_api_secret' );

		if ( empty( $domain ) || empty( $api_key ) || empty( $api_secret ) ) {
			return;
		}

		// Create session
		$this->session = new DRGC_Session;
		$this->session->init();

		// Initialize Authenticator
		$this->authenticator = new DRGC_Authenticator;
		$this->authenticator->init( $this->session );

		// Initialize shopper
		$this->shopper = new DRGC_Shopper( $this->authenticator );

		// Initialize cart
		$this->cart = new DRGC_Cart( $this->authenticator );

		// Start up the cron import
		new DRGC_Cron();
	}

	/**
	 * Define the locale for this plugin for internationalization.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function set_locale() {
		$plugin_i18n = new DRGC_i18n();
		$this->loader->add_action( 'plugins_loaded', $plugin_i18n, 'load_plugin_textdomain' );
	}

	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_admin_hooks() {
		$plugin_admin = new DRGC_Admin( $this->get_drgc(), $this->get_version(), $this->drgc_ajx );

		new DRGC_Post_Types();

		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_styles' );
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts' );

		$this->loader->add_action( 'admin_menu', $plugin_admin, 'add_settings_page' );
		$this->loader->add_action( 'admin_menu', $plugin_admin, 'register_settings_fields' );

		$this->loader->add_action( 'views_edit-dr_product', $plugin_admin, 'render_products_import_button' );

		$this->loader->add_action( 'before_delete_post', $plugin_admin, 'clean_variations_on_product_deletion' );
	}

	/**
	 * Register all of the hooks related to the public-facing functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_public_hooks() {
		$plugin_public = new DRGC_Public( $this->get_drgc(), $this->get_version() );

		$this->loader->add_action( 'template_redirect', $plugin_public, 'redirect_on_page_load' );

		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_styles' );
		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_scripts' );

		$this->loader->add_action( 'after_setup_theme', $plugin_public, 'remove_admin_bar');

		$this->loader->add_action( 'wp_ajax_get_permalink', $plugin_public, 'ajax_get_permalink_by_product_id' );
		$this->loader->add_action( 'wp_ajax_nopriv_get_permalink', $plugin_public, 'ajax_get_permalink_by_product_id' );

		$this->loader->add_filter( 'wp_nav_menu_objects', $plugin_public, 'insert_login_menu_items', 10, 2 );
		$this->loader->add_filter( 'wp_nav_menu_items', $plugin_public, 'minicart_in_header', 99, 2 );
		$this->loader->add_filter( 'template_include', $plugin_public, 'overwrite_template' );

		$this->loader->add_action( 'wp_ajax_nopriv_drgc_login', $plugin_public, 'ajax_attempt_auth' );
		$this->loader->add_action( 'wp_ajax_drgc_login', $plugin_public, 'ajax_attempt_auth' );

		$this->loader->add_action( 'wp_ajax_nopriv_drgc_signup', $plugin_public, 'dr_signup_ajax' );
		$this->loader->add_action( 'wp_ajax_drgc_signup', $plugin_public, 'dr_signup_ajax' );

		$this->loader->add_action( 'wp_ajax_nopriv_drgc_checkout_as_guest', $plugin_public, 'checkout_as_guest_ajax' );
		$this->loader->add_action( 'wp_ajax_drgc_checkout_as_guest', $plugin_public, 'checkout_as_guest_ajax' );

		$this->loader->add_action( 'wp_ajax_nopriv_drgc_logout', $plugin_public, 'dr_logout_ajax' );
		$this->loader->add_action( 'wp_ajax_drgc_logout', $plugin_public, 'dr_logout_ajax' );

		$this->loader->add_action( 'wp_ajax_nopriv_drgc_pass_reset_request', $plugin_public, 'dr_send_email_reset_pass_ajax' );
		$this->loader->add_action( 'wp_ajax_drgc_pass_reset_request', $plugin_public, 'dr_send_email_reset_pass_ajax' );

		$this->loader->add_action( 'wp_ajax_nopriv_drgc_reset_password', $plugin_public, 'dr_reset_password_ajax' );
		$this->loader->add_action( 'wp_ajax_drgc_reset_password', $plugin_public, 'dr_reset_password_ajax' );
		$this->loader->add_filter( 'get_footer', $plugin_public, 'add_legal_link', 99, 2 );
	}

	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 *
	 * @since    1.0.0
	 * @access   public
	 */
	public function run() {
		$this->loader->run();
	}

	/**
	 * The name of the plugin used to uniquely identify it within the context of
	 * WordPress and to define internationalization functionality.
	 *
	 * @since     1.0.0
	 * @return    string    The name of the plugin.
	 */
	public function get_drgc() {
		return $this->drgc;
	}

	/**
	 * The reference to the class that orchestrates the hooks with the plugin.
	 *
	 * @since     1.0.0
	 * @return    DRGC_Loader    Orchestrates the hooks of the plugin.
	 */
	public function get_loader() {
		return $this->loader;
	}

	/**
	 * Retrieve the version number of the plugin.
	 *
	 * @since     1.0.0
	 * @return    string    The version number of the plugin.
	 */
	public function get_version() {
		return $this->version;
	}
}
