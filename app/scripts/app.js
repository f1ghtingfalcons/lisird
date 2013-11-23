'use strict';

var lisirdApp = angular.module('lisirdApp', ['ngResource'])
  .config(function ($routeProvider) {
    $routeProvider
		.when('/', {templateUrl: 'views/home/main.html', controller: 'MainCtrl'})
		.when('/about/contact', {templateUrl: 'views/about/contact.html'})
		.when('/about/lisird', {templateUrl: 'views/about/lisird.html'})
		.otherwise({redirectTo: '/'});
  });
