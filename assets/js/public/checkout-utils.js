const CheckoutUtils = (($, params) => {
  const createDisplayItems = (cartData) => {
    const displayItems = [{
      label: params.translations.subtotal_label,
      amount: cartData.pricing.subtotal.value
    }, {
      label: params.translations.tax_label,
      amount: cartData.pricing.tax.value
    }];

    if (cartData.shippingOptions.shippingOption) {
      displayItems.push({
        label: params.translations.shipping_and_handling_label,
        amount: cartData.pricing.shippingAndHandling.value
      });
    }

    if (cartData.pricing.discount) {
      if (parseFloat(cartData.pricing.discount.value) > 0) {
        displayItems.push({
          label: params.translations.discount_label,
          amount: cartData.pricing.discount.value
        });
      }
    }

    return displayItems;
  };

  const createShippingOptions = (cartData) => {
    const isFreeShipping = (cartData.pricing.shippingAndHandling.value === 0);
    let shippingOptions = [];

    cartData.shippingOptions.shippingOption.forEach((option) => {
      let shippingOption = {
        id: option.id.toString(),
        label: option.description,
        amount: isFreeShipping ? 0 : option.cost.value,
        detail: ''
      };

      shippingOptions.push(shippingOption);
    });

    return shippingOptions;
  };

  const updateShippingOptions = (shippingOptions, selectedId) => {
    shippingOptions.forEach((option, index) => {
      if (option.id === selectedId.toString()) {
        shippingOptions[index].selected = true;
      } else {
        if (shippingOptions[index].selected) {
          delete shippingOptions[index].selected;
        }
      }
    });
  };

  const getBaseRequestData = (cartData, requestShipping, buttonStyle) => {
    const displayItems = createDisplayItems(cartData);
    let shippingOptions = [];

    if (requestShipping) {
      shippingOptions = createShippingOptions(cartData);
      updateShippingOptions(shippingOptions, cartData.shippingMethod.code);
    }

    const requestData = {
      country: params.drLocale.split('_')[1],
      currency: cartData.pricing.orderTotal.currency,
      total: {
        label: params.translations.order_total_label,
        amount: cartData.pricing.orderTotal.value
      },
      displayItems: displayItems,
      shippingOptions: shippingOptions,
      requestShipping: requestShipping,
      style: buttonStyle,
      waitOnClick: false
    };

    return requestData;
  };

  const updateDeliverySection = (shippingOption) => {
    const $selectedOption = $('form#checkout-delivery-form').children().find('input:radio[data-id="' + shippingOption.id + '"]');
    const resultText = `${shippingOption.label} ${shippingOption.amount === 0 ? params.translations.free_label : $selectedOption.attr('data-cost')}`;

    $selectedOption.prop('checked', true);
    $('.dr-checkout__delivery').find('.dr-panel-result__text').text(resultText);
  };

  const updateAddressSection = (addressObj, $target) => {
    const addressArr = [
      `${addressObj.firstName} ${addressObj.lastName}`,
      addressObj.line1,
      addressObj.city,
      addressObj.country
    ];

    $target.text(addressArr.join(', '));
  };

  const updateSummaryPricing = (cart) => {
    const {formattedOrderTotal, formattedTax} = cart.pricing;

    if (Object.keys(cart.shippingMethod).length) {
      const formattedShippingAndHandling = (cart.pricing.shippingAndHandling.value === 0) ? params.translations.free_label : cart.pricing.formattedShippingAndHandling;

      $('div.dr-summary__shipping > .item-value').text(formattedShippingAndHandling);
    }

    $('div.dr-summary__tax > .item-value').text(formattedTax);
    $('div.dr-summary__total > .total-value').text(formattedOrderTotal);
  };

  const displayAlertMessage = (message) => {
    alert('ERROR! ' + message);
  }

  const resetBodyOpacity = () => {
    $('body').css({'pointer-events': 'auto', 'opacity': 1});
  };

  return {
    createDisplayItems: createDisplayItems,
    createShippingOptions: createShippingOptions,
    updateShippingOptions: updateShippingOptions,
    getBaseRequestData: getBaseRequestData,
    updateDeliverySection: updateDeliverySection,
    updateAddressSection: updateAddressSection,
    updateSummaryPricing: updateSummaryPricing,
    displayAlertMessage: displayAlertMessage,
    resetBodyOpacity: resetBodyOpacity
  };
})(jQuery, drgc_params);

export default CheckoutUtils;