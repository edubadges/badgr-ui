module.exports = {
  context: {
    formFields: [
      {
        context: {
          id: 'aignmentframework',
          label: 'Framework',
          labelNote: false,
          inputText: {
            id: 'aignmentframework'
          }
        }
      },
      {
        context: {
          id: 'aignmentcode',
          label: 'Code',
          labelNote: false,
          inputText: {
            id: 'alignmentcode'
          }
        }
      }
    ],
    formSectionToggleContext: {
      xSelector: 'l-formsectiontoggle-x-toggle'
    }
  },
  label: 'Form Section Toggle'
};
