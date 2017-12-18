module.exports = {
	context:{
		buttonActionContext: {
			element: 'a',
			text: 'Add Badge',
		},
		heading: 'Web Design and Programming',
		headingNote: '12 of Something',
		headingXSelector: 'heading-x-image',
		id: 'heading',
		image: true,
		subHeading: 'World Wide Web Consortium'
	},
	variants:[
		{
			context:{
				modifier: 'heading-small'
			},
			label: 'Heading Small',
			name: 'small'
		},
		{
			context:{
				headingXSelector: 'heading-x-imageLarge'
			},
			label: 'With a Large Image (Example)',
			name: 'largeimageexample'
		},
		{
			context:{
				aside: true,
				headingXSelector: 'heading-x-imageLarge'
			},
			label: 'With Aside (Example)',
			name: 'withasideexample'
		}
	]
};
