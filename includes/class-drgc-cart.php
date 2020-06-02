<?php
/**
 * Cart object
 *
 * @since      1.0.0
 * @package    Digital_River_Global_Commerce
 */

class DRGC_Cart extends AbstractHttpService {
    /**
     * Cart Object
     */
    public $cart;

    /**
     * Refresh token
     */
    protected $refresh_token;

    /**
     * Current line items
     */
    protected $line_items = array();

    /**
     * Billing address
     */
    protected $billing_address = array();

    /**
     * Undocumented variable
     */
    protected $drgc_api_key;

	/**
	 * The authenticator | object
	 */
	protected $authenticator;

    /**
     * Constructor
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
        $this->refresh_token =  $this->authenticator->get_refresh_token();
    }

    /**
     * Get line item by id
     */
    public function get_line_item_by_id( $id ) {
        foreach ( $this->line_items as $line_item ) {
            if ( $line_item['id'] === $id ) {
                return $line_item;
            }
        }
    }

    /**
     * Returns a list of all cart line-items.
     */
    public function list_line_items() {
        return $this->line_items ?: array();
    }

    /**
     * Retrieve the contents of an active cart. Supply
     * an active token and Digital River will respond with the
     * corresponding cart information (products, prices and links
     * to billing and shipping address as well as shipping options).
     */
    public function retrieve_cart( $params = array() ) {
        $default = array(
            'expand' => 'all'
        );

        $params = array_merge(
            $default,
            array_intersect_key( $params, $default )
        );

        $res = $this->get( "/v1/shoppers/me/carts/active?".http_build_query( $params ) );
        $hasPhysicalProduct = false;

        if ( isset( $res['cart']['lineItems']['lineItem'] ) ) {
	        $line_items = $res['cart']['lineItems']['lineItem'];
		        foreach ( $line_items as $line_item ) {
                    if ( $line_item['product']['productType'] === 'PHYSICAL' ) {
                        $hasPhysicalProduct = true;
                    }
			        $this->line_items[] = $line_item;
		        }
        }

        if ( isset( $res['cart'] ) ) {
            $res['cart']['hasPhysicalProduct'] = $hasPhysicalProduct;
        }

        $this->cart = isset( $res['cart'] ) ? $res['cart'] : false;

        return $res;
    }

    /**
     * Retrieve a shopper order. Supply a full
     * access token as well as an order ID and Digital
     * River will provide all corresponding order information.
     */
    public function retrieve_order() {
        if ( is_null ( $id = $_POST[ 'order_id' ] ?? null ) ) {
            // Maybe redirect to other page
            return;
        }

        $hasPhysicalProduct = false;

        $default = array(
            'expand'     => 'all',
            'orderState' => 'Open'
        );

        $res = $this->get( "/v1/shoppers/me/orders/{$id}?".http_build_query( $default ) );
        $hasPhysicalProduct = false;

        if ( isset( $res['order']['lineItems']['lineItem'] ) ) {
            $line_items = $res['order']['lineItems']['lineItem'];
                foreach ( $line_items as $line_item ) {
                    if ( $line_item['product']['productType'] === 'PHYSICAL' ) {
                        $hasPhysicalProduct = true;
                        break;
                    }
                }
        }

        if ( isset( $res['order'] ) ) {
            $res['order']['hasPhysicalProduct'] = $hasPhysicalProduct;
        }

        return $res;
    }

    /**
     * Returns a list of all site
     * supported currencies and locales.
     */
    public function retrieve_currencies() {
        return $this->get( "/v1/shoppers/site" );
    }

    /**
     * Returns a list of all cart line-items.
     * Supply an active token and Digital River will respond with
     * the corresponding product and price information for all cart line-items.
     */
    public function fetch_items( $params = array() ) {
        $res = $this->get( "/v1/shoppers/me/carts/active/line-items" . http_build_query( $params ) );

        if ( $line_items = $res['lineItems']['lineItem'] ) {
            foreach ( $line_items as $line_item ) {
                $this->line_items[] = $line_item;
            }
        }

        return $res;
    }

    /**
     * Update and/or add product line-items to
     * an active cart. Supply one or more product
     * ID's or your system's product ID's (external reference ID)
     * and Digital River will add those products to the shopper's cart.
     */
    public function update_line_items( $params = array() ) {
        try {
            $this->post( "/v1/shoppers/me/carts/active/line-items".http_build_query( $params ));
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Retrieve a cart billing address.
     * Supply a limited access token and Digtial River
     * will respond with all corresponding billing address information.
     */
    public function get_billing_address( $params = array() ) {
        $default = array(
            'expand'            => 'all'
        );

        $params = array_merge(
            $default,
            array_intersect_key( $params, $default )
        );

        $res = $this->get( "/v1/shoppers/me/carts/active/billing-address?" . http_build_query( $params ) );

        $this->billing_address = $res['address'];

        return $res;
    }
}
