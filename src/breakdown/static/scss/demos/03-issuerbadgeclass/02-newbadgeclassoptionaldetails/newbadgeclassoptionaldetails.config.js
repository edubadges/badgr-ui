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
          buttonContext: {
            label: 'heading-whatsalignment' // Match titleBorderedContext.id
          },
          formSectionNested: {
            formSectionNestedContext: {
              id: 'heading-alignmentsubsection',
              formFields: [
                {
                  context: {
                    id: 'alignmentname',
                    label: 'Name',
                    labelNote: false,
                    textInput: {
                      id: 'alignmentname'
                    }
                  }
                },
                {
                  context: {
                    id: 'alignmenturl',
                    label: 'URL',
                    labelNote: false,
                    textInput: {
                      id: 'alignmenturl'
                    }
                  }
                },
                {
                  context: {
                    id: 'alignmentdescription',
                    label: 'Short Description',
                    labelNote: false,
                    inputText: false,
                    inputTextarea: {
                      id: 'alignmentdescription'
                    }
                  }
                }
              ],
              formSectioRemoveContext: {
                label: 'heading-alignmentsubsection',
                xSelector: 'l-formsectionnested-x-remove'
              },
              heading: 'Alignment 1'
            }
          },
          formSectionRemoveContext: {
            label: 'heading-alignment' // Match titleRuledContext.id
          },
          label: 'heading-alignment', // Match titleRuledContext.id
          textContext: {
            text: 'An Open Badge can optionally align to an educational standard. Alignment information may be relevant to people viewing an earner\'s awarded badges, or to a potential earner deciding whether to apply for the badge.'
          },
          titleBorderedContext: {
            id: 'heading-whatsalignment',
            text: 'What\'s Alignment?'
          },
          titleRuledContext: {
            id: 'heading-alignment',
            text: 'Alignment <span>(optional)</span>'
          }
        }
      },
      {
        context: {
          buttonContext: {
            label: 'heading-whataretags' // Match titleBorderedContext.id
          },
          formFields: [
            {
              context: {
                addInput: true,
                label: 'Add a Tag',
                labelNote: false,
                inputText: false,
                xSelector: 'l-formsection-x-maxwidthinput'
              }
            }
          ],
          formSectionRemoveContext: {
            label: 'heading-tags' // Match titleRuledContext.id
          },
          label: 'heading-tags', // Match titleRuledContext.id
          removeable: true,
          tags: true,
          textContext: {
            text: 'Tags are optional ways to describe a type of achievement. When you use tags, you help people who are interested in your topic find your Badge.'
          },
          titleBorderedContext: {
            id: 'heading-whataretags',
            text: 'What are Tags?'
          },
          titleRuledContext: {
            id: 'heading-tags',
            text: 'Tags'
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
                    modifier: 'squareiconcard-alignment',
                    text: 'Alignment'
                  }
                },
                {
                  context: {
                    disabled: true,
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
  label: 'New Badge Class - Optional Details'
};
