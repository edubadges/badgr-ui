module.exports = {
  context: {
    formFieldBadgeContext: {
      label: 'Image',
      labelNote: '(<button type="button">generate random<span class="visuallyhidden"> badge image</span></button>)',
      inputText: false,
      dropzoneInput: {
        context: {
          buttonContext: {
            element: 'label',
            label: 'dropzone',
            text: 'Browse',
          },
          dropZoneContext: {
            element: 'label',
            label: 'dropzone'
          }
        }
      },
      xSelector: 'l-formimageupload-x-upload'
    },
    formFieldDescriptionContext: {
      id: 'badgedescription',
      label: 'Short Description',
      labelNote: false,
      inputText: false,
      inputTextarea: {
        id: 'badgedescription'
      }
    },
    formFieldNameContext: {
      id: 'badgename',
      label: 'Name',
      labelNote: false,
      inputText: {
        id: 'badgename'
      }
    }
  },
  label: 'Form Image Upload'
};
