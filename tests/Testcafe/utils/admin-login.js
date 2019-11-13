import { Role } from 'testcafe';
import Config from '../config';
const env = Config.env;
const url = Config.baseUrl[env] + '/wp-login.php';
const username = Config.adminUserName[env];
const password = Config.adminPassword[env];
const user = Role(url, async t => {
  await t
    .wait(500)
    .typeText('#user_login', username)
    .typeText('#user_pass', password)
    .click('#wp-submit');
}, { preserveUrl: true });

module.exports = user;
