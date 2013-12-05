angular.module('lisirdApp').directive('ghDygraph', function(){
	return {
        restrict: 'A',
        replace: true,
        scope: {data: '='},
        link: function (scope, element, attrs) {
        	function valueFormatter(value) {
				return "" + value;
			};
        	
        	g = new Dygraph(element[0], scope.data, {
				colors : ['#ff2200'], // color of plot line
				digitsAfterDecimal : 4,
				gridLineColor : '#404040',
				labels : ['', ''], // Initialized to avoid warning from dygraphs
				labelsDivStyles : { // For styling mouseover label in plot
					'background' : '#f7f7f7',
					'textAlign' : 'right'
					//'z-index': 10
				},
				labelsDivWidth : 722, // Width of mouseover label; Default: 250
				logscale : false,
				panEdgeFraction : 0.0000001, // Effectively zero; Default: null
				yAxisLabelWidth : 100, // Default: 50
				xAxisLabelWidth : 60, // Default: 50
				
				axes : {
					x : {valueFormatter : valueFormatter}
				}
			});
        }
    };
});
