import { Selector, t } from 'testcafe';
import Config from '../../config';
import HomePage from '../../page-models/public/home-page-model';
import MinicartPage from '../../page-models/public/minicart-page-model';
import CartPage from '../../page-models/public/cart-page-model';
import CheckoutPage from '../../page-models/public/checkout-page-model';
import GeneralUtils from '../../utils/genericUtils';

const env = Config.env;
const baseURL = Config.baseUrl[env];
const testEmail = Config.testEmail;
const homePage = new HomePage();
const minicartPage = new MinicartPage();
const cartPage = new CartPage();
const checkoutPage = new CheckoutPage();
const utils = new GeneralUtils();

fixture `===== DRGC P1 Automation Test - Physical Product Shipping =====`
  .httpAuth({
    username: Config.websiteAuth['username'],
    password: Config.websiteAuth['password'],
  })
  .beforeEach(async t => {
    console.log('Before Each: Click Menu -> Product to Enter Product Page');
    await t
      .navigateTo(baseURL)
      .maximizeWindow()
      .click(homePage.productsMenu)
      .expect(Selector('body').hasClass('hfeed')).ok()
});

test('Estimated Shipping Fee - Standard free Shipping', async t => {
  console.log('Test Case: Check the standard shipping fee for physical products');

  await testShippingFee('standard');
});

test('Estimated Shipping Fee - Express free Shipping', async t => {
  console.log('Test Case: Check the express shipping fee for physical products');

  await testShippingFee('express');
});

async function testShippingFee(shippingMethod) {
  // Add a physical product into cart
  console.log('>> Add physical product into cart');
  const standardFee = '5.00USD';
  const expressFee = '7.49USD';
  const estimatedShipping = 'Estimated Shipping';
  const fixedShipping = 'Shipping';
  await t
    .setTestSpeed(0.9)
    .click(homePage.addPhyProduct)
    .takeScreenshot('BWC/minicart.jpg');

  // Click View Cart btn in miniCart to go to Cart page
  console.log('>> Direct to cart page');
  await minicartPage.clickViewCartBtn();

  console.log('>> Default standard shipping fee 5.00USD');
  await checkEstShippingInfo(estimatedShipping, standardFee);

  // Click Proceed to Checkout in View Cart page to proceed checkout
  console.log('>> Direct to checkout page, still show Estimated Shipping');
  await utils.clickItem(cartPage.proceedToCheckoutBtn);
  await checkShippingSummaryInfo(estimatedShipping, standardFee);

  // Enter Email and continue
  console.log('>> Checkout page - Entering email, still show Estimated Shipping');
  await checkoutPage.completeFormEmail(testEmail);
  await checkShippingSummaryInfo(estimatedShipping, standardFee);

  // Enter shipping info
  console.log('>> Checkout page - Entering shipping info, still show Estimated Shipping');
  await t.expect(checkoutPage.shippingBtn.exists).ok();
  await checkoutPage.completeFormShippingInfo();
  await checkShippingSummaryInfo(estimatedShipping, standardFee);

  // Skip Billing info
  console.log('>> Checkout page - Skip Billing info and continue, still show Estimated Shippinge');
  await utils.clickItem(checkoutPage.billingInfoSubmitBtn);
  await checkShippingSummaryInfo(estimatedShipping, standardFee);

  // Set delivery option
  console.log('>> Checkout page - Set delivery options, Estimated Shipping label changes to Shipping');
  await t.expect(checkoutPage.deliveryOptionSubmitBtn.exists).ok();
  await checkoutPage.setDeliveryOption(shippingMethod);
  if (shippingMethod == 'standard') {
	console.log('    -> Set shipping methond as standard, shipping fee = 5.00USD');
  	await checkShippingSummaryInfo(fixedShipping, standardFee);
  } else {
	console.log('    -> Set shipping methond as express, shipping fee = 7.49USD');
  	await checkShippingSummaryInfo(fixedShipping, expressFee);
  }
}

async function checkEstShippingInfo(title, value) {
  await t.expect(cartPage.estimatedShippingTitle.innerText).eql(title);
  await t.expect(cartPage.estimatedShippingValue.innerText).eql(value);
}

async function checkShippingSummaryInfo(title, value) {
  await t.expect(checkoutPage.shippingSummaryTitle.innerText).eql(title);
  await t.expect(checkoutPage.shippingSummaryValue.innerText).eql(value);
}