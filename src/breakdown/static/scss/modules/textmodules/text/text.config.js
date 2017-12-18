module.exports = {
	collated: true,
	collator: function(markup, item) {
  	return `<tr><td>${item.label}</td><td>${markup}</td></tr>`
  },
	context: {
		text: 'Here is a text snippet with <a href="#">link</a> and <strong>strong text</strong>. <span class="text-is-error">Error text.</span>'
	},
	preview: '@preview--collated',
	variants: [
		{
			context: {
				modifier: 'text-is-error'
			},
			label: 'Is Error',
			name: 'iserror',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'text-quiet'
			},
			name: 'quiet',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'text-quiet text-is-error'
			},
			label: 'Quiet + Is Error',
			name: 'quiet-iserror',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'text-small'
			},
			name: 'small',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'text-small text-is-error'
			},
			label: 'Small + Is Error',
			name: 'small-iserror',
			preview: '@preview'
		}
	]
};
