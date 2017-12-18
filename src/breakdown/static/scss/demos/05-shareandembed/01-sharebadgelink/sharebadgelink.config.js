module.exports = {
  context: {
    buttonContext: {
      text: 'Copy'
    },
    formFieldContext: {
      id: 'copy',
      label: 'Copy this private URL to share:',
      labelNote: false,
      readonly: true,
      value: 'https://api.badgr.io'
    },
    formRadioButtonv1Context: {
      checked: true,
      id: 'version1',
      name: 'version',
      text: 'v1.0'
    },
    formRadioButtonv2Context: {
      id: 'version2',
      name: 'version',
      text: 'v2.0'
    },
    textBodyContext: {
      text: 'Badgr is testing the new version of Open Badges, v2.0. Badges accessed or downloaded in v2.0 format may not yet be accepted everywhere Open Badges are used.'
    },
    textTitleContext: {
      text: '<strong>We Support Open Badges v2.0!</strong>'
    }
  },
  label: 'Share Badge - Link'
};
