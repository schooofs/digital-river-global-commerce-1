/* global drgc_params, iFrameResize */
/* eslint-disable no-alert, no-console */
import CheckoutUtils from './checkout-utils';
import DRCommerceApi from './commerce-api';

const CartModule = (($) => {
  const initAutoRenewalTerms = (digitalriverjs) => {
    const $checkoutBtn = $('a.dr-summary__proceed-checkout');
    const $termsCheckbox = $('#autoRenewOptedInOnCheckout');

    if (sessionStorage.getItem('isTermsChecked')) {
      const isTermsChecked = sessionStorage.getItem('isTermsChecked') === 'true' ? true : false;      
      $termsCheckbox.prop('checked', isTermsChecked);
    }

    $termsCheckbox.change((e) => {
      if ($(e.target).is(':checked')) {
        $('#dr-TAndC-err-msg').text('').hide();
        $checkoutBtn.prop('href', drgc_params.checkoutUrl);
        sessionStorage.setItem('isTermsChecked', 'true');
      } else {
        $checkoutBtn.prop('href', '#dr-autoRenewTermsContainer');
        sessionStorage.setItem('isTermsChecked', 'false');
      }
    });

    $checkoutBtn.click(() => {
      if (!$termsCheckbox.is(':checked')) {
        $('#dr-TAndC-err-msg').text(drgc_params.translations.required_tandc_msg).show();
      }
    });

    $termsCheckbox.trigger('change');
    
    appendAutoRenewalTerms(digitalriverjs);   
  };

  const appendAutoRenewalTerms = (digitalriverjs) => {
    const entityCode = CheckoutUtils.getEntityCode();
    const locale = drgc_params.drLocale || 'en_US';
    const compliance = CheckoutUtils.getCompliance(digitalriverjs, entityCode, locale);

    if (Object.keys(compliance).length) {
      const terms = compliance.autorenewalPlanTerms.localizedText;

      $('#dr-optInAutoRenew > .dr-optInAutoRenewTerms > p').append(terms);
      $('#dr-autoRenewTermsContainer').show();
    }
  };

  return {
    initAutoRenewalTerms,
    appendAutoRenewalTerms
  };
})(jQuery);

