module.exports = {
	collated:true,
	label:"Badge Button",
	variants:[
		{
			name:"default",
			hidden:true
		},
		{
			context:{
				badgeButton:{
					"classList?":"badgeButton-icon-pasteJson",
					"btnText?": "Paste Badge JSON"
				}
			},
			name:"pasteJson"
		},
		{
			context:{
				badgeButton:{
					"classList?":"badgeButton-icon-pasteUrl",
					"btnText?": "Upload Badge Image"
				}
			},
			name:"pasteUrl"
		},
		{
			context:{
				badgeButton:{
					"classList?":"badgeButton-icon-badgeUpload",
					"btnText?": "Upload Badge Image",
				}
			},
			name:"badgeUpload"
		},
		{
			context:{
				badgeButton:{
					"classList?":"badgeButton-icon-pasteJson",
					"btnText?": "Paste Badge JSON",
					"state?":"badgeButton-is-selected"
				}
			},
			name:"pasteJson-is-selected"
		},
		{
			context:{
				badgeButton:{
					"classList?":"badgeButton-icon-pasteUrl",
					"btnText?": "Upload Badge Image",
					"state?":"badgeButton-is-selected"
				}
			},
			name:"pasteUrl-is-selected"
		},
		{
			context:{
				badgeButton:{
					"classList?":"badgeButton-icon-badgeUpload",
					"btnText?": "Upload Badge Image",
					"state?":"badgeButton-is-selected"
				}
			},
			name:"badgeUpload-is-selected"
		}
	]
}