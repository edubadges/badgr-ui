module.exports = {
	variants:[
		{
			context: {
				pathway: {
					"state?": "pathway-is-activemove"
				}
			},
			label:"Pathway + is active move",
			name:"is-activemove"
		},
		{
			context: {
				pathway: {
					"state?": "pathway-is-inactivemove"
				}
			},
			label:"Pathway + is inactive move",
			name:"is-inactivemove"
		},
	]
}
