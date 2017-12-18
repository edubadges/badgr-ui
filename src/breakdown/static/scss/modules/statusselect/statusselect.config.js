module.exports = {
	context:{
		//statusselect:{
		//		"state?":"default"
		//}
	},
	label:"Status Select",
	notes:"A styled select menu which has a status indicator.",
	variants:[
		{
			context:{
				statusselect:{
					"state?":"statusselect-is-active"
				}
			},
			label:"statusselect + statusselect-is-active",
			note:"Active states",
			name:"is-active"
		},
		{
			context:{
				statusselect:{
					"state?":"statusselect-is-inactive"
				}
			},
			label:"statusselect + statusselect-is-inactive",
			note:"Inactive State",
			name:"is-inactive"
		},
		{
			context:{
				statusselect:{
					"classList?":"statusselect-bordered",
				}
			},
			label:" Status select bordered",
			note:"A button-like appearance, for use in headers",
			name:"bordered"
		},
		{
			context:{
				statusselect:{
					"classList?":"statusselect-bordered",
					"state?":"statusselect-is-active"
				}
			},
			label:" Status select bordered + statusselect-is-active",
			note:"Bordered active",
			name:"bordered-isactive"
		},
		{
			context:{
				statusselect:{
					"classList?":"statusselect-bordered",
					"state?":"statusselect-is-inactive"
				}
			},
			label:"Status select bordered + statusselect-is-inactive",
			note:"Bordered inactive",
			name:"bordered-isinactive"
		}
	]
}
