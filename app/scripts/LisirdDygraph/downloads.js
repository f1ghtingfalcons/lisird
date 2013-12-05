/*!
 * downloads.js v2.2
 * 
 * Created for downloading datasets either for dygraph pages or
 * pages that do not plot (e.g. Fism)
 * 
 * Written by Alexandria DeWolfe, 2009-2011
 * Edited by Lane Caudill, 2012
 */

// When users press the "enter" key in a text field; 
// this code reads the "functionName" from the page and calls that function
function enterkey(e, functionName, options) {
	if (e.keyCode == 13) {
		window[functionName](options);
	}
	return false;
}

// Is "Integrate" checkbox checked, if so un-hide wavelength range option in the page form
function integrateYN() {
	var intYN = document.getElementById('integrate');
	var intRange = document.getElementById('intRange');
	if (intYN.checked) {
		intRange.innerHTML = 'Wavelength range: <input type="text" id="wavelength1" tabindex="1" size="6" />' + 
						 ' - <input type="text" id="wavelength2" tabindex="1" size="6" />';
	} else {
		intRange.innerHTML = 'Wavelength: <input type="text" id="wavelength1" tabindex="1" size="6" />';
	}
	return false;
}

/*
 * General Download For Dygraph Pages
 * 
 * Get download type: csv, zip, etc. Check for multiple dataset selection, then either open dataset or makeZip
 */
function download(page) {

	var dataset = document.getElementById('dataset').value;
	var filetype = document.getElementById('filetype').value; // (zip, ascii, etc.)
	var downloaddata = document.getElementById('downloaddata');
	for ( var i = 0; i < downloaddata.length; i++) { // loop through dataset options.
		if (downloaddata[i].checked) {
			var downloadchoice = downloaddata[i].value;
			if (downloadchoice == 'full') { // download entire dataset
				if (filetype !== 'zip') { // for non-zip filetypes, which at the moment is only ASCII
					var downloadLink = datasetObject.download(dataset, filetype);
					window.open(downloadLink); // Open the link
				} else {
					urlString = datasetObject.csvLink(dataset);
					window.location = zipservlet + '"' + urlString + '"';
				}
			} 
			else if (downloadchoice == 'times') {
				var from = document.getElementById('from').value;
				var to = document.getElementById('to').value;
				if (filetype !== 'zip') {
					var downloadLink = datasetObject.download(dataset, filetype);
					var ssiDate = document.getElementById('ymd').value;
					ssiDate = checkDates(ssiDate, dataset);
					downloadLink = datasetObject.spectrum(downloadLink) + '&wavelength%3E=' + from + '&wavelength%3C=' + to;
					window.open(downloadLink);
				} else {
					urlString = datasetObject.csvLink(dataset) + '&wavelength%3E=' + from + '&wavelength%3C=' + to;
					window.location = zipservlet + '"' + urlString + '"';
				}
			} else if (downloadchoice == 'waves') {
				var from = document.getElementById('from').value;
				var to = document.getElementById('to').value;
				if (filetype !== 'zip') {
					var downloadLink = datasetObject.download(dataset, filetype);
					if (page == 'ssi_spectra') {
						var ssiDate = document.getElementById('ymd').value;
						ssiDate = checkDates(ssiDate, dataset);
						downloadLink = datasetObject.spectrum(downloadLink) + 'time~' + ssiDate;
					}
					window.open(downloadLink);
				} else {
					urlString = datasetObject.csvLink(dataset) + '&time%3E=' + from + '&time%3C' + to;
					if (page == 'ssi_spectra') {
						var ymd = document.getElementById('ymd').value;
						urlString = datasetObject.spectrum(datasetObject.csvLink(dataset)) + 'time~' + ymd + '&wavelength%3E=' + from + '&wavelength%3C' + to;
					}
					window.location = zipservlet + '"' + urlString + '"';
				}
			} else { // If the user wants to download only the displayed dataset
				var from = document.getElementById('from').value;
				var to = document.getElementById('to').value;

				if (filetype !== 'zip') { // For non-zip filetypes, which at the moment is only ASCII
					var downloadLink = datasetObject.download(dataset, filetype);

					if ((page != 'ssi_spectra') && (page != 'see_lines') && (page != 'options') && (page != 'ssi_ts') && (page != 'tsi')) { // For non-SSI datasets, get the time range
						from = checkDates(from, dataset, 'min');
						to = checkDates(to, dataset, 'max');
						downloadLink = downloadLink + '&time>=' + from + '&time<=' + to;
					} else if (page == 'tsi') {
						from = checkDates(from, dataset, 'min');
						to = checkDates(to, dataset, 'max');
						downloadLink = downloadLink + '&time>=' + from + '&time<=' + to + 'T12:00';
					} else if (page == 'options') {
						element = $("#element1").val();
						from = checkDates(from, dataset, 'min');
						to = checkDates(to, dataset, 'max');
						downloadLink = downloadLink + 'time,' + element + '&time>=' + from + '&time<=' + to;
					} else if (page == 'see_lines') {
						from = checkDates(from, dataset, 'min');
						to = checkDates(to, dataset, 'max');
						downloadLink = downloadLink + 'time,' + 'diode1' + '&time>=' + from + '&time<=' + to;
					} else { // SSI datasets are special as they have wavelength as well as time variables (more degrees of freedom)
						if (page == 'ssi_spectra') {
							var ssiDate = document.getElementById('ymd').value;
							ssiDate = checkDates(ssiDate, dataset);
							downloadLink = datasetObject.spectrum(downloadLink) + 'time~' + ssiDate + '&wavelength%3E=' + from + '&wavelength%3C=' + to;
						}
						if (page == 'ssi_ts') {
							from = checkDates(from, dataset, 'min');
							to = checkDates(to, dataset, 'max');
							if (downloadchoice == 'multi') {
								var wl1 = document.getElementById('wl1').value;
								var wl2 = document.getElementById('wl2').value;
								downloadLink = downloadLink + '&wavelength>=' + wl1 + '&wavelength<=' + wl2 + '&time>=' + from + '&time<=' + to;
							} else {
								var wl = document.getElementById('wavelength1').value;
								downloadLink = downloadLink + '&wavelength~' + wl + '&time>=' + from + '&time<=' + to;
							}
						}
					}
					window.open(downloadLink); // Open the link
				} else { // set up substring for URL, tack on variables for selection and add to the downloadLink zipservlet URL
					var urlString = datasetObject.csvLink(dataset) + '&time%3E=' + from + '&time%3C' + to;

					if (page == 'ssi_ts') { // special conditions for SSI pages due to different selection strings
						var wl = document.getElementById('wavelength1').value;
						urlString = urlString + '&wavelength~' + wl;
					}
					if (page == 'ssi_spectra') {
						var ymd = document.getElementById('ymd').value;
						urlString = datasetObject.spectrum(datasetObject.csvLink(dataset)) + 'time~' + ymd + '&wavelength%3E=' + from + '&wavelength%3C' + to;
					}
					window.location = zipservlet + '"' + urlString + '"';
				}
			}
		}
	}
}

