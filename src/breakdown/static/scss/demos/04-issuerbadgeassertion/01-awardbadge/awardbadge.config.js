module.exports = {
  context: {
    buttonCancelContext: {
      text: 'Cancel'
    },
    buttonCreateBadgeContext: {
      text: 'Award Badge',
      type: 'submit'
    },
    formSections: [
      {
        context: {
          buttonContext: {
            label: 'heading-badgeawarding' // Match titleBorderedContext.id
          },
          formCheckbox: {
            context: {
              id: 'notifybyemail',
              text: 'Notify Recipient by Email'
            }
          },
          formFields: [
            {
              context: {
                id: 'identifier',
                inputText: false,
                formTwoUp: true,
                label: 'Identifier',
                labelNote: false
              }
            }
          ],
          label: 'heading-recipientinformation', // Match titleRuledContext.id
          removeable: false,
          textContext: {
            text: 'You can award a badge via a recipients email address, url, or telephone number.'
          },
          titleBorderedContext: {
            id: 'heading-badgeawarding',
            text: 'Badge Awarding'
          },
          titleRuledContext: {
            id: 'heading-recipientinformation',
            text: 'Recipient Information'
          }
        }
      },
      {
        context: {
          hideHelp: true,
          label: 'heading-addoptionaldetails', // Match titleRuledContext.id
          modifier: 'l-formsection-span',
          removeable: false,
          squareIconCards: {
            context: {
              squareIconCards: [
                {
                  context: {
                    modifier: 'squareiconcard-narrative',
                    text: 'Narrative'
                  }
                },
                {
                  context: {
                    modifier: 'squareiconcard-evidence',
                    text: 'Evidence'
                  }
                }
              ]
            }
          },
          titleRuledContext: {
            id: 'heading-addoptionaldetails',
            modifier: 'title-ruled title-ruledadd',
            text: 'Add Optional Details'
          }
        }
      }
    ],
    headingContext: {
      buttonActionContext: false,
  		heading: 'Award Badge',
      headingId: 'heading-addbadgeclass',
  		headingNote: false,
  		id: 'heading',
  		image: false,
  		subHeading: false
    },
    ruleContext: {
      modifier: 'l-rule'
    }
  },
  label: 'Award Badge'
};
