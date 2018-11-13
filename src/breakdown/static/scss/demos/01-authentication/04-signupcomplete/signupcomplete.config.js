module.exports = {
  context: {
    buttonSubmitContext: {
      text: 'Sign Up',
      type: 'submit'
    },
    fields: [
      {
        context: {
          id: 'email',
          label: 'Email',
          labelNote: false,
          inputText: {
            id: 'email',
            readonly: true,
            type: 'email',
            value: 'email@address.com'
          }
        }
      },
      {
        context: {
          id: 'firstname',
          label: 'First Name',
          labelNote: false,
          inputText: {
            id: 'firstname'
          }
        }
      },
      {
        context: {
          id: 'lastname',
          label: 'Last Name',
          labelNote: false,
          inputText: {
            id: 'lastname'
          }
        }
      },
      {
        context: {
          id: 'password',
          label: 'Password',
          labelNote: '(Must be at least 8 characters)',
          inputText: {
            id: 'password',
            type: 'password'
          }
        }
      },
      {
        context: {
          id: 'passwordagain',
          label: 'Password Again',
          labelNote: false,
          inputText: {
            id: 'passwordagain',
            type: 'passwordagain'
          }
        }
      }
    ],
    formDividerContext: {
      text: 'Or'
    },
    titleContext: {
      id: 'heading-form',
      text: 'Sign Up',
      xSelector: 'l-auth-x-title'
    },
    textContext: {
      text: 'Already have an account? <a href="#">Log In</a>.',
      xSelector: 'l-auth-x-text'
    }
  },
  label: 'Sign Up - Complete'
};
