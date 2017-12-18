module.exports = {
  context: {
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
      xSelector: 'l-formsectionnested-x-remove'
    }
  },
  label: 'Form Section Nested'
};
