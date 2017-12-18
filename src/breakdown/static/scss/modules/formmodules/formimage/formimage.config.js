module.exports = {
	label:"Form Image",
	notes:"A styled `input type=file` element.",
	variants: [
		{
			context: {
				formimage: {
					"classList?": "formimage-badgeUpload"
				}
			},
			label:"Form Image - Badge Upload",
			name:"badgeUpload",
			notes:"input styled for badge upload"
		}
	]
}