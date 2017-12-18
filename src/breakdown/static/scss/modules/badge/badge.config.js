module.exports = {
	collated:true,
	collator:collator("badge"),
	meta:{
		preview:
		{
			tableHeaders:["name","",""]
		}
	},
	notes:"The most abstract representation of a badge, just the image. The size of the badge module is determined by the size of the image.",
	preview: "@preview--tablewrapper",
	variants : [
		{
			context:{
				badge:{
					"classList?":"badge-is-active"
				}
			},
			notes:"Removes the base padding",
			name:"is-active"
		},
		{
			context:{
				badge:{
					"classList?":"badge-flat"
				}
			},
			notes:"Sets a border on the badge to indicate that it's active/selected",
			name:"flat"
		}
	]
}

function collator(baseClass){
	return function(markup, item){

		var className = item.context[baseClass] ? item.context[baseClass]["classList?"] : baseClass;
		var classlist = item.context[baseClass] ? "badge "+className: baseClass;
		return `
			<tr style="padding: 10px;">
				<td>${className}</td>
				<td style="padding-bottom:5px;">
					<div class="${classlist}">
						<img src="http://placehold.it/68x68" width="68" height="68" alt="Badge Description">
					</div>
				</td>
			</tr>
		`
	}
}