module.exports = {
	collated: true,
	collator: function(markup, item) {
  	return `<tr><td>${item.label}</td><td>${markup}</td></tr>`
  },
	context:{
		text: 'Button'
	},
	preview: '@preview--collated',
	variants: [
		{
			name: 'default',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-is-disabled'
			},
			label: 'Is Disabled',
			name: 'isdisabled',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-is-loading'
			},
			label: 'Is Loading',
			name: 'isloading',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-major'
			},
			name: 'major',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-major button-is-loading'
			},
			label: 'Major + Is Loading',
			name: 'major-isloading',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-major button-is-disabled'
			},
			label: 'Major + Is Disabled',
			name: 'major-isdisabled',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-primaryghost'
			},
			label: 'Primary Ghost',
			name: 'primaryghost',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-primaryghost button-is-loading'
			},
			label: 'Primary Ghost + Is Loading',
			name: 'primaryghost-isloading',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-primaryghost button-is-disabled'
			},
			label: 'Primary Ghost + Is Disabled',
			name: 'primaryghost-isdisabled',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-secondary'
			},
			label: 'Secondary',
			name: 'secondary',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-secondary button-is-loading'
			},
			label: 'Secondary + Is Loading',
			name: 'secondary-isloading',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-secondary button-is-disabled'
			},
			label: 'Secondary + Is Disabled',
			name: 'secondary-isdisabled',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-secondaryghost'
			},
			label: 'Secondary Ghost',
			name: 'secondaryghost',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-secondaryghost button-is-loading'
			},
			label: 'Secondary Ghost + Is Loading',
			name: 'secondaryghost-isloading',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-secondaryghost button-is-disabled'
			},
			label: 'Secondary Ghost + Is Disabled',
			name: 'secondaryghost-isdisabled',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-tertiary'
			},
			name: 'tertiary',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-tertiary button-is-loading'
			},
			label: 'Tertiary + Is Loading',
			name: 'tertiary-isloading',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-tertiary button-is-disabled'
			},
			label: 'Tertiary + Is Disabled',
			name: 'tertiary-isdisabled',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-tertiaryghost'
			},
			label: 'Tertiary Ghost',
			name: 'tertiaryghost',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-tertiaryghost button-is-loading'
			},
			label: 'Tertiary Ghost + Is Loading',
			name: 'tertiaryghost-isloading',
			preview: '@preview'
		},
		{
			context: {
				modifier: 'button-tertiaryghost button-is-disabled'
			},
			label: 'Tertiary Ghost + Is Disabled',
			name: 'tertiaryghost-isdisabled',
			preview: '@preview'
		}
	]
};
