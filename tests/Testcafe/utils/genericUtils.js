import { Selector, t } from 'testcafe';
import HomePage from '../page-models/public/home-page-model';

export default class GenericUtils {
  constructor() {
    this.homePage = new HomePage();
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

  async loginGCSystest() {
    const username = Selector("#j_username");
    const password = Selector("#j_password");
    const loginBtn = Selector('.ra_Button__primary');
    const user = {
      id: "stuller",
      pw: "orange,1"
    };

    await t
      .typeText(username, user.id, { replace: true })
      .typeText(password, user.pw, { replace: true })
      .click(loginBtn)
      .switchToMainWindow();
  }

  async inputCreditInfo(cardInfo) {
    const creditNo = Selector('#dr_ccNumEntry').find('[name="cardNumber"]');
    const creditExpMonth = Selector('#expirationDateMonth');
    const creditExpMonthOption = creditExpMonth.find('option');
    const creditExpYear = Selector('#expirationDateYear');
    const creditExpYearOption = creditExpYear.find('option');
    const creditCCV = Selector('#dr_ccSecurityCodeEntry').find('[name="cardSecurityCode"]');

    await t
      .typeText(creditNo, cardInfo.cardNumber, { replace: true })
      .click(creditExpMonth)
      .click(creditExpMonthOption.withText(cardInfo.cardMonth))
      .click(creditExpYear)
      .click(creditExpYearOption.withText(cardInfo.cardYear))
      .typeText(creditCCV, cardInfo.cardCcv, { replace: true });
  }

  async inputBillingInfo(billInfo) {
    const firstName = Selector('#dr_AddressEntryFields').find('[name="name1"]');
    const lastName = Selector('#dr_AddressEntryFields').find('[name="name2"]');
    const street = Selector('#dr_AddressEntryFields').find('[name="line1"]');
    const zipCode = Selector('#dr_AddressEntryFields').find('[name="postalCode"]');
    const city = Selector('#dr_AddressEntryFields').find('[name="city"]');

    const countryOption = Selector('#country').find('option');
    const country = Selector('#dr_AddressEntryFields').find('[name="country"]');
    const phoneNo = Selector('#dr_AddressEntryFields').find('[name="phoneNumber"]');
    const email = Selector('#dr_AddressEntryFields').find('[name="EMAILemail"]');
    const password = Selector('#dr_AddressEntryFields').find('[name="PASSWORDpassword"]');
    const confirmPassword = Selector('#dr_AddressEntryFields').find('[name="PASSWORDconfirmPassword"]');

    await t
      .typeText(firstName, billInfo.firstName, { replace: true })
      .typeText(lastName, billInfo.lastName, { replace: true })
      .typeText(street, billInfo.addrLine1)
      .typeText(zipCode, billInfo.zipCode)
      .typeText(city, billInfo.city)
      .click(country)
      .click(countryOption.withText(billInfo.country))
      .typeText(phoneNo, billInfo.phoneNo)
      .typeText(email, billInfo.email)
      .typeText(password, billInfo.password)
      .typeText(confirmPassword, billInfo.password);
  }

  async addProductsIntoCart(pID){
    const product = Selector('.dr-buy-btn[data-product-id="' + pID + '"]');

    await this.clickItem(this.homePage.productsMenu);
    await this.clickItem(product);
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
