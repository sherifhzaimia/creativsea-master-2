const sites = {
  creativsea: {
    name: 'CreativSea',
    loginUrl: 'https://creativsea.com/my-account/',
    selectors: {
      username: '#username',
      password: '#password',
      loginButton: 'button[name="login"]'
    },
    cookies: {
      session: 'wordpress_logged_in_69f5389998994e48cb1f2b3bcad30e49'
    },
    waitForNavigation: true
  },

  // إضافة موقع Peeksta
  peeksta: {
    name: 'Peeksta',
    loginUrl: 'https://auth2.peeksta.com/u/login?state=hKFo2SBSMlVLcFNkZjhfcHR6SGhKUXk2ekdZemdhNEpEcVhOUKFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIEREU1dFMmQtYm1oQ1ZBYjl0SndlSW5rTFEzcVhkSmJEo2NpZNkgUUJ1RlNvam1ic1R6V3pKZ0w5c0k2dDVJcjhlZzdpRDQ',
    selectors: {
      username: '#username',
      password: '#password',
      loginButton: 'button[type="submit"]'
    },
    cookies: {
      session: 'appSession'
    },
    waitForNavigation: true
  },

  // إضافة موقع Winninghunter
  winninghunter: {
    name: 'Winninghunter',
    loginUrl: 'https://app.winninghunter.com/login',
    selectors: {
      username: '#Email-2',
      password: '#Password',
      loginButton: 'button[type="submit"]'
    },
    cookies: {
      session: 'remember_me'
    },
    waitForNavigation: true
  }
};

module.exports = sites;
