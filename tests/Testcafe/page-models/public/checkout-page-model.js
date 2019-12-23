import { Selector, t } from 'testcafe';
import GeneralUtils from '../../utils/genericUtils';

export default class CheckoutPage {
  constructor() {
    this.utils = new GeneralUtils();
    this.primary = Selector('#primary');

    this.email = Selector('#checkout-email-form').find('input');
    this.emailTexts = Selector('#dr-panel-email-result');

    this.emailBtn = Selector('#checkout-email-form > button');
    this.shippingBtn = Selector('#checkout-shipping-form > button');
    this.billingInfoSubmitBtn = Selector('#checkout-billing-form > button');
    this.deliverByExpress = Selector('#shipping-option-8196700');
    this.deliverByStandard = Selector('#shipping-option-167400');
    this.deliveryOptionSubmitBtn = Selector('#checkout-delivery-form > button');
    this.useSameAddrCheckbox = Selector('#checkbox-billing');
    this.submitPaymentBtn = Selector('#dr-submit-payment');
    this.submitOrderBtn = Selector("#checkout-confirmation-form > button");

    this.shippingFirstName = Selector('#shipping-field-first-name');
    this.shippingLastName = Selector('#shipping-field-last-name');
    this.shippingAddress1 = Selector('#shipping-field-address1');
    this.shippingCity = Selector('#shipping-field-city');
    this.shippingState = Selector('#shipping-field-state');
    this.shippingPostalCode = Selector('#shipping-field-zip');
    this.shippingCountry = Selector('#shipping-field-country');
    this.shippingPhoneNumber = Selector('#shipping-field-phone');

    // Billing Address Info.
    this.billingFirstName = Selector('#billing-field-first-name');
    this.billingLastName = Selector('#billing-field-last-name');
    this.billingAddress1 = Selector('#billing-field-address1');
    this.billingCity = Selector('#billing-field-city');
    this.billingPostalCode = Selector('#billing-field-zip');
    this.billingState = Selector('#billing-field-state');
    this.billingCountry = Selector('#billing-field-country');
    this.billingPhoneNumber = Selector('#billing-field-phone');

    // Payment Info.
    this.creditCard = Selector('#radio-credit-card');
    this.cardNumberIframe = Selector('#card-number > iframe');
    this.ccNumber = Selector('#ccNumber');
    this.cardExpIframe = Selector('#card-expiration > iframe');
    this.ccExpiry = Selector('#ccExpiry');
    this.cardCVVIframe = Selector('#card-cvv > iframe');
    this.ccCVV = Selector('#ccCVV');

    // Shipping Summary
    this.shippingSummaryTitle = Selector('.dr-summary__shipping').find('p').nth(0);
    this.shippingSummaryValue = Selector('.dr-summary__shipping').find('p').nth(1);
  }

  async completeFormEmail(testEmail) {
    await t
      .typeText(this.email, testEmail)
      .click(this.emailBtn);
  }

  async completeFormShippingInfo() {
    const shippingInfo = this.utils.getShippingUserData();
    const shippingStateOption = this.shippingState.find('option');
    const shippingCountryOption = this.shippingCountry.find('option');

    await t
      .typeText(this.shippingFirstName, shippingInfo.firstName, { replace: true })
      .typeText(this.shippingLastName, shippingInfo.lastName, { replace: true })
      .typeText(this.shippingAddress1, shippingInfo.addrLine1)
      .typeText(this.shippingCity, shippingInfo.city)
      .click(this.shippingCountry)
      .click(shippingCountryOption.withText(shippingInfo.country))
      .expect(this.shippingCountry.value).eql(shippingInfo.countryValue)
      .click(this.shippingState)
      .click(shippingStateOption.withText(shippingInfo.state))
      .expect(this.shippingState.value).eql(shippingInfo.stateValue)
      .typeText(this.shippingPostalCode, shippingInfo.postCode)
      .typeText(this.shippingPhoneNumber, shippingInfo.phoneNo)
      .click(this.shippingBtn);
  }

