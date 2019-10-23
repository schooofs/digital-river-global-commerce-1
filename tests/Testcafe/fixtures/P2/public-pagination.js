import { Selector, ClientFunction } from 'testcafe';
import config from '../../config';
import HomePage from '../../page-models/public/home-page-model';

const env = config.env;
const baseURL = config.baseUrl[env];
const getLocation = ClientFunction(() => document.location.href);
const prevBtn = Selector('.prev.page-link');
const nextBtn = Selector('.next.page-link');
const homePage = new HomePage();
const POSTSPERPAGE = 10;
var pagiMsg = ()  => Selector('.c-category-actions.c-category-actions--bottom').find('span');

fixture `===== DRGC P2 Automation Test - Pagination on Product Category, Product List & Search Page =====`;

test('Product List - 10 Products per Page and Display Pagination Correctly', async t => {
  console.log('Test Case: Product Page, Pagination & Switch Page Button');
  console.log(">> Navigate to target testing website's product page");
  await t
    .navigateTo(baseURL)
    .maximizeWindow()
	.click(homePage.productsMenu);

  var currentPage = 1;
  var pagiMsgText = await pagiMsg().innerText;
  const totalPosts = parseInt(pagiMsgText.match(/\d+/g)[1]) || 0;
  var displayingPosts = parseInt(pagiMsgText.match(/\d+/g)[0]) || 0;
  const expectedPages = Math.ceil(totalPosts / POSTSPERPAGE);
  const lastPageBtn = Selector(".page-link").withText(expectedPages.toString());
  const firstPageBtn = Selector(".page-link").withText('1');
  const prevBtnText = '<';
  const nextBtnText = '>';
  const lastPage = expectedPages;

  // If expectedPages <=1, there is no pagenation
  if (expectedPages <= 1) {
	console.log(">> Page number <=1, no pagenation.");
	await t
	  .expect(nextBtn.exists).notOk()
	  .expect(prevBtn.exists).notOk();
  } else {
	// else, click next page until reach last page.
	do {
		pagiMsg = Selector('.c-category-actions.c-category-actions--bottom').find('span');
		pagiMsgText = await pagiMsg().innerText;
		displayingPosts = parseInt(pagiMsgText.match(/\d+/g)[0]) || 0;
		var expectedPostsPerPage = POSTSPERPAGE;
		var isLastPage = false;
		// if not last page, it should display Maximum number of a posts which a page can display
		if (currentPage == lastPage) {
			expectedPostsPerPage = totalPosts % POSTSPERPAGE
			isLastPage = true;
		}

		console.log("  -> CurrentPage: " + currentPage.toString() );
		console.log("  -> Last page should be: " + lastPage.toString() );

		// All page should have: fistPageBtn, lastPageBtn, correct # of displayed items
		await t
			.expect(firstPageBtn.exists).ok()
			.expect(lastPageBtn.exists).ok()
			.expect(displayingPosts).eql(expectedPostsPerPage);

		switch (currentPage){
			case 1:
			// First page.
			// Display: nextBtn
			// Dont display: prevBtn
				console.log("  -> 1st Page -- Checking...");
				await t
				    .expect(prevBtn.exists).notOk()
					.expect(nextBtn.exists).ok()
					.expect(nextBtn.innerText).eql(nextBtnText);
				break;
			case lastPage:
			// Last page.
			// Display: prevBtn, address should have page number
			// Dont display: nextBtn
				console.log("  -> Last Page -- Checking...");
				await t
					.expect(nextBtn.exists).notOk()
					.expect(prevBtn.exists).ok()
					.expect(prevBtn.innerText).eql(prevBtnText)
					.expect(getLocation()).contains(`/page/${expectedPages}`);
				break;
			default:
			// Not First and Not last
			// Display: prevBtn, nextBtn, address should have page number
				console.log("  -> Mid Page -- Checking...");
				await t
					.expect(prevBtn.exists).ok()
					.expect(prevBtn.innerText).eql(prevBtnText)
					.expect(nextBtn.exists).ok()
					.expect(nextBtn.innerText).eql(nextBtnText)
					.expect(getLocation()).contains(`/page/${expectedPages}`);
				break;
		}

		//If there is more pages, go to next page
		if (!isLastPage) {
			console.log(">> Go to next page");
			await t.click(nextBtn);
			currentPage += 1;
		}
	} while(!isLastPage)
 }
});

test('Search page should have 2 paginations, at most 10 posts per page with correct message and buttons', async t => {
 console.log('Test Case: Search Page, Pagination & Switch Page Button');
 console.log(">> Navigate to target testing website's search page");
 await t
    .navigateTo(`${baseURL}/?s=digital&post_type=dr_product`)
    .maximizeWindow();

  var expectedCurrentPage = 1;
  const prevBtnText = '<';
  const nextBtnText = '>';
  var currentPage = parseInt(await Selector('.page-link.current').innerText);
  const pageCount = await Selector('.page-item').count;
  const lastPage = pageCount - 1;
  if (pageCount == 1) {
	console.log(">> Page number == 1, no pagenation.");
	await t
	  .expect(nextBtn.exists).notOk()
	  .expect(prevBtn.exists).notOk()
	  .expect(currentPage).eql(1);
  } else {
  // else, click next page until reach last page.
	do {
		currentPage = parseInt(await Selector('.page-link.current').innerText);
		await t.expect(currentPage).eql(expectedCurrentPage);

		var isLastPage = false;
		if (currentPage == lastPage) { isLastPage = true; }

		console.log("  -> CurrentPage: " + currentPage);
		console.log("  -> Last page should be: " + lastPage.toString() );

		switch (currentPage){
			case 1:
			// First page.
			// Display: nextBtn
			// Dont display: prevBtn
				console.log("  -> 1st Page -- Checking...");
				await t
				    .expect(prevBtn.exists).notOk()
					.expect(nextBtn.exists).ok()
					.expect(nextBtn.innerText).eql(nextBtnText);
				break;
			case lastPage:
			// Last page.
			// Display: prevBtn, address should have page number
			// Dont display: nextBtn
				console.log("  -> Last Page -- Checking...");
				await t
					.expect(nextBtn.exists).notOk()
					.expect(prevBtn.exists).ok()
					.expect(prevBtn.innerText).eql(prevBtnText)
					.expect(getLocation()).contains(`/page/${expectedCurrentPage}`);
				break;
			default:
			// Not First and Not last
			// Display: prevBtn, nextBtn, address should have page number
				console.log("  -> Mid Page -- Checking...");
				await t
					.expect(prevBtn.exists).ok()
					.expect(prevBtn.innerText).eql(prevBtnText)
					.expect(nextBtn.exists).ok()
					.expect(nextBtn.innerText).eql(nextBtnText)
					.expect(getLocation()).contains(`/page/${expectedPages}`);
				break;
		}

		//If there is more pages, go to next page
		if (!isLastPage) {
			console.log(">> Go to next page");
			await t.click(nextBtn);
			expectedCurrentPage += 1;
		}
	} while(!isLastPage)
  }
});