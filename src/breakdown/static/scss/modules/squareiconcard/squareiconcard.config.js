module.exports = {
  collated: true,
	collator: function(markup, item) {
  	return `<tr><td>${item.label}</td><td>${markup}</td></tr>`
  },
  context: {
    text: 'Icon Card'
  },
  label: 'Square Icon Card',
  preview: '@preview--collated',
  variants: [
    {
      context: {
        disabled: true
      },
      label: 'Is Disabled',
      name: 'isdisabled',
      preview: '@preview'
    },
    {
      context: {
        modifier: 'squareiconcard-alignment',
        text: 'Alignment'
      },
      name: 'alignment',
      preview: '@preview'
    },
    {
      context: {
        modifier: 'squareiconcard-alignment',
        disabled: true,
        text: 'Alignment'
      },
      label: 'Alignment + Is Disabled',
      name: 'alignment-disabled',
      preview: '@preview'
    },
    {
      context: {
        modifier: 'squareiconcard-evidence',
        text: 'Evidence'
      },
      name: 'evidence',
      preview: '@preview'
    },
    {
      context: {
        modifier: 'squareiconcard-evidence',
        disabled: true,
        text: 'Evidence'
      },
      label: 'Evidence + Is Disabled',
      name: 'evidence-disabled',
      preview: '@preview'
    },
    {
      context: {
        modifier: 'squareiconcard-narrative',
        text: 'Narrative'
      },
      name: 'narrative',
      preview: '@preview'
    },
    {
      context: {
        modifier: 'squareiconcard-narrative',
        disabled: true,
        text: 'Narrative'
      },
      label: 'Narrative + Is Disabled',
      name: 'narrative-disabled',
      preview: '@preview'
    },
    {
      context: {
        modifier: 'squareiconcard-tags',
        text: 'Tags'
      },
      name: 'tags',
      preview: '@preview'
    },
    {
      context: {
        modifier: 'squareiconcard-tags',
        disabled: true,
        text: 'Tags'
      },
      label: 'Tags + Is Disabled',
      name: 'tags-disabled',
      preview: '@preview'
    }
  ]
};
