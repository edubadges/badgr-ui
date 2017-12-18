module.exports = {
	collated:true,
	collator: collator('wrap'),
	meta:{
		preview:{
			tableHeaders:['ClassName','']
		}
	},
	notes:'Sets the background on any container element.',
	preview: '@preview--tablewrapper',
	variants: [
		{
			context: {
				wrap: {
					'classList?': 'wrap-light'
				},
			},
			name: 'light',
			notes: 'Lighter background color'
		},
		{
			context: {
				wrap: {
					'classList?': 'wrap-light4'
				},
			},
			name: 'light4',
		},
		{
			context: {
				wrap: {
					'classList?': 'wrap-rounded'
				},
			},
			name: 'rounded',
		},
		{
			context: {
				wrap: {
					'classList?': 'wrap-well'
				},
			},
			name: 'well'
		},
		{
			context: {
				wrap: {
					'classList?': 'wrap-welldark'
				},
			},
			label: 'Well Dark',
			name: 'welldark'
		}
	]
};

function collator(baseClass){
	return function(markup, item){

		var className = item.context[baseClass] ? item.context[baseClass]["classList?"] : baseClass;
		var classlist = item.context[baseClass] ? "wrap "+className: baseClass;
		return `
			<tr style="padding: 10px;">
				<td>${className}</td>
				<td style="padding-bottom:5px;"><div class="${classlist}" style="height:55px;width:100px;">&nbsp;</td>
			</tr>
		`
	}
}
