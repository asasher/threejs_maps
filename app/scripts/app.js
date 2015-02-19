//-------------------------------------------------------------------------
// app.js
//-------------------------------------------------------------------------
(function($) {

	var paths = {
		data : 'data/'
	};

	var files = {};

	var $controls = $('.controls');
	var controls = {};

	var $mapCanvas = $('.map-canvas');
	var $mapInput = $('[name="map-input"]');
	var map, markers, threejsLayer;

	(function init() {
		initControls();
		initMap($mapCanvas.get(0), $mapInput.get(0));
	})();	

	function update() {
		console.log(controls);
	}

	function initControls() {
		$controls.on('change', 'input, select', function () {
			$elem = $(this);
			name = $.camelCase($elem.attr('name'));
			type = $elem.attr('type');

			if(type == 'datetime-local') {
				var val = $elem.val();
				if(!isEmpty(val)) {
					controls[name] = new Date($elem.val());
				} else {
					controls[name] = null;
				}
				
			}
			else if(type == 'text') {
				controls[name] = $elem.val();
			}
			else if(type == 'checkbox')
			{
				controls[name] = $elem.is(":checked");
			}
			else if($elem.is('select'))
			{
				controls[name] = [];
				$elem.find(":selected").each(function (index, opt) {
					var val = $(opt).val();
					if(!isEmpty(val))
					{
						controls[name].push(val);
					}                    
                });
			}			

			update();			
		});

		$controls.find('input, select').each(function(index, elem) {
			$(elem).trigger("change");
		})
	}

	function initMap(mapCanvas, mapInput) {
		var mapOptions = {
		    zoom: 13,
		    center: new google.maps.LatLng(31.5450500, 74.3406830),
		    mapTypeId: google.maps.MapTypeId.ROADMAP
		    /*mapTypeId: google.maps.MapTypeId.SATELLITE*/		    
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

	function clearMarkers() {
		for(var marker in markers) {
			marker.setMap(null);
		}
		markers = [];
	}

	function isEmpty(str) {
	    return (!str || str.length == 0);
	}

})(jQuery)