  async completeFormBillingInfo() {
    const billingInfo = this.utils.getBillingUserData();
    const billingStateOption = this.billingState.find('option');
    const billingCountryOption = this.billingCountry.find('option');

    await t
      .typeText(this.billingFirstName, billingInfo.firstName, { replace: true })
      .typeText(this.billingLastName, billingInfo.lastName, { replace: true })
      .typeText(this.billingAddress1, billingInfo.addrLine1)
      .typeText(this.billingCity, billingInfo.city)
      .click(this.billingState)
      .click(billingStateOption.withText(billingInfo.state))
      .expect(this.billingState.value).eql(billingInfo.stateValue)
      .typeText(this.billingPostalCode, billingInfo.postCode)
      .click(this.billingCountry)
      .click(billingCountryOption.withText(billingInfo.country))
      .expect(this.billingCountry.value).eql(billingInfo.countryValue)
      .typeText(this.billingPhoneNumber, billingInfo.phoneNo)
      .click(this.billingInfoSubmitBtn);
  }

  async setDeliveryOption(deliveryOption) {
    if (deliveryOption === 'express') {
      await this.utils.clickItem(this.deliverByExpress);
    }
    else if (deliveryOption === 'standard') {
      await this.utils.clickItem(this.deliverByStandard);
    }

    await this.utils.clickItem(this.deliveryOptionSubmitBtn);
  }

  async completeFormCreditCardInfo() {
    const creditCardInfo = this.utils.getCreditCardInfo();

    await t
      .click(this.creditCard)
      .switchToIframe(this.cardNumberIframe)
      .typeText(this.ccNumber, creditCardInfo.cardNo)
      .switchToMainWindow()
      .switchToIframe(this.cardExpIframe)
      .typeText(this.ccExpiry, creditCardInfo.expiry)
      .switchToMainWindow()
      .switchToIframe(this.cardCVVIframe)
      .typeText(this.ccCVV, creditCardInfo.cvv)
      .switchToMainWindow()
      .click(this.submitPaymentBtn);
  }

  async checkLoginFormDisplayItems() {
	const drLoginForm = Selector('#dr_login_form');
	const loginTitle = Selector('.entry-title').innerText;
	const expectedLoginTitle = 'Login';
	const returningUserTitle = Selector('.dr-login-sections__section.section-returning').find('div').nth(0).find('h2').innerText;
	const expectedRturningUserTitle = 'RETURNING CUSTOMER';
    const formEmail = drLoginForm.find('[name="username"]');
    const formPassword = drLoginForm.find('[name="password"]');
    const loginSubmitBtn = Selector('#dr-auth-submit');

    await t
      .expect(drLoginForm.exists).ok()
      .expect(loginTitle).eql(expectedLoginTitle)
      .expect(returningUserTitle).eql(expectedRturningUserTitle)
      .expect(drLoginForm.exists).ok()
      .expect(formEmail.exists).ok()
      .expect(formPassword.exists).ok()
      .expect(loginSubmitBtn.exists).ok();
  }

  async checSingupFormDisplayItems() {
    const drSignupForm = Selector('#dr-signup-form');
    const signUpTitle = Selector('.dr-login-sections__section.section-new').find('div').nth(0).find('h2').innerText;
    const expectedSinUpTitle = 'NEW CUSTOMER';
    const formFirstName = drSignupForm.find('[name="first_name"]');
    const formLastName = drSignupForm.find('[name="last_name"]');
    const formEmail = drSignupForm.find('[name="uemail"]');
    const formPassword = drSignupForm.find('[name="upw"]');
    const formConfirmPassword = drSignupForm.find('[name="upw2"]');
    const singUpBtn = Selector('.dr-btn.dr-signup');
    const continueAsGuestBtn = Selector('#dr-auth-submit');

    await t
      .expect(drSignupForm.exists).ok()
      .expect(signUpTitle).eql(expectedSinUpTitle)
      .expect(formFirstName.exists).ok()
      .expect(formLastName.exists).ok()
      .expect(formEmail.exists).ok()
      .expect(formPassword.exists).ok()
      .expect(formConfirmPassword.exists).ok()
      .expect(singUpBtn.exists).ok()
      .expect(continueAsGuestBtn.exists).ok();
  }
}
