/**
 * @depends LisirdDygraph.js
 */

(function() {
	LisirdDygraph.prototype.IS_TIMESERIES = true;
	LisirdDygraph.prototype.TSS_INDEPENDENT_VARIABLE = 'time';
	LisirdDygraph.prototype.MIN_YMD;
	LisirdDygraph.prototype.MAX_YMD;
	LisirdDygraph.prototype.DEFAULT_FROM;
	LisirdDygraph.prototype.DEFAULT_TO;

	// Modified from getSamples() in LisirdJqplot.js

	LisirdDygraph.prototype.jsonToArray = function(json) {
		var retval = this.createEmptyArray(json.length, 2); // 2 variables (x and y)
		for ( var i = 0; i < json.length; i++) {
			var j = 0;
			for ( var variable in json[i]) {
				if (json[i].hasOwnProperty(variable)) { // See: http://stackoverflow.com/questions/684672/
					retval[i][j] = this.extractSample(json[i], variable);
					j++;
				}
			}
		}
		return retval;
	};

	/**
	 * ASSUME: Sorted array
	 */

	LisirdDygraph.prototype.setRangeMinMaxDefault = function(fullDataArray) {
		this.MIN_YMD = this.dateToYmd(fullDataArray[0][0]);
		this.MAX_YMD = this.dateToYmd(fullDataArray[fullDataArray.length - 1][0]);
		this.DEFAULT_FROM = this.MIN_YMD;
		this.DEFAULT_TO = this.MAX_YMD;
	};

	LisirdDygraph.prototype.resetInputs = function() {
		this.setFromAndToInputs($(this.FROM), $(this.TO), this.DEFAULT_FROM, this.DEFAULT_TO);
	};

	LisirdDygraph.prototype.fetchJsonFromTss = function() {
		var url = this.TSS_PREFIX + this.TSS_DATASET_NAME + '.json?' + this.TSS_INDEPENDENT_VARIABLE + ',' + this.TSS_DEPENDENT_VARIABLE + nans;
		return this.fetchSomethingFromServer(url, 'json');
	};

	LisirdDygraph.prototype.getDatepickerSelectors = function() {
		return [this.FROM, this.TO];
	};

	LisirdDygraph.prototype.activateControls = function() {
		var _this = this; // jQuery changes the value of 'this' in callbacks. See: http://stackoverflow.com/questions/4818637
		$(this.FROM + ', ' + this.TO).keyup(function(event) {
			_this.enterKey(event, _this, function() {
				_this.zoomInputsChanged();
			});
		});
		$(this.PLOT_BUTTON).click(function(event) {
			if ($('#element1').length != 0 && $("#element1").val() !== LisirdDygraph.prototype.TSS_DEPENDENT_VARIABLE) {
				LisirdDygraph.prototype.TSS_DEPENDENT_VARIABLE = $("#element1").val();
				_this.getDygraph().destroy();
				_this.setDygraph();
				_this.initialize();
			}
		});
	};

	// This function let's you set what info to display on mouseover (ie: %Y = year, %m = month, etc.)
	LisirdDygraph.prototype.valueFormatter = function(ms) {
		return new Date(ms).strftime('%Y/%m/%d');
	};

	window.onload = function() {
		var myRadioButton = $("#multi");
		var myTextArea = $("#wl1");
		var myTextArea2 = $("#wl2");
		if (myRadioButton != null) {
			myRadioButton.onclick = function() {
				myTextArea.focus();
			};
		}
		if (myTextArea != null) {
			myTextArea.onfocus = function() {
				myRadioButton.checked = true;
			};
		}
		if (myTextArea2 != null) {
			myTextArea2.onfocus = function() {
				myRadioButton.checked = true;
			};
		}
	};
})();