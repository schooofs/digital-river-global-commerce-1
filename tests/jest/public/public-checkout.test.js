import CheckoutModule from '../../../assets/js/public/public-checkout';

window.drgc_params = {
  translations: {
    tax_label: 'Tax',
    estimated_tax_label: 'Estimated Tax',
    shipping_label: 'Shipping',
    estimated_shipping_label: 'Estimated Shipping'
  }
};

describe('Public Checkout Module', () => {

  it('updateSummaryLabels', () => {
    document.body.innerHTML = `
      <div class="dr-checkout-wrapper__content">
        <div class="dr-checkout">
          <div class="dr-checkout__email"></div>
          <div class="dr-checkout__shipping"></div>
          <div class="dr-checkout__billing"></div>
          <div class="dr-checkout__delivery"></div>
          <div class="dr-checkout__payment"></div>
          <div class="dr-checkout__confirmation"></div>
        </div>
        <div class="dr-summary">
          <div class="dr-summary__tax">
            <p class="item-label">Estimated Tax</p>
            <p class="item-label">0.00USD</p>
          </div>
          <div class="dr-summary__shipping">
            <p class="item-label">Estimated Shipping</p>
            <p class="item-label">5.00USD</p>
          </div>
        </div>
      </div>`;

    const deliverySection = document.getElementsByClassName('dr-checkout__shipping')[0];
    const paymentSection = document.getElementsByClassName('dr-checkout__payment')[0];
    const taxLabel = document.querySelector('.dr-summary__tax .item-label');
    const shippingLabel = document.querySelector('.dr-summary__shipping .item-label');

    deliverySection.classList.add('active');
    CheckoutModule.updateSummaryLabels(jQuery);
    expect(taxLabel.innerHTML).toEqual('Estimated Tax');
    expect(shippingLabel.innerHTML).toEqual('Estimated Shipping');

    deliverySection.classList.remove('active');
    paymentSection.classList.add('active');
    CheckoutModule.updateSummaryLabels(jQuery);
    expect(taxLabel.innerHTML).toEqual('Tax');
    expect(shippingLabel.innerHTML).toEqual('Shipping');
  });

});
