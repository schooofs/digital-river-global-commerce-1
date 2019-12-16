import Config from '../../config';
import HomePage from '../../page-models/public/home-page-model';
import MinicartPage from '../../page-models/public/minicart-page-model';
import CartPage from '../../page-models/public/cart-page-model';
import CheckoutPage from '../../page-models/public/checkout-page-model';
import TYPage from '../../page-models/public/ty-page-model';
import GenericUtils from '../../utils/genericUtils';

fixture `===== DRGC P1 Automation Test - Place Order Sign In =====`
  .httpAuth({
    username: Config.websiteAuth['username'],
    password: Config.websiteAuth['password'],
  });

const env = Config.env;
const baseURL = Config.baseUrl[env];
const homePage = new HomePage();
const minicartPage = new MinicartPage();
const cartPage = new CartPage();
const checkoutPage = new CheckoutPage();
const tyPage = new TYPage();
const newUser = new GenericUtils().getNewUser();

test('Place order as a new customer', async t => {
  console.log('Test Case: Place Order as a New Customer');

  // Pre-set: Navigate to Target Testing Website
  await t
    .setTestSpeed(0.9)
    .navigateTo(baseURL)
    .maximizeWindow();

  // Go to login page to create a new user
  console.log('>> Create a New User');
  await homePage.createNewCustomer(newUser);

  // Add a physical product into cart
  console.log('>> Add Physical Product into Cart');
  await t
    .click(homePage.productsMenu)
    .click(homePage.addPhyProduct)
    .expect(minicartPage.viewCartBtn.exists).ok();

  // Login with the account we just created before
  console.log('>> Login with Existing User Account');
  await homePage.userSignIn(newUser);
  await t
    .expect(homePage.cartBtn.exists).ok()
    .expect(homePage.checkoutBtn.exists).ok();

  // Go to Cart page from Logged in Page
  console.log('>> Go to Cart Page from Logged in Page');
  await t
    .click(homePage.cartBtn)
    .expect(cartPage.proceedToCheckoutBtn.exists).ok()
    .takeScreenshot('BWC/cart_s.jpg');

  // Go to Checkout page from Logged in Page, the logged in user's info should be displayed
  console.log('>> Go to Checkout Page from Logged in Page');
  await t
    .navigateTo(baseURL + "/login/")
    .click(homePage.checkoutBtn)
    .expect(checkoutPage.emailTexts.textContent).eql(newUser.email)
    .expect(checkoutPage.shippingFirstName.value).eql(newUser.firstName)
    .expect(checkoutPage.shippingLastName.value).eql(newUser.lastName)
    .takeScreenshot('BWC/shipping_s.jpg');

  // Enter shipping info
  console.log('>> Checkout page - Entering Shipping Info.');
  await checkoutPage.completeFormShippingInfo();
  await t.expect(checkoutPage.useSameAddrCheckbox.exists).ok();

  // Set billing info as diff from shipping info
  // If checkbox is checked, the billing info will be set to same as shipping info
  let ischecked = await checkoutPage.useSameAddrCheckbox.checked;
  while(ischecked) {
    console.log('>> Checkout page - Set Billing Info to Diff from Shipping Info.');
    await t
      .expect(checkoutPage.useSameAddrCheckbox.exists).ok()
      .hover(checkoutPage.useSameAddrCheckbox)
      .click(checkoutPage.useSameAddrCheckbox);
    ischecked = await checkoutPage.useSameAddrCheckbox.checked;
  }

  // Enter Billing Info
  console.log('>> Checkout page - Entering Billing Info.');
  await checkoutPage.completeFormBillingInfo();
  await t.expect(checkoutPage.deliveryOptionSubmitBtn.exists).ok();

  // Set delivery option
  console.log('>> Checkout page - Set Delivery Options as Standard');
  await checkoutPage.setDeliveryOption('standard');
  await t.expect(checkoutPage.submitPaymentBtn.exists).ok();

  // Enter Payment Info
  console.log('>> Checkout page - Entering Payment Info.');
  await checkoutPage.completeFormCreditCardInfo();

  // Submit Order
  console.log('>> Checkout page - Place order');
  await t
    .takeScreenshot('BWC/payment_s.jpg')
    .click(checkoutPage.submitOrderBtn)
    .expect(tyPage.tyMsg.innerText).eql('Your order was completed successfully.')
    .takeScreenshot('BWC/TY_s.jpg');

  console.log('>> Directs to the TY page');
  const orderNum = await tyPage.orderNumber.textContent;
  console.log(orderNum.trim());
});
