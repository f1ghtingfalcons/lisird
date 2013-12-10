angular.module('lisirdApp').controller('tsiCtrl', function ($scope,$http) {
	
	
	
	function initialize(){
		$scope.TSS_INDEPENDENT_VARIABLE = 'time';
		$scope.TSS_DEPENDENT_VARIABLE = 'tsi_1au';
		$scope.DYGRAPHS_FILL_VALUE = null; // See bottom of http://dygraphs.com/data.html#array
		$scope.getDataset();
	}
	
	$scope.getDataset = function(){
		$http.get('json/sorce_tsi_24hr.das').success(function(data){
			$scope.metadata=$scope.objectifyMetadata(data);
		});
		if($scope.TSS_DEPENDENT_VARIABLE === 'tsi_1au'){
			$http.get('json/sorce_tsi_24hr.json').success(function(data){
				$scope.graphData=$scope.jsonToArray(data);
				$scope.setRangeMinMaxDefault();
			});
		}
		if($scope.TSS_DEPENDENT_VARIABLE === 'tsi_true_earth'){
			$http.get('json/sorce_tsi_24hr_true.json').success(function(data){
				$scope.graphData=$scope.jsonToArray(data);
				$scope.setRangeMinMaxDefault();
			});
		}
	};
	
	$scope.updatePlot = function(){
		$scope.getDataset();
	};
	 
	$scope.jsonToArray = function(json) {
		var retval = $scope.createEmptyArray(json.length, 2); // 2 variables (x and y)
		for ( var i = 0; i < json.length; i++) {
			var j = 0;
			for ( var variable in json[i]) {
				if (json[i].hasOwnProperty(variable)) { // See: http://stackoverflow.com/questions/684672/
					retval[i][j] = $scope.extractSample(json[i], variable);
					j++;
				}
			}
		}
		return retval;
	};
	
	$scope.extractSample = function(sample, variable) {
		if (variable === $scope.TSS_INDEPENDENT_VARIABLE) {
			return new Date(sample[variable]);
		} else if (variable === $scope.TSS_DEPENDENT_VARIABLE) {
			var retval = sample[variable];
			if (retval === $scope.metadata.fillValue) {
				return $scope.DYGRAPHS_FILL_VALUE;
			} else {
				return retval;
			}
		} else {
			throw 'Unknown variable encountered while parsing JSON: ' + variable;
		}
	};
	
	$scope.createEmptyArray = function(xLength, yLength, zLength) {
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
	
	$scope.objectifyMetadata = function(rawMetadata) {
		var title = rawMetadata.substring(rawMetadata.indexOf('title') + 7, rawMetadata.indexOf(';') - 1);
		var yAxisInfo = rawMetadata.substring(rawMetadata.indexOf($scope.TSS_DEPENDENT_VARIABLE));
		
		var fillValueInfo = yAxisInfo.substring(yAxisInfo.indexOf('_FillValue'));
		var fillValue = fillValueInfo.substring(fillValueInfo.indexOf('_FillValue') + 11, fillValueInfo.indexOf(';'));
		fillValue = parseFloat(fillValue);
		
		var yTitle = yAxisInfo.substring(yAxisInfo.indexOf('name') + 6, yAxisInfo.indexOf(';') - 1);
		var yUnits = yAxisInfo.substring(yAxisInfo.indexOf('units') + 7);
		yUnits = yUnits.substring(0, yUnits.indexOf(';') - 1);
		
		var xAxisInfo = rawMetadata.substring(rawMetadata.indexOf($scope.TSS_INDEPENDENT_VARIABLE));
		var xTitle = xAxisInfo.substring(xAxisInfo.indexOf('name') + 6, xAxisInfo.indexOf(';') - 1);
		var xUnits = xAxisInfo.substring(xAxisInfo.indexOf('units') + 7);
		xUnits = xUnits.substring(0, xUnits.indexOf(';') - 1);
		/*
		 * Dygraphs only requires plots that have a wavelength control variable to have MINIMUM_YMD and MAXIMUM_YMD, but the datepicker
		 * requires all plots have it. For most SSI datasets (except TIMED_SEE), calculating MINIMUM_YMD and MAXIMUM_YMD requires
		 * knowing the "parse start date". So extract it from the metadata for all datasets because it will be used by most of them.
		 */ 

		//if (this.wavelengthExists()) {
		//	parseStartDate = xUnits.substring(xUnits.indexOf('since') + 6);
		//} else {
		var ymdAxisInfo = rawMetadata.substring(rawMetadata.indexOf($scope.TSS_CONTROL_VARIABLE));
		var parseStartDate = ymdAxisInfo.substring(ymdAxisInfo.indexOf('since') + 6);
		//}
		parseStartDate = $scope.ymdToDate(parseStartDate);
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
	
	$scope.setRangeMinMaxDefault = function() {
		$scope.MIN_YMD = $scope.dateToYmd($scope.graphData[0][0]);
		$scope.MAX_YMD = $scope.dateToYmd($scope.graphData[$scope.graphData.length - 1][0]);
		$scope.plotStartDate = $scope.MIN_YMD;
		$scope.plotEndDate = $scope.MAX_YMD;
	};

	
	$scope.ymdToDate = function(ymd) {
		// Why the string must be split:
		// http://stackoverflow.com/questions/4310953/invalid-date-in-safari
		// Base 10. See: http://stackoverflow.com/questions/850346
		var ymdArray = ymd.split('-');
		var yyyy = parseInt(ymdArray[0], 10);
		var mm = parseInt(ymdArray[1], 10);
		var dd = parseInt(ymdArray[2], 10);
		return $scope.makeDate(yyyy, mm, dd);
	};
	
	$scope.dateToYmd = function(date) {
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
	
	$scope.makeDate = function(yyyy, mm, dd) {
		var retval = new Date(yyyy, mm - 1, dd); // Months count 0-11; adjust.
		retval.setFullYear(yyyy);
		// In constructor, years <100 are offset from 1900, not 0000. Be explicit with setFullYear.
		return retval;
	};
		
	initialize();
});