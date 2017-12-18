module.exports = {
	preview: '@preview--none',
	variants:[
		{
			context: {
				modifier: 'table-aligntop'
			},
			label: 'Align Top',
			name: 'aligntop'
		},
		{
			context: {
				modifier: 'table-dialog'
			},
			name: 'dialog'
		},
		{
			context: {
				modifier: 'table-import'
			},
			name: 'import'
		},
		{
			context: {
				modifier: 'table-issues'
			},
			name: 'issues'
		},
		{
			context: {
				modifier: 'table-dialog'
			},
			name: 'dialog'
		},
		{
			context: {
				modifier: 'table-staffdirector'
			},
			label: 'Staff Director',
			name: 'staffdirector'
		},
		{
			context:{
				partialData : {
					button: {
						'btnText?': 'Button'
					}
				}
			},
			label: 'Default (Example)',
			name: 'defaultexample',
			preview: '@preview',
			view: 'table--defaultexample.hbs'
		},
		{
			context: {
				tableContext: {
					modifier: 'table-aligntop'
				},
			},
			label: 'Align Top (Example)',
			name: 'aligntopexample',
			preview: '@preview',
			view: 'table--defaultexample.hbs'
		},
		{
			context: {
				tableContext: {
					modifier: 'table-dialog'
				}
			},
			label: 'Dialog (Example)',
			name: 'dialogexample',
			preview: '@preview',
			view: 'table--defaultexample.hbs'
		},
		{
			context: {
				tableContext: {
					'modifier': 'table-import'
				}
			},
			label: 'Import table (Example)',
			name: 'importexample',
			notes: 'Table nested within dialogs, used for selecting lists of items',
			preview: '@preview',
			view: 'table--importexample.hbs'
		},
		{
			label: 'Faked (Example)',
			name: 'fakedexample',
			notes: 'You can use the table module to build a fake table as well, assuming the DOM structure is consistent and the proper x-selectors are included.',
			preview: '@preview',
			view: 'table--fakedexample.hbs'
		}
	]
};
