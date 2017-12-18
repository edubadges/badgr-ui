module.exports = {
  context: {
    buttonSubmitContext: {
      text: 'Reset Password',
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
    titleContext: {
      id: 'heading-form',
      text: 'Forgot your password?',
      xSelector: 'l-auth-x-title'
    },
    textContext: {
      text: 'Fill in your email, and we\'ll help you reset your password',
      xSelector: 'l-auth-x-text'
    }
  },
  label: 'Forgot Password'
};
