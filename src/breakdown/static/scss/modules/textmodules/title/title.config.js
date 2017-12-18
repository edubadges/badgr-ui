module.exports = {
	collated: true,
	collator: function(markup, item) {
  	return `<tr><td>${item.label}</td><td>${markup}</td></tr>`
  },
	context: {
		text: 'Title'
	},
	preview: '@preview--collated',
	variants:[
		{
			context:{
				modifier: 'title-is-smallmobile'
			},
			label: 'Is Small Mobile',
			name: 'is-smallmobile',
			preview: '@preview'

		},
		{
			context:{
				modifier: 'title-bold'
			},
			name: 'bold',
			preview: '@preview'

		},
		{
			context:{
				modifier: 'title-bordered'
			},
			name: 'bordered',
			preview: '@preview'

		},
		{
			context:{
				modifier: 'title-ruled'
			},
			name: 'ruled',
			preview: '@preview'

		},
		{
			context:{
				modifier: 'title-small'
			},
			name: 'small',
			preview: '@preview'
		},
		{
			context:{
				modifier: 'title-small-2x'
			},
			label: 'Small 2x',
			name: 'small-2x',
			preview: '@preview'
		},
		{
			context:{
				modifier: 'title-small-3x'
			},
			label: 'Small 3x',
			name: 'small-3x',
			preview: '@preview'
		},
		{
			context:{
				modifier: 'title-margin-bottom-2x'
			},
			label: 'Margin Bottom 2x',
			name: 'margin-bottom-2x',
			preview: '@preview'
		},
		{
			context:{
				modifier: 'title-uppercase'
			},
			name: 'uppercase',
			preview: '@preview'
		},
	]
};
