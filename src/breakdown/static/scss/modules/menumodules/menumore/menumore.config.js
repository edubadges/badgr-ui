module.exports = {
	context:{},
	label:"Menu More",
	notes:"This is not to be confused with the main navigation dropdown menu - which has a separate mobile appearance.",
	variants:[
		{
			context: {
				menumore: {
					"state?":"menumore-is-active"
				}
			},
			label:"Menu More + is-active",
			name:"Menu more"
		}
	]
}