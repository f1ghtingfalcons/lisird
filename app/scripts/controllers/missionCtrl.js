angular.module('lisirdApp')
  .controller('missionCtrl', function ($scope, $routeParams) {
  	$scope.mission = $routeParams.mission;
  	$scope.about="Information Goes Here";
  	$scope.datasets = [];
  	$scope.image = '';
  	//get mission data from sparql query
  });