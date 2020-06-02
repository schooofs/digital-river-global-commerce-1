<?php
/**
 * Shopper object, generates session.
 * Deals with generation of tokens, and fetching data.
 *
 * @package    Digital_River_Global_Commerce
 * @subpackage Digital_River_Global_Commerce/includes
 * @version 1.0.0
 */

class DRGC_Shopper extends AbstractHttpService {
	/**
	 * Cart Id
	 */
	private $cart_id;

	/**
	 * The user id
	 */
	private $user_id;

	/**
	 *  Current shopper locale
	 */
	private $locale;

	/**
	 *  Shopper currency
	 */
	private $currency;

	/**
	 * Refresh token for limited access only | string
	 */
	private $refresh_token;

	/*
	 * Access token expiration
	 */
	private $expires_in;

	/**
	 * The client ip address
	 */
	private $client_ip_address;

	/**
	 * Weather the shopper is authenticated| bool
	 */
	private $authenticated = false;

	/**
	 * The authenticator | object
	 */
	protected $authenticator;

	/**
	 * The shopper personal data | array
	 */
	protected $shopper_data;

    /**
     * Undocumented variable
     */
    protected $drgc_api_key;

	/**
	 * DRGC_Shopper constructor.
	 *
	 * @param $authenticator
	 */
	public function __construct( $authenticator, $handler = false ) {
		parent::__construct($handler);
		$this->authenticator = $authenticator;
		$this->drgc_api_key = get_option( 'drgc_api_key' );

		$this->init();
	}

	/**
	 * Initialize the shopper object
	 */
	public function init() {
		$this->token         = $this->authenticator->get_token();
		$this->refresh_token = $this->authenticator->get_refresh_token();

		if ( ! $this->user_id && $this->token ) {
			$this->get_access_token_information();
		}
	}

	/**
	 * Generate full access token
	 *
	 * @param string $username
	 * @param string $password
	 *
	 * @return mixed $data
	 */
	public function generate_access_token_by_login_id( $username, $password ) {
		$data = $this->authenticator->generate_access_token_by_login_id( $username, $password );

		$this->refresh_token        = null;
		$this->token                = isset( $data['access_token'] ) ? $data['access_token'] : null;
		$this->tokenType            = isset( $data['token_type'] ) ? $data['token_type'] : null;
		$this->expires_in           = isset( $data['expires_in'] ) ? $data['expires_in'] : null;

		return $data;
	}

	/**
	 * Generate full access token
	 *
	 * @param string $external_reference_id
	 *
	 * @return mixed $data
	 */
	public function generate_access_token_by_ref_id( $external_reference_id ) {
		$data = $this->authenticator->generate_access_token_by_ref_id( $external_reference_id );

		$this->refresh_token        = null;
		$this->token                = isset( $data['access_token'] ) ? $data['access_token'] : null;
		$this->tokenType            = isset( $data['token_type'] ) ? $data['token_type'] : null;
		$this->expires_in           = isset( $data['expires_in'] ) ? $data['expires_in'] : null;

		return $data;
	}

	/**
	 * Generate limited access token
	 *
	 * @return mixed $this
	 */
	public function generate_limited_access_token() {
		$data = $this->authenticator->generate_access_token( '' );

		$this->token          = isset( $data['access_token'] ) ? $data['access_token'] : null;
		$this->tokenType      = isset( $data['token_type'] ) ? $data['token_type'] : null;
		$this->expires_in     = isset( $data['expires_in'] ) ? $data['expires_in'] : null;
		$this->refresh_token  = isset( $data['refresh_token'] ) ? $data['refresh_token'] : null;

		return $this;
	}

