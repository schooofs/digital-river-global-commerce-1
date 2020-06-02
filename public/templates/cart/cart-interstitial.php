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
/*
  $sale_price = $productOffer["pricing"]["formattedSalePriceWithQuantity"];
  $price = $productOffer["pricing"]["formattedListPriceWithQuantity"];;
  $product_name = $productOffer["product"]["displayName"];
  $product_image_uri = $productOffer["product"]["thumbnailImage"];
  $product_sku = $productOffer["product"]["sku"];
  $uri = $productOffer["addProductToCart"]["uri"];
  $pid = $productOffer["product"]["id"];
  */
  $lineItemId = $item['lineItemId'];
  $product_id = $item['pid'];
  $product_name = $item['product_name'];
  $product_image_uri = $item['product_image_uri'];;
  $product_colors = ['Black', 'Red'];
  $product_sku = $item['product_sku'];
  $sale_price = $item['sale_price'];
  $price = $item['price'];
  $product_qty = $item['quantity'];
  $is_variation =  isset( $item['parentProduct'] );
  $uri = $item["uri"];
  $parentProduct = $item['parentProduct'];
?>

<div  class="dr-product dr-candyRackProduct" data-product-id="<?php echo $product_id; ?>" data-parent-product-id="<?php echo $parentProduct;?>">
  <div class="dr-product-content">
      <img src="<?php echo $product_image_uri; ?>" class="dr-candyRackProduct__img"/>
      <div class="dr-product__info">
        <?php echo $product_name; ?>
        <div class="product-sku">
          <span>Product  </span>
          <span>#<?php echo $product_sku; ?></span>
        </div>
      </div>
  </div>
  <div class="dr-product__price">
      <button type="button" class="dr-btn dr-buy-crosssell" data-buy-uri="<?php echo $uri; ?>">ADD</button>
      <span class="sale-price"><?php echo $sale_price; ?></span>
      <span class="regular-price dr-strike-price <?php if ($salePrice !== $price) echo "d-none"; ?>"><?php echo $price; ?></span>
  </div>
</div>
