/* minicart-iPhone6.js */
import { Selector } from 'testcafe';
import config from '../../config';
import HomePage from '../../page-models/public/home-page-model';

fixture `===== DRGC P3 Automation Test - Mini Cart for iPhone6 =====`;

const env = config.env;
const baseURL = config.baseUrl[env];
const homePage = new HomePage();
const mobileViewHamburgList = Selector('.navbar.navbar-expand-xl.fixed-top').find('[data-target="#navbarNavDropdown"]').find('span');
const miniCartToggle = Selector('.dr-minicart-toggle');


test('Verify minicart lineItem quanaity exist in iPhone6 portrait', async t => {
  console.log('Test Case: Portrait Mode - Verify Minicart Line Item Quanaity Exist in iPhone6 ');
  console.log('>> Navigate to target testing website with Mobile mode');
  await t
    .navigateTo(baseURL)
    .resizeWindowToFitDevice('iPhone 6', {
      portraitOrientation: true
    });

  console.log('>> Add a product');
  await t
    .click(mobileViewHamburgList)
    .click(homePage.productsMenu)
    .click(homePage.addPhyProduct);

  console.log('>> Check minicart info display correctly');
  await t
    .click(miniCartToggle)
    .click(miniCartToggle)
    .expect(Selector('.dr-minicart-display').exists).ok()
    .expect(Selector('.dr-minicart-item-qty').innerText).eql('Qty.1')
    .takeScreenshot('BWC/minicart-iPhone6-portrait.png');
});

/*
Currently, testcafe doesn't have entire page screenshot feature available. A short-term solution is to use
resizeWindow and run test script in headless mode.

More details:
https://github.com/DevExpress/testcafe/issues/1520
*/

test('Verify minicart lineItem quanaity exist in iPhone6 landscape', async t => {
  console.log('Test Case: Landscape Mode - Verify Minicart Line Item Quanaity Exist in iPhone6 ');
  console.log('>> Navigate to target testing website with Mobile mode');
  await t
    .navigateTo(baseURL)
    .resizeWindowToFitDevice('iPhone 6', {
      portraitOrientation: false
    });
  console.log('>> Add a product');
  await t
    .click(mobileViewHamburgList)
    .click(homePage.productsMenu)
    .click(homePage.addPhyProduct);

  console.log('>> Check minicart info display correctly');
  await t
    .click(miniCartToggle)
    .expect(Selector('.dr-minicart-display').exists).ok()
    .click(miniCartToggle)
    .expect(Selector('.dr-minicart-display').exists).ok()
    .expect(Selector('.dr-minicart-item-qty').innerText).eql('Qty.1')
    .resizeWindow(667, 375)
    .takeScreenshot('BWC/minicart-iPhone6-landscape.png');
});
