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
