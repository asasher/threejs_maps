/**
 * Copyright 2015 Asher Anjum
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Modified from CanvasLayer utility library:
 * https://google-maps-utility-library-v3.googlecode.com/svn/trunk/canvaslayer/docs/reference.html
 *
 * Based on the Ubilabs ThreeJSLayer:
 * https://github.com/ubilabs/google-maps-api-threejs-layer
 */

/**
 * @fileoverview Modifies CanvasLayer based on ThreeJSLayer to make it easy to view and animate large datasets on maps using threejs.
 * @author Asher Anjum
 */


// TODO
// - alignment issues on too much zoom out or pan

/**
 * A map layer that provides a canvas over the map and initializes threejs.
 * Requires utils.js, canvas, webgl and threejs  
 * @constructor
 * @extends google.maps.OverlayView
 * @param {ThreeJSLayerOptions=} options for this ThreeJSLayer
 */
function ThreeJSLayer(options) {
	/**
   * If true, canvas is in a map pane and the OverlayView is fully functional.
   * See google.maps.OverlayView.onAdd for more information.
   * @type {boolean}
   * @private
   */
  this.isAdded_ = false;

  /**
   * The name of the MapPane in which this layer will be displayed.
   * @type {string}
   * @private
   */
  this.paneName_ = ThreeJSLayer.DEFAULT_PANE_NAME_;

  /**
   * If true, each update will immediately schedule the next.
   * @type {boolean}
   * @private
   */
  this.isAnimated_ = false;  

  /**
   * A browser-defined id for the currently requested callback. Null when no
   * callback is queued.
   * @type {?number}
   * @private
   */
  this.requestAnimationFrameId_ = null;

  /**
   * threejs camera
   * @type {THREE.OrthographicCamera}
   */
  this.camera = new THREE.OrthographicCamera(0, 255, 0, 255, -3000, 3000);
  this.camera.position.z = 1000;

  /**
   * threejs scene
   * @type {THREE.Scene}
   */
  this.scene = new THREE.Scene();

  /**
   * threejs renderer
   * @type {THREE.WebGLRenderer}
   */
  this.renderer = new THREE.WebGLRenderer({
	alpha: true,
	clearColor: 0x000000,
	clearAlpha: 0
  });

  /**
   * canvas element
   * @type {HTMLCanvasElement}
   * @private
   */
  this.canvas = this.renderer.domElement;

  /**
   * A reference to this.repositionCanvas_ with this bound as its this value.
   * @type {function}
   * @private
   */
  this.repositionFunction_ = this.repositionCanvas_.bind(this);

  /**
   * A reference to this.resize_ with this bound as its this value.
   * @type {function}
   * @private
   */
  this.resizeFunction_ = this.resize_.bind(this);

  /**
   * A reference to this.update_ with this bound as its this value.
   * @type {function}
   * @private
   */
  this.requestUpdateFunction_ = this.update_.bind(this);  

  /**
   * The map-pan event listener. Will be null when this.isAdded_ is false. Will
   * be null when this.isAdded_ is false.
   * @type {?function}
   * @private
   */
  this.repositionListener_ = null;

  /**
   * The map-resize event listener. Will be null when this.isAdded_ is false.
   * @type {?function}
   * @private
   */
  this.resizeListener_ = null;  

  /**
   * A user-supplied function called on every onAdd. This is where initial scene should be setup i.e add geometry etc.
   * @type {?function}
   */
  this.onAddHandler_ = null;

  /**
   * A user-supplied function called whenever an update is required. Null or
   * undefined if a callback is not provided.
   * @type {?function}
   * @private
   */
  this.updateHandler_ = null;

  /**
   * If true, the map size has changed and this.resizeHandler_ must be called
   * on the next update.
   * @type {boolean}
   * @private
   */
  this.needsResize_ = true;

  /**
   * A user-supplied function called whenever an update is required and the
   * map has been resized since the last update. Null or undefined if a
   * callback is not provided.
   * @type {?function}
   * @private
   */
  this.resizeHandler_ = null;

  /**
   * If true, the map center has changed and this.repositionHandler_ must be called
   * on the next update.
   * @type {boolean}
   * @private
   */
  this.needsReposition_ = true;

  /**
   * A user-supplied function called whenever an update is required and the
   * map has been repositioned since the last update. Null or undefined if a
   * callback is not provided.
   * @type {?function}
   * @private
   */
  this.repositionHandler_ = null;

  /**
   * A user-supplied function called on every update instead of default render function. Null or undefined if a
   * callback is not provided.
   * @type {?function}
   * @private
   */
  this.renderHandler_ = null;

  // set provided options, if any
  if (options) {
    this.setOptions(options);
  }
}

