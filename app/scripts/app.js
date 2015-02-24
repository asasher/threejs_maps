//-------------------------------------------------------------------------
// app.js
//-------------------------------------------------------------------------
(function($) {

	var paths = {
		data : 'data/'
	};

	var files = {
		routes : paths.data + 'routes.txt'
	};

	var $controls = $('.controls');
	var controls = {
		fromDate: null,
		toDate: null,
		fromTimeOfDay: null,
		toTimeOfDay: null,
		showSources: false,
		showDestinations: false,
		showRoutes: false
	};

	var oo;

	var $mapCanvas = $('.map-canvas');
	var $mapInput = $('[name="map-input"]');
	var map, threejsLayer, markers = [];
	var data = null;
	var toPlot = null;

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

			toPlot = data;
			C = d3.scale.linear()
				  .domain([3, 15])
				  .interpolate(d3.interpolateRgb)
				  .range(["#ffffff", "#ff0000"]);	

			if(controls.fromDate) {
				toPlot = $.grep(toPlot, function(elem, i) {
					var date = new Date(elem.date);
					return date >= controls.fromDate;
				});
			}

			if(controls.toDate) {
				toPlot = $.grep(toPlot, function(elem, i) {
					var date = new Date(elem.date);
					return date <= controls.toDate;
				});
			}

			if(controls.fromTimeOfDay) {
				toPlot = $.grep(toPlot, function(elem, i) {
					var date = new Date(elem.date + elem.time);
					return Utils.DateTime.compareTime(date, controls.fromTimeOfDay) == 1;
				});
			}

			if(controls.toTimeOfDay) {
				toPlot = $.grep(toPlot, function(elem, i) {
					var date = new Date(elem.date + elem.time);
					return Utils.DateTime.compareTime(date, controls.toTimeOfDay) == -1;
				});
			}

			if(controls.showSources) {
				for(var i = 0; i < toPlot.length; i++) {
					elem = toPlot[i];					
					var color = C(elem.responsetime);
					threejsLayer.createPointCloud([elem.src],color);
				}
			}

			if(controls.showDestinations) {
				for(var i = 0; i < toPlot.length; i++) {
					elem = toPlot[i];					
					var color = C(elem.responsetime);
					threejsLayer.createPointCloud([elem.dst],color);
				}
			}

			if(controls.showRoutes) {
				for(var i = 0; i < toPlot.length; i++) {
					elem = toPlot[i];					
					var color = C(elem.responsetime);
					threejsLayer.createLine(elem.route,color);
				}
			}

		}
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
	}

	// function createPointCloud(latlngs) {
	// 	var particles;

	// 	var latlngs = [];
	// 	for(var i = 0; i < 1000; i++) {
	// 		var latlng = [Utils.Number.random(31.5,31.6), Utils.Number.random(74.3,74.4)];
	// 		latlngs.push(latlng);
	// 	}

	// 	threejsLayer = new ThreeJSLayer({
	// 		map: map,
	// 		onReady: function() {
	// 			particles = threejsLayer.createLine(latlngs,0xff0000);
	// 		},
	// 		onUpdate: function() {
	// 			for(var i = 0; i < particles.geometry.vertices.length; i++) {					
	// 				particles.geometry.vertices[i].x += Utils.Number.random(-1.0,1.0);
	// 				particles.geometry.vertices[i].y += Utils.Number.random(-1.0,1.0);
	// 			}
	// 			particles.geometry.verticesNeedUpdate = true;
	// 		},
	// 		animate: true
	// 	});	

	// 	setInterval(function() {
	// 		// threejsLayer.remove(particles);
	// 		// particles = threejsLayer.createLine(latlngs,Utils.Color.toHex(randomColor()));
			
	// 		threejsLayer.setMap(null);
	// 	},3000);
	// }

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