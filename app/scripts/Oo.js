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
* @fileOverview source for Oo library.
* @author Asher Anjum
*/

/**
 * Observer object that provides one-way binding by listening to change event and updating the provided object.
 * Requires utils.js
 * @param {String} containerSelector css selector for the container element.
 * @param {Object} obj               bound Object. obj.someKey will have the value of selector [name='some-key']
 * @paran {function} callback		 no args function to be called when obj is updated after domChange
 */
function Oo(containerSelector, obj, callback) {
	/**
	 * reference to the bound object
	 * @type {Object}
	 * @private
	 */
	this.obj_ = obj;

	/**
	 * reference to the callback
	 * @type {function}
	 * @private
	 */
	this.afterDOMChanged_ = callback;

	/**
	 * reference to this.domChanged_ bound to this instance
	 * @type {function}
	 * @private
	 */
	this.domChangedFunction_ = this.domChanged_.bind(this);

	/**
	 * reference to this.updateObject- bound to this instance
	 * @type {function}
	 * @private
	 */
	this.updateObjectFunction_ = this.updateObject_.bind(this);

	/**
	 * reference to this.getAllDOMValues_ bound to this instance
	 * @type {function}
	 * @private
	 */
	this.getAllDOMValuesFunction_ = this.getAllDOMValues_.bind(this);

	/**
	 * Element for container
	 * @type {HTMLElement}
	 * @private
	 */
	this.domContainer_ = document.querySelector(containerSelector);

	this.domContainer_.addEventListener('change', this.domChangedFunction_);

	this.getAllDOMValues_();
}


/**
 * updates all the fields in obj_ to dom values
 */
Oo.prototype.getAllDOMValues_ = function() {	
	for(var key in this.obj_) {
		var selector = '[name="' + Utils.String.hyphenate(key) + '"]';
		var elem = this.domContainer_.querySelector(selector);
		if(elem) {
			this.updateObject_(key, elem);
		}
	}
}

/**
 * event handler for change event on the container.
 * @param  {HTMLEvent} e event fired when dom is changed.	
 */
Oo.prototype.domChanged_ = function(e) {
	if(e.target) {
		var elem = e.target;
		for(var key in this.obj_) {
			var selector = '[name="' + Utils.String.hyphenate(key) + '"]';
			if(elem.matches(selector)) {
				this.updateObject_(key, elem);
			}
		}
	}
	this.afterDOMChanged_();
}

/**
 * update the bound object with the value from the provided element
 * @param  {String} key  key in the bound object
 * @param  {HTMLElement} elem element that was changed
 */
Oo.prototype.updateObject_ = function(key, elem) {
	var tagName = elem.tagName.toLowerCase();
	var type = elem.getAttribute('type');
	type = type ? type.toLowerCase() : type;

	if(type == 'datetime-local' || type == 'date') {
		var val = elem.value;
		if(!Utils.String.isNullOrEmpty(val)) {
			this.obj_[key] = new Date(val);
		} else {
			this.obj_[key] = null;
		}				
	}
	else if(type == 'time') {
		var val = elem.value;
		if(!Utils.String.isNullOrEmpty(val)) {
			this.obj_[key] = new Date(new Date().toDateString() + ' ' + val);
		} else {
			this.obj_[key] = null;
		}
	}
	else if(type == 'text') {
		var val = elem.value;
		this.obj_[key] = val;
	}
	else if(type == 'checkbox')
	{
		this.obj_[key] = elem.checked;
	}
	else if(tagName == 'select')
	{
		this.obj_[key] = [];
		var options = elem.options;
		for(var i = 0; i < options.length; i++) {
			var option = options[i];
			if(option.selected) {
				this.obj_[key].push(option.value);
			}
		}
	}	
}