ThreeJSLayer.prototype = new google.maps.OverlayView();

/**
 * The default MapPane to contain the canvas.
 * @type {string}
 * @const
 * @private
 */
ThreeJSLayer.DEFAULT_PANE_NAME_ = 'overlayLayer';

/**
 * Transform CSS property name, with vendor prefix if required. If browser
 * does not support transforms, property will be ignored.
 * @type {string}
 * @const
 * @private
 */
ThreeJSLayer.CSS_TRANSFORM_ = (function() {
  var div = document.createElement('div');
  var transformProps = [
    'transform',
    'WebkitTransform',
    'MozTransform',
    'OTransform',
    'msTransform'
  ];
  for (var i = 0; i < transformProps.length; i++) {
    var prop = transformProps[i];
    if (div.style[prop] !== undefined) {
      return prop;
    }
  }

  // return unprefixed version by default
  return transformProps[0];
})();

/**
 * Sets any options provided. See CanvasLayerOptions for more information.
 * @param {ThreeJSLayerOptions} options The options to set.
 */
ThreeJSLayer.prototype.setOptions = function(options) {
	if(options.onReady) {
				this.onAddHandler_ = options.onReady;
	}

	if(options.onReposition) {
		this.repositionHandler_ = options.onReposition;
	}

	if(options.onResize) {
		this.resizeHandler_ = options.onResize;
	}

	if(options.onUpdate) {
		this.updateHandler_ = options.onUpdate;
	}

	if(options.render) {
		this.renderHandler_ = options.render;
	}

	if(options.paneName) {
		this.paneName_ = options.paneName;
	}
	
	if(options.animate) {
		this.setAnimate(options.animate);
	}

	if(options.map) {
		this.setMap(options.map);
	}
}

/**
 * Set the animated state of the layer. If true, updateHandler will be called
 * repeatedly, once per frame. If false, updateHandler will only be called when
 * a map property changes that could require the canvas content to be redrawn.
 * @param {boolean} animate Whether the canvas is animated.
 */
ThreeJSLayer.prototype.setAnimate = function(animate) {
	this.isAnimated_ = !!animate;
	if(this.isAnimated_) {
		this.scheduleUpdate();
	}
}

/**
 * @return {boolean} Whether the canvas is animated.
 */
ThreeJSLayer.prototype.isAnimated = function() {
	return this.isAnimated_;
}

/**
 * Set the onAddHandler for this layer this is called on every onAdd.
 * @param {function} onCreate no args function
 */
ThreeJSLayer.prototype.setOnReady = function(onReady) {
	this.onAddHandler_ = onReady;
}

/**
 * Set the updateHandler for this layer this is called once every frame before rendering.
 * @param {function} onUpdate no args function
 */
ThreeJSLayer.prototype.setOnUpdate = function(onUpdate) {
	this.updateHandler_ = options.onUpdate;
}

/**
 * Adds the canvas to the specified container pane. Since this is guaranteed to
 * execute only after onAdd is called, this is when paneName's existence is
 * checked (and an error is thrown if it doesn't exist).
 * @private
 */
ThreeJSLayer.prototype.setPane_ = function() {
	if(this.isAdded_) {
		var panes = this.getPanes();
		if(!panes[this.paneName_]) {
			throw new Error('"' + this.paneName_ + '" is not a valid MapPane name.');
		}
		panes[this.paneName_].appendChild(this.canvas);
	}
}

/**
 * The internal callback for resize events that resizes the canvas to keep the
 * map properly covered.
 * @private
 */
ThreeJSLayer.prototype.resize_ = function() {
	if(this.isAdded_) {		
		var mapDiv = this.getMap().getDiv();

		var newWidth = mapDiv.offsetWidth;
		var newHeight = mapDiv.offsetHeight;

		var oldWidth = this.canvas.width;
		var oldHeight = this.canvas.height;

		if (oldWidth !== newWidth || oldHeight !== newHeight) {
			this.renderer.setSize(newWidth, newHeight);		
			this.needsResize_ = true;
			this.scheduleUpdate();
		}		
	}
}

/**
 * Internal callback for map view changes. Since the Maps API moves the overlay
 * along with the map, this function calculates the opposite translation to
 * keep the canvas in place.
 * @private
 */
