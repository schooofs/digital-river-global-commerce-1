<?php
use function GuzzleHttp\json_encode;

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://www.digitalriver.com
 * @since      1.0.0
 *
 * @package    Digital_River_Global_Commerce
 * @subpackage Digital_River_Global_Commerce/public
 */

class DRGC_Public {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $drgc    The ID of this plugin.
	 */
	private $drgc;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $drgc       The name of the plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $drgc, $version ) {
		$this->drgc = $drgc;
		$this->version = $version;
	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in DRGC_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The DRGC_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style( $this->drgc, plugin_dir_url( __FILE__ ) . '../assets/css/drgc-public.min.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {
		$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';
		// Adds support for ES6
		wp_enqueue_script( 'js-polyfill', '//cdn.polyfill.io/v3/polyfill.js' );

		wp_enqueue_script( $this->drgc, DRGC_PLUGIN_URL . 'assets/js/drgc-public' . $suffix . '.js', array( 'jquery' ), $this->version, false );

		if ( is_page( 'cart' ) || is_page( 'checkout' ) || is_page( 'thank-you' ) ) {
			wp_enqueue_script( 'digital-river-js', 'https://js.digitalriverws.com/v1/DigitalRiver.js', array( $this->drgc ), null, true );
		}
		if ( is_page( 'checkout' ) ) {
			wp_enqueue_script( 'paypal-checkout-js', 'https://www.paypalobjects.com/api/checkout.js', array( $this->drgc ), null, true );
		}

		$access_token = '';
		if ( DRGC()->authenticator ) {
			$access_token = DRGC()->authenticator->get_token();
		}

		$cart_obj = '';
		$order_obj = '';
		if ( DRGC()->cart ) {
			$cart_obj = DRGC()->cart->retrieve_cart();
			if ( is_page( 'thank-you' ) ) $order_obj = DRGC()->cart->retrieve_order();
		}

    //test Order Handler
    $testOrder_option = get_option( 'drgc_testOrder_handler' );
		$testOrder_enable = ( is_array( $testOrder_option ) && '1' == $testOrder_option['checkbox'] )  ? "true" : "false";

		$applepay_option = get_option( 'drgc_applepay_handler' );
		$applepay_enabled = ( is_array( $applepay_option ) && '1' == $applepay_option['checkbox'] )  ? 'true' : 'false';

		$googlepay_option = get_option( 'drgc_googlepay_handler' );
		$googlepay_enabled = ( is_array( $googlepay_option ) && '1' == $googlepay_option['checkbox'] )  ? 'true' : 'false';

		$translation_array = array(
			'upgrade_label'               => __('Upgrade', 'digital-river-global-commerce'),
			'add_label'                   => __('Add', 'digital-river-global-commerce'),
			'free_label'                  => __('FREE', 'digital-river-global-commerce'),
			'vat_label'                   => __('VAT', 'digital-river-global-commerce'),
			'estimated_vat_label'         => __('Estimated VAT', 'digital-river-global-commerce'),
			'tax_label'              	    => __('Tax', 'digital-river-global-commerce'),
			'estimated_tax_label'         => __('Estimated Tax', 'digital-river-global-commerce'),
			'shipping_label'              => __('Shipping', 'digital-river-global-commerce'),
			'estimated_shipping_label'    => __('Estimated Shipping', 'digital-river-global-commerce'),
			'credit_card_ending_label'    => __('Credit card ending in', 'digital-river-global-commerce'),
			'pay_with_card_label'         => __('pay with card', 'digital-river-global-commerce'),
			'pay_with_paypal_label'       => __('pay with paypal', 'digital-river-global-commerce'),
			'view_cart_label'             => __('View Cart', 'digital-river-global-commerce'),
			'checkout_label'              => __('Checkout', 'digital-river-global-commerce'),
			'remove_label'                => __('Remove', 'digital-river-global-commerce'),
			'subtotal_label'              => __('Sub-Total', 'digital-river-global-commerce'),
			'qty_label'                   => __('Qty', 'digital-river-global-commerce'),
			'shipping_and_handling_label'	=> __('Shipping and Handling', 'digital-river-global-commerce'),
			'discount_label'		          => __('Discount', 'digital-river-global-commerce'),
			'order_total_label'		        => __('Order Total', 'digital-river-global-commerce'),
			'password_reset_title'        => __('Password reset email sent', 'digital-river-global-commerce'),
			'password_saved_title'        => __('Password saved', 'digital-river-global-commerce'),
			'password_reset_msg'          => __('You will be receiving an email soon with instructions on resetting your login password.', 'digital-river-global-commerce'),
			'password_saved_msg'          => __('You can now log in with your new password.', 'digital-river-global-commerce'),
			'empty_cart_msg'              => __('Your cart is empty.', 'digital-river-global-commerce'),
			'invalid_promo_code_msg'      => __('Please enter a valid promo code.', 'digital-river-global-commerce'),
			'invalid_email_msg'           => __('Please enter a valid email address.', 'digital-river-global-commerce'),
			'address_error_msg'           => __('Address not accepted for current currency.', 'digital-river-global-commerce'),
			'credit_card_error_msg'       => __('Failed payment for specified credit card.', 'digital-river-global-commerce'),
			'required_field_msg'          => __('This field is required.', 'digital-river-global-commerce'),
			'email_confirm_error_msg'     => __('Emails do not match.', 'digital-river-global-commerce'),
			'password_length_error_msg'      => __('Password must be between 8 - 32 characters.', 'digital-river-global-commerce'),
			'password_uppercase_error_msg'   => __('Must use at least one upper case letter.', 'digital-river-global-commerce'),
			'password_lowercase_error_msg'   => __('Must use at least one lower case letter.', 'digital-river-global-commerce'),
			'password_number_error_msg'      => __('Must use at least one number.', 'digital-river-global-commerce'),
			'password_char_error_msg'        => __('Must use at least one special character (! _ @).', 'digital-river-global-commerce'),
			'password_banned_char_error_msg' => __('Contains non-allowable special characters (only ! _ @ are allowed).', 'digital-river-global-commerce'),
			'password_confirm_error_msg'     => __('Passwords do not match.', 'digital-river-global-commerce'),
			'required_tandc_msg'             => __('Please indicate you have read and accepted the privacy policy and terms of sale.', 'digital-river-global-commerce'),
			'undefined_error_msg'            => __('Something went wrong. Please try again.', 'digital-river-global-commerce'),
			'loading_msg'                    => __('Loading...', 'digital-river-global-commerce')
		);

		// transfer drgc options from PHP to JS
		$options = array(
			'wpLocale'          =>  get_locale(),
			'drLocale'          =>  get_dr_locale( get_locale() ),
			'ajaxUrl'           =>  admin_url( 'admin-ajax.php' ),
			'ajaxNonce'         =>  wp_create_nonce( 'drgc_ajax' ),
			'cartUrl'           =>  drgc_get_page_link( 'cart' ),
			'checkoutUrl'       =>  drgc_get_page_link( 'checkout' ),
			'siteID'            =>  get_option( 'drgc_site_id' ),
			'domain'            =>  get_option( 'drgc_domain' ),
			'digitalRiverKey'   =>  get_option( 'drgc_digitalRiver_key' ),
			'accessToken'       =>  $access_token,
			'cart'              =>  $cart_obj,
			'order'             =>  $order_obj,
			'thankYouEndpoint'  =>  esc_url( drgc_get_page_link( 'thank-you' ) ),
			'isLogin'           =>  drgc_get_user_status(),
			'payPal'            =>  array (
				'sourceId' => isset( $_GET['sourceId'] ) ? $_GET['sourceId'] : false,
				'failure'  => isset( $_GET['ppcancel'] ) ? $_GET['ppcancel'] : false,
				'success'  => isset ( $_GET['ppsuccess'] ) ? $_GET['ppsuccess'] : false,
      ),
			'testOrder'          => $testOrder_enable,
			'translations'       => $translation_array,
			'isApplePayEnabled'  => $applepay_enabled,
			'isGooglePayEnabled' => $googlepay_enabled,
			'client_ip'			 => $_SERVER['REMOTE_ADDR'],
		);

		wp_localize_script( $this->drgc, 'drgc_params', $options );
	}

	public function ajax_attempt_auth() {
		check_ajax_referer( 'drgc_ajax', 'nonce' );

		$plugin = DRGC();

		if ( (isset( $_POST['username'] ) && isset( $_POST['password'] )) ) {
			$username = sanitize_text_field( $_POST['username'] );
			$password = sanitize_text_field( $_POST['password'] );

			$user = wp_authenticate( $username, $password );

			if ( is_wp_error( $user ) ) {
				wp_send_json_error( __( 'Authorization failed for specified credentials' ) );
			}

			$current_user = get_user_by( 'login', $username );
			$externalReferenceId = get_user_meta( $current_user->ID, '_external_reference_id', true );
			$attempt = $plugin->shopper->generate_access_token_by_ref_id( $externalReferenceId );
		}

		if ( array_key_exists( 'error', $attempt ) ) {
			wp_send_json_error( $attempt );
		}

		if ( array_key_exists( 'access_token', $attempt ) ) {
			$plugin->session->set_guest_flag_cookie( 'false' );
			$plugin->session->dirty_set_session( $_COOKIE['drgc_session'] );

			wp_send_json_success( $attempt );
		}
	}

	private function get_password_error_msgs( $password, $confirm_password ) {
		$error_msgs = array();

		if ( $password !== $confirm_password ) {
			array_push( $error_msgs, __( 'Passwords do not match.' ) );
		}

		if ( 8 > strlen( $password ) || 32 < strlen( $password ) ) {
			array_push( $error_msgs, __( 'Password must be between 8 - 32 characters.' ) );
		}

		if ( ! preg_match( '/[A-Z]/', $password ) ) {
			array_push( $error_msgs, __( 'Must use at least one upper case letter.' ) );
		}

		if ( ! preg_match( '/[a-z]/', $password ) ) {
			array_push( $error_msgs, __( 'Must use at least one lower case letter.' ) );
		}

		if ( ! preg_match( '/[0-9]/', $password ) ) {
			array_push( $error_msgs, __( 'Must use at least one number.' ) );
		}

		if ( ! preg_match( '/[!_@]/', $password ) ) {
			array_push( $error_msgs, __( 'Must use at least one special character (! _ @).' ) );
		}

		if ( ! preg_match( '/^[a-zA-Z0-9!_@]+$/', $password ) ) {
			array_push( $error_msgs, __( 'Contains non-allowable special characters (only ! _ @ are allowed).' ) );
		}

		return $error_msgs;
	}

	public function dr_signup_ajax() {
		check_ajax_referer( 'drgc_ajax', 'nonce' );

		$plugin = DRGC();

		if ( isset( $_POST['first_name'] ) && isset( $_POST['last_name'] ) &&
			   isset( $_POST['username'] ) && isset( $_POST['password'] ) ) {
			$first_name = sanitize_text_field( $_POST['first_name'] );
			$last_name = sanitize_text_field( $_POST['last_name'] );
			$email = sanitize_text_field( $_POST['username'] );
			$password = sanitize_text_field( $_POST['password'] );
			$confirm_password = sanitize_text_field( $_POST['confirm_password'] );

			$plugin->session->dirty_set_session( $_COOKIE['drgc_session'] );
			$error_msgs = array();

			if ( ! is_email( $email ) ) {
				array_push( $error_msgs, __( 'Please enter a valid email address.' ) );
			}

			$error_msgs = array_merge( $error_msgs, $this->get_password_error_msgs( $password, $confirm_password ) );

			if ( !empty( $error_msgs ) ) {
				wp_send_json_error( join( ' ', $error_msgs) );
				return;
			}

			// Attemp WP user store
			$userdata = array(
				'user_login'  => $email,
				'user_pass'   => $password,
				'user_email'  => $email,
				'first_name'  => $first_name,
				'last_name'   => $last_name,
				'role'        => 'subscriber'
			);

			$user_id = wp_insert_user( $userdata ) ;
			$externalReferenceId = hash( 'sha256', uniqid( $user_id, true ) );

			add_user_meta( $user_id, '_external_reference_id', $externalReferenceId);

			if ( is_wp_error( $user_id ) ) {
				wp_send_json_error( $user_id->get_error_message() );
				return;
			}

			$attempt = $plugin->shopper->create_shopper( $email, $password, $first_name, $last_name, $email, $externalReferenceId );

			if ( ! is_null( $attempt ) && array_key_exists( 'errors', $attempt ) ) {
				wp_delete_user( $user_id );
				wp_send_json_error( $attempt );
			} else {
				$user = wp_authenticate( $email, $password );

				if ( is_wp_error( $user ) ) {
					wp_send_json_error( $user );
				}

				$plugin->session->set_guest_flag_cookie( 'false' );
				$attempt = $plugin->shopper->generate_access_token_by_ref_id( $externalReferenceId );
				wp_send_json_success( $attempt );
			}
		} else {
			wp_send_json_error();
		}
	}

	public function checkout_as_guest_ajax() {
		check_ajax_referer( 'drgc_ajax', 'nonce' );
		$plugin = DRGC();
		$plugin->session->set_guest_flag_cookie( 'true' );
		wp_send_json_success();
	}

	public function dr_logout_ajax() {
		check_ajax_referer( 'drgc_ajax', 'nonce' );
		$plugin = DRGC();
		$plugin->shopper = null;
		$plugin->session->set_guest_flag_cookie( 'false' );
		$plugin->session->dirty_set_session( $_COOKIE['drgc_session'] );
		$plugin->session->clear_session();
		wp_send_json_success();
	}

	/**
	 * Ajax handles sending password retrieval email to user.
	 */
	function dr_send_email_reset_pass_ajax() {
		check_ajax_referer( 'drgc_ajax', 'nonce' );

		$errors = new WP_Error();

		$email = sanitize_text_field( $_POST['email'] );
		if ( empty( $email ) || ! is_string( $email ) ) {
			$errors->add( 'empty_username', __( 'Enter a username or email address.' ) );
		} elseif ( strpos( $email, '@' ) ) {
			$user_data = get_user_by( 'email', wp_unslash( $email ) );
			if ( empty( $user_data ) ) {
				$errors->add( 'invalid_email', __( 'There is no account with that username or email address.' ) );
			}
		} else {
			$user_data = get_user_by( 'login', $email );
		}

		/**
		 * Fires before errors are returned from a password reset request.
		 */
		do_action( 'lostpassword_post', $errors );
		if ( $errors->has_errors() ) {
			wp_send_json_error($errors);
		}
		if ( ! $user_data ) {
			$errors->add( 'invalidcombo', __( 'There is no account with that username or email address.' ) );
			wp_send_json_error($errors);
		}

		// Redefining user_login ensures we return the right case in the email.
		$user_login = $user_data->user_login;
		$user_email = $user_data->user_email;
		$key        = get_password_reset_key( $user_data );

		if ( is_wp_error( $key ) ) {
			wp_send_json_error($key);
		}
		if ( is_multisite() ) {
			$site_name = get_network()->site_name;
		} else {
			/*
			* The blogname option is escaped with esc_html on the way into the database
			* in sanitize_option we want to reverse this for the plain text arena of emails.
			*/
			$site_name = wp_specialchars_decode( get_option( 'blogname' ), ENT_QUOTES );
		}

		$message = __( '<p> Someone has requested a password reset for the following account:' ) . "</p><br>";
		$message .= sprintf( __( '<p> Site Name: %s' ), $site_name ) . "<br>";
		$message .= sprintf( __( 'Username: %s' ), $user_login ) . "</p><br>";
		$message .= __( '<p> If this was a mistake, just ignore this email and nothing will happen.' ) . "<br>";
		$message .= __( 'To reset your password, visit the following address:' ) . "</p><br>";
		$message .= '<a href="' . drgc_get_page_link( 'login'  ) . "?action=rp&key=$key&login=" . rawurlencode( $user_login ) . "\">\r\n";
		$message .=  __( 'Reset Password</a>');

		$title = sprintf( __( '[%s] Password Reset' ), $site_name );

		/**
		 * Filters the subject of the password reset email.
		 */
		$title = apply_filters( 'retrieve_password_title', $title, $user_login, $user_data );

		/**
		 * Filters the message body of the password reset mail.
		 * If the filtered message is empty, the password reset email will not be sent.
		 */
		$message = apply_filters( 'retrieve_password_message', $message, $key, $user_login, $user_data );
		add_filter( 'wp_mail_content_type', function( $content_type ) { return 'text/html'; });

		if ( $message && ! wp_mail( $user_email, wp_specialchars_decode( $title ), $message ) ) {
			wp_die( __( 'The email could not be sent. Possible reason: your host may have disabled the mail() function.' ) );
		}

		wp_send_json_success();
	}

	/**
	 * Reset user password AJAX
	 */
	public function dr_reset_password_ajax() {
		check_ajax_referer( 'drgc_ajax', 'nonce' );

		$password = sanitize_text_field( $_POST['password'] );
		$confirm = sanitize_text_field( $_POST['confirm-password'] );
		$key = sanitize_text_field( $_POST['key'] );
		$login = urldecode( sanitize_text_field( $_POST['login'] ) );

		if (
			empty( $password ) || ! is_string( $password ) ||
			empty( $key ) || ! is_string( $key ) ||
			empty( $login ) || ! is_string( $login )
		) {
			wp_send_json_error( __( 'Something went wrong.' ) );
			return;
		}

		$error_msgs = $this->get_password_error_msgs( $password, $confirm );

		if ( !empty( $error_msgs ) ) {
			wp_send_json_error( join( ' ', $error_msgs) );
			return;
		}

		// Check if key is valid
		$user = check_password_reset_key( $key, $login );

		if ( is_wp_error( $user ) ) {
			if ( $user->get_error_code() === 'expired_key' ){
				wp_send_json_error( __( 'Expired key' ) );
			} else {
				wp_send_json_error( __( 'Invalid key' ) );
			}
		}

		reset_password( $user, $password );
		wp_send_json_success();
	}

	/**
	 * Get permalink by product ID for AJAX usage.
	 *
	 * @since  1.0.0
	 */
	public function ajax_get_permalink_by_product_id() {
		$product_id = isset( $_POST['productID'] ) ? intval( $_POST['productID'] ) : NULL;

		if ( $product_id ) {
			$products = get_posts(
				array(
					'post_type'     => 'dr_product',
					'meta_key'      => 'gc_product_id',
					'meta_value'    => $product_id
				)
			);

			if ( ! empty( $products ) ) {
				echo get_permalink( $products[0]->ID );
			}
		}

		echo '#';
		die();
	}

	/**
	 * Hide sidebar when, subscriber is authenticated
	 */

	public function remove_admin_bar() {
		if ( ! current_user_can( 'administrator' ) && ! is_admin() ) {
			show_admin_bar( false );
		}
		// if ( ! current_user_can( 'manage_optins' )  ) {
		// 	add_filter('show_admin_bar', '__return_false');
		// }
	}

	/**
	 * Insert login link at menu.
	 *
	 * @since  1.1.0
	 */
	public function insert_login_menu_items( $items, $args ) {
		$customer = DRGC()->shopper->retrieve_shopper();
		$is_logged_in = $customer && 'Anonymous' !== $customer['id'];

		$new_item = array(
			'title'            => $is_logged_in ? __( 'Hi, ', 'digital-river-global-commerce' ) . $customer['firstName'] : __( 'Login' ),
			'menu_item_parent' => 0,
			'ID'               => 'login',
			'db_id'            => 'login',
			'url'              => get_site_url() . '/login',
			'classes'          => $is_logged_in ? array( 'menu-item', 'menu-item-has-children' ) : array( 'menu-item' ),
			'target'           => null,
			'xfn'              => null,
			'current'          => null // for preventing warning in debug mode
		);
		$items[] = (object) $new_item;

		if ( $is_logged_in ) {
			$new_sub_item = array(
				'title'            => __( 'Logout', 'digital-river-global-commerce' ),
				'menu_item_parent' => 'login',
				'ID'               => 'logout',
				'db_id'            => 'logout',
				'url'              => '#',
				'classes'          => array( 'menu-item' ),
				'target'           => null,
				'xfn'              => null,
				'current'          => null // for preventing warning in debug mode
			);
			$items[] = (object) $new_sub_item;
		}

		return $items;
	}

	/**
	 * Render minicart on header.
	 *
	 * @since  1.0.0
	 */
	public function minicart_in_header( $content ) {
		if ( !is_page( 'cart' ) && !is_page( 'checkout' ) && !is_page( 'thank-you' ) ) {
			ob_start();
			include_once 'partials/drgc-minicart.php';
			$append = ob_get_clean();
			return $content . $append;
		}
		return $content;
	}

	/**
	 * Render the full page by overwriting template.
	 *
	 * @since  1.0.0
	 */
	public function overwrite_template( $template ) {
		$theme = wp_get_theme();
		if ( 'Digital River Global Commerce' != $theme->name ) {
			if ( is_singular( 'dr_product' ) ) {
				$template = DRGC_PLUGIN_DIR . 'public/templates/single.php';
			} else if ( is_post_type_archive( 'dr_product' ) || is_tax( 'dr_product_category' ) ) {
				$template = DRGC_PLUGIN_DIR . 'public/templates/archive.php';
			}
		}
		return $template;
	}

	public function add_legal_link() {
		if ( is_page( 'cart' ) || is_page( 'checkout' ) || is_page( 'thank-you' ) ) {
			if ( ! is_page( 'thank-you' ) ) {
				$cart = DRGC()->cart->retrieve_cart();
				$entity_code = $cart['cart']['businessEntityCode'];
			} else {
				$order = DRGC()->cart->retrieve_order();
				$entity_code = $order['order']['businessEntityCode'];
			}
			include_once 'partials/drgc-legal-footer.php';
		}
	}

	/**
	 * Redirect on page load.
	 *
	 * @since  1.1.0
	 */
	public function redirect_on_page_load() {
		if ( is_page( 'checkout' ) ) {
			$customer = DRGC()->shopper->retrieve_shopper();
			$is_logged_in = $customer && 'Anonymous' !== $customer['id'];
			$is_guest = 'true' === $_COOKIE['drgc_guest_flag'];

			if ( ! $is_logged_in && ! $is_guest ) {
				wp_redirect( get_permalink( get_page_by_path( 'login' ) ) );
				exit;
			}
		}
	}
}
