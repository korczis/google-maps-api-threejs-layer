/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 Copyright 2012-2015 Ubiabs & Tomas Korcak <korczis@gmail.com>
	
	 Licensed under the Apache License, Version 2.0 (the "License");
	 you may not use this file except in compliance with the License.
	 You may obtain a copy of the License at
	
	 http://www.apache.org/licenses/LICENSE-2.0
	
	 Unless required by applicable law or agreed to in writing, software
	 distributed under the License is distributed on an "AS IS" BASIS,
	 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 See the License for the specific language governing permissions and
	 limitations under the License.
	 **/
	
	/**
	 * Base on the CanvasLayer utility library:
	 * https://google-maps-utility-library-v3.googlecode.com/svn/trunk/canvaslayer/docs/reference.html
	 */
	
	/**
	 * Creates a new Three.js layer by extending OverlayView.
	 * @see https://developers.google.com/maps/documentation/javascript/reference#OverlayView.
	 * @param {Object}   options  Options passed to initialize method.
	 * @param {Function} callback Callback to execute when map was updated.
	 */
	'use strict';
	
	var _inherits = __webpack_require__(1)['default'];
	
	var _classCallCheck = __webpack_require__(16)['default'];
	
	var ThreejsLayer = (function (_google$maps$OverlayView) {
	    _inherits(ThreejsLayer, _google$maps$OverlayView);
	
	    function ThreejsLayer(options, callback) {
	        _classCallCheck(this, ThreejsLayer);
	
	        _google$maps$OverlayView.call(this);
	
	        this.bindAll();
	        this.callback = callback;
	        this.initialize(options || {});
	
	        this.firstRun = true;
	
	        if (options.map) {
	            this.setMap(options.map);
	        }
	    }
	
	    /**
	     * Get browser specifiv CSS transform property.
	     *
	     * @return {String} The property.
	     */
	
	    /**
	     * Bind all methods to the instance.
	     */
	
	    ThreejsLayer.prototype.bindAll = function bindAll() {
	        var instance = this;
	
	        function bind(name) {
	            var method = instance[name];
	            if (typeof method != "function") {
	                return;
	            }
	            instance[name] = function () {
	                return method.apply(instance, arguments);
	            };
	        }
	
	        for (var all in instance) {
	            bind(all);
	        }
	    };
	
	    /**
	     * Initialize the layer with the given options.
	     * @param  {Object} options - Options
	     */
	
	    ThreejsLayer.prototype.initialize = function initialize(options) {
	
	        this.options = options;
	
	        this.camera = new THREE.OrthographicCamera(0, 255, 0, 255, -3000, 3000);
	        this.camera.position.z = 1000;
	        this.renderertype = options.renderertype || '';
	        this.scene = new THREE.Scene();
	
	        this.webgl = (function () {
	            try {
	                var canvas = document.createElement('canvas');
	                return !!window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
	            } catch (e) {
	                return false;
	            }
	        })();
	
	        if (this.renderertype == 'Canvas' || !this.webgl) {
	            this.renderer = new THREE.CanvasRenderer({
	                alpha: true,
	                clearColor: 0x000000,
	                clearAlpha: 0
	            });
	            this.renderertype = 'Canvas';
	        } else {
	            this.renderer = new THREE.WebGLRenderer({
	                alpha: true,
	                clearColor: 0x000000,
	                clearAlpha: 0
	            });
	            this.renderertype = 'WebGL';
	        }
	
	        this.canvas = this.renderer.domElement;
	    };
	
	    /**
	     * This method is called once after setMap() is called with a valid map.
	     * @see https://developers.google.com/maps/documentation/javascript/reference#OverlayView
	     */
	
	    ThreejsLayer.prototype.onAdd = function onAdd() {
	
	        this.map = this.getMap();
	
	        this.getPanes().overlayLayer.appendChild(this.canvas);
	
	        this.changeHandler = google.maps.event.addListener(this.map, 'bounds_changed', this.draw);
	
	        this.draw();
	    };
	
	    /**
	     * This method is called once following a call to setMap(null).
	     * @see https://developers.google.com/maps/documentation/javascript/reference#OverlayView
	     */
	
	    ThreejsLayer.prototype.onRemove = function onRemove() {
	
	        if (!this.map) {
	            return;
	        }
	
	        this.map = null;
	
	        this.canvas.parentElement.removeChild(this.canvas);
	
	        if (this.changeHandler) {
	            google.maps.event.removeListener(this.changeHandler);
	            this.changeHandler = null;
	        }
	    };
	
	    /**
	     * This method is called when the layer postion needs an update.
	     */
	
	    ThreejsLayer.prototype.draw = function draw() {
	        if (!this.map) {
	            return;
	        }
	
	        var bounds = this.map.getBounds();
	
	        var topLeft = new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng());
	
	        var projection = this.getProjection();
	        var point = projection.fromLatLngToDivPixel(topLeft);
	
	        this.canvas.style[ThreejsLayer.CSS_TRANSFORM] = 'translate(' + Math.round(point.x) + 'px,' + Math.round(point.y) + 'px)';
	
	        if (this.firstRun) {
	            this.firstRun = false;
	
	            if (this.callback) {
	                this.callback(this);
	            }
	        }
	
	        this.update();
	    };
	
	    /**
	     * Call this method when the layer's size changed.
	     */
	
	    ThreejsLayer.prototype.resize = function resize() {
	
	        if (!this.map) {
	            return;
	        }
	
	        var div = this.map.getDiv(),
	            width = div.clientWidth,
	            height = div.clientHeight;
	
	        if (width == this.width && height == this.height) {
	            return;
	        }
	
	        this.width = width;
	        this.height = height;
	
	        this.renderer.setSize(width, height);
	        this.update();
	    };
	
	    /**
	     * This method is called when the Three.js camera needs an update.
	     */
	
	    ThreejsLayer.prototype.update = function update() {
	        var projection = this.map.getProjection();
	
	        if (!projection) {
	            return;
	        }
	
	        var bounds = this.map.getBounds();
	
	        var topLeft = new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng());
	
	        var zoom = this.map.getZoom();
	        var scale = Math.pow(2, zoom);
	        var offset = projection.fromLatLngToPoint(topLeft);
	
	        this.resize();
	
	        this.camera.position.x = offset.x;
	        this.camera.position.y = offset.y;
	
	        this.camera.scale.x = this.width / 256 / scale;
	        this.camera.scale.y = this.height / 256 / scale;
	
	        this.render();
	    };
	
	    /**
	     * Renders the layer deferred.
	     */
	
	    ThreejsLayer.prototype.render = function render() {
	        cancelAnimationFrame(this.animationFrame);
	        this.animationFrame = requestAnimationFrame(this.deferredRender);
	    };
	
	    /**
	     * The final rendering. If you have passed a function to `options.render`
	     * it will be executed here.
	     */
	
	    ThreejsLayer.prototype.deferredRender = function deferredRender() {
	        if (typeof this.options.render === false) {
	            return;
	        } else if (typeof this.options.render == "function") {
	            this.options.render();
	        } else {
	            this.renderer.render(this.scene, this.camera);
	        }
	    };
	
	    /**
	     * Shortcut method to add new geometry to the scene.
	     * @param  {Geometry} geometry The Three.js geometry to add.
	     */
	
	    ThreejsLayer.prototype.add = function add(geometry) {
	        this.scene.add(geometry);
	    };
	
	    /**
	     * Helper method to convert for LatLng to vertex.
	     * @param  {google.maps.LatLng} latLng - The LatLng to convert.
	     * @return {THREE.Vector3} The resulting vertex.
	     */
	
	    ThreejsLayer.prototype.fromLatLngToVertex = function fromLatLngToVertex(latLng) {
	        var projection = this.map.getProjection();
	        var point = projection.fromLatLngToPoint(latLng);
	        var vertex = new THREE.Vector3();
	
	        vertex.x = point.x;
	        vertex.y = point.y;
	        vertex.z = 0;
	
	        return vertex;
	    };
	
	    return ThreejsLayer;
	})(google.maps.OverlayView);
	
	ThreejsLayer.CSS_TRANSFORM = (function () {
	    var div = document.createElement('div');
	    var props = ['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform'];
	
	    for (var i = 0; i < props.length; i++) {
	        var prop = props[i];
	        if (div.style[prop] !== undefined) {
	            return prop;
	        }
	    }
	
	    return props[0];
	})();
	
	if (window) {
	    window.ThreejsLayer = ThreejsLayer;
	}
	
	module.exports = ThreejsLayer;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _Object$create = __webpack_require__(2)["default"];
	
	var _Object$setPrototypeOf = __webpack_require__(5)["default"];
	
	exports["default"] = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }
	
	  subClass.prototype = _Object$create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _Object$setPrototypeOf ? _Object$setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	};
	
	exports.__esModule = true;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(3), __esModule: true };

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(4);
	module.exports = function create(P, D){
	  return $.create(P, D);
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	var $Object = Object;
	module.exports = {
	  create:     $Object.create,
	  getProto:   $Object.getPrototypeOf,
	  isEnum:     {}.propertyIsEnumerable,
	  getDesc:    $Object.getOwnPropertyDescriptor,
	  setDesc:    $Object.defineProperty,
	  setDescs:   $Object.defineProperties,
	  getKeys:    $Object.keys,
	  getNames:   $Object.getOwnPropertyNames,
	  getSymbols: $Object.getOwnPropertySymbols,
	  each:       [].forEach
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(6), __esModule: true };

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(7);
	module.exports = __webpack_require__(10).Object.setPrototypeOf;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.19 Object.setPrototypeOf(O, proto)
	var $def = __webpack_require__(8);
	$def($def.S, 'Object', {setPrototypeOf: __webpack_require__(11).set});

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(9)
	  , core      = __webpack_require__(10)
	  , PROTOTYPE = 'prototype';
	var ctx = function(fn, that){
	  return function(){
	    return fn.apply(that, arguments);
	  };
	};
	var $def = function(type, name, source){
	  var key, own, out, exp
	    , isGlobal = type & $def.G
	    , isProto  = type & $def.P
	    , target   = isGlobal ? global : type & $def.S
	        ? global[name] : (global[name] || {})[PROTOTYPE]
	    , exports  = isGlobal ? core : core[name] || (core[name] = {});
	  if(isGlobal)source = name;
	  for(key in source){
	    // contains in native
	    own = !(type & $def.F) && target && key in target;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    if(isGlobal && typeof target[key] != 'function')exp = source[key];
	    // bind timers to global for call from export context
	    else if(type & $def.B && own)exp = ctx(out, global);
	    // wrap global constructors for prevent change them in library
	    else if(type & $def.W && target[key] == out)!function(C){
	      exp = function(param){
	        return this instanceof C ? new C(param) : C(param);
	      };
	      exp[PROTOTYPE] = C[PROTOTYPE];
	    }(out);
	    else exp = isProto && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export
	    exports[key] = exp;
	    if(isProto)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
	  }
	};
	// type bitmap
	$def.F = 1;  // forced
	$def.G = 2;  // global
	$def.S = 4;  // static
	$def.P = 8;  // proto
	$def.B = 16; // bind
	$def.W = 32; // wrap
	module.exports = $def;

/***/ },
/* 9 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var UNDEFINED = 'undefined';
	var global = module.exports = typeof window != UNDEFINED && window.Math == Math
	  ? window : typeof self != UNDEFINED && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 10 */
