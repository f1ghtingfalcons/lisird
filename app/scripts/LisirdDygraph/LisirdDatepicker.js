/**
 * /lisird/scripts/LisirdDatepicker.js
 * 
 * This object is a wrapper for the jQuery UI Datepicker. It can either create
 * a single datepicker or combine two datepickers to form a "date range".
 * 
 * This object may be created at any time once the DOM is ready.
 * 
 * Example usage:
 * 		new LisirdDatepicker(selectors, dateFormat, minMaxDate);
 * 
 * @param selectors (string[1] or string[2])
 * 		jQuery selectors for the text box(es) the datepicker(s) will be attached
 * 		to, e.g. ['#ymd'] or ['#ymd-from', '#ymd-to']. An array with a single
 * 		element creates a single datepicker; an array with two elements combines
 * 		two datepickers to form a "date range". For a list of possible
 * 		selectors, see: http://api.jquery.com/category/selectors/.
 * @param dateFormat (string)
 * 		The date format the datepicker(s) will use, e.g. 'yy-mm-dd' or 'yy-oo',
 * 		formatted according to: http://docs.jquery.com/UI/Datepicker/formatDate.
 * 		The string must be precise to the day: either the year, month, and
 * 		day-of-month or the year and day-of-year must be present.
 * @param minMaxDate (Date[2])
 * 		The range of dates the datepicker(s) will consider valid.
 * 
 * NOTE: This object relies on .change() being called. If programmatically
 * changing the text box(es) this object is attached to, remember to call
 * change() immediately afterward. It is not called automatically (see bottom
 * of: http://forum.jquery.com/topic/jquery-val-and-change). For example:
 * 		$('#ymd').val(someValue); // text box changed programmatically...
 * 		$('#ymd').change(); // ...thus call .change() immediately afterward.
 * 		$('#ymd').val(someValue).change(); // ...or call it in the "chain".
 * However, if working with a "date range" and modifying both the "from" and
 * "to" text boxes at the same time, it is best to call .change() only after
 * both the "from" and "to" text boxes have been set. This is because this
 * object assumes that whenever .change() is called on a text box, the other
 * text box valid and can be used in calculations. But this may not always be
 * the case if the "from" and "to" text boxes are being changed together. For
 * example:
 * 		$('#from').val(someValue); // Don't call .change() until "to" is set.
 * 		$('#to').val(someValue);
 * 		$('#from').change(); // Call .change() immediately afterward.
 * 		$('#to').change();
 * 
 * @author Terry Smith
 * @since 2011-06-20
 * @depends jQuery 1.6.1+
 * @depends jQuery UI 1.8.13+
 * @tags jquery ui datepicker lisird plotting widget
 * @constructor LisirdDatepicker
 */

function LisirdDatepicker(selectors, dateFormat, minMaxDate) {
	// Modified from: https://developer.mozilla.org/en/JavaScript/Reference/Functions_and_function_scope/arguments/length
	if (arguments.length !== LisirdDatepicker.length) {
		throw 'Expected ' + LisirdDatepicker.length	+ ' arguments, instead got: ([' + selectors + '], "' + dateFormat + '", [' + minMaxDate + '])';
	}

	if (selectors.length === 1) {
		this.setYmd(selectors[0]);
		this.setSelector(this.getYmd());
	} else if (selectors.length === 2) {
		this.setFrom(selectors[0]);
		this.setTo(selectors[1]);
		this.setSelector(this.getFrom() + ', ' + this.getTo());
	} else {
		throw 'Expected one or two elements in selectors array, instead got: ' + selectors.length;
	}
	this.setDateFormat(dateFormat);
	
	if (minMaxDate.length === 2) {
		this.setMinDate(minMaxDate[0]);
		this.setMaxDate(minMaxDate[1]);
	} else {
		throw 'Expected two elements in minMaxDate array, instead got: '	+ minMaxDate.length;
	}
	this.initialize();
}

