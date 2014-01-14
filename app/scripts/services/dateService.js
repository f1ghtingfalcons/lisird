angular.module('lisirdApp').factory('dateService', function ($http) {
	
	return {
		ymdToDate: ymdToDate,
		dateToYmd: dateToYmd,
	};
	
	function ymdToDate(ymd) {
		var ymdArray = ymd.split('-');
		var yyyy = parseInt(ymdArray[0], 10);
		var mm = parseInt(ymdArray[1], 10);
		var dd = parseInt(ymdArray[2], 10);
		return makeDate(yyyy, mm, dd);
	}
	
	function dateToYmd(d) {
		var date = new Date(d);
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
	}
	
	function makeDate(yyyy, mm, dd) {
		var retval = new Date(yyyy, mm - 1, dd); // Months count 0-11; adjust.
		retval.setFullYear(yyyy);
		// In constructor, years <100 are offset from 1900, not 0000. Be explicit with setFullYear.
		return retval;
	};
});