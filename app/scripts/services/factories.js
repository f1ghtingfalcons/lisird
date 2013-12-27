'use strict';
/* Services */
lisirdApp.factory('dataFactory', function ($http) {
	var dataFactory = {};
	dataFactory.getSPARQLQuery = function (urlBase, queryStr) {
		var query = 'query=' + escape(queryStr);
		return $http.post(urlBase, query, {
			headers: {
				'Accept': 'application/sparql-results+json',
				'Content-type': 'application/x-www-form-urlencoded'
			}
		});
	};
	return dataFactory;
});