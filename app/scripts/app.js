//-------------------------------------------------------------------------
// app.js
//-------------------------------------------------------------------------
(function($) {

	var paths = {
		data : 'data/'
	};

	var files = {};

	var $controls = $('.controls');
	var controls = {
		fromDatetime: null,
		toDatetime: null,
		textTest: '',
		checkboxTest: false,
		selectTest: []
	};

	var oo;

	var $mapCanvas = $('.map-canvas');
	var $mapInput = $('[name="map-input"]');
	var map, threejsLayer, markers = [];

	initControls();
	initMap($mapCanvas.get(0), $mapInput.get(0));
	createPointCloud([]);

	function update() {
		console.log(controls);
	}

	function initControls() {
		oo = new Oo('.controls', controls, update);		
	}

	function createPointCloud(latlngs) {
		var geometry = new THREE.Geometry(),
			texture = new THREE.Texture(generateSprite(64)),
			material = new THREE.PointCloudMaterial({
				size: 32,
				map: texture,
				opacity: 0.3,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				transparent: true
			}), 
			particles;

		threejsLayer = new ThreeJSLayer({
			map: map,
			onReady: function() {
				for(var i = 0; i < 1000; i++) {
					var lat = Utils.Number.random(31.5,31.6);
					var lng = Utils.Number.random(74.3,74.4);
					var location = new google.maps.LatLng(lat, lng),
					vertex = threejsLayer.fromLatLngToVertex(location);
					geometry.vertices.push( vertex );
				}	

				texture.needsUpdate = true;

				particles = new THREE.PointCloud( geometry, material );
				particles.dynamic = true;

				threejsLayer.add(particles);
			},
			onUpdate: function() {
				for(var i = 0; i < particles.geometry.vertices.length; i++) {					
					particles.geometry.vertices[i].x += Utils.Number.random(-1.0,1.0);
					particles.geometry.vertices[i].y += Utils.Number.random(-1.0,1.0);
				}
				particles.geometry.verticesNeedUpdate = true;
			},
			animate: true
		});	
	}

	function generateSprite(size) {
		var canvas = document.createElement('canvas'),
			context = canvas.getContext('2d'),
			gradient;

		size = size || 32;
		canvas.width = size;
		canvas.height = size;

		gradient = context.createRadialGradient(
		  canvas.width / 2, canvas.height / 2, 0,
		  canvas.width / 2, canvas.height / 2, canvas.width / 2
		);

		gradient.addColorStop(1.0, 'rgba(255,255,255,0)');
		gradient.addColorStop(0.0, 'rgba(255,255,255,1)');

		context.fillStyle = gradient;
		context.fillRect(0, 0, canvas.width, canvas.height);

		return canvas;
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
		    zoom: 2,
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