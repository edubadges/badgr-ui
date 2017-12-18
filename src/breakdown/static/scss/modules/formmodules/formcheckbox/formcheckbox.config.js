module.exports = {
	context: {
		id: 'form-checkbox',
		text: 'Remember Me'
	},
	label:"Form Checkbox",
	notes: "Standard checkbox with label text",
	variants:[
		{
			context:{
				formcheckbox:{
					"classList?":"formcheckbox-notext"
				}
			},
			label:"Class List (no text)",
			name:"notext",
			notes:"formcheckbox-notext"
		}
	]
}
