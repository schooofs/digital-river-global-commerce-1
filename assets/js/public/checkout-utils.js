const CheckoutUtils = (($, params) => {
  const createDisplayItemsObj = (cartData) => {
    const displayItems = [{
      label: params.translations.subtotal_label,
      amount: cartData.pricing.subtotal.value
    }, {
      label: params.translations.tax_label,
      amount: cartData.pricing.tax.value
    }];

    if (cartData.pricing.shippingAndHandling.value) {
      displayItems.push({
        label: params.translations.shipping_and_handling_label,
        amount: cartData.pricing.shippingAndHandling.value
      });
    }

    if (cartData.pricing.discount.value) {
      displayItems.push({
        label: params.translations.discount_label,
        amount: cartData.pricing.discount.value
      });
    }

    return displayItems;
  };

  const createShippingOptionsObj = (cartData) => {
    let shippingOptions = [];

    cartData.shippingOptions.shippingOption.forEach((option) => {
      let shippingOption = {
        id: option.id.toString(),
        label: option.description,
        amount: option.cost.value,
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
    const displayItems = createDisplayItemsObj(cartData);
    let shippingOptions = [];

    if (requestShipping) {
      shippingOptions = createShippingOptionsObj(cartData);
    }

    updateShippingOptions(shippingOptions, cartData.shippingMethod.code);

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
  }

  return {
    createDisplayItemsObj: createDisplayItemsObj,
    createShippingOptionsObj: createShippingOptionsObj,
    updateShippingOptions: updateShippingOptions,
    getBaseRequestData: getBaseRequestData,
    updateDeliverySection: updateDeliverySection,
    updateAddressSection: updateAddressSection,
    updateSummaryPricing: updateSummaryPricing
  };
})(jQuery, drgc_params);