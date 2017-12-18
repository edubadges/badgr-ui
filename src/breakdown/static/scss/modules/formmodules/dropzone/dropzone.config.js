module.exports = {
	collated: true,
	collator: function(markup, item) {
  	return `<tr><td>${item.label}</td><td>${markup}</td></tr>`
  },
	context: {
		text: 'Dropzone'
	},
	preview: '@preview--collated',
	variants: [
		{
			name: 'default',
			preview: '@preview'
		},
		{
			context: {
				element: 'label',
				modifier:  'dropzone-alt1',
				text: 'Upload Image'
			},
			label: 'Alt 1',
			name: 'alt1',
			preview: '@preview'
		},
		{
			context: {
				element: 'label',
				image: true,
				modifier:  'dropzone-alt1 dropzone-is-dropped',
				text: 'Upload Image'
			},
			label: 'Alt 1 + Is Dropped',
			name: 'alt1-isdropped',
			preview: '@preview'
		},
		{
			context: {
				element: 'label',
				modifier:  'dropzone-alt1 dropzone-is-error',
				text: 'Upload Image'
			},
			label: 'Alt 1 + Is Error',
			name: 'alt1-iserror',
			preview: '@preview'
		},
		{
			context: {
				modifier:  'dropzone-inline'
			},
			name: 'inline',
			preview: '@preview'
		}
	]
};
