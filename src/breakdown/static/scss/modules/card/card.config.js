module.exports = {
	context:{
		partialData : {
			button: {
				'l-offsetright?': true,
				'l-offsetbottom?': true,
				'btnText?': 'Share'
			}
		}
	},
	notes: 'Cards wrap lists of badges, pathways, and groups with a consistent card appearance.',
	preview: '@preview--none',
	variants: [
		{
			context: {
				modifier: 'card-largeimage'
			},
			label: 'Large Image',
			name: 'largeimage'
		},
		{
			label: 'Default (Example)',
			name: 'defaultexample',
			preview: '@preview',
			view: 'card--example.hbs'
		},
		{
			context: {
				card: {
					'classList?': 'card-action'
				}
			},
			label: 'Action (Example)',
			name: 'actionexample',
			preview: '@preview',
			view: 'card--example.hbs'
		},
		{
			context: {
				card: {
					'classList?': 'card-large'
				},
				titledivider:{
					'text?': 'Top Badges'
				}
			},
			label: 'Large (Example)',
			name: 'largeexample',
			preview: '@preview',
			view: 'card--example.hbs'
		},
		{
			context: {
				card: {
					'classList?': 'card-placeholder'
				}
			},
			label: 'Placeholder (Example)',
			name: 'placeholderexample',
			notes: 'Placeholder for where a new card may go',
			preview: '@preview',
			view: 'card--example.hbs'
		},
		{
			context: {
				card: {
					'classList?': 'card-collection'
				}
			},
			label: 'Collection (Example)',
			name: 'collectionexample',
			preview: '@preview',
			view: 'card--collectionexample.hbs'
		},
		{
			context: {
				card: {
					'classList?': 'card-actionsright'
				}
			},
			hidden: true,
			label: 'Actions Right (Example)',
			name: 'actionsrightexample',
			preview: '@preview',
			view: 'card--example.hbs'
		},
		{
			context: {
				card: {
					'classList?': 'card-pathway'
				}
			},
			hidden: true,
			label: 'Pathway Example',
			name: 'pathwayexample',
			preview: '@preview',
			view: 'card--example.hbs'
		},
		{
			context: {
				card: {
					'classList?': 'card-largeimage'
				}
			},
			hidden: true,
			label: 'Large Image (Example)',
			name: 'largeimageexample',
			preview: '@preview',
			view: 'card--example.hbs'
		}
	]
};