function setEndDate() {
	var servlet = document.getElementById('servlet').value;
	var today = new Date();
	if (servlet == 'SEE_files') {
		today.setDate(today.getDate() - 2); // 2 days before today
	} else {
		today.setDate(today.getDate() - 3); // 3 days for fism/fism_dev
	}
	var yd = makeDOY(today);
	document.getElementById('enddate').value = yd;
	return yd;
}
function checkDataset() {
	var dataset = document.getElementById('dataset').value;
	if (dataset == 'flare') {
		document.getElementById('entire').innerHTML = "1982-2009 as .zip file";
		document.getElementById('startdate').value = "2010-001";
	}
	if (dataset == 'daily') {
		document.getElementById('entire').innerHTML = "Entire dataset as IDL .sav file";
		document.getElementById('startdate').value = "1947-045";
	}
}

/*
 * This will check page for date range input, which form is it (flare, daily, or SEE), and create an alert message to user if dates are not valid
 */
function validate(dataset) {
	var dataset = document.getElementById('dataset').value;
	var download = document.getElementById('download');
	var inputs = download.getElementsByTagName('input');
	var whichDownloadData = 'subset';
	for ( var i = 0; i < 2; i++) {
		if (inputs[i].checked) {
			whichDownloadData = inputs[i].value;
			if (whichDownloadData == 'entire') {
				if (dataset == 'flare') { // flare 1982-2009
					window.location = '/lisird/resources/fism/model_output/flare_1982_2009_zipped/FISM_flare_data.1982002.2009365.zip';
				}
				if (dataset == 'daily') { // entire daily dataset
					window.location = '/lisird/resources/fism/model_output/daily_merged/FISM_daily_merged_v01_01.sav';
				}
			}
		}
	}
	if (whichDownloadData == 'subset') {
		// Error codes for alert message (0 = Nan, 1 = Dates out of range, 2 = Start date later than end date)
		var code = 0, startyear = 0;
		var date1 = document.getElementById('startdate').value;
		var date2 = document.getElementById('enddate').value;
		var today = new Date();
		var todayYD = makeDOY(today);
		var validDates = true;
		var yToday = todayYD.substring(0, 4);
		if (todayYD < date2) {
			date2 = setEndDate();
		} // checks enddate <= today

		var y1 = parseInt(date1.substring(0, 4), 10);
		var d1 = parseInt(date1.substring(5), 10);
		var y2 = parseInt(date2.substring(0, 4), 10);
		var d2 = parseInt(date2.substring(5), 10);
		if (isNaN(Number(y1)), isNaN(Number(y2)), isNaN(Number(d1)), isNaN(Number(d2))) {
			validDates = false;
		}
		if (d1 >= 367 || d2 >= 367 || y1 > yToday) {
			validDates = false;
			code = 1;
		}
		if (d1 <= 0) {
			d1 = 1;
		}
		if (dataset == 'flare') {
			startyear = 1982;
			if (y1 < startyear || y2 < startyear || (y1 == startyear && d1 < 2)) {
				validDates = false;
				code = 1;
			}
			if (y1 == startyear && d1 < 2) {
				validDates = false;
				code = 1;
			}
			if ((y2 - y1) > 10) { // Make sure they're not downloading the whole flare dataset
				var format = $('#format');
				if (format == 'zip') {
					validDates = false;
					code = 3;
				}
			}
		}
		if (dataset == 'daily') {
			startyear = 1947;
			if (y1 < startyear || y2 < startyear || (y1 == startyear && d1 < 45)) {
				validDates = false;
				code = 1;
			}
		}
		if (dataset == 'see_l2a_egs') {
			startyear = 2002;
			if (y1 < startyear || y2 < startyear || (y1 == startyear && d1 < 39)) {
				validDates = false;
				code = 1;
			}
		}
		if (dataset == 'see_l2a_xps' || dataset == 'see_l3a') {
			startyear = 2002;
			if (y1 < startyear || y2 < startyear || (y1 == startyear && d1 < 22)) {
				validDates = false;
				code = 1;
			}
		}
		if (d2 !== '') {
			if (y2 < y1 || (y2 == y1 && d2 < d1)) {
				validDates = false;
				code = 2;
			}
		}
		if (validDates == true) {
			get_download(dataset, y1, y2, d1, d2);
		} else {
			alerttxt = 'Please enter valid dates. ';
			if (code == 1) {
				alerttxt = alerttxt + 'Valid dates for ' + dataset + ' data are ';
				if (dataset == 'flare') {
					alerttxt = alerttxt + '1982-002 to the present. The most recent data is up to ' + setEndDate();
				}
				if (dataset == 'daily') {
					alerttxt = alerttxt + '1947-045 to the present. The most recent data is up to ' + setEndDate();
				}
				if (dataset == 'see_l2a_egs') {
					alerttxt = alerttxt + '2002-039 to the present. The most recent data is up to ' + setEndDate();
				}
				if (dataset == 'see_l2a_xps' || dataset == 'see_l3a') {
					alerttxt = alerttxt + '2002-022 to the present. The most recent data is up to ' + setEndDate();
				}
			}
			if (code == 2) {
				alerttxt = alerttxt + 'The start date must be earlier than the end date.';
			}
			if (code == 3) {
				alerttxt = 'The time range you have selected for the flare dataset is too large to ' + 'dynamically generate a zip file at this time. There is currently a 10 year '
				          + 'limit to dynamic selection of a flare time range in zip format. To download the entire ' + 'flare dataset as a zip file, please download the 1982-2009 .zip file '
				          + 'and then select a smaller range with the "Select by date" option.';
			}
			alert(alerttxt);
		}
	}
}

