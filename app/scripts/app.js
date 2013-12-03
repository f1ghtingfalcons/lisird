'use strict';

var lisirdApp = angular.module('lisirdApp', ['ngResource','ui.bootstrap'])
  .config(function ($routeProvider) {
    $routeProvider
		.when('/', {templateUrl: 'views/home/main.html', controller: 'MainCtrl'})
		.when('/about/contact', {templateUrl: 'views/about/contact.html'})
		.when('/about/lisird', {templateUrl: 'views/about/lisird.html'})
		.when('/data/tsi', {templateUrl: 'views/data/tsi.html'})
		.when('/data/tsi/sorce', {templateUrl: 'views/data/sorce.html'})
		.when('/about/latis', {templateUrl: 'views/about/latis.html'})
		.otherwise({redirectTo: '/'});
  });
