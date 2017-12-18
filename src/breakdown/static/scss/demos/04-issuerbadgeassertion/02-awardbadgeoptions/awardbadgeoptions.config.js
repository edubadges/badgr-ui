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
          buttonContext: {
            label: 'heading-narrativehelp' // Match titleBorderedContext.id
          },
          label: 'heading-narrative', // Match titleRuledContext.id,
          markdownEditor: {
            context: {
              formFieldContext: {
                id: 'markdowntext',
                label: 'How did the recipience earn this badge?',
                labelNote: false,
                inputTextarea: {
                  id: 'markdowntext'
                }
              },
              hideTooltip: true,
              xSelector: 'l-formsection-x-inputoffset'
            }
          },
          textContext: {
            text: 'The narrative is an overall description of the achievement related to the badge.'
          },
          titleBorderedContext: {
            id: 'heading-narrativehelp',
            text: 'Narrative'
          },
          titleRuledContext: {
            id: 'heading-narrative',
            text: 'Narrative'
          }
        }
      },
      {
        context: {
          buttonContext: {
            label: 'heading-whatsevidence' // Match titleBorderedContext.id
          },
          formSectionNested: {
            buttonIconContext: {
              text: 'Add Additional Evidence'
            },
            formSectionNestedContext: {
              formFields: [
                {
                  context: {
                    id: 'urltoevidiencepage',
                    label: 'URL to Evidence Page',
                    labelNote: false,
                    textInput: {
                      id: 'urltoevidiencepage'
                    }
                  }
                }
              ],
              formSectioRemoveContext: {
                label: 'heading-nestedevidence',
                xSelector: 'l-formsectionnested-x-remove'
              },
              hideToggle: true,
              id: 'heading-nestedevidence',
              markdownEditor: {
                context: {
                  formFieldContext: {
                    id: 'markdownevidence',
                    label: 'How is this badge earned?',
                    labelNote: false,
                    inputTextarea: {
                      id: 'markdownevidence'
                    }
                  },
                  hideTooltip: true
                }
              }
            }
          },
          formSectionRemoveContext: {
            label: 'heading-evidence' // Match titleRuledContext.id
          },
          label: 'heading-evidence', // Match titleRuledContext.id
          textContext: {
            text: 'Evidence is submitted proof that an earner meets the criteria for a badge they are applying for. This can be in the form of a narrative that describes the evidence and process of achievement, and/or a URL of a webpage presenting the evidence of achievement.'
          },
          titleBorderedContext: {
            id: 'heading-whatsevidence',
            text: 'What\'s Evidence?'
          },
          titleRuledContext: {
            id: 'heading-evidence',
            text: 'Evidence'
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
                    disabled: true,
                    modifier: 'squareiconcard-narrative',
                    text: 'Narrative'
                  }
                },
                {
                  context: {
                    disabled: true,
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
  label: 'Award Badge - Options'
};
