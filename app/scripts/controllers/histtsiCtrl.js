angular.module('lisirdApp').controller('histtsiCtrl', [
	'$scope', 
	'$http',
	'dateService',
	'dataFactory',
	function ($scope,$http,dateService,dataFactory) {
		function initialize(){
			$scope.TSS_INDEPENDENT_VARIABLE = 'time';
			$scope.TSS_DEPENDENT_VARIABLE = 'Irradiance';
			$scope.DYGRAPHS_FILL_VALUE = null; // See bottom of http://dygraphs.com/data.html#array
			$scope.getDataset();
		}
		
		$scope.getDataset = function(){
			$http.get('json/historical_tsi.das').success(function(data){
				dataFactory.setVariables($scope.TSS_INDEPENDENT_VARIABLE,$scope.TSS_DEPENDENT_VARIABLE,'',null,$scope.DYGRAPHS_FILL_VALUE);
				$scope.metadata=dataFactory.objectifyMetadata(data);
			});	
			$http.get('json/historical_tsi.json').success(function(data){
				$scope.graphData=dataFactory.jsonToArray(data);
				$scope.setRangeMinMaxDefault();
			});
		};
		
		$scope.updatePlot = function(){
			$scope.getDataset();
		};
		
		$scope.setRangeMinMaxDefault = function() {
			$scope.MIN_YMD = dateService.dateToYmd($scope.graphData[0][0]);
			$scope.MAX_YMD = dateService.dateToYmd($scope.graphData[$scope.graphData.length - 1][0]);
		};
			
		initialize();
	}
]);