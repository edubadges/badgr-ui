module.exports = {
	notes: `Dialogs are generated using the standard HTML dialog element with a polyfill for browsers that do not yet support it. Animations only occur when the dialog is opened, this is the case for two reasons:
		* The backdrop element is created and destroyed when the dialog is opened and closed.
		* Because the backdrop can only animate in, we only animate the open state for the dialog element.`,
	preview: '@preview--none',
	variants:[
		{
			context: {
				modifier: 'dialog-large'
			},
			name: 'large'
		},
		{
			context: {
				modifier: 'dialog-titled'
			},
			name: 'titled'
		},
		{
			context:{
				dialog:{
					'classList?' : 'dialog-large'
				}
			},
			label: 'Large (Example)',
			name: 'largeexample',
			preview: '@preview',
			view: 'dialog--largeexample.hbs'
		},
		{
			context:{
				dialog:{
					'classList?' : 'dialog-titled'
				}
			},
			label: 'Titled (Example)',
			name: 'titledexample',
			preview: '@preview',
			view: 'dialog--titledexample.hbs'
		},
		{
			context:{
				formradiobutton:{
					'btnLabels?':[
						{
							btnLabel: 'Version 1.1'
						},
						{
							btnLabel: 'Version 2.0'
						}
					]
				},
				dialog:{
					'classList?' : 'dialog-titled'
				}
			},
			label: 'Titled With Version Select (Example)',
			name: 'titledwithversionselectexample',
			preview: '@preview',
			view: 'dialog--titledwithversionselectexample.hbs'
		}
	]
};
