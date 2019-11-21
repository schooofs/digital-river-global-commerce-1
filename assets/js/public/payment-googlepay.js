import CheckoutUtils from './checkout-utils';
import DRCommerceApi from './commerce-api';

const DRGooglePay = (($, translations) => {
  const initGooglePayEvents = (googlepay) => {
    googlepay.on('shippingaddresschange', (event) => {
      const shippingAddress = event.shippingAddress;

      if (shippingAddress.address.postalCode === '') {
        event.updateWith({
          status: 'failure',
          error: {
            fields: {
              postalCode: 'Your postal code is invalid.'
            }
          }
        });
      } else if (shippingAddress.address.city === '') {
        event.updateWith({
          status: 'failure',
          error: {
            fields: {
              city: 'Your city is invalid.'
            }
          }
        });
      } else if (shippingAddress.address.state === '') {
        event.updateWith({
          status: 'failure',
          error: {
            fields: {
              region: 'Your region value is invalid. Please supply a different one.'
            }
          }
        });
      } else if (shippingAddress.address.country !== 'US') {
        event.updateWith({
          status: 'failure',
          error: {
            message: 'We can only ship to the US.'
          }
        });
      } else {
        const shippingAddressObj = {
          id: 'shippingAddress',
          city: shippingAddress.address.city,
          countrySubdivision: shippingAddress.address.state,
          postalCode: shippingAddress.address.postalCode,
          country: shippingAddress.address.country
        };

        DRCommerceApi.updateCart({expand: 'all'}, {shippingAddress: shippingAddressObj}).then((data) => {
          const displayItems = CheckoutUtils.createDisplayItems(data.cart);
          const shippingOptions = CheckoutUtils.createShippingOptions(data.cart);
          const requestUpdateObject = {
            total: {
              label: translations.order_total_label,
              amount: data.cart.pricing.orderTotal.value
            },
            displayItems: displayItems,
            shippingOptions: shippingOptions
          };

          requestUpdateObject.status = 'success';
          event.updateWith(requestUpdateObject);
        });
      }
    });

    googlepay.on('shippingoptionchange', (event) => {
      const shippingOption = event.shippingOption;

      DRCommerceApi.applyShippingOption(shippingOption.id).then((data) => {
        const displayItems = CheckoutUtils.createDisplayItems(data.cart);
        const shippingOptions = CheckoutUtils.createShippingOptions(data.cart);

        CheckoutUtils.updateShippingOptions(shippingOptions, shippingOption.id);

        const requestUpdateObject = {
          status: 'success',
          total: {
            label: translations.order_total_label,
            amount: data.cart.pricing.orderTotal.value
          },
          displayItems: displayItems,
          shippingOptions: shippingOptions
        };

        event.updateWith(requestUpdateObject);
        CheckoutUtils.updateSummaryPricing(data.cart);
      });
    });

    googlepay.on('source', (event) => {
      const sourceId = event.source.id;      
      const shippingAddressObj = {
        id: 'shippingAddress',
        firstName: event.shippingAddress.firstName,
        lastName: event.shippingAddress.lastName,
        line1: event.shippingAddress.address.line1,
        line2: event.shippingAddress.address.line2,
        city: event.shippingAddress.address.city,
        countrySubdivision: event.shippingAddress.address.state,
        postalCode: event.shippingAddress.address.postalCode,
        country: event.shippingAddress.address.country,
        phoneNumber: event.shippingAddress.phone,
        emailAddress: event.shippingAddress.email
      };

      sessionStorage.setItem('paymentSourceId', sourceId);
      $('body').css({'pointer-events': 'none', 'opacity': 0.5});

      DRCommerceApi.updateCart({expand: 'all'}, {shippingAddress: shippingAddressObj}).then((data) => {
        DRCommerceApi.applyPaymentAndSubmitCart(sourceId);
      });

      event.complete('success');
    });
  };

  const init = (params) => {
    const {digitalriverJs, cartData = {}, requestShipping = false, buttonStyle = {}} = params || {};

    if (typeof digitalriverJs !== 'object') {
      throw new Error('Please pass an instance of the DigitalRiver object.');
    }

    if (Object.keys(cartData).length === 0) {
      throw new Error('Please pass the cart data object.');
    }

    const paymentRequestData = CheckoutUtils.getBaseRequestData(cartData, requestShipping, buttonStyle);
    const googlePayRequestData = digitalriverJs.paymentRequest(paymentRequestData);
    const googlepay = digitalriverJs.createElement('googlepay', googlePayRequestData);

    if (googlepay.canMakePayment()) {
      initGooglePayEvents(googlepay);
      googlepay.mount('dr-googlepay-button');
      document.getElementById('dr-googlepay-button').style.border = 'none';

      return googlepay;
    } else {
      return false;
    }
  };

  return {
    init: init
  };
})(jQuery, drgc_params.translations);

export default DRGooglePay;