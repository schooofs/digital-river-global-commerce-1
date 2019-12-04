let config = {
  env: 'dev', // local: dev; staging/systest: sys; production/demo: prod
  apiEnv: 'PRD',
  testEmail: 'qa@dr.com',
  adminUserName: {
    dev: 'tracy', //Replace this to your localhost admin username
    sys: 'username',
    prod: 'username',
    demo: 'username',
  },
  adminPassword: {
    dev: 'tracyadmin', //Replace this to your localhost admin password
    sys: 'password',
    prod: 'password',
    demo: 'password',
  },
  baseUrl: {
    dev: 'http://10.70.10.35/wordpress/',  //Replace this to your localhost test site address
    sys: 'http://tpedevapp0264.d010.digitalriverws.net/',
    prod: 'http://wordpress.c141.digitalriverws.net/',
    demo: 'http://gcwpdemo.wpengine.com/',
  },
  apiUrl: {
    PRD: 'https://api.digitalriver.com',
    NONPRD: 'https://dispatch-test.digitalriver.com',
  },
  websiteAuth: {
    username: 'gcwpdemo',
    password: '33a5b9f5',
  }
};

module.exports = config;
