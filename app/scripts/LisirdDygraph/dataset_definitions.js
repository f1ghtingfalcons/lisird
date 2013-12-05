var tsds = 'http://' + window.location.host + '/lisird/tss/';
var zipservlet = 'http://' + window.location.host + '/lisird/zip?';
var nans = '&replace_missing(NaN)';

datasetObject = {
	tsi : 'sorce_tsi_24hr',
	tsi6 : 'sorce_tsi_6hr',
	h_tsi: 'historical_tsi',
	lya : 'composite_lyman_alpha',
	f107 : 'noaa_radio_flux',
	ssn : 'american_sunspot_number',
	ssindex : 'sfo_sunspot_indices',
	mgii : 'composite_mg_index',
	nrlssi : 'nrlssi',
	smg : 'sorce_mg_index',
	ssi_sorce : 'sorce_ssi',
	ssi_uars : 'uars_solstice_ssi',
	ssi_sme : 'sme_ssi',
	see_l2_ssi: 'timed_see_egs_l2',
	see_l2_xps: 'timed_see_xps_l2',
	see_l3_ssi : 'timed_see_ssi',
	see_l3a_ssi : 'timed_see_ssi_l3a',
	see_l3_lines: 'timed_see_lines_l3',
	see_l3_xps: 'timed_see_diodes_l3',
	see_l3a_lines: 'timed_see_lines_l3a',
	see_l3a_xps: 'timed_see_diodes_l3a',
	see_l4_ssi : 'timed_see_ssi_l4',
	see_l4a_ssi : 'timed_see_ssi_l4a',
	
	amcLink : function (dataset) {
		return (tsds + this [dataset] + '.amc?');
	},
	infoLink : function(dataset) {
		return (tsds + this [dataset] + '.das');
	},
	csvLink : function(dataset) {
		return (tsds + this [dataset] + '.csv?');
	},
	jsonLink : function(dataset) {
		return (tsds + this [dataset] + '.json?');
	},
	spectrum : function(link) {
		return (link + 'time,wavelength,irradiance&');
	},
	timeseries : function(link) {
		return (link + 'time,irradiance&');
	},	
	download : function (dataset,format) {
		return (tsds + this [dataset] + '.' + format + '?');
	},
	
	info : function (dataset) {	
		//replaces getMetadataString
		requestURL = this.infoLink(dataset);

	    var httpRequest = $.ajax({
		    url: requestURL,
		    dataType: 'text',
		    success: function(data) {return(data);},
		    async: false
	    });
	    return (httpRequest.responseText);
	},
	
	minmaxDate : function(dataset) {
		// Get first and last date in a timeseries

		var requestURL = this.amcLink(dataset) + 'time';
		//var requestURL = this.jsonLink(dataset) + 'time';
		var httpRequest = $.ajax({
	         url:    requestURL,
	         success: function (data) {return data;},
	         async:   false //,
	         //dataType: 'json'
	    });
		
		var txt = httpRequest.responseText;
		var min = txt.substring(0,10);
		var max = txt.substring(txt.lastIndexOf('-')-7,txt.lastIndexOf('-')+5);
		max = max.replace(/^\s+|\s+$/g, '');//strip off whitespace and linebreaks
		max = max.substring(-10);
		return [min,max];
	},
	
	
	minmaxDateAsDateObject : function (dataset) {
		// Split each Date into year, month, and day components so that each
		// component can be accessed individually.
		var minMaxDate = this.minmaxDate(dataset);	// Don't inline this, for performance reasons.
		var minDateArray = minMaxDate[0].split('-');
		var maxDateArray = minMaxDate[1].split('-');
		
		var minYyyy = parseInt(minDateArray[0], 10);
		var minMm = parseInt(minDateArray[1], 10);
		var minDd = parseInt(minDateArray[2], 10);
		
		var maxYyyy = parseInt(maxDateArray[0], 10);
		var maxMm = parseInt(maxDateArray[1], 10);
		var maxDd = parseInt(maxDateArray[2], 10);
		
		// Feed year, month, and day components into a new Date object. Account
		// for the fact that Date object months count from zero, not one.
		// In the constructor years <100 are offset from 1900, not 0000, so be
		// explicit with .setFullYear().
		var minDate = new Date(minYyyy, minMm - 1, minDd);
		minDate.setFullYear(minYyyy);
		var maxDate = new Date(maxYyyy, maxMm - 1, maxDd);
		maxDate.setFullYear(maxYyyy);
		return [minDate, maxDate];	// Effectively return two values.
	},
	minmaxTime : function (dataset) {
		// get first and last date in a timeseries
		var requestURL = this.csvLink(dataset) + 'time';
		var httpRequest = $.ajax({
	         url:    requestURL,
	         dataType: 'text',
	         success: function (data) {return data;},
	         async:   false
	    });
		var txt = httpRequest.responseText;
		var min = txt.substring(txt.indexOf(')')+2,txt.indexOf(')')+8);
		min = min.replace(/^\s+|\s+$/g, '');//strip off whitespace and linebreaks
		var max = txt.substring(txt.lastIndexOf('.')-4,txt.lastIndexOf('.')+2);
		max = max.replace(/^\s+|\s+$/g, '');//strip off whitespace and linebreaks
		return [min,max];
	},

	minmaxWavelength : function (dataset) {
		var requestURL = this.amcLink(dataset)+ 'time[0],wavelength';
		var httpRequest = $.ajax({
	         url:    requestURL,
	         success: function (data) {return data;},
	         async:   false
	    });
		var txt = httpRequest.responseText;
		var min = txt.substring(txt.indexOf(',')+1, txt.indexOf('\n'));
		var max = txt.substring(txt.lastIndexOf(',')+1);
		min = min.replace(/^\s+|\s+$/g, ''); //strip off whitespace and linebreaks
		max = max.replace(/^\s+|\s+$/g, '');
		return [parseFloat(min),parseFloat(max)];
	},
	exactTime: function (dataset,approx,varName) {
		// get exact wavelength value
		var requestURL = this.csvLink(dataset) + varName + '&' + varName + '~' + approx;
		var httpRequest = $.ajax({
	         url: requestURL,
	         success: function (data) {return data;},
	         async: false
		});
		var time = httpRequest.responseText;
		time = time.replace(/^\s+|\s+$/g, ''); //strip off whitespace and linebreaks
		time = time.substring(time.length, time.length - 6);
		return time;
	},
	wavelength: function(dataset,approx_wl) {
		// get exact wavelength value
		var requestURL = this.amcLink(dataset) + 'wavelength[0]&wavelength~' + approx_wl;
		var httpRequest = $.ajax({
	         url: requestURL,
	         success: function (data) {return data;},
	         async: false
	    });
		var wl = httpRequest.responseText;
		wl = wl.substring(wl.length, wl.length - 10);
		wl = wl.replace(/^\s+|\s+$/g, ''); //strip off whitespace and linebreaks
		return wl;
	}
};