angular.module('lisirdApp').controller('tsiCtrl', [
	'$scope', 
	'$http',
	'dateService',
	'dataFactory',
	function ($scope,$http,dateService,dataFactory) {
		$scope.mission="SORCE";
		$scope.datasetURI = 'http://webdev1.lasp.colorado.edu:57529/vivo/individual/n210';
		
		function initialize(){
			$scope.TSS_INDEPENDENT_VARIABLE = 'time';
			$scope.TSS_DEPENDENT_VARIABLE = 'tsi_1au';
			$scope.DYGRAPHS_FILL_VALUE = null; // See bottom of http://dygraphs.com/data.html#array
			$scope.getDataset();
			$scope.getVIVOData();
		}
		
		$scope.getDataset = function(){
			$http.get('json/sorce_tsi_24hr.das').success(function(data){
				$scope.metadata=dataFactory.objectifyMetadata(data);
				dataFactory.setVariables($scope.TSS_INDEPENDENT_VARIABLE,$scope.TSS_DEPENDENT_VARIABLE,'',$scope.metadata.fillValue,$scope.DYGRAPHS_FILL_VALUE);
			});
			if($scope.TSS_DEPENDENT_VARIABLE === 'tsi_1au'){
				$http.get('json/sorce_tsi_24hr.json').success(function(data){
					$scope.graphData=dataFactory.jsonToArray(data);
					$scope.setRangeMinMaxDefault();
				});
			}
			if($scope.TSS_DEPENDENT_VARIABLE === 'tsi_true_earth'){
				$http.get('json/sorce_tsi_24hr_true.json').success(function(data){
					$scope.graphData=dataFactory.jsonToArray(data);
					$scope.setRangeMinMaxDefault();
				});
			}
		};
		
		$scope.getVIVOData = function(){
			var urlBase='http://lasp-db-dev:3030/VIVO/query';
			var queryStr= 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX vsto: <http://escience.rpi.edu/ontology/vsto/2/0/vsto.owl#> SELECT ?about ?instrument WHERE { <http://webdev1.lasp.colorado.edu:57529/vivo/individual/n210> vsto:hasDescription ?about . <http://webdev1.lasp.colorado.edu:57529/vivo/individual/n210> vsto:isMeasuredBy ?inst . ?inst rdfs:label ?instrument }';
			var result = [];
			dataFactory.getSPARQLQuery(urlBase, queryStr).success(function (data) {
				$scope.error = '';
				if (data) {
					result=dataFactory.formatDatasetResults(data);
					$scope.about=result.about;
					$scope.instruments=result.instruments;
				}
			}).error(function (data, status) {
				$scope.error = 'Endpoint returned: ' + status;
			});
		};
		
		$scope.updatePlot = function(){
			$scope.getDataset();
		};
		 
		$scope.setRangeMinMaxDefault = function() {
			$scope.MIN_YMD = dateService.dateToYmd($scope.graphData[0][0]);
			$scope.MAX_YMD = dateService.dateToYmd($scope.graphData[$scope.graphData.length - 1][0]);
			$scope.plotStartDate = $scope.MIN_YMD;
			$scope.plotEndDate = $scope.MAX_YMD;
		};
		 
		initialize();
	}	
]);