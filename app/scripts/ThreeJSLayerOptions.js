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
 */

/**
 * @fileoverview definition of all the option for ThreejsLayer.
 * @author Asher Anjum
 */

/**
 * Options for ThreejsLayer
 * @interface
 */
function ThreeJSLayerOptions() { }

/**
 * If true, updateHandler will be called repeatedly, once per frame. If false,
 * updateHandler will only be called when a map property changes that could
 * require the canvas content to be redrawn.
 * @type {boolean}
 */
ThreeJSLayerOptions.prototype.animate;

/**
 * Map on which to overlay the canvas.
 * @type {google.maps.Map}
 */
ThreeJSLayerOptions.prototype.map;

/**
 * The name of the MapPane in which this layer will be displayed. See
 * {@code google.maps.MapPanes} for the panes available. Default is
 * "overlayLayer".
 * @type {string}
 */
CanvasLayerOptions.prototype.paneName;

/**
 * A function that is called on every layer.setMap(map).
 * @type {function}
 */
ThreeJSLayerOptions.prototype.onReady;

/**
 * A function that is called whenever the the map has been repositioned.
 * @type {function}
 */
ThreeJSLayerOptions.prototype.onReposition;

/**
 * A function that is called whenever the canvas has been resized to fit the
 * map.
 * @type {function}
 */
ThreeJSLayerOptions.prototype.onResize;

/**
 * A function that is called when a repaint of the canvas is required.
 * @type {function}
 */
ThreeJSLayerOptions.prototype.onUpdate;

/**
 * A function that is called instead of the default render function.
 * @type {function}
 */
ThreeJSLayerOptions.prototype.render;
