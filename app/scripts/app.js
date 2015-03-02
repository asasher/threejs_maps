//-------------------------------------------------------------------------
// app.js
//-------------------------------------------------------------------------
(function($) {

	var paths = {
		data : 'data/'
	};

	var files = {
		routes : paths.data + 'data.json'
	};

	var $controls = $('.controls');
	var controls = {
		fromDate: null,
		toDate: null,
		fromTimeOfDay: null,
		toTimeOfDay: null,
		showSources: false,
		showDestinations: false,
		showRoutes: false,
		showScatter: false,
		showGrid: false,
		emergencyTypes: []
	};

	var oo;

	var $mapCanvas = $('.map-canvas');
	var $mapInput = $('[name="map-input"]');
	var map, threejsLayer, markers = [];
	var data = null;
	var features = null;

	initControls();
	initMap($mapCanvas.get(0), $mapInput.get(0));
	initThreeJSLayer();

	getData(files.routes, function(result) {
		data = result;		
		update();
	});

	function update() {
		console.log(controls);
		if(data && threejsLayer.isReady()) {
			console.log('ready to draw');

			threejsLayer.clear();

			features = data.features;
			C = d3.scale.linear()
				  .domain([0, 1])
				  .interpolate(d3.interpolateRgb)
				  .range(["#ffffff", "#ff0000"]);	

			if(controls.fromDate) {
				features = $.grep(features, function(elem, i) {
					var date = new Date(elem.properties.date);
					return date >= controls.fromDate;
				});
			}

			if(controls.toDate) {
				features = $.grep(features, function(elem, i) {
					var date = new Date(elem.properties.date);
					return date <= controls.toDate;
				});
			}

			if(controls.fromTimeOfDay) {
				features = $.grep(features, function(elem, i) {
					var date = new Date(elem.properties.date + ' ' + elem.properties.timeOfDay);
					return Utils.DateTime.compareTime(date, controls.fromTimeOfDay) == 1;
				});
			}

			if(controls.toTimeOfDay) {
				features = $.grep(features, function(elem, i) {
					var date = new Date(elem.properties.date + ' ' + elem.properties.timeOfDay);
					return Utils.DateTime.compareTime(date, controls.toTimeOfDay) == -1;
				});
			}

			if(controls.emergencyTypes.length) {
				features = $.grep(features, function(elem, i) {
					return $.inArray(elem.properties.emergencyType, controls.emergencyTypes) > -1;
				});
			}

			for(var i = 0; i < features.length; i++) {
				elem = features[i];					
				var color = getFeatureColor(elem);
				if(elem.geometry.type == 'Point') {
					threejsLayer.createPointCloud([elem.geometry.coordinates],color);
					
				} else if(elem.geometry.type == 'LineString') {
					if(controls.showSources) {
						threejsLayer.createPointCloud(elem.geometry.coordinates.slice(0,0),color);
					}
					if(controls.showDestinations) {
						threejsLayer.createPointCloud(elem.geometry.coordinates.slice(-1),color);
					}
					if(controls.showRoutes) {
						threejsLayer.createLine(elem.geometry.coordinates,color);
					}
				} else if(elem.geometry.type == 'MultiPoint') {
					if(controls.showScatter) {
						threejsLayer.createPointCloud(elem.geometry.coordinates,color);
					}

				} else if(elem.geometry.type == 'Rectangle') {
					if(controls.showGrid) {
						threejsLayer.createRectangle(elem.geometry.coordinates,color);
					}
				}
			}
		}
	}

	function getFeatureColor(elem) {
		var color = elem.properties.color;
		if(typeof(color) === 'object') {
			var C = d3.scale.linear()
				  .domain([0, 1])
				  .interpolate(d3.interpolateRgb)
				  .range([color.min, color.max]);
			color = C(color.value);
		}
		return color;
	}

	function getData(file, callback) {
		$.getJSON(file, function(result) {
			console.log('got ' + file);			
			callback(result);
		}).fail(function( jqxhr, textStatus, error ) {
		    var err = textStatus + ', ' + error;
		    console.log('failed: ' + err );
		});
	}

	function initControls() {
		oo = new Oo('.controls', controls, update);		

		$controls.on('click', '.dump-to-file', function() {
			var $elem = $(this);
			var output = {
				"type" : "FeatureCollection",
				"features" : features
			}
			var blob = new Blob([JSON.stringify(output)], {type: "text/plain;charset=utf-8"});
			saveAs(blob, "dump.json");
		});
	}

	function clearMarkers() {
		for(var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
		markers = [];
	}

	function drawMarker(latlng) {
		var color = '#f00';
		var marker = new google.maps.Marker({
			position: latlng,
			icon: {
		      path: google.maps.SymbolPath.CIRCLE,
		      strokeColor: color,
		      strokeWeight: 1,
		      fillColor: color,
		      fillOpacity: 1,
		      scale: 2
		    },
			map: map
		});
		markers.push(marker);
	}

	function initThreeJSLayer() {
		threejsLayer = new ThreeJSLayer({ map: map, onReady: function() { update(); } });
	}

	function initMap(mapCanvas, mapInput) {
		var styles = [
		  {
		    "stylers": [
		      { "invert_lightness": true },
		      { "saturation": -100 },
		      { "visibility": "on" }
		    ]
		 	   },
		  {
		    "featureType": "landscape",
		    "stylers": [
		      { "color": "#000000" }
		    ]
		  },
		  {
		    "featureType": "administrative.country",
		    "elementType": "geometry",
		    "stylers": [
		      { "visibility": "on" }
		    ]
		  }
		];

		var mapOptions = {
		    zoom: 6,
		    center: new google.maps.LatLng(31.5450500, 74.3406830),
		    mapTypeControl: false,
		    mapTypeId: google.maps.MapTypeId.ROADMAP,
		    styles: styles
		};

		map = new google.maps.Map(mapCanvas, mapOptions);

		//-------------------------------------------------------------------------
		// search box
		//-------------------------------------------------------------------------
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(mapInput);

		var searchBox = new google.maps.places.SearchBox((mapInput));

		google.maps.event.addListener(searchBox, 'places_changed', function() {
		    var places = searchBox.getPlaces();

		    if (places.length == 0) {
		      return;
		    }

		    clearMarkers();

		    var bounds = new google.maps.LatLngBounds();

		    for (var i = 0, place; place = places[i]; i++) {
			    var image = {
			        url: place.icon,
			        size: new google.maps.Size(71, 71),
			        origin: new google.maps.Point(0, 0),
			        anchor: new google.maps.Point(17, 34),
			        scaledSize: new google.maps.Size(25, 25)
			    };

			    var marker = new google.maps.Marker({
			        map: map,
			        icon: image,
			        title: place.name,
			        position: place.geometry.location
			    });  

			    markers.push(marker);
      			bounds.extend(place.geometry.location);
			}
			 
      		map.fitBounds(bounds);		
      	});

      	// bias search results within the visible area
      	google.maps.event.addListener(map, 'bounds_changed', function() {
		    var bounds = map.getBounds();
		    searchBox.setBounds(bounds);
		});
      	//-------------------------------------------------------------------------
	}

	function isEmpty(str) {
	    return (!str || str.length == 0);
	}

})(jQuery)