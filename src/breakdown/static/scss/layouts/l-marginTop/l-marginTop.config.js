module.exports = {
	label:"Margin Top",
	notes:"Adds a margin of gridspace to an element.",
	variants:[
		{
			context:{
				"classList?" : "l-marginTop-2x"
			},
			name:"2x",
			notes:"Adds a margin of 2x gridspace to an element.",
		},
		{
			context: {
				"classList?": "l-marginTop-3x"
			},
			name:"3x",
			notes:"Adds a margin of 3x gridspace to an element.",
		},
		{
			context: {
				"classList?": "l-marginTop-4x"
			},
			name:"4x",
			notes:"Adds a margin of 4x gridspace to an element.",
		},
        {
            context: {
                "classList?": "l-marginTop-5x"
            },
            name:"5x",
            notes:"Adds a margin of 5x gridspace to an element.",
        }
	]
}