/*
 * For non dygraph page data downloads (e.g Fism) This will create the url string to access appropriate servlet and get data
 */
function get_download(dataset, y1, y2, d1, d2) {
	var servlet = document.getElementById('servlet').value;
	var format = document.getElementById('format').value;

	var downloadURL = 'http://' + window.location.host + '/lisird/' + servlet + '?' + dataset;
	// e.g. http://wren:8180/lisird/fismFileServlet?daily&start=2010045&tar
	// http://wren:8180/lisird/fismFileServlet?daily&end=1955045&zip
	// http://wren:8180/lisird/SEE_files?see_l2a_egs&start=2002039&end=2002039

	// add trailing zeroes for DDD
	if (d1 < 100) {
		d1 = '0' + d1;
	}
	if (d1 < 10) {
		d1 = '0' + d1;
	}

	// If no end value selected
	if (d2 == '') {
		downloadURL = downloadURL + '&start=' + y1 + d1;
	}
	if (d2 !== '') {

		// Add trailing zeroes for DDD
		if (d2 < 100) {
			d2 = '0' + d2;
		}
		if (d2 < 10) {
			d2 = '0' + d2;
		}
		downloadURL = downloadURL + '&start=' + y1 + d1 + '&end=' + y2 + d2;
	}
	downloadURL = downloadURL + '&' + format;
	window.location = downloadURL;
}

