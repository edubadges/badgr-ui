module.exports = {
  collated: true,
	collator: function(markup, item) {
  	return `<tr><td>${item.label}</td><td>${markup}</td></tr>`
  },
  label: 'Button Icon',
  preview: '@preview--collated',
  variants: [
    {
      context: {
        disabled: true
      },
      label: 'Is Disabled',
      name: 'isdisabled'
    },
    {
      context: {
        modifier: 'buttonicon-add',
        text: 'Add Another'
      },
      name: 'add',
      preview: '@preview'
    },
    {
      context: {
        disabled: true,
        modifier: 'buttonicon-add',
        text: 'Add Another'
      },
      label: 'Add + Is Disabled',
      name: 'add-isdisabled',
      preview: '@preview'
    }
  ]
};
