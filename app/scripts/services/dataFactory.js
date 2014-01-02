angular.module('lisirdApp').factory('dataFactory', function ($http,dateService) {
	var TSS_INDEPENDENT_VARIABLE = '';
	var TSS_DEPENDENT_VARIABLE = '';
	var TSS_CONTROL_VARIABLE = '';
	var DYGRAPHS_FILL_VALUE = null;
	var metafill = '';
	
	return {
		jsonToArray: jsonToArray,
		objectifyMetadata: objectifyMetadata,
		setVariables: setVariables,
		getSPARQLQuery: getSPARQLQuery,
		formatDatasetResults: formatDatasetResults
	};
	
	function getSPARQLQuery(urlBase, queryStr) {
		var query = 'query=' + escape(queryStr);
		return $http.post(urlBase, query, {
			headers: {
				'Accept': 'application/sparql-results+json',
				'Content-type': 'application/x-www-form-urlencoded'
			}
		});
	}
	
	function formatDatasetResults(json){
		var about = '';
		var instruments = [];
		var projects = [];
		about=json.results.bindings[0].about.value;
		instruments=json.results.bindings[0].instrument.value;
		projects=json.results.bindings[0].project.value;
		return {
			'about': about,
			'instruments': instruments,
			'projects' : projects
		};
	}
	
	function setVariables(ind,dep,control,fill,meta_fill){
		TSS_INDEPENDENT_VARIABLE = ind;
		TSS_DEPENDENT_VARIABLE = dep;
		TSS_CONTROL_VARIABLE = control;
		DYGRAPHS_FILL_VALUE = fill;
		metafill = meta_fill;
	}
	
	function jsonToArray(json) {
		var tmp;
		var retval = createEmptyArray(json.length, 2); // 2 variables (x and y)
		for ( var i = 0; i < json.length; i++) {
			var j = 0;
			for ( var variable in json[i]) {
				if (json[i].hasOwnProperty(variable)) { // See: http://stackoverflow.com/questions/684672/
					tmp = extractSample(json[i], variable);
					if(tmp!==null){
						retval[i][j] = tmp;
					}
					j++;
				}
			}
		}
		return retval;
	}
		
	function extractSample(sample, variable) {
		if (variable === TSS_INDEPENDENT_VARIABLE) {
			return sample[variable];
		} else if (variable === TSS_DEPENDENT_VARIABLE) {
			var retval = sample[variable];
			if (retval === metafill) {
				return null;
			} else {
				return retval;
			}
		} else {
			throw 'Unknown variable encountered while parsing JSON: ' + variable;
		}
	}
		
	function createEmptyArray(xLength, yLength, zLength) {
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
	}
		
	function objectifyMetadata(rawMetadata) {
		var title = rawMetadata.substring(rawMetadata.indexOf('title') + 7, rawMetadata.indexOf(';') - 1);
		var yAxisInfo = rawMetadata.substring(rawMetadata.indexOf(TSS_DEPENDENT_VARIABLE));
		
		var fillValueInfo = yAxisInfo.substring(yAxisInfo.indexOf('_FillValue'));
		var fillValue = fillValueInfo.substring(fillValueInfo.indexOf('_FillValue') + 11, fillValueInfo.indexOf(';'));
		fillValue = parseFloat(fillValue);
		
		var yTitle = yAxisInfo.substring(yAxisInfo.indexOf('name') + 6, yAxisInfo.indexOf(';') - 1);
		var yUnits = yAxisInfo.substring(yAxisInfo.indexOf('units') + 7);
		yUnits = yUnits.substring(0, yUnits.indexOf(';') - 1);
		
		var xAxisInfo = rawMetadata.substring(rawMetadata.indexOf(TSS_INDEPENDENT_VARIABLE));
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
		var ymdAxisInfo = rawMetadata.substring(rawMetadata.indexOf(TSS_CONTROL_VARIABLE));
		var parseStartDate = ymdAxisInfo.substring(ymdAxisInfo.indexOf('since') + 6);
		//}
		parseStartDate = dateService.ymdToDate(parseStartDate);
		DYGRAPHS_FILL_VALUE=fillValue;
		return {
		     title : title,
		     fillValue : fillValue,
		     yTitle : yTitle,
		     yUnits : yUnits,
		     xTitle : xTitle,
		     xUnits : xUnits,
		     parseStartDate : parseStartDate
		}; 
	}
});