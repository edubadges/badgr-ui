module.exports = {
	variants:[
		{
			context: {
				state: {
					"classList?": "state-is-error"
				}
			},
			name: "is-error",
			notes: "Error"
		},
		{
			context: {
				state: {
					"classList?": "state-is-pending"
				}
			},
			name: "is-pending",
			notes: "Pending"
		},
		{
			context: {
				state: {
					"classList?": "state-is-success"
				}
			},
			name: "is-success",
			notes: "Success"
		},
		{
			context: {
				state: {
					"classList?": "state-pill"
				}
			},
			name: "state-pill",
			notes: "Alternate styling",
			preview: "@preview--mediumbackground",
		},
		{
			context: {
				state: {
					"classList?": "state-pill",
					"state?":"state-is-error"
				}
			},
			label: "State Pill + state-is-error",
			name:"state-pill-is-error",
			notes: "Error"
		},
		{
			context: {
				state: {
					"classList?": "state-pill",
					"state?":"state-is-pending"
				}
			},
			label: "State Pill + state-is-pending",
			name:"state-pill-is-pending",
			notes: "Error"
		},
		{
			context: {
				state: {
					"classList?": "state-pill",
					"state?":"state-is-success"
				}
			},
			label: "State Pill + state-is-success",
			name:"state-pill-is-success",
			notes: "Error"
		}
	]
}