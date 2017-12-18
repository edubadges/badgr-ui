module.exports = {
	context: {
		id: 'formfield',
		inputText: true,
		label: 'Label',
		labelNote: '(Label Note)',
		textInput: {
			placeholder: 'Placeholder'
		}
	},
	collated: true,
	collator: function(markup, item) {
  	return `<tr><td>${item.label}</td><td>${markup}</td></tr>`
  },
	label: 'Form Field ',
	preview: '@preview--collated',
	variants:[
		{
			name: 'default',
			preview: '@preview'
		},
		{
			context: {
				errorText: 'Error message.',
				modifier: 'formfield-is-error'
			},
			label: 'Is Error',
			name: 'iserror',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'formfield-link'
			},
			name: 'link',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'formfield-locked'
			},
			name: 'locked',
			preview: '@preview'
		},
		{
			label: 'Image (Example)',
			name: 'imageexample',
			preview: '@preview',
			view: 'formfield--imageexample.hbs'
		},
		{
			context: {
				modifier: 'formfield-inlinelabel'
			},
			label: 'Inline Label',
			name: 'inlinelabel',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'formfield-limitedtextarea'
			},
			label: 'Limited Text Area',
			name: 'limitedtextarea',
			preview: '@preview'
		},
		{
			label: 'Image (Example)',
			name: 'imageexample',
			preview: '@preview',
			view: 'formfield--imageexample.hbs'
		},
		{
			context:{
				inputAction: {
					buttonContext: {
						text: 'Copy'
					},
					id: 'formfield',
					value: 'https://concentricsky.com'
				},
				inputText: false
			},
			label: 'With Action (Example) ',
			name: 'withactionexample',
			preview: '@preview'
		},
		{
			context:{
				errorText: 'Error message.',
				modifier: 'formfield-is-error',
				inputAction: {
					buttonContext: {
						text: 'Copy'
					},
					id: 'formfield',
					value: 'https://concentricsky.com'
				},
				inputText: false
			},
			label: 'With Action + Is Error (Example) ',
			name: 'withactioniserrorexample',
			preview: '@preview'
		},
		{
			context:{
				inputAuthButtons: true,
				inputText: false
			},
			label: 'With Auth Buttons (Example) ',
			name: 'withauthbuttonsexample',
			preview: '@preview'
		},
		{
			context: {
				inputText: {
					disabled: true,
					value: 'Entered Text'
				}
			},
			label: 'With Disabled (Example)',
			name: 'withdisabledexample',
			preview: '@preview'
		},
		{
			context: {
				labelElement: 'p',
				labelNote: '(<button type="button">generate random</button>)',
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
				}
			},
			label: 'With Dropzone Input (Example)',
			name: 'withdropzoneinputexample',
			preview: '@preview'
		},
		{
			context:{
				inputText: false,
				inputTextarea: true
			},
			label: 'With Textarea (Example)',
			name: 'withtextareaexample',
			preview: '@preview'
		},
		{
			context:{
				errorText: 'Error message.',
				modifier: 'formfield-is-error',
				inputText: false,
				inputTextarea: true
			},
			label: 'With Text Area + Is Error (Example)',
			name: 'withtextareaiserrorexample',
			preview: '@preview'
		}
	]
};
