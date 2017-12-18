module.exports = {
	collated: true,
	collator: function(markup, item) {
  	return `<tr><td>${item.label}</td><td>${markup}</td></tr>`
  },
	context:{
		id: 'formradiobutton1',
		name: 'formradiobutton',
		text: 'Form Radio Button'
	},
	label: 'Form Radio Button',
	preview: '@preview--collated',
	variants:[
		{
			context: {
				id: 'default'
			},
			name: 'default',
			preview: '@preview'
		},
		{
			context: {
				disabled: true,
				id: 'disabled'
			},
			name: 'isdisabled',
			preview: '@preview'
		},
		{
			context:{
				id: 'notext',
				modifier: 'formradiobutton-notext'
			},
			label: 'No Text',
			name: 'notext',
			preview: '@preview'
		}
	]
};
