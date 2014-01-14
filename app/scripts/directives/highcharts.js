angular.module('lisirdApp').directive('ghHighchart', function(){
	return {
        restrict: 'A',
        replace: true,
        scope: {
        	data: '=',
        	metadata: '=',
        },
        link: function (scope, element, attrs) {           	
			
			var clickDetected = false;
			
			function createGraph(data,meta){
				return new Highcharts.StockChart({
		           chart: {
		           		type: 'line',
		                renderTo: element[0],
		                connectNulls: true,
		                backgroundColor: '#f7f7f7',
		                zoomType: 'x',
		                events: {
				            load: function() {
				                this.renderer.image('images/lisird_watermark_sm.png',722,321,88,19)
				                    .add();
				            },
				            click: function(event) {
				                if(clickDetected) {
				                    scope.chart.zoomOut();
				                    clickDetected = false;
				                } else {
				                    clickDetected = true;
				                    setTimeout(function() {
				                        clickDetected = false;
				                    }, 400); 
				                }
				            }
				        }
					},
					rangeSelector: {
						selected: 5
					},
			        series: [{
			        	name: 'TSI 1AU',
			            data: data,
			            color: '#FF0000',
						threshold: null,
						tooltip: {
			        		valueDecimals: 2
			        	}
			        }],
			        title: {
			        	text: meta.title
			        },
			        yAxis: {
			        	title: {
			        		text: meta.yTitle
			        	}
			        },
			        xAxis: {
			        	type: 'datetime',
			        	title: {
			        		text: meta.xTitle
			        	}
			        },
			        exporting: {
			        	enableImages: true,
			        }
				});
			}
			
			scope.$watch('data', function(newVal,oldVal){
				if(!newVal){
					return;
				}
				scope.chart=createGraph(newVal,scope.metadata);
			});
			
        }
    };
});