jQuery(document).ready(($) => {
    const apiBaseUrl = 'https://' + drgc_params.domain + '/v1/shoppers';
    const productLabel = $("#dr-cart-page-wrapper div.product-sku span:first-child").html();
    // Very basic throttle function,
    // does not store calls white in limit period
    const throttle = (func, limit) => {
        let inThrottle

        return function() {
          const args = arguments
          const context = this

          if (!inThrottle) {
            func.apply(context, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
          }
        }
    }

    $('body').on('click', '.dr-prd-del', (e) => {
        e.preventDefault();

        const $this = $(e.target);
        const lineItemID = $this.closest('.dr-product').data('line-item-id');

        DRCommerceApi.removeLineItem(lineItemID)
            .then(() => {
                $(`.dr-product[data-line-item-id="${lineItemID}"]`).remove();
                fetchFreshCart();
            })
            .catch(jqXHR => CheckoutUtils.apiErrorHandler(jqXHR));
    });

    $('body').on('click', 'span.dr-pd-cart-qty-plus, span.dr-pd-cart-qty-minus', throttle(setProductQty, 200));

    function setProductQty(e) {
        // Get current quantity values
        const $this = $(e.target);
        const lineItemId = $this.closest('.dr-product').data('line-item-id');
        const $qty = $this.siblings('.product-qty-number:first');
        const val = parseInt($qty.val(), 10);
        const max = parseInt($qty.attr('max'), 10);
        const min = parseInt($qty.attr('min'), 10);
        const step = parseInt($qty.attr('step'), 10);
        const initialVal = $qty.val();

        if ($this.hasClass('disabled')) return;

        if (val) {
            // Change the value if plus or minus
            if ($(e.currentTarget).is('.dr-pd-cart-qty-plus')) {
                if (max && (max <= val)) {
                    $qty.val(max);
                } else {
                    $qty.val(val + step);
                }
            } else if ($(e.currentTarget).is('.dr-pd-cart-qty-minus')) {
                if (min && (min >= val)) {
                    $qty.val(min);
                } else if (val > 1) {
                    $qty.val(val - step);
                }
            }
        } else {
            $qty.val('1');
        }

        let params = {
            'action'              : 'update',
            'quantity'            : $qty.val(),
            'expand'              : 'all',
            'fields'              : null
        }

        $.ajax({
            type: 'POST',
            headers: {
              "Accept": "application/json",
              "Content-Type":"application/json",
              "Authorization": `Bearer ${drgc_params.accessToken}`
            },
            url: `${apiBaseUrl}/me/carts/active/line-items/${lineItemId}?${$.param(params)}`,
            success: (data, textStatus, xhr) => {
                if (xhr.status === 200) {
                    let { formattedListPriceWithQuantity, formattedSalePriceWithQuantity } = data.lineItem.pricing;
                    $(`span#${lineItemId}.sale-price`).text(formattedSalePriceWithQuantity);
                    $(`span#${lineItemId}.regular-price`).text(formattedListPriceWithQuantity);

                    fetchFreshCart();
                }
            },
            error: (jqXHR) => {
                CheckoutUtils.apiErrorHandler(jqXHR);
                $qty.val(val); // reset to original qty
            }
        });
    }

    function beforeAjax() {
      if($('.dr-cart__products').length > 0)$('body').css({ 'pointer-events': 'none', 'opacity': 0.5 });
    }

    function afterAjax() {
      if($('.dr-cart__products').length > 0)$('body').css({ 'pointer-events': 'auto', 'opacity': 1 });
    }

    $(document).ajaxSend(function() {
      beforeAjax();
    });

    $(document).ajaxStop(function() {
      afterAjax();
    });


    function fetchFreshCart() {
        $.ajax({
            type: 'GET',
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${drgc_params.accessToken}`
            },
            url: `${apiBaseUrl}/me/carts/active?expand=all`,
            success: (data) => {
                renderCartProduct(data);
            },
            error: (jqXHR) => {
                CheckoutUtils.apiErrorHandler(jqXHR);
            }
        });
    }


    function shoppingCartBannerAndOutputLineItems(){
      $.ajax({
        type: 'GET',
        headers: {
          "Content-Type": 'application/json',
          "Authorization": `Bearer ${drgc_params.accessToken}`
        },
        url: `${apiBaseUrl}/me/point-of-promotions/Banner_ShoppingCartLocal/offers?format=json&expand=all`,
        success: (shoppingCartOfferData, textStatus, xhr) => {
          $.each(shoppingCartOfferData.offers.offer, function( index, offer ) {
            let shoppingCartHTML = `
            <div class="dr-banner">
              <div class="dr-banner__content">${offer.salesPitch[0]}</div>
              <div class="dr-banner__img"><img src="${offer.image}"></div>
            </div>
            `;
            $("#tempCartProducts").append(shoppingCartHTML);
            $(".dr-cart__products").html($("#tempCartProducts").html());
          });
        },
        error: (jqXHR) => {
            reject(jqXHR);
        }
      });
    }

    function tightBundleRemoveElements(productID){
      $.ajax({
        type: 'GET',
        headers: {
          "Content-Type": 'application/json',
          "Authorization": `Bearer ${drgc_params.accessToken}`
        },
        url: `${apiBaseUrl}/me/products/${productID}/offers?format=json&expand=all`,
        success: (tightData, textStatus, xhr) => {
          $.each(tightData.offers.offer, function( index, offer ) {
            if(offer.type =="Bundling" && offer.policyName == "Tight Bundle Policy"){
             $.each(offer.productOffers.productOffer, function( index, productOffer ) {
               /*if product have  tight policy and it is not tight itself, remove the action button*/
               if(productOffer.product.id != productID){
                 $('div.dr-product[data-product-id="'+productOffer.product.id+'"]').find('.remove-icon,.value-button-increase,.value-button-decrease').remove();
               }
             });
            }
          });

        },
        error: (jqXHR) => {
            reject(jqXHR);
        }
      });
    }


    function candyRackCheckAndRender(productID){
      $.ajax({
        type: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${drgc_params.accessToken}`
        },
        url: `${apiBaseUrl}/me/products/${productID}/point-of-promotions/CandyRack_ShoppingCart/offers?format=json&expand=all`,
        success: (candyRackData, textStatus, xhr) => {
          $.each(candyRackData.offers.offer, function( index, offer ) {
            let promoText = offer.salesPitch[0].length > 0 ? offer.salesPitch[0]   : "";
            $.each(offer.productOffers.productOffer, function( index, productOffer ) {
              const salePrice = productOffer.pricing.formattedSalePriceWithQuantity;
              const listPrice = productOffer.pricing.formattedListPriceWithQuantity;
              const purchasable = productOffer.product.inventoryStatus.productIsInStock === 'true';
              let buyButtonText = '';

              if (purchasable) {
                buyButtonText = (offer.type === 'Up-sell') ? drgc_params.translations.upgrade_label : drgc_params.translations.add_label;
              } else {
                buyButtonText = drgc_params.translations.out_of_stock;
              }
              let candyRackProductHTML = `
              <div  class="dr-product dr-candyRackProduct" data-product-id="${productOffer.product.id}" data-parent-product-id="${productID}">
                <div class="dr-product-content">
                    <img src="${productOffer.product.thumbnailImage}" class="dr-candyRackProduct__img"/>
                    <div class="dr-product__info">
                      <div class="product-color">
                        <span style="background-color: yellow;">${promoText}</span>
                      </div>
                      ${productOffer.product.displayName}
                      <div class="product-sku">
                        <span>${productLabel}  </span>
                        <span>#${productOffer.product.id}</span>
                      </div>
                    </div>
                </div>
                <div class="dr-product__price">
                    <button type="button" class="dr-btn dr-buy-candyRack"
                      data-buy-uri="${productOffer.addProductToCart.uri}"
                      ${purchasable ? '' : 'disabled="disabled"'}>${buyButtonText}</button>
                    <span class="sale-price">${salePrice}</span>
                    <span class="regular-price dr-strike-price ${salePrice === listPrice ? 'd-none' : ''}">${listPrice}</span>
                </div>
              </div>
              `;
              if($('div.dr-product[data-product-id="'+productOffer.product.id+'"]:not(.dr-candyRackProduct)').length == 0)$('div[data-product-id="'+productID+'"]').after(candyRackProductHTML);
            });
          });
        },
        error: (jqXHR) => {
            reject(jqXHR);
        }
      });
    }

    $('body').on('click', '.dr-buy-candyRack', (e) => {
      e.preventDefault();
      const $this = $(e.target);
      const buyUri = $this.attr('data-buy-uri');
      $.ajax({
          type: 'POST',
          headers: {
              "Accept": "application/json",
              "Content-Type":"application/json",
              "Authorization": `Bearer ${drgc_params.accessToken}`
          },
          url: (() => {
              let url = buyUri;
              if(drgc_params.testOrder == "true")url += '&testOrder=true';
              return url;
          })(),
          success: (data, textStatus, xhr) => {
            fetchFreshCart();
          },
          error: (jqXHR) => {
            CheckoutUtils.apiErrorHandler(jqXHR);
          }
      });
    });

    function getpermalink(permalinkProductId){
      return new Promise((resolve, reject) => {
        $.ajax({
          type: 'POST',
          url: drgc_params.ajaxUrl,
          data: {
            action: 'get_permalink',
            productID: permalinkProductId
          },
          success: (data) => {
            resolve(data);
          },
          error: (jqXHR) => {
            reject(jqXHR);
          }
        });
    });
    }

    function updateSummary(data,hasPhysicalProduct){
      const pricing = data.cart.pricing;
      if(hasPhysicalProduct){
        $('.dr-summary__shipping').show();
      }else{
        $('.dr-summary__shipping').hide();
      }
      $('div.dr-summary__shipping .shipping-value').text(pricing.formattedShippingAndHandling);
      //overwrite $0.00 to FREE
      if(pricing.shippingAndHandling.value === 0 )$('div.dr-summary__shipping .shipping-value').text(drgc_params.translations.free_label);
      $('div.dr-summary__discount .discount-value').text(`-${pricing.formattedDiscount}`);
      $('div.dr-summary__discounted-subtotal .discounted-subtotal-value').text(pricing.formattedSubtotalWithDiscount);

      if (pricing.discount.value) {
        $('.dr-summary__discount').show();
      } else {
        $('.dr-summary__discount').hide();
      }

    }

    function renderLineItemsAndSummary(data,hasPhysicalProductinLineItem) {
      const min = 1;
      const max = 999;
      let lineItemCount = 0;

      $.each(data.cart.lineItems.lineItem, function( index, lineitem ) {
        if(lineitem.product.productType == "PHYSICAL")hasPhysicalProductinLineItem = true;
        let permalinkProductId = lineitem.product.id;
        if(lineitem.product.parentProduct)permalinkProductId = lineitem.product.parentProduct.id;
        const salePrice = lineitem.pricing.formattedSalePriceWithQuantity;
        const listPrice = lineitem.pricing.formattedListPriceWithQuantity;

        getpermalink(permalinkProductId).then((response) => {
          const permalink = response;
          const lineItemHTML = `
          <div data-line-item-id="${lineitem.id}" class="dr-product dr-product-lineitem" data-product-id="${lineitem.product.id}" data-sort="${index}">
            <div class="dr-product-content">
                <div class="dr-product__img" style="background-image: url(${lineitem.product.thumbnailImage})"></div>
                <div class="dr-product__info">
                    <a class="product-name" href="${permalink}">${lineitem.product.displayName}</a>
                    <div class="product-sku">
                        <span>${productLabel} </span>
                        <span>#${lineitem.product.id}</span>
                    </div>
                    <div class="product-qty">
                        <span class="qty-text">Qty ${lineitem.quantity}</span>
                        <span class="dr-pd-cart-qty-minus value-button-decrease ${lineitem.quantity <= min ? 'disabled' : ''}"></span>
                        <input type="number" class="product-qty-number" step="1" min="${min}" max="${max}" value="${lineitem.quantity}" maxlength="5" size="2" pattern="[0-9]*" inputmode="numeric" readonly="true">
                        <span class="dr-pd-cart-qty-plus value-button-increase ${lineitem.quantity >= max ? 'disabled' : ''}"></span>
                    </div>
                </div>
            </div>
            <div class="dr-product__price">
                <button class="dr-prd-del remove-icon"></button>
                <span class="sale-price">${salePrice}</span>
                <span class="regular-price ${salePrice === listPrice ? 'd-none' : ''}">${listPrice}</span>
            </div>
          </div>
          `;
          $('#tempCartProducts').append(lineItemHTML);
          $(".dr-cart__products").html($("#tempCartProducts").html());
        }).then(() => {
          lineItemCount++;
          if(lineItemCount === data.cart.lineItems.lineItem.length){
            updateSummary(data,hasPhysicalProductinLineItem);
            reOrderCartAndMerchandising(data);
          }
        }).catch((jqXHR) => {
          CheckoutUtils.apiErrorHandler(jqXHR);
        });
      });
    }

    function reOrderCartAndMerchandising(data){
      //1.Order dr-product-lineitem in temp area
      let $wrapper = $('#tempCartProducts');
      $wrapper.find('.dr-product-lineitem').sort(function (a, b) {
          return +a.dataset.sort - +b.dataset.sort;
      }).appendTo( $wrapper );
      //2. Add banner at last and output lineitems
      shoppingCartBannerAndOutputLineItems();
      //3. Main cart item displayed, Finish loading icon
      $('body').css({ 'pointer-events': 'auto', 'opacity': 1 });
      //4. Execute candyRackCheckAndRender and tightBundleRemoveElements
      $.each(data.cart.lineItems.lineItem, function( index, lineitem ) {
        candyRackCheckAndRender(lineitem.product.id);
        tightBundleRemoveElements(lineitem.product.id);
      });
    }

    function renderCartProduct(data){
      let hasPhysicalProduct = false;
      $("#tempCartProducts").remove();
      $("<div id='tempCartProducts' style='display:none;'></div>").appendTo('body');

      if(data.cart.lineItems.lineItem){
        renderLineItemsAndSummary(data,hasPhysicalProduct);
      }else{
        $('.dr-cart__products').text(drgc_params.translations.empty_cart_msg);
        $('#cart-estimate').hide();
      }
    }

    $('body').on('change', '.dr-currency-select', function(e) {
        e.preventDefault();
        $('body').css({ 'pointer-events': 'none', 'opacity': 0.5 });

        let data = {
            currency: e.target.value,
            locale: $(this).find('option:selected').attr('data-locale')
        };

        $.ajax({
            type: 'POST',
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Authorization": `Bearer ${drgc_params.accessToken}`
            },
            url: `${apiBaseUrl}/me?currency=${data.currency}&locale=${data.locale}`,
            success: (data, textStatus, xhr) => {
                if (xhr.status === 204) {
                    location.reload(true);
                }
            },
            error: (jqXHR) => {
                reject(jqXHR);
            }
        });
    });

    $('.promo-code-toggle').click(() => {
        $('.promo-code-wrapper').toggle();
    });

    $('#apply-promo-code-btn').click((e) => {
        const promoCode = $('#promo-code').val();

        if (!$.trim(promoCode)) {
          $('#dr-promo-code-err-field').text(drgc_params.translations.invalid_promo_code_msg).show();
          return;
        }

        $(e.target).addClass('sending').blur();
        DRCommerceApi.updateCart({ promoCode }).then(() => {
            $(e.target).removeClass('sending');
            $('#dr-promo-code-err-field').text('').hide();
            fetchFreshCart();
        }).catch((jqXHR) => {
            $(e.target).removeClass('sending');
            if (jqXHR.responseJSON.errors) {
                const errMsgs = jqXHR.responseJSON.errors.error.map((err) => {
                    return err.description;
                });
                $('#dr-promo-code-err-field').html(errMsgs.join('<br/>')).show();
            }
        });
    });

    $('#promo-code').keypress((e) => {
        if ( e.which == 13 ) {
            e.preventDefault();
            $('#apply-promo-code-btn').trigger('click');
        }
    });

    /*init cart via JS*/
    if($('#dr-cart-page-wrapper').length){
      fetchFreshCart();

      const digitalriverjs = new DigitalRiver(drgc_params.digitalRiverKey);
      CheckoutUtils.applyLegalLinks(digitalriverjs);

      if ($('#dr-autoRenewTermsContainer').length) {
        CartModule.initAutoRenewalTerms(digitalriverjs);
      }
    }
});

export default CartModule;
