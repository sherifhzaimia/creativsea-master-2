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
  // يمكن إضافة مواقع أخرى هنا
  example: {
    name: 'Example Site',
    loginUrl: 'https://designbeastapp.com/Dashboard/Account/Login',
    selectors: {
      username: 'input[name="EmailId"]',
      password: 'input[name="Password"]',
      loginButton: 'button[type="submit"]'
    },
    cookies: {
      session: '.alert-danger'
    },
    waitForNavigation: true
  }
};

module.exports = sites;
