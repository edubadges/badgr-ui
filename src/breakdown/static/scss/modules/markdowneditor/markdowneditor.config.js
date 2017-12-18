module.exports = {
	label: "Markdown Editor",
	notes:`Displays a markdown to html translation. This pattern provides"
 * Sub module 'markdowneditor-preview' which is used to display a preview of the user generated markdown.
 * Tab state 'markdowneditor-x-tab-is-active'.
 * A tool tip to display supported markdown.`,
	variants:[
		{
			context:{
				markdowneditor:{
					"x-selector?":"markdowneditor-x-preview",
				}
			},
			label:"Markdown Editor Preview",
			name:"editorPreview"
		},
	]
}
