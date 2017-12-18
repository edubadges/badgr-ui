module.exports = {
	label:"Form Message",
	preview: "@preview--none",
	variants:[
		{
			context:{
				formmessage:{
					"classList?":"formmessage-is-active"
				}
			},
			label:"Formmessage + is-active",
			name:"formmessage-is-active",
			preview: "@preview"
		},
		{
			context:{
				formmessage:{
					"classList?":"formmessage-is-active",
					"state?":"formmessage-is-error"
				}
			},
			label:"Formmessage + is-Error",
			name:"formmessage-is-Error",
			preview: "@preview"
		},
		{
			context:{
				formmessage:{
					"classList?":"formmessage-is-active",
					"state?":"formmessage-is-pending"
				}
			},
			label:"Formmessage + is-Pending",
			name:"formmessage-is-Pending",
			preview: "@preview"
		},
		{
			context:{
				formmessage:{
					"classList?":"formmessage-is-active",
					"state?":"formmessage-is-success"
				}
			},
			label:"Formmessage + is-Success",
			name:"formmessage-is-Success",
			preview: "@preview"
		}
	]
}
