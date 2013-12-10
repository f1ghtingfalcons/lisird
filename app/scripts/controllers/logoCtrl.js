angular.module('lisirdApp')
  .controller('logoCtrl', function ($scope,$location) {
  	$scope.location = [];
  	$scope.big = true;
  	$scope.$watch(function(){
  		$scope.location = $location.path().split('/');
  		$scope.big = true;
  		if(typeof($scope.location) !== 'undefined'){
	  		for(var i=0;i<$scope.location.length;i++){
	  			if( $scope.location[i] === 'data' ){
	  				if(typeof($scope.location[i+1]) !== 'undefined'){
	  					if($scope.location[i+1] !== ''){
	  						if(typeof($scope.location[i+2]) !== 'undefined'){
	  							if($scope.location[i+2] !== ''){
	  								$scope.big = false;
	  							}
	  						}
	  					}
	  				}
	  			}
	  		}
  		}
  	});
  });
