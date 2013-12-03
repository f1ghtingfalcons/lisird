angular.module('lisirdApp')
  .controller('navCtrl', function ($scope) {
  	
	$scope.menu = [
	    {
	        "name": "MAIN",
	        "link": "#/",
	        "content": []
	    },
	    {
	        "name": "DATA",
	        "link": "#/data",
	        "content": [
	            {
	                "name": "SSI",
	                "link": "#/data/ssi"
	            },
	            {
	                "name": "TSI",
	                "link": "#/data/tsi"
	            },
	            {
	                "name": "COMPOSITES",
	                "link": "#/data/composites"
	            },
	            {
	                "name": "MISSION DATA",
	                "link": "#/data/mission_data"
	            },
	            {
	                "name": "MODELS",
	                "link": "#/data/models"
	            },
	            {
	                "name": "SOLAR IMAGES",
	                "link": "http://lasp.colorado.edu/pspt_access/"
	            },
	            {
	                "name": "SPACE WEATHER",
	                "link": "#/data/space_weather"
	            }
	        ]
	    },
	    {
	    	"name":"MISSIONS",
	    	"link":"#/mission",
	    	"content": [
	    		{
	                "name": "SME",
	                "link": "#/missions/sme"
	            },
	            {
	                "name": "SORCE",
	                "link": "#/missions/sorce"
	            },
	            {
	                "name": "TIMED/SEE",
	                "link": "#/missions/timed-see"
	            },
	            {
	                "name": "UARS",
	                "link": "#/missions/uars"
	            },
	            {
	                "name": "SDO",
	                "link": "#/missions/sdo"
	            },
	            {
	                "name": "SNOE",
	                "link": "#/missions/snoe"
	            }
	    	]
	    },
	    {
	    	"name":"TOOLS",
	    	"link":"#/tools",
	    	"content": []
	    },
	    {
	    	"name":"ABOUT",
	    	"link":"#/about/lisird",
	    	"content": [
	    		{
	                "name": "LISIRD",
	                "link": "#/about/lisird"
	            },
	            {
	                "name": "LaTiS",
	                "link": "#/about/latis"
	            },
	            {
	                "name": "Publications",
	                "link": "#/about/publications"
	            },
	            {
	                "name": "Contact",
	                "link": "#/about/contact"
	            }
	    	]
	    }
	];
	
	$scope.onMouseOver = function(item){
		$scope.displayedSubMenu=item;
	};
	$scope.displayMenu = function(item){
		return ($scope.displayedSubMenu === item);
	};
});