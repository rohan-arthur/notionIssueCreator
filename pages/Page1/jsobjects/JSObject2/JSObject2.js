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


			return { Title: title, "Github issue": githubIssue , URL : url};
		});
		storeValue("notionData",extractedData);
		return extractedData;
	},

	async getNotionContent(url){
		const id = this.extractNotionPageId(url);
		const response = await GetPageContent.run({id: id});
		const blocks = response.results;
		let markdownContent = '';

		blocks.forEach(block => {
			switch (block.type) {
				case 'paragraph':
					if (block.paragraph.text.length > 0) {
						const paragraphText = block.paragraph.text.map(t => t.plain_text).join('');
						markdownContent += `${paragraphText}\n\n`;
					}
					break;
				case 'image':
					const imageUrl = block.image.file.url;
					markdownContent += `![Image](${imageUrl})\n\n`;
					break;
				case 'heading_3':
					const headingText = block.heading_3.text.map(t => t.plain_text).join('');
					markdownContent += `### ${headingText}\n\n`;
					break;
				case 'numbered_list_item':
					const listItemText = block.numbered_list_item.text.map(t => t.plain_text).join('');
					markdownContent += `1. ${listItemText}\n`;
					break;
				default:
					// For other types not handled above
					break;
			}
		});

		return markdownContent;
	},

	async extractNotionPageId(notionUrl){
		//const notionUrl = "https://www.notion.so/appsmith/test1-ed6fdf84f2814e0792c20eb06f34cb45"

		try {
			// This approach assumes the page ID is always at the end of the URL, following the last slash '/'
			const lastSlashIndex = notionUrl.lastIndexOf('/');

			if (lastSlashIndex === -1) {
				return null; // No slash found, invalid URL for this use case
			}

			// Extract everything after the last slash
			const lastSegment = notionUrl.substring(lastSlashIndex + 1);

			// Notion page IDs typically end the URL and are 32 characters long
			const possiblePageId = lastSegment.split('-').pop();

			if (possiblePageId.length === 32) {
				return possiblePageId; // Return the page ID if it's the correct length
			}

			return null; // Return null if the length isn't right, indicating it's not a valid page ID
		} catch (error) {
			console.error("Error parsing URL:", error);
			return null; // Return null if any errors occur (e.g., invalid URL format)
		}
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
			const createdIssueResponse = await CreateIssue.run({title: NotionTable.triggeredRow.Title, url: NotionTable.triggeredRow.URL, pageContent: this.getNotionContent(NotionTable.triggeredRow.URL)});
			const issueLink = createdIssueResponse.html_url;
			const urlUpdated = await UpdateURLCopy.run({page:NotionTable.triggeredRow.URL.match(/-(\w+)$/)[1], issueLink: issueLink});
			//await showAlert("Issue created: "+ issueLink, "success");
			return urlUpdated;

		}

	},
	async myFun2 () {
		//	use async-await or promises
		//	await storeValue('varName', 'hello world')
	},
	async createIssueIfNotExists_debug () {
		try{
			if(NotionTable.selectedRow.properties["Github issue"].rich_text[0].plain_text){
				await showAlert("Issue already exists: "+ NotionTable.selectedRow.properties.GitHub_URL.rich_text[0].plain_text, "error");
				return NotionTable.selectedRow.properties.GitHub_URL.rich_text[0].plain_text;
			}
		}
		catch(e){ 
			const createdIssueResponse = await CreateIssue.run({title: NotionTable.selectedRow.Title, url: NotionTable.selectedRow.URL});
			const issueLink = createdIssueResponse.html_url;
			const urlUpdated = await UpdateURLCopy.run({page:NotionTable.selectedRow.URL.match(/-(\w+)$/)[1], issueLink: issueLink});
			//await showAlert("Issue created: "+ issueLink, "success");
			return urlUpdated;

		}

	}
}