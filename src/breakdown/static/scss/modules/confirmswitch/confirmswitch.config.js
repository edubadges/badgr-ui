module.exports = {
	context: {
		partialData:{
			confim:{
				buttton:{
					"btnText?": "Confirm Remove"
				}
			},
			primaryButton: {
				button: {
					"btnText?": "Make Primary"
				}
			},
			resendButton: {
				button: {
					"btnText?": "Re-send Verification"
				}
			},
			removeButton:{
				button:{
					"btnText?": "Remove",
					"xselector?":"confirmswitch-x-toggle",
					"onclick?": "event.target.parentNode.parentNode.classList.toggle('confirmswitch-is-active')"
				}
			},
			cancel:{
				button:{
					"btnText?": "cancel",
					"xselector?":"confirmswitch-x-toggle",
					"onclick?": "event.target.parentNode.parentNode.classList.toggle('confirmswitch-is-active')"
				}
			},
		},
	},
	label:"Confirm Switch",
	notes:"The state before user input",
	variants:[
		{
			context: {
				confirmswitch: {
					"classList?": "confirmswitch-is-active"
				},
			},
			name: "is-active",
			notes: " When the user is prompted to confirm"
		}
	]
}