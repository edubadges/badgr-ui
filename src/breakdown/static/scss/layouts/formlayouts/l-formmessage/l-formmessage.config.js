module.exports = {
	label: 'Form Message',
	notes: 'Positions formmessage module.',
	preview: '@preview--none',
	variants: [
		{
			context: {
				context: {
					formmessage : {
						'classList?': 'formmessage-is-active l-formmessage'
					}
				}
			},
			label: 'Default (Example)',
			name: 'defaultexample',
			preview: '@preview',
			view: 'l-formmessage--example.hbs'
		}
	]
};
