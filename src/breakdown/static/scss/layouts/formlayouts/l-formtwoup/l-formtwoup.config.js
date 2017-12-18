module.exports = {
  context: {
    formFields: [
      {
        context: {
          hideLabel: true,
          id: 'formfield-twoupselect',
          inputSelect: {
            options: [
              {
                text: 'Email Address',
                value: 'email'
              },
              {
                text: 'URL',
                value: 'url'
              },
              {
                text: 'Telephone',
                value: 'telephone'
              }
            ]
          },
          inputText: false,
          label: 'Select Options',
          labelNote: false
        }
      },
      {
        context: {
          hideLabel: true,
          id: 'formfield-twouptext',
          label: 'Text Input',
          labelNote: false
        }
      }
    ]
  },
  label: 'Form Two Up'
};
