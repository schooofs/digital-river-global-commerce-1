import { Selector, t } from 'testcafe';
import HomePage from '../page-models/public/home-page-model';
import CartPage from '../page-models/public/cart-page-model';
import CheckoutPage from '../page-models/public/checkout-page-model';

export default class GenericUtils {
  constructor() {
    this.homePage = new HomePage();
    this.cartPage = new CartPage();
  }

  async checkEstShippingInfo(title, value) {
    await t
      .expect(this.cartPage.estimatedShippingTitle.innerText).eql(title)
      .expect(this.cartPage.estimatedShippingValue.innerText).eql(value);
  }

  async checkShippingSummaryInfo(title, value) {
    await t
      .expect(new CheckoutPage().shippingSummaryTitle.innerText).eql(title)
      .expect(new CheckoutPage().shippingSummaryValue.innerText).eql(value);
  }

  async clickItem(target) {
    await t
      .expect(target.exists).ok()
      .hover(target)
      .click(target);
  }

  async checkCheckBox(checkbox) {
    let ischecked = await checkbox.checked;
    while(!ischecked) {
      await t
        .hover(checkbox)
        .click(checkbox);
      ischecked = await checkbox.checked;
    }
  }

  async addProductsIntoCart(pID){
    const product = Selector('.dr-buy-btn[data-product-id="' + pID + '"]');

    await this.clickItem(this.homePage.productsMenu);
    await this.clickItem(product);
  }


  async testShippingFee(estShippingFee, shippingMethod, finalShippingFee) {
    const checkoutPage = new CheckoutPage();
    const estimatedShipping = 'Estimated Shipping';
    const testEmail = "qa@test.com";
    const fixedShipping = 'Shipping';
    // Click Proceed to Checkout in View Cart page to proceed checkout
    console.log('>> Direct to checkout page, still show Estimated Shipping');
    await this.clickItem(this.cartPage.proceedToCheckoutBtn);
    await this.checkShippingSummaryInfo(estimatedShipping, estShippingFee);

    // Enter Email and continue
    console.log('>> Checkout page - Entering email, still show Estimated Shipping');
    await checkoutPage.completeFormEmail(testEmail);
    await this.checkShippingSummaryInfo(estimatedShipping, estShippingFee);

    // Enter shipping info
    console.log('>> Checkout page - Entering shipping info, still show Estimated Shipping');
    await t.expect(checkoutPage.shippingBtn.exists).ok();
    await checkoutPage.completeFormShippingInfo();
    await this.checkShippingSummaryInfo(estimatedShipping, estShippingFee);

    // Skip Billing info
    console.log('>> Checkout page - Skip Billing info and continue, still show Estimated Shippinge');
    await this.clickItem(checkoutPage.billingInfoSubmitBtn);
    await this.checkShippingSummaryInfo(estimatedShipping, estShippingFee);

    // Set delivery option
    console.log('>> Checkout page - Set delivery, Estimated Shipping label changes to Shipping');
    await t.expect(checkoutPage.deliveryOptionSubmitBtn.exists).ok();
    await checkoutPage.setDeliveryOption(shippingMethod);
    await this.checkShippingSummaryInfo(fixedShipping, finalShippingFee);
}

  getNewUser() {
    const timestamp = Date.now();
    const newEmail = 'qa' + timestamp + '@dr.com';
    const firstName = 'JOHN';
    const lastName = 'DON';
    const password = 'DigitalRiverTest_2019!';
    const email = newEmail;

    const user = {
      firstName: firstName,
      lastName: lastName,
      password: password,
      email: email
    };

    return user;
  }

  getShippingUserData() {
    const shipInfo = {
      firstName: 'Helen',
      lastName: 'Mcclinton',
      addrLine1: '10451 Gunpowder Falls St',
      city: 'Las Vegas',
      country: 'United States of America',
      countryValue: 'US',
      state: 'Nevada',
      stateValue: 'NV',
      postCode: '89123',
      phoneNo: '7028962624'
    };

    return shipInfo;
  }

  getBillingUserData() {
    const shipInfo = {
      firstName: 'John',
      lastName: 'Doe',
      addrLine1: '10380 Bren Rd W',
      city: 'Minnetonka',
      country: 'United States of America',
      countryValue: 'US',
      state: 'Minnesota',
      stateValue: 'MN',
      postCode: '55343',
      phoneNo: '9522531234'
    };

    return shipInfo;
  }

  getCreditCardInfo() {
    const currentTime = new Date();
    const year = (currentTime.getFullYear() + 3).toString();
    const expiryData = '01'+ year.slice(-2);
    const cardInfo = {
      cardNo: '4444222233331111',
      expiry: expiryData,
      cvv: '123'
    };

    return cardInfo;
  }
}
