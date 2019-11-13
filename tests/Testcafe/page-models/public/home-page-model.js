import { Selector, t } from 'testcafe';
import DataUtils from '../../utils/dataUtils';

const dataUtils = new DataUtils();
const physicalProdID = dataUtils.getTestingPhysicalProduct().productID;
const digitalProdID = dataUtils.getTestingDigitalProduct().productID;

export default class HomePage {
  constructor() {
    this.productsMenu = Selector('#menu-item-68 > a');
    this.signIn = Selector('#menu-item-76 > a');
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

	this.cartBtn = Selector('.dr-btn').withText('CART');
	this.checkoutBtn = Selector('.dr-btn').withText('CHECKOUT');

  }

  async createNewCustomer(newUser) {
	console.log('  -> Click Login Button and Direct to Login Page');
    await t.click(this.signIn);

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
    await t
      .click(this.signIn);

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