ThreeJSLayer.prototype.repositionCanvas_ = function() {
	if(this.isAdded_) {		
		var map = this.getMap();

		var bounds = map.getBounds();
		var topLeft = new google.maps.LatLng(
			bounds.getNorthEast().lat(),
			bounds.getSouthWest().lng()
		);		

		var layerProjection = this.getProjection();
		var point = layerProjection.fromLatLngToDivPixel(topLeft);
		this.canvas.style[ThreeJSLayer.CSS_TRANSFORM_] = 'translate(' + Math.round(point.x) + 'px,' + Math.round(point.y) + 'px)';
		
		var mapProjection = map.getProjection();
		var point = mapProjection.fromLatLngToPoint(topLeft);
		this.camera.position.x = point.x;
		this.camera.position.y = point.y;

		var zoom = map.getZoom();
		var scale = Math.pow(2, zoom);

		var width = this.canvas.width;
		var height = this.canvas.height;

		this.camera.scale.x = width / 256 / scale;
		this.camera.scale.y = height / 256 / scale;
		
		this.needsReposition_ = true;
		this.scheduleUpdate();	
	}

}

/**
 * Internal callback that serves as main animation scheduler via
 * requestAnimationFrame. Calls resize and update callbacks if set, and
 * schedules the next frame if overlay is animated.
 * @private
 */
ThreeJSLayer.prototype.update_ = function() {
	this.requestAnimationFrameId_ = null;
	if(this.isAdded_) {
		if(this.isAnimated_) {
			this.scheduleUpdate();
		}
		if(this.needsResize_ && this.resizeHandler_) {
			this.needsResize_ = false;
			this.resizeHandler_();
		}
		if(this.needsReposition_ && this.repositionHandler_) {
			this.needsReposition_ = false;
			this.repositionHandler_();
		}
		if(this.updateHandler_) {
			this.updateHandler_();
		}
		if(this.renderHandler_) {
			this.resizeHandler_();
		} else {		
			this.renderer.render(this.scene, this.camera);
		}		
	}
}

/**
 * Schedule a requestAnimationFrame callback to updateHandler. If one is
 * already scheduled, there is no effect.
 */
ThreeJSLayer.prototype.scheduleUpdate = function() {
		if (this.isAdded_ && !this.requestAnimationFrameId_) {
		this.requestAnimationFrameId_ = requestAnimationFrame(this.requestUpdateFunction_);
	}
};

/**
 * @inheritDoc
 */
ThreeJSLayer.prototype.draw = function() {
  this.repositionCanvas_();
};


ThreeJSLayer.prototype.onAdd = function() {
	if(!this.isAdded_) {				
		this.isAdded_ = true;
		this.setPane_();

		this.resizeListener_ = google.maps.event.addListener(this.getMap(),'resize', this.resizeFunction_);
		this.repositionListener_ = google.maps.event.addListener(this.getMap(),'center_changed', this.repositionFunction_);		

		if(this.onAddHandler_) {
			this.onAddHandler_();
			this.scheduleUpdate();
		}

		this.resize_();
		this.repositionCanvas_();
	}
}

/**
 * @inheritDoc
 */
ThreeJSLayer.prototype.onRemove = function() {
	if(this.isAdded_) {
		this.isAdded_ = false;

		this.canvas.parentElement.removeChild(this.canvas);

		if (this.repositionListener_) {
			google.maps.event.removeListener(this.centerListener_);
			this.centerListener_ = null;
		}
		if (this.resizeListener_) {
			google.maps.event.removeListener(this.resizeListener_);
			this.resizeListener_ = null;
		}

		if(this.requestAnimationFrameId_) {
			cancelAnimationFrame(this,requestAnimationFrameId_);
			this.requestAnimationFrameId_ = null;
		}
	}
}

/**
 * Shortcut method to add new geometry to the scene.
 * @param  {Geometry} geometry The Three.js geometry to add.
 */
ThreeJSLayer.prototype.add = function(geometry){
	this.scene.add(geometry);
};

/**
 * Helper method to convert for LatLng to vertex.
 * @param  {google.maps.LatLng} latLng - The LatLng to convert.
 * @return {THREE.Vector3} The resulting vertex.
 */
ThreeJSLayer.prototype.fromLatLngToVertex = function(latLng) {
	var map = this.getMap();
  	var projection = map.getProjection();
    var point = projection.fromLatLngToPoint(latLng);

    vertex = new THREE.Vector3();
	vertex.x = point.x;
	vertex.y = point.y;
	vertex.z = 0;

	return vertex;
};