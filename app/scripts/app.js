'use strict';

var lisirdApp = angular.module('lisirdApp', ['ngResource','ui.bootstrap'])
  .config(function ($routeProvider) {
    $routeProvider
		.when('/', {templateUrl: 'views/home/main.html', controller: 'MainCtrl'})
		//about
		.when('/about/contact', {templateUrl: 'views/about/contact.html'})
		.when('/about/lisird', {templateUrl: 'views/about/lisird.html'})
		.when('/about/latis', {templateUrl: 'views/about/latis.html'})
		.when('/about/latis', {templateUrl: 'views/about/latis.html'})
		//data
		.when('/data/tsi', {templateUrl: 'views/data/tsi.html'})
		.when('/data/tsi/sorce', {templateUrl: 'views/data/tsi/sorce.html'})
		//missions
		.when('/missions/:mission', {templateUrl: 'views/missions/missions.html', controller: 'missionCtrl'})
		.otherwise({redirectTo: '/'});
  });
