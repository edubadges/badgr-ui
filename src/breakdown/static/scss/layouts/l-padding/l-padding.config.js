module.exports = {
	label: 'Padding',
	notes: 'Adds a padding of gridspace to an element.',
	variants: [
		{
			context: {
				'classList?' : 'l-padding-2x'
			},
			name: '2x',
			notes: 'Adds a margin of 2x gridspace to an element.',
		},
		{
			context: {
				'classList?': 'l-padding-3x'
			},
			name: '3x',
			notes: 'Adds a margin of 3x gridspace to an element.',
		},
		{
			context: {
				'classList?': 'l-padding-4x'
			},
			name: '4x',
			notes: 'Adds a margin of 4x gridspace to an element.',
		}
	]
};
