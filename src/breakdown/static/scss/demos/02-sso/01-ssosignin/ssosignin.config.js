module.exports = {
  context: {
    buttonSubmitContext: {
      text: 'Sign In',
      type: 'submit'
    },
    formDividerContext: {
      text: 'Or sign in with your email'
    },
    formFieldEmailContext: {
      id: 'email',
      label: 'Email',
      labelNote: false,
      inputText: {
        id: 'email',
        type: 'email'
      }
    },
    formFieldPasswordContext: {
      id: 'password',
      label: 'Password',
      labelNote: false,
      inputText: {
        id: 'password',
        type: 'password'
      }
    },
    formFieldSocialContext: {
      label: 'Sign In With',
      labelElement: 'p',
      labelNote: false,
      inputAuthButtons: true,
      inputText: false
    },
    titleContext: {
      id: 'heading-form',
      text: 'Sign in to your Badgr Account',
      xSelector: 'l-auth-x-title'
    },
    textContext: {
      text: 'The application <strong>Digital Promise</strong> would like to sign you in using your Badgr account. Not using Badgr? <a href="#">Create an account</a>!',
      xSelector: 'l-auth-x-text'
    }
  },
  label: 'Sign In'
};
