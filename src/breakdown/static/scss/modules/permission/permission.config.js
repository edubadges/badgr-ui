module.exports = {
  preview: '@preview--none',
  variants: [
    {
      context: {
        modifier: 'permission-personal',
        text: 'Know who you are on Badgr'
      },
      name: 'personal',
      preview: '@preview'
    },
    {
      context: {
        modifier: 'permission-profile',
        text: 'View your profile and email addresses'
      },
      name: 'profile',
      preview: '@preview'
    }
  ]
};
