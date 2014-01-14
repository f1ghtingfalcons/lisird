angular.module('lisirdApp').directive('ghDygraph', function(){
	return {
        restrict: 'A',
        replace: true,
        scope: {
        	data: '=',
        	metadata: '=',
        	start: '=',
        	end: '='
        },
        link: function (scope, element, attrs) {           	
        	
        	function valueFormatter(value) {
				return "" + value;
			};
			
			function updateTitle(){
				if(!scope.g){
					return;
				}
				var mainTitle = scope.metadata.title;
				scope.g.updateOptions({
					title : mainTitle + getHelpTooltipHtml()
				});
			}
			
			function updateYLabel() {
				if(!scope.g){
					return;
				}
				var ylabel = scope.metadata.yTitle + ' (' + scope.metadata.yUnits + ')';
		
				scope.g.updateOptions({
				     labels : ['', scope.metadata.yTitle],
				     ylabel : ylabel
				});
			};
					
			function updateXLabel() {
				if(!scope.g){
					return;
				}
				xlabel = scope.metadata.xTitle + ' (' + scope.metadata.xUnits + ')';
				scope.g.updateOptions({
					xlabel : xlabel
				});
			};
			
			function updateXRange(start,end){
				if(!scope.g){
					return;
				}
				//format to time since epoch
				var s,e;
				s=Date.parse(start);
				e=Date.parse(end);
				scope.g.updateOptions({
					dateWindow: [s,e]
				});
			}
			
			function valueFormatter(ms) {
				return new Date(ms).strftime('%m/%d/%Y');
			};
			
			function createGraph(data){
				return new Dygraph(element[0], data, {
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
			
			function getHelpTooltipHtml() {
				var retval = '<div class="absolute-top-right">';// background-image in css used here for info icon
				retval += '<div class="dygraphs-help2"><span>'
			          + '<b>pan</b>&nbsp; : shift + click + drag<br>'
			          + '<b>zoom in</b>&nbsp; : click + drag <br>'
			          + '<b>zoom out</b>&nbsp; : double click';
				retval += '</span></div>';
				return retval;
			};
			
			function addZoomCallBack(){
				if(!scope.g){
					return;
				}
				var range = [];
				scope.g.updateOptions({
					zoomCallback: function(){
						range=scope.g.xAxisRange();
						scope.start=valueFormatter(range[0]);
						scope.end=valueFormatter(range[1]);
						scope.$apply();
					}
				});
			};
			
			scope.$watch('start', function(newVal,oldVal){
				if(!newVal){
					return;
				}
				updateXRange(scope.start,scope.end);
			});
			
			scope.$watch('end', function(newVal,oldVal){
				if(!newVal){
					return;
				}
				updateXRange(scope.start,scope.end);
			});
			
			scope.$watch('data', function(newVal,oldVal){
				if(!newVal){
					return;
				}
				if(scope.g){
					scope.g.destroy();
				}
				scope.g=createGraph(newVal);
				addZoomCallBack();
				updateTitle();
				updateYLabel();
				updateXLabel();
			});
			
        }
    };
});
