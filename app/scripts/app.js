'use strict';

var lisirdApp = angular.module('lisirdApp', ['ngResource','ngCookies','ui.bootstrap'])
  .config(function ($routeProvider, $httpProvider) {
    $routeProvider
		.when('/', {templateUrl: 'views/home/main.html', controller: 'MainCtrl'})
		.when('/datasets', {templateUrl: 'views/datasets.html'})
		.when('/sitemap', {templateUrl: 'views/sitemap.html'})
		//data
		.when('/data', {templateUrl: 'views/data/about.html'})
		.when('/data/ssi', {templateUrl: 'views/data/ssi.html'})
		.when('/data/tsi', {templateUrl: 'views/data/tsi.html'})
		.when('/data/composites', {templateUrl: 'views/data/composites.html'})
		.when('/data/mission_data', {templateUrl: 'views/data/mission_data.html'})
		.when('/data/models', {templateUrl: 'views/data/models.html'})
		.when('/data/space_weather', {templateUrl: 'views/data/space_weather'})
		.when('/data/tsi/sorce', {templateUrl: 'views/data/tsi/sorce.html', controller: 'tsiCtrl'})
		//missions
		.when('/missions', {templateUrl: 'views/missions/about.html'})
		.when('/missions/:mission', {templateUrl: 'views/missions/missions.html', controller: 'missionCtrl'})
		//tools
		.when('/tools', {templateUrl: 'views/tools/tools.html'})
		//about
		.when('/about/contact', {templateUrl: 'views/about/contact.html'})
		.when('/about/lisird', {templateUrl: 'views/about/lisird.html'})
		.when('/about/latis', {templateUrl: 'views/about/latis.html'})
		.when('/about/publications', {templateUrl: 'views/about/publications.html'})
		.otherwise({redirectTo: '/'});
		
		//enable crossdomain requests
	    $httpProvider.defaults.withCredentials = true;
	    delete $httpProvider.defaults.headers.common["X-Requested-With"];
	    delete $httpProvider.defaults.headers.post["Content-Type"];
  });
