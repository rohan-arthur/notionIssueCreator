export default {
	myVar1: [],
	myVar2: {},
	myFun1 () {

	},
	async myFun2 () {
		const response = await GetPageContentz.run();
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


	}
}