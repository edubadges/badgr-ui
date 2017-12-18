module.exports = {
  context: {
    lAuthButtonsContext: {
      authButtons: [
        {
          context: {
            modifier: 'buttonauth-facebook',
            text: 'Facebook'
          }
        },
        {
          context: {
            modifier: 'buttonauth-linkedin_oauth2',
            text: 'LinkedIn'
          }
        },
        {
          context: {
            modifier: 'buttonauth-twitter',
            text: 'Twitter'
          }
        }
      ]
    },
    lTabsContext: {
      tabs: [
        {
          context: {
            modifier: false,
            text: 'Link'
          }
        },
        {
          context: {
            modifier: 'tab-is-active',
            text: 'Social'
          }
        },
        {
          context: {
            text: 'Embed'
          }
        }
      ]
    }
  },
  label: 'Share Badge - Social'
};
