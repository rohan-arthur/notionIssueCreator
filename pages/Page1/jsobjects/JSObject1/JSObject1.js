export default {
	myVar1: [],
	myVar2: {},
	extractDBId () {
		const url = NotionLinkInput.text;

		// Extract the string using a regular expression
		const match = url.match(/\/([^\/?]+)(?:\?.*)?$/);

		// Check if there's a match and extract the string
		const extractedString = match ? match[1] : null;
		
		storeValue('DBID',extractedString);
		
		return(extractedString);
	},
	async extractDB () {
		const url = NotionLinkInput.text;

		// Extract the string using a regular expression
		const match = url.match(/\/([^\/?]+)(?:\?.*)?$/);

		// Check if there's a match and extract the string
		const extractedString = match ? match[1] : null;
		
		storeValue('DBID',extractedString);
		const notionDBData = await GetNotionDBCopy.run({dbid:appsmith.store.DBID});
		storeValue('titleProperty',this.getTitleProperty());
		storeValue('notionDBData',notionDBData);
		return notionDBData;
	},
	getTitleProperty () {
		const firstPage = GetNotionDB.data.results[0]; // Get the first page from the results

		if (!firstPage) return null; // Return null if there are no pages

		const properties = firstPage.properties;
		for (const [key, value] of Object.entries(properties)) {
			if (value.type === "title") {
				return key //{
					//propertyName: key,
					//titleContent: value.title[0]?.plain_text // Assuming there's at least one text element
				//};
			}
		}
		
		return null; // Return null if no title property is found
	},
	async createIssueIfNotExists () {
		//if(Table1.triggeredRow.githubURL)
		if(this.createIssueColumn()){
			try{
				if(Table1.selectedRow.properties["Github issue"].rich_text[0].plain_text){
					await showAlert("Issue already exists: "+ Table1.selectedRow.properties.GitHub_URL.rich_text[0].plain_text, "error");
					return Table1.selectedRow.properties.GitHub_URL.rich_text[0].plain_text;
				}
			}
			catch(e){ 
				const createdIssueResponse = await CreateIssue.run({title: Table1.selectedRow.Title, url: Table1.selectedRow.url});
				const issueLink = createdIssueResponse.html_url;
				const urlUpdated = await UpdateURLCopy.run({page:Table1.selectedRow.url.match(/-(\w+)$/)[1], issueLink: issueLink});
				//await showAlert("Issue created: "+ issueLink, "success");
				return urlUpdated;
			}
		}
	},
	async createIssueColumn(){
		if (Table1.selectedRow.properties['Github Issue']){
			return true;
		}else{
			const columnCreated = await CreateColumn.run();
			if(columnCreated)
				return true
			else
				return false;
		}
	},
	checkCondition (){
		try{if(Table1.selectedRow.properties["Github issue"].rich_text[0].plain_text)
			return "true"
			 }catch(e){
				 return "false"
			 }
	},
	async myFun2 () {
		//	use async-await or promises
		//	await storeValue('varName', 'hello world')
	}
}

//1ad4c80ae2b1401a83bfe4a89dae8dd3
//1ad4c80ae2b1401a83bfe4a89dae8dd3