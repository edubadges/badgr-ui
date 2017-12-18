module.exports = {
	collated:true,
	collator: collator("bordered"),
	meta:{
		preview:{
			tableHeaders:["ClassName","","Handle"]
		}
	},
	notes:`Assists in creating borders around custom layouts and containers. Sub modules can be mixed and matched
	 ('.bordered.bordered-light.bordered-top' would put a lighter border on top for example.)`,
	preview: "@preview--tablewrapper",
	variants:[
		{
			context:{
				bordered:{
					"classList?":"bordered-light"
				}
			},
			name:"light",
			notes:"A lighter border"
		},
		{
			context:{
				bordered:{
					"classList?":"bordered-dark"
				}
			},
			name:"dark",
			notes:"A darker border"
		},
		{
			context:{
				bordered:{
					"classList?":"bordered-top"
				}
			},
			name:"top",
			notes:"Top border"
		},
		{
			context:{
				bordered:{
					"classList?":"bordered-right"
				}
			},
			name:"right",
			notes:"Right border"
		},
		{
			context:{
				bordered:{
					"classList?":"bordered-bottom"
				}
			},
			name:"bottom",
			notes:"Bottom border"
		},
		{
			context:{
				bordered:{
					"classList?":"bordered-left"
				}
			},
			name:"left",
			notes:"Left border"
		},
	]
}

function collator(baseClass){
	return function(markup, item){

		var className = item.context[baseClass] ? item.context[baseClass]["classList?"] : baseClass;
		var classlist = item.context[baseClass] ? "bordered "+className: baseClass;
		return `
			<tr style="padding: 10px;">
				<td>${className}</td>
				<td style="padding-bottom:5px;">
					<div class="${classlist}" style="height:35px;width:100px;">&nbsp;</div>
				</td>
			</tr>
		`
	}
}
