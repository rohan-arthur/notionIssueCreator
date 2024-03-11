export default {
	getPodLabels: () => {
		return Object.keys(getAllLabels.data.runners[0].issue.labels);
	},
	getLabelsForPod: () => {
		return getAllLabels.data.runners[0].issue.labels[filter_pod.selectedOptionValue].conditions.map((label) => getAllLabels.data.labels[label.label]).filter((label) => label !== undefined)
	}
}