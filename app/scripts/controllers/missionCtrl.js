angular.module('lisirdApp')
  .controller('missionCtrl', function ($scope, $routeParams, dataFactory) {
  	$scope.mission = $routeParams.mission;
  	$scope.about="Information Goes Here";
  	$scope.datasets = [];
  	$scope.image = '';
  	//get mission data from sparql query
  	$scope.vivoLocation = "http://lemr-dev:8080/vivo";
  	$scope.urlBase = 'http://lemr-dev:3030/VIVO/query';
	$scope.getMissionInfo = function () {
		$scope.queryStr = 'PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#> PREFIX vivo: <http://vivoweb.org/ontology/core#> PREFIX vitro: <http://vitro.mannlib.cornell.edu/ns/vitro/public#> PREFIX vsto: <http://escience.rpi.edu/ontology/vsto/2/0/vsto.owl#> SELECT DISTINCT ?mission ?instrument ?instrumentURI ?desc ?imageURL WHERE { ?thing a vsto:Deployment . ?thing rdfs:label ?mission . FILTER (REGEX(STR(?mission), "'+$scope.mission+'", "i")) . OPTIONAL{ ?thing vsto:hasInstrument ?instrumentURI . ?instrumentURI rdfs:label ?instrument } . OPTIONAL{ ?thing vsto:isDeploymentOn ?sc . ?sc vivo:description ?desc} . OPTIONAL{ ?sc vitro:mainImage ?mi . ?mi vitro:thumbnailImage ?thumb . ?thumb vitro:downloadLocation ?image . ?image vitro:directDownloadUrl ?imageURL}}';
		dataFactory.getSPARQLQuery($scope.urlBase, $scope.queryStr).success(function (data) {
			$scope.error = '';
			if (data) {
				$scope.results = data.results.bindings;
			}
		}).error(function (data, status) {
			$scope.error = 'Fuseki returned: ' + status;
		});
	};
	
	$scope.getDatasets = function () {
		$scope.queryStr = 'PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#> PREFIX vivo: <http://vivoweb.org/ontology/core#> PREFIX vitro: <http://vitro.mannlib.cornell.edu/ns/vitro/public#> PREFIX vsto: <http://escience.rpi.edu/ontology/vsto/2/0/vsto.owl#> SELECT DISTINCT ?dataset WHERE { ?thing a vsto:Deployment . ?thing rdfs:label ?mission . FILTER (REGEX(STR(?mission), "'+$scope.mission+'", "i")) . OPTIONAL{ ?thing vsto:hasInstrument ?instrumentURI . ?instrumentURI rdfs:label ?instrument } . OPTIONAL{ ?instrumentURI vsto:hasDataset ?ds . ?ds rdfs:label ?dataset}}';
		dataFactory.getSPARQLQuery($scope.urlBase, $scope.queryStr).success(function (data) {
			$scope.error = '';
			if (data) {
				$scope.datasets = data.results.bindings;
			}
		}).error(function (data, status) {
			$scope.error = 'Fuseki returned: ' + status;
		});
	};
	
	$scope.getMissionInfo();
	$scope.getDatasets();
  });