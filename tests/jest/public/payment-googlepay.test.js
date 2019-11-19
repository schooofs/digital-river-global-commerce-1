import DRGooglePay from '../../../assets/js/public/payment-googlepay';
import DRCommerceApi from '../../../assets/js/public/commerce-api';

const setupDocumentBody = () => {
  document.body.innerHTML =
    '<div id="dr-googlepay-button"></div>' +
    '<div class="dr-checkout__delivery>' +
    ' <form id="checkout-delivery-form" class="dr-panel-edit dr-panel-edit--delivery">' +
    '   <div class="dr-panel-edit__el">' +
    '     <div class="field-radio">' +
    '       <input type="radio" name="selector" id="shipping-option-12345" data-cost="999USD" data-id="12345" data-desc="shipping option #1" />' +
    '       <label for="shipping-option-12345">' +
    '         <span>shipping option #1</span>' +
    '         <span class="black">999USD</span>' +
    '       </label>' +
    '     </div>' +
    '     <div class="field-radio">' +
    '       <input type="radio" name="selector" id="shipping-option-67890" data-cost="1000USD" data-id="67890" data-desc="shipping option #2" />' +
    '       <label for="shipping-option-67890">' +
    '         <span>shipping option #2</span>' +
    '         <span class="black">1000USD</span>' +
    '       </label>' +
    '     </div>' +
    '     <div class="field-radio">' +
    '       <input type="radio" name="selector" id="shipping-option-13579" data-cost="2000USD" data-id="13579" data-desc="shipping option #3" />' +
    '       <label for="shipping-option-12345">' +
    '         <span>shipping option #3</span>' +
    '         <span class="black">2000USD</span>' +
    '       </label>' +
    '     </div>' +
    '   </div>' + 
    ' </form>' +
    ' <div class="dr-panel-result">' +
    '   <p class="dr-panel-result__text">Standard $0.00</p>' +
    ' </div>' +
    '</div>' +
    '<div class="dr-summary__shipping">' +
    ' <p class="item-label">Shipping</p>' +
    ' <p class="item-value">7.49USD</p>' +
    '</div>' +
    '<div class="dr-summary__tax">' +
    ' <p class="item-label">Estimated Tax</p>' +
    ' <p class="item-value">0.00USD</p>' +
    '</div>' +
    '<div class="dr-summary__total">' +
    ' <p class="total-label">Total</p>' +
    ' <p class="total-value">104.98USD</p>' +
    '</div>';
};

const cartData = {
  pricing: {
    orderTotal: {
      currency: 'USD',
      value: '21.98'
    },
    subtotal: {
      currency: 'USD',
      value: '19.99'
    },
    tax: {
      currency: 'USD',
      value: '1.99'
    },
    shippingAndHandling: {
      currency: 'USD',
      value: '3.99'
    },
    formattedTax: '$1.99',
    formattedOrderTotal: '$21.98'
  },
  shippingOptions: {
    shippingOption: [{
      id: 12345,
      description: 'shipping option #1',
      cost: {
        value: 999
      }
    }]
  },
  shippingAddress: {
    firstName: 'abc',
    lastName: 'xyz',
    line1: '10380 Bren Rd W',
    city: 'Minnetonka',
    country: 'US'
  },
  shippingMethod: {
    code: 'SHIPPING_CODE'
  }
};

const DigitalRiver = {};

Object.defineProperty(DigitalRiver, 'paymentRequest', {
  value: jest.fn(() => {
    return {};
  })
});

Object.defineProperty(DigitalRiver, 'createElement', {
  value: jest.fn((type, object) => {
    return {
      id: `${type}-12345`,
      type: type,
      mount: mount,
      canMakePayment: canMakePayment,
      on: on,
      options: object
    };
  })
});

const mount = jest.fn();
const canMakePayment = jest.fn();
const on = jest.fn();
const updateWith = jest.fn();
const complete = jest.fn();

describe('Google Pay tests', () => {
  test('init error', () => {
    // Missing the params
    expect(() => {
      DRGooglePay.init();
    }).toThrow();

    // Missing the DigitalRiver JS object
    expect(() => {
      DRGooglePay.init({});
    }).toThrow();

    // Missing the cart data object
    expect(() => {
      DRGooglePay.init({digitalriverJs: DigitalRiver});
    }).toThrow();
  });

  test('canMakePayment returns false', () => {
    canMakePayment.mockReturnValueOnce(false);

    const googlepay = DRGooglePay.init({
      digitalriverJs: DigitalRiver,
      cartData: cartData
    });

    expect(googlepay).toBe(false);
  });

  test('init successfully', () => {
    const event = {
      shippingAddress: {
        firstName: 'abc',
        address: {
          country: 'US'
        }
      },
      shippingOption: {
        id: 'SHIPPING_OPTION_ID'
      },
      source: {
        id: 'SOURCE_ID'
      },
      updateWith: updateWith,
      complete: complete
    };

    setupDocumentBody();
    canMakePayment.mockReturnValueOnce(true);
    on.mockImplementation((action, cb) => cb(event));
    
    DRCommerceApi.updateCart = jest.fn(() =>
      Promise.resolve({
        cart: cartData
    }));

    DRCommerceApi.applyShippingOption = jest.fn(() =>
      Promise.resolve({
        cart: cartData
    }));

    const googlepay = DRGooglePay.init({
      digitalriverJs: DigitalRiver,
      cartData: cartData,
      requestShipping: false,
      buttonStyle: {
        buttonType: 'long',
        buttonColor: 'dark',
        buttonLanguage: 'US'
      }
    });

    expect(typeof googlepay).toBe('object');
    expect(googlepay.type).toBe('googlepay');
    expect(typeof googlepay.canMakePayment).toBe('function');
    expect(typeof googlepay.mount).toBe('function');
    expect(typeof googlepay.on).toBe('function');
  });
});