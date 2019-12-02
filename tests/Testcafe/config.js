let config = {
  env: 'dev', // local: dev; staging/systest: sys; production/demo: prod
  apiEnv: 'PRD',
  testEmail: 'qa@dr.com',
  adminUserName: {
    dev: 'username', //Replace this to your localhost admin username
    sys: 'username',
    prod: 'username',
    demo: 'username',
  },
  adminPassword: {
    dev: 'password', //Replace this to your localhost admin password
    sys: 'password',
    prod: 'password',
    demo: 'password',
  },
  baseUrl: {
    dev: 'http://localhost/wordpress/',  //Replace this to your localhost test site address
    sys: 'http://tpedevapp0264.d010.digitalriverws.net/',
    prod: 'http://wordpress.c141.digitalriverws.net/',
    demo: 'http://gcwpdemo.wpengine.com/',
  },
  apiUrl: {
    PRD: 'https://api.digitalriver.com',
    NONPRD: 'https://dispatch-test.digitalriver.com',
  }
};

module.exports = config;
