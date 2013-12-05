/**
 * /lisird/scripts/LisirdDygraph/LisirdDygraph.js
 * 
 * This object plots data from the Time Series Server using dygraphs
 * (http://dygraphs.com/). It provides text box controls in addition to the
 * default dygraphs mouse controls. It also implements a dynamic "thinning"
 * algorithm to plot a limited amount of data at a time (while maintaining the
 * full data in memory), speeding user interaction with the plot.
 * 
 * There is no need to initialize this object directly. Simply include the
 * necessary files in the HTML (see below for which files to include).
 * 
 * This is an incomplete object. Other files must be included (in the HTML) with
 * this file to supply the unimplemented functions. Different behavior will
 * result from including different files. To create a complete object, include
 * all the files in one branch of this hierarchy tree, in the same order:
 * LisirdDygraph.js TimeseriesDygraph.js LyaDygraph.js SorceTsiDygraph.js
 * HistoricalTsiDygraph.js SorceMgiiDygraph.js SsiSpectraDygraph.js
 * SorceSsiSpectraDygraph.js UarsSsiSpectraDygraph.js SmeSsiSpectraDygraph.js
 * SeeSsiSpectraDygraph.js SsiTimeseriesDygraph.js SorceSsiTimeseriesDygraph.js
 * UarsSsiTimeseriesDygraph.js SmeSsiTimeseriesDygraph.js
 * SeeSsiTimeseriesDygraph.js For example, include LisirdDygraphs.js, followed
 * by SsiSpectraDygraph.js, followed by SeeSsiSpectraDygraph.js.
 * 
 * Timeseries pages have "from" and "to" text boxes formatted as date strings.
 * SSI Spectra plots have "from" and "to" text boxes formatted as floats, plus a
 * "ymd" text box formatted as a date string. SSI Timeseries plots have "from"
 * and "to" text boxes formatted as date strings, plus a "wavelength" text box
 * formatted as a float.
 * 
 * This entire file is wrapped in an "anonymous, self-invoking function":
 * (function () { ... })(); This limits the scope of new variables, which
 * prevents the global namespace from becoming polluted. See:
 * http://stackoverflow.com/questions/592414.
 * 
 * Dygraphs downloaded from: http://danvk.org/dygraphs/dygraph-combined.js
 * 
 * @author Terry Smith, with code modified from Alexandria DeWolfe's plotting.js
 * @since 2011-06-20
 * @depends dygraphs-combined.js (15 June 2011 or later)
 * @depends jQuery 1.6.1+
 * @depends jQuery UI 1.8.13+
 * @depends LisirdDatepicker.js
 * @tags jquery ui dygraphs dygraph lisird plotting widget datepicker
 * @constructor LisirdDygraph
 */

