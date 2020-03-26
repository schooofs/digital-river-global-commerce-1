const DRCommerceApi = (($, params) => {
  const apiBaseUrl = `https://${params.domain}/v1/shoppers`;

  const getCart = (queryStrings = {}) => {
    const queryStr = $.param(queryStrings);

    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.accessToken}`
        },
        url: `${apiBaseUrl}/me/carts/active?${queryStr}`,
        success: (data) => {
          resolve(data);
        },
        error: (jqXHR) => {
          reject(jqXHR);
        }
      });
    });
  };

  const updateCart = (queryStrings = {}, requestPayload = {}) => {
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
        data: !$.isEmptyObject(requestPayload) ? JSON.stringify(requestPayload) : null,
        success: (data) => {
          resolve(data);
        },
        error: (jqXHR) => {
          reject(jqXHR);
        }
      });
    });
  };

  const removeLineItem = (lineItemID) => {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.accessToken}`
        },
        url: `${apiBaseUrl}/me/carts/active/line-items/${lineItemID}`,
        success: () => {
          resolve();
        },
        error: (jqXHR) => {
          reject(jqXHR);
        }
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
        url: `${apiBaseUrl}/me/carts/active/apply-shipping-option?${$.param(queryStrings)}`,
        success: (data) => {
          resolve(data);
        },
        error: (jqXHR) => {
          reject(jqXHR);
        }
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

  const getProduct = (productID, queryObj = {}) => {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.accessToken}`
        },
        url: `${apiBaseUrl}/me/products/${productID}?${$.param(queryObj)}`,
        success: (data) => {
          resolve(data);
        },
        error: (jqXHR) => {
          reject(jqXHR);
        }
      });
    });
  };

  const getProductPricing = (productID) => {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.accessToken}`
        },
        url: `${apiBaseUrl}/me/products/${productID}/pricing`,
        success: (data) => {
          resolve(data);
        },
        error: (jqXHR) => {
          reject(jqXHR);
        }
      });
    });
  };

  const getProductInventoryStatus = (productID) => {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.accessToken}`
        },
        url: `${apiBaseUrl}/me/products/${productID}/inventory-status`,
        success: (data) => {
          resolve(data);
        },
        error: (jqXHR) => {
          reject(jqXHR);
        }
      });
    });
  };

  return {
    apiBaseUrl,
    getCart,
    updateCart,
    submitCart,
    removeLineItem,
    applyShippingOption,
    applyPaymentAndSubmitCart,
    getProduct,
    getProductPricing,
    getProductInventoryStatus
  };

})(jQuery, drgc_params);

export default DRCommerceApi;
