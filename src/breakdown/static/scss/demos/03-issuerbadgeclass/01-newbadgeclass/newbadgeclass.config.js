module.exports = {
  context: {
    buttonCancelContext: {
      text: 'Cancel'
    },
    buttonCreateBadgeContext: {
      text: 'Create Badge',
      type: 'submit'
    },
    formSections: [
      {
        context: {
          buttonContext: {
            label: 'heading-badgebasics' // Match titleBorderedContext.id
          },
          badge: true,
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
        }
      },
      {
        context: {
          buttonContext: {
            label: 'heading-whatscriteria' // Match titleBorderedContext.id
          },
          formFields: [
            {
              context: {
                id: 'criteria-url',
                label: 'URL to the Badge Criteria Page',
                labelNote: false,
                inputText: {
                  id: 'criteria-url'
                }
              }
            }
          ],
          label: 'heading-criteria', // Match titleRuledContext.id
          markdownEditor: {
            context: {
              formFieldContext: {
                id: 'markdowntext',
                label: 'How is this Badge Earned?',
                labelNote: false,
                inputTextarea: {
                  id: 'markdowntext'
                }
              },
              hideTooltip: true,
              xSelector: 'l-formsection-x-inputoffset'
            }
          },
          removeable: false,
          textContext: {
            text: 'Critera describes exactly what must be done to earn this badge. Some issuers choose a URL on their website as a promotional page that explains this badge opportunity and how to earn it. <strong>At least one field is required.</strong>'
          },
          titleBorderedContext: {
            id: 'heading-whatscriteria',
            text: 'What\'s Criteria?'
          },
          titleRuledContext: {
            id: 'heading-criteria',
            text: 'Criteria'
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
                    modifier: 'squareiconcard-alignment',
                    text: 'Alignment'
                  }
                },
                {
                  context: {
                    modifier: 'squareiconcard-tags',
                    text: 'Tags'
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
  		heading: 'Add Badge Class',
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
  label: 'New Badge Class - Default'
};
