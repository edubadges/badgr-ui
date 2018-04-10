module.exports = {
	label:"Margin Bottom",
	notes:"Adds a margin of gridspace to an element.",
	variants:[
    {
      context:{
        "classList?" : "l-marginBottom-1andhalfx"
      },
      label:"1.5x",
      name:"1andhalfx",
      notes:"Adds a margin of 1.5x gridspace to an element.",
    },
    {
      context:{
           "classList?" : "l-marginBottom-2x"
      },
      name:"2x",
      notes:"Adds a margin of 2x gridspace to an element.",
    },
    {
        context: {
            "classList?": "l-marginBottom-3x"
        },
        name:"3x",
        notes:"Adds a margin of 3x gridspace to an element.",
    },
    {
        context: {
            "classList?": "l-marginBottom-4x"
        },
        name:"4x",
        notes:"Adds a margin of 4x gridspace to an element.",
    },
    {
        context: {
            "classList?": "l-marginBottom-5x"
        },
        name:"5x",
        notes:"Adds a margin of 5x gridspace to an element.",
    }
	]
}