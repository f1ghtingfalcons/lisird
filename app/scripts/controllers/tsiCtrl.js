angular.module('lisirdApp').controller('tsiCtrl', [
	'$scope', 
	'$http',
	'dateService',
	'dataFactory',
	function ($scope,$http,dateService,dataFactory) {
		$scope.datasetURI = 'http://webdev1.lasp.colorado.edu:57529/vivo/individual/n210';
		$scope.cadence="24hr";
		
		function initialize(){
			$scope.TSS_INDEPENDENT_VARIABLE = 'time';
			$scope.TSS_DEPENDENT_VARIABLE = 'tsi_1au';
			$scope.DYGRAPHS_FILL_VALUE = null; // See bottom of http://dygraphs.com/data.html#array
			$scope.getDataset();
			$scope.getVIVOData();
		}
		
		$scope.getDataset = function(){
			$http.get('json/sorce_tsi_24hr.das').success(function(data){
				dataFactory.setVariables($scope.TSS_INDEPENDENT_VARIABLE,$scope.TSS_DEPENDENT_VARIABLE,'',null,$scope.DYGRAPHS_FILL_VALUE);
				$scope.metadata=dataFactory.objectifyMetadata(data);
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
			var queryStr= 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX vsto: <http://escience.rpi.edu/ontology/vsto/2/0/vsto.owl#> PREFIX laspcms: <http://localhost:8080/laspcms#> SELECT ?about ?instrument ?project WHERE { <' + $scope.datasetURI + '> vsto:hasDescription ?about . <' + $scope.datasetURI + '> vsto:isMeasuredBy ?inst . ?inst rdfs:label ?instrument . ?inst vsto:isInstrumentOn ?dep . ?dep vsto:isDeploymentOn ?sc . ?sc laspcms:spacecraftHasProject ?proj . ?proj rdfs:label ?project }';
			var result = [];
			dataFactory.getSPARQLQuery(urlBase, queryStr).success(function (data) {
				$scope.error = '';
				if (data) {
					result=dataFactory.formatDatasetResults(data);
					$scope.about=result.about;
					$scope.instruments=result.instruments;
					$scope.mission=result.projects;
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
		};
		 
		initialize();
	}	
]);