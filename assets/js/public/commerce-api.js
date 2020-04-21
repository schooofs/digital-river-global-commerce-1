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

  const updateCartShippingAddress = (queryStrings = {}, requestPayload = {}) => {
    const queryStr = $.param(queryStrings);

    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.accessToken}`
        },
        url: `${apiBaseUrl}/me/carts/active/shipping-address?${queryStr}`,
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

  const updateCartBillingAddress = (queryStrings = {}, requestPayload = {}) => {
    const queryStr = $.param(queryStrings);

    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.accessToken}`
        },
        url: `${apiBaseUrl}/me/carts/active/billing-address?${queryStr}`,
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

  const applyPaymentMethod = (sourceId) => {
    if (!sourceId) return;

    const postData = {
      'paymentMethod': {
        'sourceId': sourceId
      }
    };

    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.accessToken}`
        },
        url: `${apiBaseUrl}/me/carts/active/apply-payment-method?expand=all`,
        data: JSON.stringify(postData),
        success: (data) => {
          resolve(data);
        },
        error: (jqXHR) => {
          reject(jqXHR);
        }
      });
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

  const updateShopperAddress = (address) => {
    if (!address) return;

    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.accessToken}`
        },
        url: `${apiBaseUrl}/me/addresses`,
        data: JSON.stringify(address),
        success: () => {
          resolve();
        },
        error: (jqXHR) => {
          reject(jqXHR);
        }
      });
    });
  };

  const submitCart = () => {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.accessToken}`
        },
        url: `${apiBaseUrl}/me/carts/active/submit-cart?expand=all`,
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
    applyPaymentMethod,
    getProduct,
    getProductPricing,
    getProductInventoryStatus,
    updateCartShippingAddress,
    updateCartBillingAddress,
    updateShopperAddress,
    submitCart
  };

})(jQuery, drgc_params);

export default DRCommerceApi;