(function () {
	// Constructor. Attach it to the global 'window' object so it is accessible
	// to files that implement this object's missing functions.
	window.LisirdDygraph = function($) {
		this.initialize();
	};

	// Invoke the constructor when the DOM is ready.
	// Dygraphs changes the value of 'this' in callbacks. Save it for later.
	// Modified from: http://stackoverflow.com/questions/4818637

	jQuery(document).ready(function() {
		$(window).load(function() {
			graph = new LisirdDygraph();
		});
	});
	LisirdDygraph.prototype.initialize = function() {
		this.createPlotLoadingMessage();
		this.initializeMetadata();
		this.bootstrapDataAndInputs();
		this.createGraph();
		this.updateGraphWithMetadata();
		this.addPersistentLegend();
		this.getHelpTooltipHtml();
		
		// dygraphs disables select for all situations except panning in non-canvas-supported browsers.
		this.disableAbilityToSelect(this.PLOT_AREA);
		this.suggestCanvasBrowser();
		this.createDatepicker();
		this.activateControls();
		this.destroyPlotLoadingMessage();
	};

	LisirdDygraph.prototype.PLOT_AREA = '#plot1';
	LisirdDygraph.prototype.FROM = '#from';
	LisirdDygraph.prototype.TO = '#to';
	LisirdDygraph.prototype.PLOT_BUTTON = '#plot';
	LisirdDygraph.prototype.RESET = '#reset';
	LisirdDygraph.prototype.MOUSE_WHEEL_WORKS = !($.browser.mozilla) && !($.browser.opera);
	LisirdDygraph.prototype.IS_OLD_IE_BROWSER = ($.browser.msie && $.browser.version < 9.0);
	LisirdDygraph.prototype.DYGRAPHS_FILL_VALUE = null; // See bottom of http://dygraphs.com/data.html#array
	LisirdDygraph.prototype.DECIMAL_PRECISION = 4;
	LisirdDygraph.prototype.INPUTS_DECIMAL_PRECISION = 2; // for input selection fields (e.g.wavelength)
	LisirdDygraph.prototype.LYMAN_ALPHA_WAVELENGTH = 121.5;
	LisirdDygraph.prototype.TSS_PREFIX = 'http://' + location.host + '/lisird/tss/';
	LisirdDygraph.prototype.TSS_THIN = 1000000; // Empirically, most browsers cannot handle more than this.

	// Thinning function breaks down into 3 blocks:
	// BLOCK_THIN for browsers capable of handling more data points, 3 blocks combined total 1mil points
	// BLOCK_THIN_NO_CANVAS for browsers that don't currently support <canvas> element
	LisirdDygraph.prototype.LEFT_BLOCK_THIN = 250000; // 100;
	LisirdDygraph.prototype.MIDDLE_BLOCK_THIN = 500000; // 4800;
	LisirdDygraph.prototype.RIGHT_BLOCK_THIN = 250000; // 100;
	LisirdDygraph.prototype.LEFT_BLOCK_THIN_NO_CANVAS = 50;
	LisirdDygraph.prototype.RIGHT_BLOCK_THIN_NO_CANVAS = 50;
	LisirdDygraph.prototype.MIDDLE_BLOCK_THIN_NO_CANVAS = 400;
	LisirdDygraph.prototype.MOUSE_WHEEL_SENSITIVITY = 1 / 50; // Modified from http://dygraphs.com/tests/drawing.html
	LisirdDygraph.prototype.fullDataArray = [];
	LisirdDygraph.prototype.metadata = {};
	LisirdDygraph.prototype.dygraph = null;
	LisirdDygraph.prototype.DATEPICKER_DATE_FORMAT = 'yy-mm-dd';
	LisirdDygraph.prototype.LOADING_MESSAGE = '#loading-message';
	LisirdDygraph.prototype.UPGRADE_MESSAGE = '#upgrade-message';
	LisirdDygraph.prototype.LOADING_HTML = '<span class="red">Loading plot...</span><br><img src="/lisird/images/loading.gif">';
	LisirdDygraph.prototype.UPGRADE_HTML = 'We recommend for faster plotting and a better overall browsing experience,<br>'
	          + 'you upgrade to <a target="_blank" href="http://windows.microsoft.com/en-US/internet-explorer/products/ie/home"> Internet Explorer 9</a> '
	          + 'or use an alternative browser such as <a target="_blank" href="https://www.google.com/intl/en/chrome/browser/">Chrome</a> or '
	          + '<a target="_blank" href="http://www.mozilla.org/en-US/firefox/new/">Firefox</a>.';

	LisirdDygraph.prototype.getLeftBlockThin = function() {
		if (this.IS_OLD_IE_BROWSER) {return this.LEFT_BLOCK_THIN_NO_CANVAS;}
	};

	LisirdDygraph.prototype.getMiddleBlockThin = function() {
		if (this.IS_OLD_IE_BROWSER) {return this.MIDDLE_BLOCK_THIN_NO_CANVAS;}
	};

	LisirdDygraph.prototype.getRightBlockThin = function() {
		if (this.IS_OLD_IE_BROWSER) {return this.RIGHT_BLOCK_THIN_NO_CANVAS;}
	};

	LisirdDygraph.prototype.getFullDataArray = function() {
		return this.fullDataArray;
	};

	LisirdDygraph.prototype.setFullDataArray = function(newFullDataArray) {
		this.fullDataArray = newFullDataArray;
	};

	LisirdDygraph.prototype.getMetadata = function() {
		return this.metadata;
	};

	LisirdDygraph.prototype.setMetadata = function(newMetadata) {
		this.metadata = newMetadata;
	};

	LisirdDygraph.prototype.getDygraph = function() {
		return this.dygraph;
	};

	LisirdDygraph.prototype.setDygraph = function(newDygraph) {
		this.dygraph = newDygraph;
	};

	LisirdDygraph.prototype.wavelengthExists = function() {
		return $(this.WAVELENGTH).length !== 0;
	};

	LisirdDygraph.prototype.ymdExists = function() {
		return $(this.YMD).length !== 0;
	};

	LisirdDygraph.prototype.bootstrapDataAndInputs = function() {

		this.setControlMinMaxDefault();
		// 1. Determine the minimum, maximum, and default values of the
		// "control variable" input (if there is one)
		// by fetching and parsing a minimal subset of data from the TSS.

		this.setControlInput();
		// 2. Set the "control variable" input (if there is one) to its
		// default value.

		this.setFullDataArray(this.jsonToArray(this.fetchJsonFromTss()));
		// 3. Use the "control variable" input (if there is one) to fetch the
		// data from the TSS. Otherwise fetch
		// the data from the TSS without the "control variable" input.

		this.setRangeMinMaxDefault(this.getFullDataArray());
		// 4. Determine the minimum, maximum, and default values of the "from"
		// and "to" inputs by parsing the data
		// fetched from the TSS.

		this.setInputs();
		// 5. Set the "from" and "to" inputs to their default values.

		this.fixInputs();
		// 6. Fix the inputs for good measure.
	};

	/**
	 * Full list of options: http://dygraphs.com/options.html
	 */
	LisirdDygraph.prototype.createGraph = function() {
		var thinnedBlocks = this.thinAllBlocks(this.getFullDataArray(), 0, this.getFullDataArray().length);
		var dygraph = new Dygraph($(this.PLOT_AREA)[0], thinnedBlocks, {
		     colors : ['#ff2200'], // color of plot line
		     digitsAfterDecimal : this.DECIMAL_PRECISION,
		     gridLineColor : '#404040',
		     labels : ['', ''], // Initialized to avoid warning from dygraphs
		     labelsDivStyles : { // For styling mouseover label in plot
		          'background' : '#f7f7f7',
		          'textAlign' : 'right'
		          //'z-index': 10
		     },
		     labelsDivWidth : 722, // Width of mouseover label; Default: 250
		     logscale : false,
		     panEdgeFraction : 0.0000001, // Effectively zero; Default: null
		     yAxisLabelWidth : 100, // Default: 50
		     xAxisLabelWidth : 60, // Default: 50

		     // ********* Callbacks **********\\
		     axes : {
			     x : {valueFormatter : this.valueFormatter}
		     },
		     zoomCallback : this.zoomCallback,
		     interactionModel : {
		          mousedown : this.mousedown,
		          mousemove : this.mousemove,
		          mouseup : this.mouseup,
		          mouseout : this.mouseout,
		          dblclick : this.dblclick,
		          mousewheel : this.mousewheel
		     }
		});
		this.setDygraph(dygraph);
	};

	/**
	 * WARNING: Time-intensive function
	 */
	LisirdDygraph.prototype.setControlMinMaxDefault = function() {
		if (this.wavelengthExists() || this.ymdExists()) {
			var minmax = this.fetchControlMinMaxFromTss(); // Don't inline, for performance reasons.
			if (this.wavelengthExists()) {
				this.MIN_WAVELENGTH = minmax[0];
				this.MAX_WAVELENGTH = minmax[1];
				this.DEFAULT_WAVELENGTH = this.LYMAN_ALPHA_WAVELENGTH;
			} else if (this.ymdExists()) {
				this.MIN_YMD = minmax[0];
				this.MAX_YMD = minmax[1];
				this.DEFAULT_YMD = this.MAX_YMD;
			}
		}
	};

	LisirdDygraph.prototype.setControlInput = function() {
		if (this.wavelengthExists() || this.ymdExists()) {this.resetControlInput();}
	};

	LisirdDygraph.prototype.setInputs = function() {
		this.resetInputs();
	};

	LisirdDygraph.prototype.initializeMetadata = function() {
		var rawMetadata = this.fetchMetadataFromTss(); // Time-intensive operation
		var metadata = this.objectifyMetadata(rawMetadata);
		this.setMetadata(metadata);
	};

	LisirdDygraph.prototype.updateGraphWithMetadata = function() {
		this.updateTitle();
		this.updateYLabel();
		this.updateXLabel();
	};

	/**
	 * Yes, not every dataset has every property, meaning the parsing will
	 * return garbage for some properties. But datasets won't attempt to access
	 * properties they don't have, either.
	 */
	LisirdDygraph.prototype.objectifyMetadata = function(rawMetadata) {
		var title = rawMetadata.substring(rawMetadata.indexOf('title') + 7, rawMetadata.indexOf(';') - 1);
		var yAxisInfo = rawMetadata.substring(rawMetadata.indexOf(this.TSS_DEPENDENT_VARIABLE));
		
		var fillValueInfo = yAxisInfo.substring(yAxisInfo.indexOf('_FillValue'));
		var fillValue = fillValueInfo.substring(fillValueInfo.indexOf('_FillValue') + 11, fillValueInfo.indexOf(';'));
		fillValue = parseFloat(fillValue);
		
		var yTitle = yAxisInfo.substring(yAxisInfo.indexOf('name') + 6, yAxisInfo.indexOf(';') - 1);
		var yUnits = yAxisInfo.substring(yAxisInfo.indexOf('units') + 7);
		yUnits = yUnits.substring(0, yUnits.indexOf(';') - 1);
		
		var xAxisInfo = rawMetadata.substring(rawMetadata.indexOf(this.TSS_INDEPENDENT_VARIABLE));
		var xTitle = xAxisInfo.substring(xAxisInfo.indexOf('name') + 6, xAxisInfo.indexOf(';') - 1);
		var xUnits = xAxisInfo.substring(xAxisInfo.indexOf('units') + 7);
		xUnits = xUnits.substring(0, xUnits.indexOf(';') - 1);
		/*
		 * Dygraphs only requires plots that have a wavelength control variable to have MINIMUM_YMD and MAXIMUM_YMD, but the datepicker
		 * requires all plots have it. For most SSI datasets (except TIMED_SEE), calculating MINIMUM_YMD and MAXIMUM_YMD requires
		 * knowing the "parse start date". So extract it from the metadata for all datasets because it will be used by most of them.
		 */

		if (this.wavelengthExists()) {
			parseStartDate = xUnits.substring(xUnits.indexOf('since') + 6);
		} else {
			var ymdAxisInfo = rawMetadata.substring(rawMetadata.indexOf(this.TSS_CONTROL_VARIABLE));
			parseStartDate = ymdAxisInfo.substring(ymdAxisInfo.indexOf('since') + 6);
		}
		parseStartDate = this.ymdToDate(parseStartDate);
		return {
		     title : title,
		     fillValue : fillValue,
		     yTitle : yTitle,
		     yUnits : yUnits,
		     xTitle : xTitle,
		     xUnits : xUnits,
		     parseStartDate : parseStartDate
		};
	};

	LisirdDygraph.prototype.fetchMetadataFromTss = function() {
		var url = this.TSS_PREFIX + this.TSS_DATASET_NAME + '.das';
		return this.fetchSomethingFromServer(url, 'text');
	};
	
	// For the styling of these elements, see: "/lisird/CSS/LisirdDygraph.css"
	LisirdDygraph.prototype.getHelpTooltipHtml = function() {

		var retval = '<div class="absolute-top-right">';// background-image in css used here for info icon
		
		if (this.MOUSE_WHEEL_WORKS && this.IS_OLD_IE_BROWSER) {
			retval += '<div class="dygraphs-help-IE">';
		}
		if (this.MOUSE_WHEEL_WORKS && !this.IS_OLD_IE_BROWSER) {
			retval += '<div class="dygraphs-help">';
		}
		if (this.MOUSE_WHEEL_WORKS){
			retval += '<span><b>pan</b>&nbsp;  : shift + click + drag &nbsp;&nbsp;<br>'
			          + '<b>zoom in</b>&nbsp; : click + drag or scroll<br>'
			          + '<b>zoom out</b>&nbsp; : double click or scroll';
		} else {
			retval += '<div class="dygraphs-help2"><span>'
			          + '<b>pan</b>&nbsp; : shift + click + drag<br>'
			          + '<b>zoom in</b>&nbsp; : click + drag <br>'
			          + '<b>zoom out</b>&nbsp; : double click';
		}
		retval += '</span></div>';
		return retval;
	};

	/**
	 * In non-canvas-supported-browsers, the legend covers the plot title and therefore the help tooltip, which 
	 * is part of the plot title. If the plot title and legend were siblings, this issue would be fixed by raising the
	 * z-index of the plot title. However, the plot title's *parent* and the legend are siblings, so the z-index of the 
	 * plot title's *parent* must be raised. Raise it to 11, which is one more than the legend's z-index of 10. This work 
	 * cannot be done in the CSS because there is no simple selector for the plot title's parent container. See:
	 * http://www.tjkdesign.com/articles/everything_you_always_wanted_to_know_about_z-index_but_were_afraid_to_ask.asp
	 */
	LisirdDygraph.prototype.putTooltipOnTop = function() {
		if (this.IS_OLD_IE_BROWSER) {
			$('.dygraph-title').parent().css('zIndex', 10);
		}
	};

	LisirdDygraph.prototype.createDatepicker = function() {
		new LisirdDatepicker(this.getDatepickerSelectors(), // No need to save this to a variable for later.
		this.DATEPICKER_DATE_FORMAT, [this.MIN_YMD, this.MAX_YMD]);
	};

	LisirdDygraph.prototype.thinAllBlocks = function(data, startZoomIndex, endZoomIndex) {
		if (this.IS_OLD_IE_BROWSER) {
			var leftBlock = data.slice(0, startZoomIndex);
			var middleBlock = data.slice(startZoomIndex, endZoomIndex);
			var rightBlock = data.slice(endZoomIndex, data.length - 1);
			var thinnedLeftBlock = this.thinSingleBlock(leftBlock, this.getLeftBlockThin());
			var thinnedMiddleBlock = this.thinSingleBlock(middleBlock, this.getMiddleBlockThin());
			var thinnedRightBlock = this.thinSingleBlock(rightBlock, this.getRightBlockThin());
			var retval = [];
			if (thinnedLeftBlock.length !== 0) {
				retval = retval.concat(thinnedLeftBlock);
			}
			if (thinnedMiddleBlock.length !== 0) {
				retval = retval.concat(thinnedMiddleBlock);
			}
			if (thinnedRightBlock.length !== 0) {
				retval = retval.concat(thinnedRightBlock);
			}
		} else {retval = this.getFullDataArray();}
		return retval;
	};

	LisirdDygraph.prototype.thinSingleBlock = function(block, thinValue) {
		if (block.length === 0) {
			return block;
		}
		var stride = Math.ceil(block.length / thinValue); // Guarantee a non-zero integer.
		var thinnedBlock = [];
		for ( var i = 0; i < block.length - 1; i += stride) { // Always add the first sample.
			thinnedBlock.push(block[i]);
		}
		if (block.length > 1) { // For an array with a single element, don't add the element a second time.
			thinnedBlock.push(block[block.length - 1]); // Add the last sample for roundness.
		}
		return thinnedBlock;
	};

	LisirdDygraph.prototype.getRangeIndices = function() {
		var dataArray = this.getFullDataArray();

		if (this.IS_TIMESERIES) {
			var minX = new Date(this.getDygraph().xAxisRange()[0]);
			var maxX = new Date(this.getDygraph().xAxisRange()[1]);
		} else {
			minX = this.getDygraph().xAxisRange()[0];
			maxX = this.getDygraph().xAxisRange()[1];
		}
		var minXIndex = this.valueToIndex(dataArray, minX);
		var maxXIndex = this.valueToIndex(dataArray, maxX);
		return [minXIndex, maxXIndex];
	};

	LisirdDygraph.prototype.updateResolution = function() {
		var thinnedBlocks = this.thinAllBlocks(this.getFullDataArray(), this.getRangeIndices()[0], this.getRangeIndices()[1]);
		this.updateDygraphsData(thinnedBlocks);
		this.syncZoomInputsToPlot();
		this.updateTitle();
	};

	LisirdDygraph.prototype.addPersistentLegend = function() {
		// Legend in old IE browsers never clears whitespace, so leave legend on always
		if (this.IS_OLD_IE_BROWSER) {
			this.getDygraph().updateOptions({
				legend : 'always' // Default: 'onmouseover'
			});
		}
	};

	LisirdDygraph.prototype.updateDygraphsData = function(data) {
		this.getDygraph().updateOptions({
			file : data
		// Side effect: prevents vertical zooming
		});
	};

	LisirdDygraph.prototype.updateTitle = function() {
		var numArrayElements = this.getRangeIndices()[1] - this.getRangeIndices()[0];
		var resolution = '';
		var mainTitle = this.getMetadata().title;

		if (this.getMiddleBlockThin() <= numArrayElements) {
			resolution = ', ';
			resolution += ((this.getMiddleBlockThin() / numArrayElements) * 100).toFixed(0);
			resolution += '% resolution';
		}
		if (this.wavelengthExists()) {
			mainTitle += ', Wavelength=' + $(this.WAVELENGTH).val() + 'nm';
		} else if (this.ymdExists()) {
			mainTitle += ', ' + $(this.YMD).val();
		}
		this.getDygraph().updateOptions({
			title : mainTitle + resolution + this.getHelpTooltipHtml()
		});
	};

	LisirdDygraph.prototype.updateYLabel = function() {
		var ylabel = this.getMetadata().yTitle + ' (' + this.getMetadata().yUnits + ')';

		this.getDygraph().updateOptions({
		     labels : ['', this.getMetadata().yTitle],
		     ylabel : ylabel
		});
	};

	LisirdDygraph.prototype.updateXLabel = function() {
		if (this.IS_TIMESERIES) {
			xlabel = ' '; // Hide the text, but maintain the spacing.
		} else {
			xlabel = this.getMetadata().xTitle + ' (' + this.getMetadata().xUnits + ')';
		}
		this.getDygraph().updateOptions({
			xlabel : xlabel
		});
	};

	LisirdDygraph.prototype.unzoom = function() {
		// Modified from: http://dygraphs.com/tests/zoom.html
		// Use the fixed extreme values of the data instead of null to prevent the plot from shifting by 
		// one or two data points when double-clicking repeatedly.
		this.getDygraph().updateOptions({
			dateWindow : [this.getExtremes()[0], this.getExtremes()[1]], //x-axis
			valueRange : null // y-axis
		});
		this.updateResolution();
	};

	LisirdDygraph.prototype.syncZoomInputsToPlot = function() {
		var minX = this.getDygraph().xAxisRange()[0];
		var maxX = this.getDygraph().xAxisRange()[1];
		if (this.IS_TIMESERIES) {
			this.setFromAndToInputs($(this.FROM), $(this.TO), this.dateToYmd(new Date(minX)), this.dateToYmd(new Date(maxX)));
		} else {
			this.setFromAndToInputs($(this.FROM), $(this.TO), minX.toFixed(this.INPUTS_DECIMAL_PRECISION), maxX.toFixed(this.INPUTS_DECIMAL_PRECISION));
		}
	};

	LisirdDygraph.prototype.inputsChanged = function() {
		this.fixInputs();
		this.setFullDataArray(this.jsonToArray(this.fetchJsonFromTss()));
		this.setRangeMinMaxDefault(this.getFullDataArray());
		var thinnedBlocks = this.thinAllBlocks(this.getFullDataArray(), this.getDygraph().xAxisRange()[0], this.getDygraph().xAxisRange()[1]);
		this.updateDygraphsData(thinnedBlocks);
		this.zoomInputsChanged();
		this.updateTitle(); // Do this only after the inputs have settled.
	};

	LisirdDygraph.prototype.zoomInputsChanged = function() {
		// Calling this.fixZoomInputs() instead of this.fixInputs() to improve performance but also with
		// the knowledge that the non-zoom inputs are not being fixed and should therefore not be used in this function.
		this.fixZoomInputs();

		if (this.IS_TIMESERIES) {
			var from = this.yOrYmdToDate($(this.FROM).val()).getTime();
			var to = this.yOrYmdToDate($(this.TO).val()).getTime();
		} else {
			from = parseFloat($(this.FROM).val());
			to = parseFloat($(this.TO).val());
		}
		this.getDygraph().updateOptions({
			dateWindow : [from, to] // x-axis
		});
		this.updateResolution();
	};

	LisirdDygraph.prototype.getExtremes = function() {
		// For some reason this.getDygraph().xAxisExtremes() isn't constant, so use the values that were manually extracted from the data.
		// this.getDygraph().xAxisExtremes(); // Don't use; not constant

		if (this.IS_TIMESERIES) {
			return [this.ymdToDate(this.MIN_YMD).getTime(), this.ymdToDate(this.MAX_YMD).getTime()];
		} else {
			return [this.MIN_WAVELENGTH, this.MAX_WAVELENGTH];
		}
	};

	LisirdDygraph.prototype.fixZoom = function(minX, maxX) {
		// Swap backwards range so future calculations have sane values to work with
		if (minX > maxX) {
			var buffer = minX;
			minX = maxX;
			maxX = buffer;
		}
		var extremes = this.getExtremes();
		var smallestRange = (extremes[1] - extremes[0]) / this.getFullDataArray().length;
		var isTooZoomedLeft = minX < extremes[0];
		var isTooZoomedRight = maxX > extremes[1];
		var isTooZoomedIn = maxX - minX < smallestRange;
		var dateWindow;

		if (isTooZoomedLeft && isTooZoomedRight) {
			dateWindow = [extremes[0], extremes[1]]; // Reset both sides of zoom
		} else if (isTooZoomedLeft) {
			dateWindow = [extremes[0], maxX]; // Reset left side of zoom
		} else if (isTooZoomedRight) {
			dateWindow = [minX, extremes[1]]; // Reset right side of zoom
		} else if (isTooZoomedIn) {
			var extention = smallestRange / 2;
			dateWindow = [minX - extention, maxX + extention]; // Zoom out by equal amounts on either side
		} else {
			dateWindow = [minX, maxX]; // Valid zoom; don't alter
		}
		
		// set y-range values
		var minValue = this.getDygraph().yAxisRange()[0];
	     var maxValue = this.getDygraph().yAxisRange()[1];
	     valueRange = [minValue, maxValue];
	     
		this.getDygraph().updateOptions({
			dateWindow : dateWindow, // update x-axis values
			valueRange : valueRange // update y-axis values
		});
		this.updateResolution();
	};

	LisirdDygraph.prototype.zoomCallback = function(minX, maxX, yRange) {
		graph.fixZoom(minX, maxX, yRange);
	};

	LisirdDygraph.prototype.valueFormatter = function(value) {
		return "" + value;
	};

	LisirdDygraph.prototype.mousedown = function(event, g, context) {
		Dygraph.defaultInteractionModel.mousedown(event, g, context);
	};

	LisirdDygraph.prototype.mousemove = function(event, g, context) {
		// Modified from the dygraphs source code: http://dygraphs.com/jsdoc/symbols/src/dygraph.js.html
		if (context.isPanning && !this.IS_OLD_IE_BROWSER) { // Faster version for canvas-supported browsers only
			graph.updateResolution();
		}
		Dygraph.defaultInteractionModel.mousemove(event, g, context);
	};

	LisirdDygraph.prototype.mouseup = function(event, g, context) {
		if (this.IS_OLD_IE_BROWSER) { // Slower version for older IE browsers only
			graph.updateResolution();
		}
		// Modifies context (which was used previously)
		Dygraph.defaultInteractionModel.mouseup(event, g, context);
	};

	LisirdDygraph.prototype.mouseout = function(event, g, context) {
		Dygraph.defaultInteractionModel.mouseout(event, g, context);
	};

	LisirdDygraph.prototype.dblclick = function(event, g, context) {
		// Call unzoom instead of the built-in dygraphs function to prevent the plot from shifting by one or two data
		// points when double-clicking repeatedly.
		// Dygraph.defaultInteractionModel.dblclick(event, g, context); Don't use; shifts slightly
		graph.unzoom();
	};

	/**
	 * Modified from: http://dygraphs.com/tests/drawing.html Cleaned up as much
	 * as possible, but admittedly still esoteric.
	 */

	LisirdDygraph.prototype.mousewheel = function(event, g, context) {
		var oldRange = g.xAxisRange();
		var oldRangeWidth = oldRange[1] - oldRange[0];

		// Determine the factor by which to alter the zoom.
		var scrollFactor = event.detail ? event.detail * -1: event.wheelDelta / 40; // Normalize across browsers
		var deltaFactor = scrollFactor * graph.MOUSE_WHEEL_SENSITIVITY;

		// Determine the cursor's location within the plot as a percentage of its x-offset from the left-most edge of
		// the plot (entire dygraph minus y-axis). Regular (DOM) coordinates are relative to the entire dygraph
		// (plot plus y-axis). Relative coordinates are relative to the plot (entire dygraph minus y-axis).
		var plotCoords = [g.toDomCoords(oldRange[0], null)[0], g.toDomCoords(oldRange[1], null)[0]];
		var plotWidth = plotCoords[1] - plotCoords[0];
		var cursorCoord = event.offsetX;
		var relativeCursorCoord = cursorCoord - plotCoords[0];
		var relativeCursorPercent = plotWidth == 0 ? 0: (relativeCursorCoord / plotWidth); // Prevent divide-by-zero

		// Alter the zoom by the factor determined above. Center the zoom around the cursor's location by breaking the
		// factor into two weighted pieces.
		var delta = oldRangeWidth * deltaFactor;
		var deltaFragments = [delta * relativeCursorPercent, delta * (1 - relativeCursorPercent)];
		var dateWindow = [oldRange[0] + deltaFragments[0], oldRange[1] - deltaFragments[1]];
		graph.fixZoom(dateWindow[0], dateWindow[1]);
		Dygraph.cancelEvent(event);
	};

	/**************************************************************************
	 * "Input fixer" functions
	 */

	LisirdDygraph.prototype.fixZoomInputs = function() {
		var fixedZoomInputs = this._getFixedZoomInputs($(this.FROM), $(this.TO), this.DEFAULT_FROM, this.DEFAULT_TO);
		this.setFromAndToInputs($(this.FROM), $(this.TO), fixedZoomInputs[0], fixedZoomInputs[1]);
	};

	LisirdDygraph.prototype.fixInputs = function() {

		if (this.wavelengthExists()) {
			var fixedWavelengthInput = this._getFixedWavelengthInput($(this.WAVELENGTH), this.DEFAULT_WAVELENGTH);
			$(this.WAVELENGTH).val(fixedWavelengthInput).change();
			var fixedWavelengthForTss = this._getFixedWavelengthInputForTss($(this.WAVELENGTH));
			fixedWavelengthForTss = this.roundNumber(fixedWavelengthForTss, this.INPUTS_DECIMAL_PRECISION);
			$(this.WAVELENGTH).val(fixedWavelengthForTss).change();
		} else if (this.ymdExists()) {
			var fixedYmdInput = this._getFixedYmdInput($(this.YMD), this.DEFAULT_YMD);
			$(this.YMD).val(fixedYmdInput).change();
		}
		this.fixZoomInputs();
	};

	/**
	 * Private functions. Please don't call from outside of this section. Use
	 * the public functions (above) instead.
	 */
	LisirdDygraph.prototype._getFixedWavelengthInput = function($wavelength, defaultWavelength) {
		var wavelengthFloat = parseFloat($wavelength.val());
		var dataset = document.getElementById('dataset').value;

		if (isNaN(wavelengthFloat)) {
			return defaultWavelength;
		}
		if (wavelengthFloat < this.MIN_WAVELENGTH.toFixed(this.INPUTS_DECIMAL_PRECISION)) {
			alert('The minimum wavelength value for this data set is ' + this.MIN_WAVELENGTH.toFixed(this.INPUTS_DECIMAL_PRECISION));
			return this.MIN_WAVELENGTH;
		}
		if (wavelengthFloat > this.MAX_WAVELENGTH.toFixed(this.INPUTS_DECIMAL_PRECISION) && dataset!="see_l4_ssi" && dataset!="see_l4a_ssi") {
			alert('The maximum wavelength value for this data set is ' + this.MAX_WAVELENGTH.toFixed(this.INPUTS_DECIMAL_PRECISION));
			return this.MAX_WAVELENGTH;
		}
		var formattedWavelengthFloat = wavelengthFloat.toFixed(this.INPUTS_DECIMAL_PRECISION);
		return formattedWavelengthFloat;
	};

	/**
	 * Set wavelength to an actual TSS wavelength, not just a formatted number.
	 * WARNING: This function is time-intensive. Use minimally.
	 */
	LisirdDygraph.prototype._getFixedWavelengthInputForTss = function($wavelength) {
		var url = this.TSS_PREFIX + this.TSS_DATASET_NAME + '.json' + '?wavelength[0]&wavelength~' + $wavelength.val(); // TODO Un-hardcode?
		var json = this.fetchSomethingFromServer(url, 'json');
		var wavelength = json[0].Spectrum[0].wavelength; // TODO Un-hardcode?
		wavelength = wavelength.toFixed(this.INPUTS_DECIMAL_PRECISION);
		return wavelength;
	};

	LisirdDygraph.prototype._getFixedYmdInput = function($ymd, defaultYmd) {
		var ymdString = $ymd.val();
		// Approximately 100,000,000 years before and after 1970.
		// See: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date#Description
		var largestYear = 275754;
		var smallestYear = -271814;
		var ymdArray = ymdString.split('-');
		// Convert to a numerical array to fix the individual pieces of the date. Make sure every piece is numerical.

		var defaultYmdArray = defaultYmd.split('-');
		var correctLength = 3;
		var resetToDefault = false;

		for ( var i = 0; i < correctLength; i++) { // Base 10. See: http://stackoverflow.com/questions/850346
			ymdArray[i] = parseInt(ymdArray[i], 10);

			if (isNaN(ymdArray[i]) || ymdArray[i] < smallestYear || ymdArray[i] > largestYear) {
				// Help lazy users out by converting "2005" to "2005-01-01" for example.
				ymdArray[i] = 1; // However, if the user didn't even specify a year, then nothing can be salvaged.

				if (i === 0) {
					resetToDefault = true;
					break; // Continuing this loop would be pointless (ymd will be reset anyway).
				}
			}
		}

		// Consolidate into a Date object to fix the date as a whole
		if (resetToDefault) {
			var ymdDate = this.makeDate(defaultYmdArray[0], defaultYmdArray[1], defaultYmdArray[2]);
		} else {
			ymdDate = this.makeDate(ymdArray[0], ymdArray[1], ymdArray[2]);
		}
		if (ymdDate < this.ymdToDate(this.MIN_YMD)) {
			ymdDate = this.ymdToDate(this.MIN_YMD);
		}
		if (ymdDate > this.ymdToDate(this.MAX_YMD)) {
			ymdDate = this.ymdToDate(this.MAX_YMD);
		}
		return this.dateToYmd(ymdDate);
	};

	LisirdDygraph.prototype._getFixedZoomInputs = function($from, $to, defaultFrom, defaultTo) {
		if (this.IS_TIMESERIES) {
			var fixedFromInput = this._getFixedYmdInput($from, this.MIN_YMD);
			var fixedToInput = this._getFixedYmdInput($to, this.MAX_YMD);

			this.setFromAndToInputs($from, $to, fixedFromInput, fixedToInput);
			from = this.ymdToDate($from.val()).getTime();
			to = this.ymdToDate($to.val()).getTime();
		} else {
			var fixedFromInput = this._getFixedWavelengthInput($from, this.MIN_WAVELENGTH);
			var fixedToInput = this._getFixedWavelengthInput($to, this.MAX_WAVELENGTH);
			this.setFromAndToInputs($from, $to, fixedFromInput, fixedToInput);
			from = parseFloat($from.val());
			to = parseFloat($to.val());
		}
		if (from === to) {
			return [defaultFrom, defaultTo];
		} else if (from > to) { // TODO Redundant? The datepicker also prevents backwards date ranges.
			return [$to.val(), $from.val()]; // Reverse
		} else {
			return [$from.val(), $to.val()];
		}
	};

	/**************************************************************************
	 * General utility functions
	 */

	LisirdDygraph.prototype.setFromAndToInputs = function($from, $to, fromValue, toValue) {
		/*
		 * Only call .change() once *both* 'from' and 'to' have been fixed. This is because LisirdDatepicker.js assumes 
		 * when one input has changed, the other input is valid and can be used in calculations. But this may not be the 
		 * case if both inputs have not been fixed yet. See what LisirdDatepicker.js does after .change() event for details.
		 */
		$from.val(fromValue);
		$to.val(toValue);
		$from.change();
		$to.change();
	};

	LisirdDygraph.prototype.fetchSomethingFromServer = function(url, dataType) {
		var retval = 0;
		$.ajax({
		     url : encodeURI(url), // Just to be safe
		     async : false,
		     dataType : dataType,
		     success : function(data) {
			     retval = data;
		     }
		});
		return retval;
	};

	LisirdDygraph.prototype.createEmptyArray = function(xLength, yLength, zLength) {
		var retval = [];
		for ( var x = 0; x < xLength; x++) {
			retval[x] = [];
			for ( var y = 0; y < yLength; y++) {
				retval[x][y] = [];
				for ( var z = 0; z < zLength; z++) {
					retval[x][y][z] = null;
				}
			}
		}
		return retval;
	};

	LisirdDygraph.prototype.makeDate = function(yyyy, mm, dd) {
		var retval = new Date(yyyy, mm - 1, dd); // Months count 0-11; adjust.
		retval.setFullYear(yyyy);
		// In constructor, years <100 are offset from 1900, not 0000. Be explicit with setFullYear.

		return retval;
	};

	LisirdDygraph.prototype.datePlusDays = function(date, days) { // Unix epoch (1970-01-01)
		var retval = new Date(0);
		var daylightSavingOffsetMinutes = retval.getTimezoneOffset() - date.getTimezoneOffset();
		// Account for the possible Daylight Saving Time discrepency between
		// the Unix epoch and the date being added to.

		var millsInMinute = 1000 * 60;
		var millsInDay = millsInMinute * 60 * 24;
		var mills = (days * millsInDay) + (daylightSavingOffsetMinutes * millsInMinute); // Account for fractional dates
		retval.setMilliseconds(date.getTime() + mills); // setMilliseconds allows overflow
		return retval;
	};

	LisirdDygraph.prototype.yyyydddToDate = function(yyyyddd) { // Base 10. See: http://stackoverflow.com/questions/850346
		var yyyy = parseInt(yyyyddd.substring(0, 4), 10);
		var ddd = parseInt(yyyyddd.substring(4, 7), 10);
		// setFullYear pushes the date ahead by 365-31=334 days without also using this two-argument constructor.
		// Modified from: http://stackoverflow.com/questions/4049020
		var date = new Date(0, 0); // 1900-01-01
		date.setFullYear(yyyy);
		date.setDate(ddd);
		return date;
	};

	LisirdDygraph.prototype.ymdToDate = function(ymd) {
		// Why the string must be split:
		// http://stackoverflow.com/questions/4310953/invalid-date-in-safari
		// Base 10. See: http://stackoverflow.com/questions/850346
		var ymdArray = ymd.split('-');
		var yyyy = parseInt(ymdArray[0], 10);
		var mm = parseInt(ymdArray[1], 10);
		var dd = parseInt(ymdArray[2], 10);
		return this.makeDate(yyyy, mm, dd);
	};

	LisirdDygraph.prototype.yOrYmdToDate = function(ymd) {
		// taken from LisirdDygraph.prototype.ymdToDate and adjusted to allow
		// for displaying only year (ie:h_tsi)
		var ymdArray = ymd.split('-');

		if (ymdArray.length === 1) {
			var yyyy = parseInt(ymdArray[0], 10);
			var mm = 1;
			var dd = 1;
		} else {
			yyyy = parseInt(ymdArray[0], 10);
			mm = parseInt(ymdArray[1], 10);
			dd = parseInt(ymdArray[2], 10);
		}
		return this.makeDate(yyyy, mm, dd);
	};

	LisirdDygraph.prototype.dateToYmd = function(date) {
		var yyyy = date.getFullYear();
		var mm = (date.getMonth() + 1); // Months count 0-11; adjust.
		var dd = date.getDate();

		// Pad with zeros
		if (yyyy < 10) {yyyy = '000' + yyyy;} 
		else if (yyyy < 100)  {yyyy = '00' + yyyy;} 
		else if (yyyy < 1000) {yyyy = '0' + yyyy;}
		if (mm < 10) {mm = '0' + mm;}
		if (dd < 10) {dd = '0' + dd;}
		return yyyy + '-' + mm + '-' + dd;
	};

	LisirdDygraph.prototype.disableAbilityToSelect = function(selector) {
		// .disableSelection() is undocumented.
		// See: http://groups.google.com/group/jquery-ui/browse_thread/thread/07687f11ae23a392?pli=1
		jQuery(selector).disableSelection();
	};

	LisirdDygraph.prototype.suggestCanvasBrowser = function() {
		if (this.IS_OLD_IE_BROWSER) {
			$(this.UPGRADE_MESSAGE).append(this.UPGRADE_HTML);
		}
	};

	LisirdDygraph.prototype.valueToIndex = function(array, value) {
		for ( var i = 0; i < array.length; i++) {
			if (value <= array[i][0]) {
				return i;
			}
		}
		return -1; // Not found
	};

	/**
	 * Modified from: http://api.jquery.com/keyup/
	 */
	LisirdDygraph.prototype.enterKey = function($event, context, callback) {
		if ($event.which == '13') { // Enter key
			$event.preventDefault();
			callback.call(context);
		}
	};

	LisirdDygraph.prototype.createPlotLoadingMessage = function() {
		$(this.LOADING_MESSAGE).append(this.LOADING_HTML);
	};

	LisirdDygraph.prototype.destroyPlotLoadingMessage = function() {
		$(this.LOADING_MESSAGE).empty();
	};
	
	LisirdDygraph.prototype.roundNumber = function (num, dec) {
		var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
		return result;
	};
})();