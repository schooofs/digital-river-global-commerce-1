<?php
$standart_price = '$0.00';
$standart_estimated_arrival = 'Apr 08 - Apr 11';
$express_price = '$10.00';
$express_estimated_arrival = 'Apr 09, 2019';
$overnight_price = '$20.00';
$overnight_estimated_arrival = 'Apr 08, 2019';

$result = 'Standard $0.00';

?>

<div class="dr-checkout__delivery dr-checkout__el">

    <div class="dr-accordion">
        
        <span class="dr-accordion__name">

            <span class="dr-accordion__title-long">

                <?php echo isset( $steps_titles['delivery'] ) ? $steps_titles['delivery'] : ''; ?>

            </span>

            <span class="dr-accordion__title-short">

                <?php echo __( 'Delivery' ); ?>

            </span>
            

        </span>

       <span class="dr-accordion__edit">Edit></span>
  
        
    </div>

    <form id="checkout-delivery-form" class="dr-panel-edit dr-panel-edit--delivery">

        <div class="dr-panel-edit__el"></div>

        <button type="submit" class="dr-panel-edit__btn dr-btn">

            <?php echo __( 'Save and continue' ); ?>

        </button>

        <div class="invalid-feedback dr-err-field"></div>

    </form>

    <div class="dr-panel-result">
        
        <p class="dr-panel-result__text">

            <?php echo $result ?>

        </p>

    </div>

</div>