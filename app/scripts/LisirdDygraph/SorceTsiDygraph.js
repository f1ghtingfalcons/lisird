(function () {
	LisirdDygraph.prototype.TSS_DATASET_NAME = 'sorce_tsi_24hr';
	LisirdDygraph.prototype.TSS_DEPENDENT_VARIABLE = 'tsi_1au';

	LisirdDygraph.prototype.extractSample = function (sample, variable) {
		if (variable === this.TSS_INDEPENDENT_VARIABLE) {
			return new Date(sample[variable]);
		} else if (variable === this.TSS_DEPENDENT_VARIABLE) {
			var retval = sample[variable];
			if (retval === this.getMetadata().fillValue) {
				return this.DYGRAPHS_FILL_VALUE;
			} else {
				return retval;
			}
		} else {
			throw 'Unknown variable encountered while parsing JSON: ' + variable;
		}
	};
})();