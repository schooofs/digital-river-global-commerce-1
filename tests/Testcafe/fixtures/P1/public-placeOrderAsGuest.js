import { Selector, ClientFunction } from 'testcafe';
import Config from '../../config';
import HomePage from '../../page-models/public/home-page-model';
import MinicartPage from '../../page-models/public/minicart-page-model';
import CartPage from '../../page-models/public/cart-page-model';
import CheckoutPage from '../../page-models/public/checkout-page-model';
import TYPage from '../../page-models/public/ty-page-model';

const env = Config.env;
const baseURL = Config.baseUrl[env];
const testEmail = Config.testEmail;
const homePage = new HomePage();
const minicartPage = new MinicartPage();
const cartPage = new CartPage();
const checkoutPage = new CheckoutPage();
const tyPage = new TYPage();

fixture `===== DRGC P1 Automation Test - Place Order As Guest =====`
  .httpAuth({
    username: 'gcwpdemo',
    password: '33a5b9f5',
  })
  .beforeEach(async t => {
    console.log('Before Each: Click Menu -> Product to Enter Product Page');
    await t
      .navigateTo(baseURL)
      .maximizeWindow()
      .click(homePage.productsMenu)
      .expect(Selector('body').hasClass('hfeed')).ok()
});

test('Place order with physical product', async t => {
  console.log('Test Case: Place Order with Physical Product');

  // Add a physical product into cart
  console.log('>> Add physical product into cart');
  await t
    .click(homePage.addPhyProduct)
    .takeScreenshot('BWC/minicart.jpg');

  // Click View Cart btn in miniCart to go to Cart page
  console.log('>> Direct to cart page');
  await minicartPage.clickViewCartBtn();

  // Click Proceed to Checkout in View Cart page to proceed checkout
  console.log('>> Direct to checkout page');
  await t
    .takeScreenshot('BWC/cart.jpg')
    .click(cartPage.proceedToCheckoutBtn)
    .expect(checkoutPage.primary.exists).ok();

  // Enter Email and continue
  console.log('>> Checkout page - Entering email');
  await checkoutPage.completeFormEmail(testEmail);

  // Enter shipping info
  console.log('>> Checkout page - Entering shipping info.');
  await t.expect(checkoutPage.shippingBtn.exists).ok();
  await checkoutPage.completeFormShippingInfo();

  // Set billing info as diff from shipping info
  console.log('>> Checkout page - Set billing info to diff from shipping info.');
  await t
	.expect(checkoutPage.billingDiffCheckbox.exists).ok()
	.hover(checkoutPage.billingDiffCheckbox)
	.click(checkoutPage.billingDiffCheckbox);

  // Enter Billing Info
  console.log('>> Checkout page - Entering billing info.');
  await t.expect(checkoutPage.billingInfoSubmitBtn.exists).ok();
  await checkoutPage.completeFormBillingInfo();

  // Set delivery option
  console.log('>> Checkout page - Set delivery options as express');
  await t.expect(checkoutPage.deliveryOptionSubmitBtn.exists).ok();
  await checkoutPage.setDeliveryOption('express');

  // Enter Payment Info
  console.log('>> Checkout page - Entering payment info.');
  await t.expect(checkoutPage.submitPaymentBtn.exists).ok();
  await checkoutPage.completeFormCreditCardInfo();

  // Submit Order
  console.log('>> Checkout page - Place order');
  await t
    .takeScreenshot('BWC/payment.jpg')
    .click(checkoutPage.submitOrderBtn)
    .expect(tyPage.tyMsg.innerText).eql('Your order was completed successfully.')
    .takeScreenshot('BWC/TY.jpg');
  console.log('>> Direct to the TY page');
  const orderNum = await tyPage.orderNumber.textContent;
  console.log(orderNum.trim());
});

test('Place order with digital product', async t => {
  console.log('Test Case: Place Order with Digital Product');

  // Add a Digital product into cart
  console.log('>> Add digital product into cart');
  await t
    .setTestSpeed(0.7)
    .click(homePage.addDigiProduct)
    .takeScreenshot('BWC/minicart_d.jpg');

  // Click View Cart btn in miniCart to go to Cart page
  console.log('>> Direct to cart page');
  await minicartPage.clickViewCartBtn();

  // Click Proceed to Checkout in View Cart page to proceed checkout
  console.log('>> Direct to checkout page');
  await t
    .takeScreenshot('BWC/cart_d.jpg')
    .click(cartPage.proceedToCheckoutBtn)
    .expect(checkoutPage.primary.exists).ok();

  // Enter Email and continue
  console.log('>> Checkout page - Entering email');
  await checkoutPage.completeFormEmail(testEmail);

  // Enter Billing Info
  console.log('>> Checkout page - Entering billing info.');
  await t.expect(checkoutPage.billingInfoSubmitBtn.exists).ok();
  await checkoutPage.completeFormBillingInfo();

  // Enter Payment Info
  console.log('>> Checkout page - Entering payment info.');
  await t.expect(checkoutPage.submitPaymentBtn.exists).ok();
  await checkoutPage.completeFormCreditCardInfo();

  // Submit Order
  console.log('>> Checkout page - Place order');
  await t
    .takeScreenshot('BWC/payment_d.jpg')
    .click(checkoutPage.submitOrderBtn)
    .expect(tyPage.tyMsg.innerText).eql('Your order was completed successfully.')
    .takeScreenshot('BWC/TY_d.jpg');

  console.log('>> Directs to the TY page');
  const orderNum = await tyPage.orderNumber.textContent;
  console.log(orderNum.trim());
});
