module.exports = {
	label:"Children Horizontal",
	variants: [
		{
			context:{
				lchildrenhorizontal:{
					"classList?": "l-childrenhorizontal-right"
				}
			},
			name:"right"
		},
		{
			context:{
				lchildrenhorizontal: {
					"classList?": "l-childrenhorizontal-small"
				}
			},
			name:"small"
		},
		{
			context:{
				lchildrenhorizontal: {
					"classList?": "l-childrenhorizontal-spacebetween"
				}
			},
			name:"spacebetween"
		},
		{
			context:{
				lchildrenhorizontal: {
					"classList?": "l-childrenhorizontal-stackmobile"
				}
			},
			name:"stackmobile"
		}
	]
}