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
* @fileOverview source for Oo object.
* @author Asher Anjum
*/

/**
 * Observer object that provides one-way binding by listening to change event and updating the provided object.
 * Requires utils.js
 * @param {String} containerSelector css selector for the container element.
 * @param {Object} obj               bound Object. obj.someKey will have the value of selector [name='some-key']
 */
function Oo(containerSelector = '', obj = {}) {
	/**
	 * reference to the bound object
	 * @type {Object}
	 * @private
	 */
	this.obj_ = obj;

	/**
	 * reference to this.domChanged_ bound to this instance
	 * @type {function}
	 * @private
	 */
	this.domChangedFunction_ = this.domChanged_.bind(this);

	/**
	 * reference t this.updateObject bound to this instance
	 * @type {function}
	 */
	this.updateObjectFunction_ = this.updateObject_.bind(this);

	var container = document.querySelector(containerSelector);
	container.addEventListener('change', this.domChangedFunction_);
}

/**
 * event handler for change event on the container.
 * @param  {Event} e event fired when dom is changed.	
 */
Oo.prototype.domChanged_ = function(e) {
	if(e.target) {
		for(var key in this.obj_) {
			var selector = '[name="' + Utils.hyphenate(key) + '"]';
			if(e.target.matches(selector)) {
				this.updateObjectFunction_(key, elem);
			}
		}
	}
}

/**
 * update the bound object with the value from the provided element
 * @param  {String} key  key in the bound object
 * @param  {Element} elem element that was changed
 */
Oo.prototype.updateObject_ = function(key, elem) {
	var tagName = elem.tagName.toLowerCase();
	var type = elem.getAttribute('type').toLowerCase();

	if(type == 'datetime-local') {
		var val = elem.value;
		if(!Utils.isNullOrEmpty(val)) {
			this.obj_[key] = new Date(val);
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
		for(var option in options) {
			if(option.selected) {
				this.obj_[key].push(option.value);
			}
		}		
	}	
}