	/**
	 * Updates shopper information for the current shopper.
	 *
	 * @param array $params
	 *
	 * @return array|bool
	 */
	public function update_shopper_fields( $params = array() ) {
		$default = array(
			'expand'            => 'all'
		);

		$params = array_merge(
			$default,
			array_intersect_key( $params, $default )
		);

		try {
			$this->post( "/v1/shoppers/me?" . http_build_query( $params ) );
			return true;
		} catch (\Exception $e) {
			return "Error: # {$e->getMessage()}";
		}
	}
	/**
	 * Create or Update Customer Tax Registration for the current shopper.
	 *
	 * @param array $params
	 *
	 * @return array|bool
	 */
	/*public function update_tax_registration( $params = array() ) {
		$default = array(
			'expand'            => 'all'
		);

		$params = array_merge(
			$default,
			array_intersect_key( $params, $default )
		);

		try {
			$this->post( "/v1/customers/customerId/tax-registration?" . http_build_query( $params ) );
			return true;
		} catch (\Exception $e) {
			return "Error: # {$e->getMessage()}";
		}
	}*/
	/**
	 * Get access token data
	 */
	public function get_access_token_information() {
		$params = array(
			'token' => $this->token
		);

		$url = "/oauth20/access-tokens?" . http_build_query( $params );

		try {
			$res = $this->get( $url );

			$this->locale            = $res['locale'];
			$this->currency          = $res['currency'];
			$this->cart_id           = $res['cartId'];
			$this->user_id           = $res['userId'];
			$this->authenticated     = (bool) $res['authenticated'];
			$this->client_ip_address = $res['clientIpAddress'];

			return $res;
		} catch (\Exception $e) {
			return "Error: # {$e->getMessage()}";
		}
	}

	/**
	 * Retrieve the current (anonymous and
	 * authenticated) shopper and shopper data.
	 *
	 * @param array $params
	 * @return bool
	 */
	public function retrieve_shopper( $params = array() ) {
		$default = array(
			'expand'            => 'all'
		);

		$params = array_merge(
			$default,
			array_intersect_key( $params, $default )
		);

		$url = "/v1/shoppers/me?".http_build_query( $params );

		try {
			$res = $this->get($url);

			$this->shopper_data = array(
				'username'   =>  $res['shopper']['username'],
				'last_name'  =>  $res['shopper']['lastName'],
				'first_name' =>  $res['shopper']['firstName'],
				'email'      =>  $res['shopper']['emailAddress'],
			);

			$this->user_id = $res['shopper']['id'];

			return $res['shopper'];
		} catch (\Exception $e) {
			return false;
		}
	}

	public function retrieve_shopper_address( $params = array() ) {
		$default = array(
			'expand'            => 'all'
		);

		$params = array_merge(
			$default,
			array_intersect_key( $params, $default )
		);

		$url = "/v1/shoppers/me?".http_build_query( $params );
		try {
			$res = $this->get($url);

			if ( isset($res['shopper']['addresses']['address']) && !empty($res['shopper']['addresses']['address']) ) {
				return $res['shopper']['addresses']['address'];
			} else {
				return false;
			}
		} catch (\Exception $e) {
			return false;
		}
	}

	/**
	 * Create a new shopper.
	 * The base shopper account information includes the shopper's name and email address.
	 *
	 * @param string $username
	 * @param string $password
	 * @param string $first_name
	 * @param string $last_name
	 * @param string $email_address
	 * @param string $externalReferenceId
	 *
	 * @return mixed
	 */
	public function create_shopper(
		$username,
		$password,
		$first_name,
		$last_name,
		$email_address,
		$externalReferenceId
	) {
		$data = array (
			'shopper' => array (
				'username'     			  => $username,
				'password'     			  => base64_encode($password),
				'firstName'    			  => $first_name,
				'lastName'     			  => $last_name,
				'emailAddress' 			  => $email_address,
				'externalReferenceId' => $externalReferenceId
				// 'locale'       => $this->locale,
				// 'currency'     => $this->currency,
			),
		);

		$this->setJsonContentType();

		try {
			$res = $this->post( "/v1/shoppers", $data );

			if ( isset( $res['errors']['error'] ) ) {
				return $res;
			}

			$this->generate_access_token_by_ref_id( $externalReferenceId );

			return true;
		} catch (\Exception $e) {
			return $e->getMessage();
		}
	}

	/**
	 * Return true if the shopper is authenticated
	 *
	 * @return bool
	 */
	public function is_shopper_logged_in() {
		return $this->authenticated;
	}

	/**
	 * Return current shopper locale
	 *
	 * @return bool
	 */
	public function get_locale() {
		return $this->locale;
	}
}
