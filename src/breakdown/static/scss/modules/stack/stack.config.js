module.exports = {
	notes: "For use when an image (badge or issuer avatar) appear side by side, with optional secondary text.",
	variants: [
		{
			context: {
				stack: {
					"classList?": "stack-list"
				}
			},
			name: "list",
			notes: "Used when stack patterns appear in a list of link-able items"
		},
		{
			context: {
				stack: {
					"classList?": "stack-small"
				}
			},
			name: "small",
			notes: "Used in cards"
		},
	]
}