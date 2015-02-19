/**
 * Copyright 2012 Asher Anjum
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
 * checks whether given argument is null or has length = 0
 * @param  {String|Array}  can be any object that has length method.
 * @return {Boolean}
 */
Utils.prototype.isNullOrEmpty = function(arr) {
	return (!arr || arr.length == 0);
}

Utils.prototype.hyphenate = function(str) {
	return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}


