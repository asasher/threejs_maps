/**
 * Copyright 2012 asasher
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
 * Based on the Ubilabs ThreejsLayer:
 * https://github.com/ubilabs/google-maps-api-threejs-layer
 */

 /**
 * @fileoverview Modifies CanvasLayer based on ThreejsLayer to make it easy to view and animate large datasets on maps using threejs.
 * @author Asher Anjum
 */

/**
 * A map layer that provides a canvas over the map and initializes threejs.
 * Requires canvas, webgl and threejs  
 * @constructor
 * @extends google.maps.OverlayView
 * @param {ThreejsLayerOptions=} options for this ThreejsLayer
 */
function ThreejsLayer(options) {

}

ThreejsLayer.prototype = new google.maps.OverlayView();

