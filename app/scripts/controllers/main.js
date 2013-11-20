'use strict';

angular.module('lisirdApp')
  .controller('MainCtrl', function ($scope,$http) {
  	$http.get('json/metadata.json').success(function(data){
  		$scope.data=data;
  	});
});
