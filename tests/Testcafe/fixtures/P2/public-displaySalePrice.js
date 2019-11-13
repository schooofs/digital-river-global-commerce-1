import { Selector } from 'testcafe';
import Config from '../../config';
import HomePage from '../../page-models/public/home-page-model';
import DataUtils from '../../utils/dataUtils';

fixture `===== DRGC P2 Automation Test - Displaying Sale Price =====`;

const homePage = new HomePage();
const dataUtils = new DataUtils();
const baseURL = Config.baseUrl[Config.env];
const onSaleProductID = dataUtils.getOnSaleProduct().productID;
const getSaleBuyBtn = (pId) => Selector(`button[data-product-id="${pId}"]`);
const getRegularPrice = (buyBtn) => buyBtn.parent('div').find('.old-price');
const getSalePrice = (buyBtn) => buyBtn.parent('div').find('.new-price');
const getProductPageRegularPrice = (buyBtn) => buyBtn.parent('form').find('.product-price-old');
const getProductPageSalePrice = (buyBtn) => buyBtn.parent('form').find('.product-price');
const getOnSaleProductPageLink = (pid) => getSaleBuyBtn(pid).parent('div').find('.card-overlay');
const getMinicartItem = (pId) => Selector(`li.dr-minicart-item > div[data-product-id="${pId}"]`);

test('Minicart price', async t => {
  console.log('Test Case: Minicart - Check the Sale Price ');
  const saleBuyBtn = getSaleBuyBtn(onSaleProductID);
  const regularPrice = getRegularPrice(saleBuyBtn);
  const salePrice = getSalePrice(saleBuyBtn);
  const minicartItem = getMinicartItem(onSaleProductID);
  const minicartRegularPrice = minicartItem.find('p.dr-minicart-item-price > .dr-strike-price');
  const minicartSalePrice = minicartItem.find('p.dr-minicart-item-price > .dr-sale-price');

  console.log('>> Navigate to target testing website');
  await t
    .setTestSpeed(0.7)
    .navigateTo(baseURL)
    .maximizeWindow();

  console.log('>> Add on sale product into cart');
  await t
	.click(homePage.productsMenu)
    .expect(saleBuyBtn.exists).ok()
    .expect(regularPrice.exists).ok()
    .expect(salePrice.exists).ok();

  console.log('>> Checking the sale price and regular price in mini cart');
  await t
    .wait(500)
    .click(saleBuyBtn)
    .expect(minicartItem.exists).ok()
    .expect(minicartRegularPrice.exists).ok()
    .expect(minicartSalePrice.exists).ok();
});

test('Category page price', async t => {
  console.log('Test Case: Category Page - Check the Sale Price ');
  const saleBuyBtn = getSaleBuyBtn(onSaleProductID);
  const regularPrice = getRegularPrice(saleBuyBtn);
  const salePrice = getSalePrice(saleBuyBtn);

  console.log('>> Navigate to target testing website');
  await t
    .navigateTo(baseURL)
    .maximizeWindow()

  console.log('>> Checking the on sale/regular price in category page');
  await t
	.click(homePage.productsMenu)
    .expect(saleBuyBtn.exists).ok()
    .expect(regularPrice.exists).ok()
    .expect(salePrice.exists).ok();
});

test('Porduct page price', async t => {
  console.log('Test Case: Product Detail Page - Check the Sale Price');
  const saleBuyBtn = getSaleBuyBtn(onSaleProductID);
  const regularPrice = getProductPageRegularPrice(saleBuyBtn);
  const salePrice = getProductPageSalePrice(saleBuyBtn);
  const onSaleProductPageLink = getOnSaleProductPageLink(onSaleProductID);

  console.log('>> Navigate to target testing website');
  await t
    .navigateTo(baseURL)
    .maximizeWindow()

  console.log('>> Checking the on sale/regular price in product\'s page');
  await t
	.click(homePage.productsMenu)
	.click(onSaleProductPageLink)
    .expect(saleBuyBtn.exists).ok()
    .expect(regularPrice.exists).ok()
    .expect(salePrice.exists).ok();
});
