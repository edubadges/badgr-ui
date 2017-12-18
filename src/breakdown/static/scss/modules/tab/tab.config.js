module.exports = {
  collated: true,
	collator: function(markup, item) {
  	return `<tr><td>${item.label}</td><td>${markup}</td></tr>`
  },
  context: {
    text: 'Tab'
  },
  preview: '@preview--collated',
  variants: [
    {
      name: 'default',
      preview: '@preview'
    },
    {
      context: {
        modifier: 'tab-is-active'
      },
      label: 'Is Active',
      name: 'isactive',
      preview: '@preview'
    },
    {
      context: {
        disabled: true
      },
      label: 'Is Disabled',
      name: 'isdisabled',
      preview: '@preview'
    }
  ]
};
