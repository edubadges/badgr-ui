module.exports = {
  context: {
    buttonSubmitContext: {
      text: 'Sign In',
      type: 'submit'
    },
    formDividerContext: {
      text: 'Or'
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
      labelNote: '<a href="#">Forgot Password?</a>',
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
      text: 'Welcome to Badgr!',
      xSelector: 'l-auth-x-title'
    },
    textContext: {
      text: 'Choose your sign in method to get started.',
      xSelector: 'l-auth-x-text'
    }
  },
  label: 'Sign In'
};
