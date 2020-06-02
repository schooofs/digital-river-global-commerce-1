<?php
/**
 * Provide a publidr-facing view for the plugin
 *
 * This file is used to markup the publidr-facing aspects of the plugin.
 *
 * @link       https://www.digitalriver.com
 * @since      1.0.0
 *
 * @package    Digital_River_Global_Commerce
 * @subpackage Digital_River_Global_Commerce/public/partials
 */
?>

<?php
$shipping_price = $cart['cart']['pricing']['formattedShippingAndHandling'];
$discount       = $cart['cart']['pricing']['discount']['value'];
$formatted_discount = $cart['cart']['pricing']['formattedDiscount'];
$subtotal_items = $cart['cart']['totalItemsInCart'];
$subtotal_with_discount_value = $cart['cart']['pricing']['formattedSubtotalWithDiscount'];

$delivery_info = 'Delivery in 2-5 working days and extended 30 days return period';
?>



<div class="dr-summary dr-summary--cart">

    <div class="dr-summary__discount" <?php if ( $discount === 0 ) echo 'style="display: none;"' ?>>

        <p class="discount-label"><?php echo __('Discount') ?></p>

        <p class="discount-value"><?php echo '-' . $formatted_discount; ?></p>

    </div>

    <div class="dr-summary__discounted-subtotal">

        <p class="discounted-subtotal-label"><?php echo __('Subtotal') ?></p>

        <p class="discounted-subtotal-value"><?php echo $subtotal_with_discount_value; ?></p>

    </div>

    <div class="dr-summary__shipping">

        <p class="shipping-label"><?php echo __('Estimated Shipping') ?></p>

        <p class="shipping-value"><?php echo $shipping_price; ?></p>

    </div>

    <div class="dr-summary__promo-code">
        <a class="promo-code-toggle" href="javascript:void(0);"><?php echo __('Add Promo Code +') ?></a>
        <div class="promo-code-wrapper" style="display: none;">
            <input type="text" class="form-control" id="promo-code" name="promo_code" placeholder="<?php echo __('Promo Code') ?>">
            <button type="button" class="dr-btn" id="apply-promo-code-btn"><?php echo __('Apply') ?></button>
            <div class="invalid-feedback" id="dr-promo-code-err-field"></div>
        </div>
    </div>

	<?php if ( 1 < count($cart['cart']['lineItems'] )) : ?>

        <a href="<?php echo esc_url( drgc_get_page_link( 'checkout' ) ); ?>" class="dr-summary__proceed-checkout dr-btn"><?php echo __('Proceed to checkout') ?></a>

	<?php endif; ?>


    <?php /*
    <div class="dr-summary__delivery delivery-info">

        <span class="delivery-info__icon"></span>

        <span class="delivery-info__text"><?php echo $delivery_info; ?></span>

    </div>
 */ ?>

</div>
