module.exports = {
	preview: "@preview--none",
	variants:[
    {
		  context: {
				 hidden:{
					 "classList?":"hidden-is-tablet"
				 },
			 },
		  name:"hidden-is-tablet",
		  notes:"Only shows for tablets and up"
		},
		{
			context:{
				hidden:{
					"classList?":"hidden-is-desktop"
				}
			},
			name:"hidden-is-desktop",
			notes:"Only shows for desktops and up"
		},
		{
			context :{
				hidden:{
					"classList?":"hidden-is-lessThen-tablet"
				}
			},
			label:"Hidden Is Less Then Tablet",
			name:"hidden-is-lessThen-tablet",
			notes:"Only shows up for tablets or less."
		}
	]
}