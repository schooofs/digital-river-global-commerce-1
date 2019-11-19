const DRCommerceApi = (($, params) => {
  const apiBaseUrl = `https://${params.domain}/v1/shoppers`;

  const updateCart = (queryStrings = {}, cartRequest = {}) => {
    const queryStr = $.param(queryStrings);

    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.accessToken}`
        },
        url: `${apiBaseUrl}/me/carts/active?${queryStr}`,
        data: JSON.stringify({
          cart: cartRequest
        })
      })
      .done((data) => {
        resolve(data);
      })
      .fail((jqXHR) => {
        reject(jqXHR);
      });
    });
  };

  const applyShippingOption = (shippingOptionId) => {
    const queryStrings = {
      expand: 'all',
      shippingOptionId: shippingOptionId
    };

    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.accessToken}`
        },
        url: `${apiBaseUrl}/me/carts/active/apply-shipping-option?${$.param(queryStrings)}`
      })
      .done((data) => {
        resolve(data);
      })
      .fail((jqXHR) => {
        reject(jqXHR);
      });
    });
  };

  const submitCart = () => {
    $.ajax({
      type: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.accessToken}`
      },
      url: `${apiBaseUrl}/me/carts/active/submit-cart?expand=all`,
      success: (data) => {
        $('#checkout-confirmation-form input[name="order_id"]').val(data.submitCart.order.id);
        $('#checkout-confirmation-form').submit();
      },
      error: (jqXHR) => {
        $('form#checkout-confirmation-form').find('button[type="submit"]').removeClass('sending').blur();
        $('#dr-checkout-err-field').text(jqXHR.responseJSON.errors.error[0].description).show();
        $('body').css({'pointer-events': 'auto', 'opacity': 1});
      }
    });
  };

  const applyPaymentAndSubmitCart = (sourceId) => {
    if (!sourceId) return;

    const postData = {
      'paymentMethod': {
        'sourceId': sourceId
      }
    }

    $.ajax({
      type: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.accessToken}`
      },
      url: `${apiBaseUrl}/me/carts/active/apply-payment-method?expand=all`,
      data: JSON.stringify(postData),
      success: () => {
        submitCart();
      },
      error: (jqXHR) => {
        $('form#checkout-confirmation-form').find('button[type="submit"]').removeClass('sending').blur();
        $('#dr-checkout-err-field').text(jqXHR.responseJSON.errors.error[0].description).show();
        $('body').css({'pointer-events': 'auto', 'opacity': 1});
      }
    });
  };

  return {
    updateCart: updateCart,
    submitCart: submitCart,
    applyShippingOption: applyShippingOption,
    applyPaymentAndSubmitCart: applyPaymentAndSubmitCart
  };

})(jQuery, drgc_params);

export default DRCommerceApi;