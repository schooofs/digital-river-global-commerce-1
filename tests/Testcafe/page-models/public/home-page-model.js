import { Selector, t } from 'testcafe';
import Config from '../../config';
import ProductUtils from '../../utils/productUtils';

const env = Config.env;
const baseURL = Config.baseUrl[env];
const dataUtils = new ProductUtils();
const physicalProdID = dataUtils.getTestingPhysicalProduct().productID;
const digitalProdID = dataUtils.getTestingDigitalProduct().productID;
const onSaleProdID = dataUtils.getOnSaleProduct().productID;

export default class HomePage {
  constructor() {
    // the 2nd menu of the main-menu, if the menu is rearranged, need to change this index.
    this.productsMenu = Selector('#main-menu').find('li').nth(1);
    this.addPhyProduct = Selector('.dr-buy-btn[data-product-id="' + physicalProdID + '"]');
    this.addDigiProduct = Selector('.dr-buy-btn[data-product-id="' + digitalProdID + '"]');
    this.firstName = Selector('#dr-signup-form').find('[name="first_name"]');
    this.lastName = Selector('#dr-signup-form').find('[name="last_name"]');
    this.ueMail = Selector('#dr-signup-form').find('[name="uemail"]');
    this.uPW = Selector('#dr-signup-form').find('[name="upw"]');
    this.uPW2 = Selector('#dr-signup-form').find('[name="upw2"]');
    this.signUpBtn = Selector('#dr-signup-form').find('.dr-signup');
    this.logOutBtn = Selector('.dr-logout');
    this.userName = Selector('[name="username"]');
    this.userPW = Selector('[name="password"]');
    this.logInBtn = Selector('#dr-auth-submit');

    this.onSaleBuyButton = Selector('button[data-product-id="' + onSaleProdID + '"]');
    this.categoryRegularPrice = this.onSaleBuyButton.parent('div').find('.new-price');
    this.categorySalePrice = this.onSaleBuyButton.parent('div').find('.new-price');
    this.minicartItem = Selector('li.dr-minicart-item > div[data-product-id="' + onSaleProdID + '"]');
    this.minicartRegularPrice = this.minicartItem.find('p.dr-minicart-item-price > .dr-strike-price');
    this.minicartSalePrice = this.minicartItem.find('p.dr-minicart-item-price > .dr-sale-price');

    this.paginationPrevBtn = Selector('.prev.page-link');
    this.paginationNextBtn = Selector('.next.page-link');
    this.cartBtn = Selector('.dr-btn').withText('CART');
    this.checkoutBtn = Selector('.dr-btn').withText('CHECKOUT');

  }

  async createNewCustomer(newUser) {
    console.log('  -> Click Login Button and Direct to Login Page');
    await t.navigateTo(baseURL + "/login/");

    console.log('  -> Entering New User Info and SignUp');
    await t
      .expect(this.signUpBtn.exists).ok()
      .typeText(this.firstName, newUser.firstName, { replace: true })
      .typeText(this.lastName, newUser.lastName, { replace: true })
      .typeText(this.ueMail, newUser.email, { replace: true })
      .typeText(this.uPW, newUser.password, { replace: true })
      .typeText(this.uPW2, newUser.password, { replace: true })
      .takeScreenshot('BWC/signup.jpg')
      .click(this.signUpBtn)
      .expect(this.logOutBtn.exists).ok({timeout: 10000});

    console.log('  -> Logout from Current User');
    await t
      .click(this.logOutBtn)
      .expect(this.signUpBtn.exists).ok();
  }

  async userSignIn(newUser) {
    console.log('  -> Click Login Button and Direct to Login Page');
    await t.navigateTo(baseURL + "/login/");

    console.log('  -> Entering Account and Password and Login');
    await t
      .expect(this.logInBtn.exists).ok()
      .typeText(this.userName, newUser.email, { replace: true })
      .typeText(this.userPW, newUser.password, { replace: true })
      .takeScreenshot('BWC/login.jpg')
      .click(this.logInBtn)
      .expect(this.logOutBtn.exists).ok();
  }
}