function getToday() {
	var today = new Date();
	today.setDate(today.getDate() - 10); // Knock off 10 days to account for processing lag
	var year = today.getFullYear();
	var month = today.getMonth() + 1;
	var date = today.getDate();
	if (month < 10) {
		mm = '0' + mm;
	}
	if (date < 10) {
		dd = '0' + dd;
	}
	var ymd = [year, month, date];
	return ymd;
}

function makeDOY(inputDate) {
	/* Convert a js date object to a string with form YYYY-DDD */
	var ms1 = inputDate.getTime(); // input date in ms since 01/01/1970
	var year = inputDate.getFullYear();
	var ms0 = Date.parse('01/01/' + year);
	var doy = 1 + Math.floor(((ms1 - ms0) / 86400000));
	if (doy < 100) {
		doy = '0' + doy;
	}
	;
	if (doy < 10) {
		doy = '0' + doy;
	}
	;
	var yd = year + '-' + doy;
	return yd;
}

function makeYMD(inputDate) {
	// Convert javascript native dates into string YYYY-MM-DD
	var yyyy = inputDate.getFullYear();
	var mm = inputDate.getMonth() + 1;
	var dd = inputDate.getDate();
	if (mm < 10) {
		mm = '0' + mm;
	}
	if (dd < 10) {
		dd = '0' + dd;
	}
	var fullDate = yyyy + '-' + mm + '-' + dd;
	return fullDate;
}

/*
 * Checks for missing date values, sets defaults, and evaluates against limits of data (e.g. user can input "2005" and it'll default to 2005-01-01)
 */
function checkDates(inputDate, dataset, tag) {
	var year = inputDate.substring(0, 4);
	var month = inputDate.substring(5, 7);
	var date = inputDate.substring(8, 10);

	if (isNaN(Number(year))) {
		year = '0001';
	}
	if (isNaN(Number(month))) {
		month = '01';
	}
	if (isNaN(Number(date))) {
		date = '01';
	}
	if (year == '') {
		year = '0001';
	}
	if (month == '') {
		month = '01';
	}
	if (date == '') {
		date = '01';
	}

	// Validate form input: compare with dataset min/max.
	var dminmax = datasetObject.minmaxDate(dataset);
	var dmin = dminmax[0];
	var dmax = dminmax[1];
	var dateMin = new Date((dmin.substring(0, 4)), (dmin.substring(5, 7) - 1), (dmin.substring(8, 10)));
	var dateMax = new Date((dmax.substring(0, 4)), (dmax.substring(5, 7) - 1), (dmax.substring(8, 10)));
	var jsDate = new Date((year), (month - 1), (date));

	if (tag == '') {
		if (jsDate < dateMin) {
			tag == 'min';
		} // If date is smaller than minimum value for dataset, assume it's the minimum
		if (jsDate > dateMax) {
			tag == 'max';
		} // If date is larger than max value for dataset, assume it's the max
	}
	if (tag == 'min') {
		if ((jsDate < dateMin) || (jsDate > dateMax)) {
			jsDate = dateMin;
		}
	}
	if (tag == 'max') {
		if ((jsDate < dateMin) || (jsDate > dateMax)) {
			jsDate = dateMax + 1; // Add 1 to compensate for half-day problem in max date values. Changed 4/19/2011.
		}
	}

	var newDate = makeYMD(jsDate); // Get the exact date from dataset
	var requestURL = datasetObject.amcLink(dataset) + 'time&time~' + newDate;
	var httpRequest = $.ajax({
	     url : requestURL,
	     success : function(data) {
		     return (data);
	     },
	     async : false
	});

	newDate = httpRequest.responseText;
	newDate = newDate.replace(/^\s+|\s+$/g, ''); //strip off any whitespace
	return (newDate);
}