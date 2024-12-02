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
  designbeastapp: {
    name: 'designbeastapp',
    loginUrl: 'https://designbeastapp.com/Dashboard/Account/Login',
    selectors: {
      username: '#EmailId',
      password: '#Password',
      loginButton: 'body > div > div > div > form > div.container-login100-form-btn > button'
    },
    cookies: {
      session: 'ASP.NET_SessionId'
    },
    waitForNavigation: true
  }
};

module.exports = sites;