/***/ function(module, exports) {

	var core = module.exports = {};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var getDesc  = __webpack_require__(4).getDesc
	  , isObject = __webpack_require__(12)
	  , anObject = __webpack_require__(13);
	var check = function(O, proto){
	  anObject(O);
	  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
	};
	module.exports = {
	  set: Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
	    ? function(buggy, set){
	        try {
	          set = __webpack_require__(14)(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
	          set({}, []);
	        } catch(e){ buggy = true; }
	        return function setPrototypeOf(O, proto){
	          check(O, proto);
	          if(buggy)O.__proto__ = proto;
	          else set(O, proto);
	          return O;
	        };
	      }()
	    : undefined),
	  check: check
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	// http://jsperf.com/core-js-isobject
	module.exports = function(it){
	  return it !== null && (typeof it == 'object' || typeof it == 'function');
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(12);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(15);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  } return function(/* ...args */){
	      return fn.apply(that, arguments);
	    };
	};

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 16 */
/***/ function(module, exports) {

	"use strict";
	
	exports["default"] = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};
	
	exports.__esModule = true;

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZWZhNTAxZmE0MzVjZWYyNDcyMTciLCJ3ZWJwYWNrOi8vLy4vc3JjL3RocmVlanMtbGF5ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW5oZXJpdHMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2NyZWF0ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2NyZWF0ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9zZXQtcHJvdG90eXBlLW9mLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3Qvc2V0LXByb3RvdHlwZS1vZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5kZWYuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5nbG9iYWwuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb3JlLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc2V0LXByb3RvLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXMtb2JqZWN0LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuYW4tb2JqZWN0LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY3R4LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuYS1mdW5jdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jbGFzcy1jYWxsLWNoZWNrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tDWE0sWUFBWTtlQUFaLFlBQVk7O0FBQ0gsY0FEVCxZQUFZLENBQ0YsT0FBTyxFQUFFLFFBQVEsRUFBRTsrQkFEN0IsWUFBWTs7QUFFViw0Q0FBTyxDQUFDOztBQUVSLGFBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNmLGFBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQ3pCLGFBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDOztBQUUvQixhQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQzs7QUFFckIsYUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFO0FBQ2IsaUJBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1VBQzVCO01BQ0o7Ozs7Ozs7Ozs7OztBQWJDLGlCQUFZLFdBa0JkLE9BQU8sc0JBQUc7QUFD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Q0w7QUFDQTtBQUNBO0FBQ0EsK0RBQThEO0FBQzlEO0FBQ0E7QUFDQTtBQUNBLFlBQVc7QUFDWCxZQUFXO0FBQ1gsWUFBVztBQUNYLFlBQVc7QUFDWCxhQUFZO0FBQ1osYUFBWTtBQUNaLHVCOzs7Ozs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBdUMsZ0M7Ozs7OztBQ0p2QztBQUNBLHNDQUFxQyxnQzs7Ozs7O0FDRHJDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbURBQWtEO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBLGlCQUFnQjtBQUNoQixVQUFTLFVBQVUsY0FBYztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBLEc7Ozs7OztBQ3pCQTtBQUNBO0FBQ0E7QUFDQSxHOzs7Ozs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEc7Ozs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0EsRzs7Ozs7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBLEc7Ozs7OztBQ0hBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMkIiLCJmaWxlIjoidGhyZWVqcy1sYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgZWZhNTAxZmE0MzVjZWYyNDcyMTdcbiAqKi8iLCIvKipcbiBDb3B5cmlnaHQgMjAxMi0yMDE1IFViaWFicyAmIFRvbWFzIEtvcmNhayA8a29yY3ppc0BnbWFpbC5jb20+XG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKiovXG5cbi8qKlxuICogQmFzZSBvbiB0aGUgQ2FudmFzTGF5ZXIgdXRpbGl0eSBsaWJyYXJ5OlxuICogaHR0cHM6Ly9nb29nbGUtbWFwcy11dGlsaXR5LWxpYnJhcnktdjMuZ29vZ2xlY29kZS5jb20vc3ZuL3RydW5rL2NhbnZhc2xheWVyL2RvY3MvcmVmZXJlbmNlLmh0bWxcbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVGhyZWUuanMgbGF5ZXIgYnkgZXh0ZW5kaW5nIE92ZXJsYXlWaWV3LlxuICogQHNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9tYXBzL2RvY3VtZW50YXRpb24vamF2YXNjcmlwdC9yZWZlcmVuY2UjT3ZlcmxheVZpZXcuXG4gKiBAcGFyYW0ge09iamVjdH0gICBvcHRpb25zICBPcHRpb25zIHBhc3NlZCB0byBpbml0aWFsaXplIG1ldGhvZC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIHRvIGV4ZWN1dGUgd2hlbiBtYXAgd2FzIHVwZGF0ZWQuXG4gKi9cbmNsYXNzIFRocmVlanNMYXllciBleHRlbmRzIGdvb2dsZS5tYXBzLk92ZXJsYXlWaWV3IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zLCBjYWxsYmFjaykge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuYmluZEFsbCgpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZShvcHRpb25zIHx8IHt9KTtcblxuICAgICAgICB0aGlzLmZpcnN0UnVuID0gdHJ1ZTtcblxuICAgICAgICBpZiAob3B0aW9ucy5tYXApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0TWFwKG9wdGlvbnMubWFwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEJpbmQgYWxsIG1ldGhvZHMgdG8gdGhlIGluc3RhbmNlLlxuICAgICAqL1xuICAgIGJpbmRBbGwoKSB7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlID0gdGhpcztcblxuICAgICAgICBmdW5jdGlvbiBiaW5kKG5hbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IG1ldGhvZCA9IGluc3RhbmNlW25hbWVdO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QgIT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5zdGFuY2VbbmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1ldGhvZC5hcHBseShpbnN0YW5jZSwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBhbGwgaW4gaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGJpbmQoYWxsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIGxheWVyIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBvcHRpb25zIC0gT3B0aW9uc1xuICAgICAqL1xuICAgIGluaXRpYWxpemUob3B0aW9ucykge1xuXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuT3J0aG9ncmFwaGljQ2FtZXJhKDAsIDI1NSwgMCwgMjU1LCAtMzAwMCwgMzAwMCk7XG4gICAgICAgIHRoaXMuY2FtZXJhLnBvc2l0aW9uLnogPSAxMDAwO1xuICAgICAgICB0aGlzLnJlbmRlcmVydHlwZSA9IG9wdGlvbnMucmVuZGVyZXJ0eXBlIHx8ICcnO1xuICAgICAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cbiAgICAgICAgdGhpcy53ZWJnbCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICAgICAgICAgIHJldHVybiAhIXdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQgJiYgKGNhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbCcpIHx8IGNhbnZhcy5nZXRDb250ZXh0KCdleHBlcmltZW50YWwtd2ViZ2wnKSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSgpO1xuXG4gICAgICAgIGlmICh0aGlzLnJlbmRlcmVydHlwZSA9PSAnQ2FudmFzJyB8fCAhdGhpcy53ZWJnbCkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5DYW52YXNSZW5kZXJlcih7XG4gICAgICAgICAgICAgICAgYWxwaGE6IHRydWUsXG4gICAgICAgICAgICAgICAgY2xlYXJDb2xvcjogMHgwMDAwMDAsXG4gICAgICAgICAgICAgICAgY2xlYXJBbHBoYTogMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVydHlwZSA9ICdDYW52YXMnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHtcbiAgICAgICAgICAgICAgICBhbHBoYTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjbGVhckNvbG9yOiAweDAwMDAwMCxcbiAgICAgICAgICAgICAgICBjbGVhckFscGhhOiAwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXJ0eXBlID0gJ1dlYkdMJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2FudmFzID0gdGhpcy5yZW5kZXJlci5kb21FbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCBvbmNlIGFmdGVyIHNldE1hcCgpIGlzIGNhbGxlZCB3aXRoIGEgdmFsaWQgbWFwLlxuICAgICAqIEBzZWUgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vbWFwcy9kb2N1bWVudGF0aW9uL2phdmFzY3JpcHQvcmVmZXJlbmNlI092ZXJsYXlWaWV3XG4gICAgICovXG4gICAgb25BZGQoKSB7XG5cbiAgICAgICAgdGhpcy5tYXAgPSB0aGlzLmdldE1hcCgpO1xuXG4gICAgICAgIHRoaXMuZ2V0UGFuZXMoKS5vdmVybGF5TGF5ZXIuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xuXG4gICAgICAgIHRoaXMuY2hhbmdlSGFuZGxlciA9IGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKFxuICAgICAgICAgICAgdGhpcy5tYXAsXG4gICAgICAgICAgICAnYm91bmRzX2NoYW5nZWQnLFxuICAgICAgICAgICAgdGhpcy5kcmF3XG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIG9uY2UgZm9sbG93aW5nIGEgY2FsbCB0byBzZXRNYXAobnVsbCkuXG4gICAgICogQHNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9tYXBzL2RvY3VtZW50YXRpb24vamF2YXNjcmlwdC9yZWZlcmVuY2UjT3ZlcmxheVZpZXdcbiAgICAgKi9cbiAgICBvblJlbW92ZSgpIHtcblxuICAgICAgICBpZiAoIXRoaXMubWFwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1hcCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5jYW52YXMucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmNhbnZhcyk7XG5cbiAgICAgICAgaWYgKHRoaXMuY2hhbmdlSGFuZGxlcikge1xuICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQucmVtb3ZlTGlzdGVuZXIodGhpcy5jaGFuZ2VIYW5kbGVyKTtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlSGFuZGxlciA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgd2hlbiB0aGUgbGF5ZXIgcG9zdGlvbiBuZWVkcyBhbiB1cGRhdGUuXG4gICAgICovXG4gICAgZHJhdygpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1hcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gdGhpcy5tYXAuZ2V0Qm91bmRzKCk7XG5cbiAgICAgICAgY29uc3QgdG9wTGVmdCA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXG4gICAgICAgICAgICBib3VuZHMuZ2V0Tm9ydGhFYXN0KCkubGF0KCksXG4gICAgICAgICAgICBib3VuZHMuZ2V0U291dGhXZXN0KCkubG5nKClcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBwcm9qZWN0aW9uID0gdGhpcy5nZXRQcm9qZWN0aW9uKCk7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gcHJvamVjdGlvbi5mcm9tTGF0TG5nVG9EaXZQaXhlbCh0b3BMZWZ0KTtcblxuICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZVtUaHJlZWpzTGF5ZXIuQ1NTX1RSQU5TRk9STV0gPSAndHJhbnNsYXRlKCcgK1xuICAgICAgICAgICAgTWF0aC5yb3VuZChwb2ludC54KSArICdweCwnICtcbiAgICAgICAgICAgIE1hdGgucm91bmQocG9pbnQueSkgKyAncHgpJztcblxuICAgICAgICBpZiAodGhpcy5maXJzdFJ1bikge1xuICAgICAgICAgICAgdGhpcy5maXJzdFJ1biA9IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5jYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2sodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGwgdGhpcyBtZXRob2Qgd2hlbiB0aGUgbGF5ZXIncyBzaXplIGNoYW5nZWQuXG4gICAgICovXG4gICAgcmVzaXplKCkge1xuXG4gICAgICAgIGlmICghdGhpcy5tYXApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRpdiA9IHRoaXMubWFwLmdldERpdigpLFxuICAgICAgICAgICAgd2lkdGggPSBkaXYuY2xpZW50V2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQgPSBkaXYuY2xpZW50SGVpZ2h0O1xuXG4gICAgICAgIGlmICh3aWR0aCA9PSB0aGlzLndpZHRoICYmIGhlaWdodCA9PSB0aGlzLmhlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICB0aGlzLnJlbmRlcmVyLnNldFNpemUod2lkdGgsIGhlaWdodCk7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIHdoZW4gdGhlIFRocmVlLmpzIGNhbWVyYSBuZWVkcyBhbiB1cGRhdGUuXG4gICAgICovXG4gICAgdXBkYXRlKCkge1xuICAgICAgICBjb25zdCBwcm9qZWN0aW9uID0gdGhpcy5tYXAuZ2V0UHJvamVjdGlvbigpO1xuXG4gICAgICAgIGlmICghcHJvamVjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYm91bmRzID0gdGhpcy5tYXAuZ2V0Qm91bmRzKCk7XG5cbiAgICAgICAgY29uc3QgdG9wTGVmdCA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXG4gICAgICAgICAgICBib3VuZHMuZ2V0Tm9ydGhFYXN0KCkubGF0KCksXG4gICAgICAgICAgICBib3VuZHMuZ2V0U291dGhXZXN0KCkubG5nKClcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCB6b29tID0gdGhpcy5tYXAuZ2V0Wm9vbSgpO1xuICAgICAgICBjb25zdCBzY2FsZSA9IE1hdGgucG93KDIsIHpvb20pO1xuICAgICAgICBjb25zdCBvZmZzZXQgPSBwcm9qZWN0aW9uLmZyb21MYXRMbmdUb1BvaW50KHRvcExlZnQpO1xuXG4gICAgICAgIHRoaXMucmVzaXplKCk7XG5cbiAgICAgICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueCA9IG9mZnNldC54O1xuICAgICAgICB0aGlzLmNhbWVyYS5wb3NpdGlvbi55ID0gb2Zmc2V0Lnk7XG5cbiAgICAgICAgdGhpcy5jYW1lcmEuc2NhbGUueCA9IHRoaXMud2lkdGggLyAyNTYgLyBzY2FsZTtcbiAgICAgICAgdGhpcy5jYW1lcmEuc2NhbGUueSA9IHRoaXMuaGVpZ2h0IC8gMjU2IC8gc2NhbGU7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXJzIHRoZSBsYXllciBkZWZlcnJlZC5cbiAgICAgKi9cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0aW9uRnJhbWUpO1xuICAgICAgICB0aGlzLmFuaW1hdGlvbkZyYW1lID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuZGVmZXJyZWRSZW5kZXIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBmaW5hbCByZW5kZXJpbmcuIElmIHlvdSBoYXZlIHBhc3NlZCBhIGZ1bmN0aW9uIHRvIGBvcHRpb25zLnJlbmRlcmBcbiAgICAgKiBpdCB3aWxsIGJlIGV4ZWN1dGVkIGhlcmUuXG4gICAgICovXG4gICAgZGVmZXJyZWRSZW5kZXIoKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLnJlbmRlciA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLnJlbmRlciA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5yZW5kZXIoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIHRoaXMuY2FtZXJhKTtcbiAgICAgICAgfVxuICAgIH1cblxuO1xuXG4gICAgLyoqXG4gICAgICogU2hvcnRjdXQgbWV0aG9kIHRvIGFkZCBuZXcgZ2VvbWV0cnkgdG8gdGhlIHNjZW5lLlxuICAgICAqIEBwYXJhbSAge0dlb21ldHJ5fSBnZW9tZXRyeSBUaGUgVGhyZWUuanMgZ2VvbWV0cnkgdG8gYWRkLlxuICAgICAqL1xuICAgIGFkZChnZW9tZXRyeSkge1xuICAgICAgICB0aGlzLnNjZW5lLmFkZChnZW9tZXRyeSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGVscGVyIG1ldGhvZCB0byBjb252ZXJ0IGZvciBMYXRMbmcgdG8gdmVydGV4LlxuICAgICAqIEBwYXJhbSAge2dvb2dsZS5tYXBzLkxhdExuZ30gbGF0TG5nIC0gVGhlIExhdExuZyB0byBjb252ZXJ0LlxuICAgICAqIEByZXR1cm4ge1RIUkVFLlZlY3RvcjN9IFRoZSByZXN1bHRpbmcgdmVydGV4LlxuICAgICAqL1xuICAgIGZyb21MYXRMbmdUb1ZlcnRleChsYXRMbmcpIHtcbiAgICAgICAgY29uc3QgcHJvamVjdGlvbiA9IHRoaXMubWFwLmdldFByb2plY3Rpb24oKTtcbiAgICAgICAgY29uc3QgcG9pbnQgPSBwcm9qZWN0aW9uLmZyb21MYXRMbmdUb1BvaW50KGxhdExuZyk7XG4gICAgICAgIGNvbnN0IHZlcnRleCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cbiAgICAgICAgdmVydGV4LnggPSBwb2ludC54O1xuICAgICAgICB2ZXJ0ZXgueSA9IHBvaW50Lnk7XG4gICAgICAgIHZlcnRleC56ID0gMDtcblxuICAgICAgICByZXR1cm4gdmVydGV4O1xuICAgIH1cbn1cblxuLyoqXG4gKiBHZXQgYnJvd3NlciBzcGVjaWZpdiBDU1MgdHJhbnNmb3JtIHByb3BlcnR5LlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gVGhlIHByb3BlcnR5LlxuICovXG5UaHJlZWpzTGF5ZXIuQ1NTX1RSQU5TRk9STSA9IChmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29uc3QgcHJvcHMgPSBbXG4gICAgICAgICd0cmFuc2Zvcm0nLFxuICAgICAgICAnV2Via2l0VHJhbnNmb3JtJyxcbiAgICAgICAgJ01velRyYW5zZm9ybScsXG4gICAgICAgICdPVHJhbnNmb3JtJyxcbiAgICAgICAgJ21zVHJhbnNmb3JtJ1xuICAgIF07XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHByb3AgPSBwcm9wc1tpXTtcbiAgICAgICAgaWYgKGRpdi5zdHlsZVtwcm9wXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvcDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBwcm9wc1swXTtcbn0pKCk7XG5cbmlmICh3aW5kb3cpIHtcbiAgICB3aW5kb3cuVGhyZWVqc0xheWVyID0gVGhyZWVqc0xheWVyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRocmVlanNMYXllcjtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3RocmVlanMtbGF5ZXIuanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9PYmplY3QkY3JlYXRlID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvY3JlYXRlXCIpW1wiZGVmYXVsdFwiXTtcblxudmFyIF9PYmplY3Qkc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9zZXQtcHJvdG90eXBlLW9mXCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpO1xuICB9XG5cbiAgc3ViQ2xhc3MucHJvdG90eXBlID0gX09iamVjdCRjcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKHN1cGVyQ2xhc3MpIF9PYmplY3Qkc2V0UHJvdG90eXBlT2YgPyBfT2JqZWN0JHNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9pbmhlcml0cy5qc1xuICoqIG1vZHVsZSBpZCA9IDFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvY3JlYXRlXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9jcmVhdGUuanNcbiAqKiBtb2R1bGUgaWQgPSAyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgJCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGUoUCwgRCl7XG4gIHJldHVybiAkLmNyZWF0ZShQLCBEKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvY3JlYXRlLmpzXG4gKiogbW9kdWxlIGlkID0gM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyICRPYmplY3QgPSBPYmplY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiAgICAgJE9iamVjdC5jcmVhdGUsXG4gIGdldFByb3RvOiAgICRPYmplY3QuZ2V0UHJvdG90eXBlT2YsXG4gIGlzRW51bTogICAgIHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlLFxuICBnZXREZXNjOiAgICAkT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgc2V0RGVzYzogICAgJE9iamVjdC5kZWZpbmVQcm9wZXJ0eSxcbiAgc2V0RGVzY3M6ICAgJE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzLFxuICBnZXRLZXlzOiAgICAkT2JqZWN0LmtleXMsXG4gIGdldE5hbWVzOiAgICRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgZ2V0U3ltYm9sczogJE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMsXG4gIGVhY2g6ICAgICAgIFtdLmZvckVhY2hcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuanNcbiAqKiBtb2R1bGUgaWQgPSA0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L3NldC1wcm90b3R5cGUtb2ZcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L3NldC1wcm90b3R5cGUtb2YuanNcbiAqKiBtb2R1bGUgaWQgPSA1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQuY29yZScpLk9iamVjdC5zZXRQcm90b3R5cGVPZjtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9zZXQtcHJvdG90eXBlLW9mLmpzXG4gKiogbW9kdWxlIGlkID0gNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4zLjE5IE9iamVjdC5zZXRQcm90b3R5cGVPZihPLCBwcm90bylcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7c2V0UHJvdG90eXBlT2Y6IHJlcXVpcmUoJy4vJC5zZXQtcHJvdG8nKS5zZXR9KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5zZXQtcHJvdG90eXBlLW9mLmpzXG4gKiogbW9kdWxlIGlkID0gN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGdsb2JhbCAgICA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKVxuICAsIGNvcmUgICAgICA9IHJlcXVpcmUoJy4vJC5jb3JlJylcbiAgLCBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcbnZhciBjdHggPSBmdW5jdGlvbihmbiwgdGhhdCl7XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufTtcbnZhciAkZGVmID0gZnVuY3Rpb24odHlwZSwgbmFtZSwgc291cmNlKXtcbiAgdmFyIGtleSwgb3duLCBvdXQsIGV4cFxuICAgICwgaXNHbG9iYWwgPSB0eXBlICYgJGRlZi5HXG4gICAgLCBpc1Byb3RvICA9IHR5cGUgJiAkZGVmLlBcbiAgICAsIHRhcmdldCAgID0gaXNHbG9iYWwgPyBnbG9iYWwgOiB0eXBlICYgJGRlZi5TXG4gICAgICAgID8gZ2xvYmFsW25hbWVdIDogKGdsb2JhbFtuYW1lXSB8fCB7fSlbUFJPVE9UWVBFXVxuICAgICwgZXhwb3J0cyAgPSBpc0dsb2JhbCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pO1xuICBpZihpc0dsb2JhbClzb3VyY2UgPSBuYW1lO1xuICBmb3Ioa2V5IGluIHNvdXJjZSl7XG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXG4gICAgb3duID0gISh0eXBlICYgJGRlZi5GKSAmJiB0YXJnZXQgJiYga2V5IGluIHRhcmdldDtcbiAgICBpZihvd24gJiYga2V5IGluIGV4cG9ydHMpY29udGludWU7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSBvd24gPyB0YXJnZXRba2V5XSA6IHNvdXJjZVtrZXldO1xuICAgIC8vIHByZXZlbnQgZ2xvYmFsIHBvbGx1dGlvbiBmb3IgbmFtZXNwYWNlc1xuICAgIGlmKGlzR2xvYmFsICYmIHR5cGVvZiB0YXJnZXRba2V5XSAhPSAnZnVuY3Rpb24nKWV4cCA9IHNvdXJjZVtrZXldO1xuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XG4gICAgZWxzZSBpZih0eXBlICYgJGRlZi5CICYmIG93billeHAgPSBjdHgob3V0LCBnbG9iYWwpO1xuICAgIC8vIHdyYXAgZ2xvYmFsIGNvbnN0cnVjdG9ycyBmb3IgcHJldmVudCBjaGFuZ2UgdGhlbSBpbiBsaWJyYXJ5XG4gICAgZWxzZSBpZih0eXBlICYgJGRlZi5XICYmIHRhcmdldFtrZXldID09IG91dCkhZnVuY3Rpb24oQyl7XG4gICAgICBleHAgPSBmdW5jdGlvbihwYXJhbSl7XG4gICAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQyA/IG5ldyBDKHBhcmFtKSA6IEMocGFyYW0pO1xuICAgICAgfTtcbiAgICAgIGV4cFtQUk9UT1RZUEVdID0gQ1tQUk9UT1RZUEVdO1xuICAgIH0ob3V0KTtcbiAgICBlbHNlIGV4cCA9IGlzUHJvdG8gJiYgdHlwZW9mIG91dCA9PSAnZnVuY3Rpb24nID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XG4gICAgLy8gZXhwb3J0XG4gICAgZXhwb3J0c1trZXldID0gZXhwO1xuICAgIGlmKGlzUHJvdG8pKGV4cG9ydHNbUFJPVE9UWVBFXSB8fCAoZXhwb3J0c1tQUk9UT1RZUEVdID0ge30pKVtrZXldID0gb3V0O1xuICB9XG59O1xuLy8gdHlwZSBiaXRtYXBcbiRkZWYuRiA9IDE7ICAvLyBmb3JjZWRcbiRkZWYuRyA9IDI7ICAvLyBnbG9iYWxcbiRkZWYuUyA9IDQ7ICAvLyBzdGF0aWNcbiRkZWYuUCA9IDg7ICAvLyBwcm90b1xuJGRlZi5CID0gMTY7IC8vIGJpbmRcbiRkZWYuVyA9IDMyOyAvLyB3cmFwXG5tb2R1bGUuZXhwb3J0cyA9ICRkZWY7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZGVmLmpzXG4gKiogbW9kdWxlIGlkID0gOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0xMTU3NTkwMjhcbnZhciBVTkRFRklORUQgPSAndW5kZWZpbmVkJztcbnZhciBnbG9iYWwgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiB3aW5kb3cgIT0gVU5ERUZJTkVEICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSBVTkRFRklORUQgJiYgc2VsZi5NYXRoID09IE1hdGggPyBzZWxmIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbmlmKHR5cGVvZiBfX2cgPT0gJ251bWJlcicpX19nID0gZ2xvYmFsOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZ2xvYmFsLmpzXG4gKiogbW9kdWxlIGlkID0gOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGNvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuaWYodHlwZW9mIF9fZSA9PSAnbnVtYmVyJylfX2UgPSBjb3JlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29yZS5qc1xuICoqIG1vZHVsZSBpZCA9IDEwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBXb3JrcyB3aXRoIF9fcHJvdG9fXyBvbmx5LiBPbGQgdjggY2FuJ3Qgd29yayB3aXRoIG51bGwgcHJvdG8gb2JqZWN0cy5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXG52YXIgZ2V0RGVzYyAgPSByZXF1aXJlKCcuLyQnKS5nZXREZXNjXG4gICwgaXNPYmplY3QgPSByZXF1aXJlKCcuLyQuaXMtb2JqZWN0JylcbiAgLCBhbk9iamVjdCA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKTtcbnZhciBjaGVjayA9IGZ1bmN0aW9uKE8sIHByb3RvKXtcbiAgYW5PYmplY3QoTyk7XG4gIGlmKCFpc09iamVjdChwcm90bykgJiYgcHJvdG8gIT09IG51bGwpdGhyb3cgVHlwZUVycm9yKHByb3RvICsgXCI6IGNhbid0IHNldCBhcyBwcm90b3R5cGUhXCIpO1xufTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXQ6IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCAoJ19fcHJvdG9fXycgaW4ge30gLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgID8gZnVuY3Rpb24oYnVnZ3ksIHNldCl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc2V0ID0gcmVxdWlyZSgnLi8kLmN0eCcpKEZ1bmN0aW9uLmNhbGwsIGdldERlc2MoT2JqZWN0LnByb3RvdHlwZSwgJ19fcHJvdG9fXycpLnNldCwgMik7XG4gICAgICAgICAgc2V0KHt9LCBbXSk7XG4gICAgICAgIH0gY2F0Y2goZSl7IGJ1Z2d5ID0gdHJ1ZTsgfVxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pe1xuICAgICAgICAgIGNoZWNrKE8sIHByb3RvKTtcbiAgICAgICAgICBpZihidWdneSlPLl9fcHJvdG9fXyA9IHByb3RvO1xuICAgICAgICAgIGVsc2Ugc2V0KE8sIHByb3RvKTtcbiAgICAgICAgICByZXR1cm4gTztcbiAgICAgICAgfTtcbiAgICAgIH0oKVxuICAgIDogdW5kZWZpbmVkKSxcbiAgY2hlY2s6IGNoZWNrXG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnNldC1wcm90by5qc1xuICoqIG1vZHVsZSBpZCA9IDExXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBodHRwOi8vanNwZXJmLmNvbS9jb3JlLWpzLWlzb2JqZWN0XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0ICE9PSBudWxsICYmICh0eXBlb2YgaXQgPT0gJ29iamVjdCcgfHwgdHlwZW9mIGl0ID09ICdmdW5jdGlvbicpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pcy1vYmplY3QuanNcbiAqKiBtb2R1bGUgaWQgPSAxMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKCFpc09iamVjdChpdCkpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmFuLW9iamVjdC5qc1xuICoqIG1vZHVsZSBpZCA9IDEzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBvcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuLyQuYS1mdW5jdGlvbicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgdGhhdCwgbGVuZ3RoKXtcbiAgYUZ1bmN0aW9uKGZuKTtcbiAgaWYodGhhdCA9PT0gdW5kZWZpbmVkKXJldHVybiBmbjtcbiAgc3dpdGNoKGxlbmd0aCl7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYSl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbihhLCBiLCBjKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH0gcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gICAgfTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY3R4LmpzXG4gKiogbW9kdWxlIGlkID0gMTRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZih0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmEtZnVuY3Rpb24uanNcbiAqKiBtb2R1bGUgaWQgPSAxNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2NsYXNzLWNhbGwtY2hlY2suanNcbiAqKiBtb2R1bGUgaWQgPSAxNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIl0sInNvdXJjZVJvb3QiOiIifQ==