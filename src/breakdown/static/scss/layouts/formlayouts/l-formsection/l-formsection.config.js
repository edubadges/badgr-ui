module.exports = {
  context: {
    buttonContext: {
      label: 'helpheading',
      text: 'Learn More'
    },
    formSectionRemoveContext: {
      label: 'formsection',
      xSelector: 'l-formsection-x-remove'
    },
    removeable: true,
    textContext: {
      text: 'Help text.'
    },
    titleBorderedContext: {
      element: 'h4',
      id: 'helpheading',
      text: 'Help Title'
    },
    titleRuledContext: {
      id: 'formsection',
      text: 'Legend',
      xSelector: 'l-formsection-x-legend'
    }
  },
  label: 'Form Section',
  variants: [
    {
      context: {
        buttonContext: {
          label: 'heading-badgebasics' // Match titleBorderedContext.id
        },
        formFields: [
          {
            context: {
              formImage: {
                context: {
                  hideLabel: true
                }
              },
              id: 'badgedescription',
              inputText: false,
              label: 'Image',
              labelElement: 'p',
              labelNote: '(<button type="button">generate random</button>)',
            }
          },
          {
            context: {
              id: 'badgedescription',
              label: 'Short Description',
              labelNote: false,
              inputText: false,
              inputTextarea: {
                id: 'badgedescription'
              }
            }
          },
          {
            context: {
              id: 'badgename',
              label: 'Name',
              labelNote: false,
              inputText: {
                id: 'badgename'
              }
            }
          }
        ],
        label: 'heading-basicinformation', // Match titleRuledContext.id
        removeable: false,
        textContext: {
          text: 'Badge images can be either PNGs or SVGs. <strong>All fields are required.</strong>'
        },
        titleBorderedContext: {
          id: 'heading-badgebasics',
          text: 'Badge Basics'
        },
        titleRuledContext: {
          id: 'heading-basicinformation',
          text: 'Basic Information'
        }
      },
      label: 'With Form Image (Example)',
      name: 'withformimageexample'
    }
  ]
};
