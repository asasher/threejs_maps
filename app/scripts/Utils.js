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
  * @fileOverview source for Utils object which provides helpfull utility functions.
  * @author Asher Anjum
  */

/**
 * Utils objects provide helpful static function not meant to be initiated.
 */
function Utils() { }


/**
 * namespace for all string related utilities
 * @type {Object}
 */
Utils.String = {}

/**
 * checks whether given argument is null or has length = 0
 * @param  {String|Array}  can be any object that has length method.
 * @return {Boolean}
 */
Utils.String.isNullOrEmpty = function(arr) {
	return (!arr || arr.length == 0);
}

/**
 * hyphenates a given cameCase string
 * @param  {String} str camelCase string
 * @return {String}     hyphenated string
 */
Utils.String.hyphenate = function(str) {
	return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * namespace for javascript related utilities
 * @type {Object}
 */
Utils.JS = {};

/**
 * binds all methods in given instace to given thisArg
 * @param  {Object} thisArg thisArg to bind to 
 * @param  {Object} intance instance to be bound
 */
Utils.JS.bindAll = function(thisArg, intance){
	for(var props in instace) {
		if(typeof props == 'function') {
			instace[props] = instace[props].bind(thisArg);
		}
	}
};

/**
 * namespace for HTML related utilities
 * @type {Object}
 */
Utils.HTML = {};

/**
 * return true if webg is supported
 * @return {Boolean}
 */
Utils.HTML.hasWebGL = function() {
	try {
      var canvas = document.createElement('canvas');
      return !!window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
}

/**
 * namespace for Number related utilites
 * @type {Object}
 */
Utils.Number = {};

/**
 * returns a random number between lower (inclusive) and upper (exclusive)
 * @param  {number} lower
 * @param  {number} upper
 * @return {number}
 */
Utils.Number.random = function(lower, upper) {
	return (upper - lower)*Math.random() + lower;
}
