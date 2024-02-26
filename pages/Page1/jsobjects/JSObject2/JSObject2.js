export default {
	myVar1: [],
	myVar2: {},
	async getNotion () {
		const url = NotionLinkInput.text;

		// Extract the string using a regular expression
		const match = url.match(/\/([^\/?]+)(?:\?.*)?$/);

		// Check if there's a match and extract the string
		const extractedString = match ? match[1] : null;

		storeValue('DBID',extractedString);

		let notionRows = await GetNotionDB.run();
		//return notionRows.results[0].properties;

		if(await this.createIssueColumn(notionRows)){
			notionRows = await GetNotionDB.run();
		}
		storeValue("notionRows",notionRows);

		const extractedData = notionRows.results.map(page => {
			let titlePropertyKey = Object.keys(page.properties).find(key => page.properties[key].type === "title");
			let title = titlePropertyKey ? page.properties[titlePropertyKey].title.map(t => t.plain_text).join('') : "No title found";

			let githubIssuePropertyKey = "Github issue";
			let githubIssue = page.properties[githubIssuePropertyKey] && page.properties[githubIssuePropertyKey].rich_text ? 
					page.properties[githubIssuePropertyKey].rich_text.map(text => text.plain_text).join('') : "";

			let url = page.url; 

			return { Title: title, "Github issue": githubIssue , URL : url};
		});
		storeValue("notionData",extractedData);
		return extractedData;
	},
	async createIssueColumn(notionRows){
		if (notionRows.results[0].properties['Github Issue']){
			return true;
		}else{
			const columnCreated = await CreateColumn.run();
			if(columnCreated)
				return true
			else
				return false;
		}
	},
	async createIssueIfNotExists () {
		try{
			if(NotionTable.triggeredRow.properties["Github issue"].rich_text[0].plain_text){
				await showAlert("Issue already exists: "+ NotionTable.triggeredRow.properties.GitHub_URL.rich_text[0].plain_text, "error");
				return NotionTable.triggeredRow.properties.GitHub_URL.rich_text[0].plain_text;
			}
		}
		catch(e){ 
			const createdIssueResponse = await CreateIssue.run({title: NotionTable.triggeredRow.Title, url: NotionTable.triggeredRow.URL});
			const issueLink = createdIssueResponse.html_url;
			const urlUpdated = await UpdateURLCopy.run({page:NotionTable.triggeredRow.URL.match(/-(\w+)$/)[1], issueLink: issueLink});
			//await showAlert("Issue created: "+ issueLink, "success");
			return urlUpdated;
			
		}

	},
	async myFun2 () {
		//	use async-await or promises
		//	await storeValue('varName', 'hello world')
	}
}