LisirdDatepicker.prototype.getFrom = function () { return this.from; };
LisirdDatepicker.prototype.getTo = function () { return this.to; };
LisirdDatepicker.prototype.getYmd = function () { return this.ymd; };
LisirdDatepicker.prototype.getSelector = function () { return this.selector; };
LisirdDatepicker.prototype.getMinDate = function () { return this.minDate; };
LisirdDatepicker.prototype.getMaxDate = function () { return this.maxDate; };
LisirdDatepicker.prototype.getDateFormat = function () { return this.dateFormat; };
LisirdDatepicker.prototype.setFrom = function (newFrom) { this.from = newFrom; };
LisirdDatepicker.prototype.setTo = function (newTo) { this.to = newTo; };
LisirdDatepicker.prototype.setYmd = function (newYmd) { this.ymd = newYmd; };
LisirdDatepicker.prototype.setSelector = function (newSelector) { this.selector = newSelector; };
LisirdDatepicker.prototype.setMinDate = function (newMinDate) { this.minDate = newMinDate; };
LisirdDatepicker.prototype.setMaxDate = function (newMaxDate) { this.maxDate = newMaxDate; };
LisirdDatepicker.prototype.setDateFormat = function (newDateFormat) { this.dateFormat = newDateFormat; };

LisirdDatepicker.prototype.initialize = function () {
	// jQuery changes the value of 'this' in callbacks. Save it for later.
	// Modified from: http://stackoverflow.com/questions/4818637
	var _this = this; // '_this' refers to the LisirdDatepicker object.

	$(this.getSelector()).datepicker({
		// Full list of options: http://jqueryui.com/demos/datepicker/#options
		changeMonth: true,
		changeYear: true,
		yearRange: '0000:nn', // ASSUME: No dataset extends beyond year 0000 or the current date.
		minDate: _this.getMinDate(),
		maxDate: _this.getMaxDate(),
		dateFormat: _this.getDateFormat(),
		onSelect: function () {
			_this.updateMinMax($(this)); // 'this' refers to the text box the datepicker is attached to.
		}
	});

	// Define the behavior when .change() is called. .change() must be called manually.
	$(this.getSelector()).change(function () {
		_this.updateMinMax($(this)); // 'this' refers to the text box the datepicker is attached to.
	});
};

/**
 * Each datepicker element has the notion of a minDate and a maxDate (see:
 * http://jqueryui.com/demos/datepicker/#options). Normally these values are
 * fixed, but if two datepickers are being combined to make a "date range", the
 * minDates and maxDates need to be continuously updated to prevent the user
 * from being able to create a backwards date range. Whenever one of the
 * datepickers changes its value, this function updates either minDate or
 * maxDate of the other datepicker.
 * 
 * Modified from: http://jqueryui.com/demos/datepicker/#date-range
 */

LisirdDatepicker.prototype.updateMinMax = function ($element) {
	if (typeof this.getFrom() === 'undefined') {
		return; // No range to restrict (only one datepicker on the page).
	}

	// Determine what needs to be updated (which option and whose option).
	if ($element.attr('id') === this.getFrom().substring(1)) { // Strip off the '#' before comparing
		$otherElement = $(this.getTo());
		option = 'minDate';
	} else if ($element.attr('id') === this.getTo().substring(1)) { // Strip off the '#' before comparing
		$otherElement = $(this.getFrom());
		option = 'maxDate';
	} else {
		throw 'Unhandled element: ' + $element;
	}

	// Create a date object based on the value in the text box.
	var settings = $element.data('datepicker').settings;
	var date = $.datepicker.parseDate(settings.dateFormat, $element.val(), settings);

	// Prevent out-of-range dates.
	if (date < this.getMinDate()) {
		date = this.getMinDate(); // Clip
	}
	if (date > this.getMaxDate()) {
		date = this.getMaxDate(); // Clip
	}

	// Perform the update.
	$otherElement.datepicker('option', option, date);
};