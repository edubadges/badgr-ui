module.exports = {
	notes:"Standalone select input",
	variants:[
		{
			context:{
				select:{
					"classList?":"select-import select-inputonly"
				}
			},
			name:"import",
			notes:"Styling used in import table"
		},
		{
			context:{
				select:{
					"classList?":"select-inputonly"
				}
			},
			name:"inputonly",
			notes:"Hides the label"
		},
		{
			context:{
				select:{
					"classList?":"select-secondary"
				}
			},
			name:"secondary",
			notes:"Alternative styling, used on pathways"
		}
	]
}