module.exports = {
  context: {
    cards: [
      {
        heading: 'Canvas LTI',
        id: 'heading-card-01',
        description: 'Badgr connects with Canvas LTI to automatically issue badges to students as they complete',
        note: 'Active'
      },
      {
        buttonContext: {
          label: 'heading-card-02',
          text: 'Revoke'
        },
        heading: 'Digital Promise',
        id: 'heading-card-02',
        description: 'This application has been granted permisson to sign you in using your Badgr account.',
        note: 'Authorized: <strong>May 15, 2016</strong>'
      }
    ],
    headingContext: {
      buttonActionContext: false,
  		heading: 'App Integrations',
  		headingNote: false,
  		headingXSelector: 'heading-x-image',
  		id: 'heading',
  		image: false,
  		subHeading: false
    },
    textContext: {
      text: 'You\'ve authorized access to your Badgr account for the apps and sites listed below.'
    }
  },
  label: 'App Integrations Overview'
};
