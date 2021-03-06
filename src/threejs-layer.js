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
class ThreejsLayer extends google.maps.OverlayView {
    constructor(options, callback) {
        super();

        this.bindAll();
        this.callback = callback;
        this.initialize(options || {});

        this.firstRun = true;

        if (options.map) {
            this.setMap(options.map);
        }
    }

    /**
     * Bind all methods to the instance.
     */
    bindAll() {
        const instance = this;

        function bind(name) {
            const method = instance[name];
            if (typeof method != "function") {
                return;
            }
            instance[name] = function () {
                return method.apply(instance, arguments);
            };
        }

        for (let all in instance) {
            bind(all);
        }
    }

    /**
     * Initialize the layer with the given options.
     * @param  {Object} options - Options
     */
    initialize(options) {

        this.options = options;

        this.camera = new THREE.OrthographicCamera(0, 255, 0, 255, -3000, 3000);
        this.camera.position.z = 1000;
        this.renderertype = options.renderertype || '';
        this.scene = new THREE.Scene();

        this.webgl = (function () {
            try {
                const canvas = document.createElement('canvas');
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
    }

    /**
     * This method is called once after setMap() is called with a valid map.
     * @see https://developers.google.com/maps/documentation/javascript/reference#OverlayView
     */
    onAdd() {

        this.map = this.getMap();

        this.getPanes().overlayLayer.appendChild(this.canvas);

        this.changeHandler = google.maps.event.addListener(
            this.map,
            'bounds_changed',
            this.draw
        );

        this.draw();
    }

    /**
     * This method is called once following a call to setMap(null).
     * @see https://developers.google.com/maps/documentation/javascript/reference#OverlayView
     */
    onRemove() {

        if (!this.map) {
            return;
        }

        this.map = null;

        this.canvas.parentElement.removeChild(this.canvas);

        if (this.changeHandler) {
            google.maps.event.removeListener(this.changeHandler);
            this.changeHandler = null;
        }
    }

    /**
     * This method is called when the layer postion needs an update.
     */
    draw() {
        if (!this.map) {
            return;
        }

        const bounds = this.map.getBounds();

        const topLeft = new google.maps.LatLng(
            bounds.getNorthEast().lat(),
            bounds.getSouthWest().lng()
        );

        const projection = this.getProjection();
        const point = projection.fromLatLngToDivPixel(topLeft);

        this.canvas.style[ThreejsLayer.CSS_TRANSFORM] = 'translate(' +
            Math.round(point.x) + 'px,' +
            Math.round(point.y) + 'px)';

        if (this.firstRun) {
            this.firstRun = false;

            if (this.callback) {
                this.callback(this);
            }
        }

        this.update();
    }

    /**
     * Call this method when the layer's size changed.
     */
    resize() {

        if (!this.map) {
            return;
        }

        const div = this.map.getDiv(),
            width = div.clientWidth,
            height = div.clientHeight;

        if (width == this.width && height == this.height) {
            return;
        }

        this.width = width;
        this.height = height;

        this.renderer.setSize(width, height);
        this.update();
    }

    /**
     * This method is called when the Three.js camera needs an update.
     */
    update() {
        const projection = this.map.getProjection();

        if (!projection) {
            return;
        }

        const bounds = this.map.getBounds();

        const topLeft = new google.maps.LatLng(
            bounds.getNorthEast().lat(),
            bounds.getSouthWest().lng()
        );

        const zoom = this.map.getZoom();
        const scale = Math.pow(2, zoom);
        const offset = projection.fromLatLngToPoint(topLeft);

        this.resize();

        this.camera.position.x = offset.x;
        this.camera.position.y = offset.y;

        this.camera.scale.x = this.width / 256 / scale;
        this.camera.scale.y = this.height / 256 / scale;

        this.render();
    }

    /**
     * Renders the layer deferred.
     */
    render() {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = requestAnimationFrame(this.deferredRender);
    }

    /**
     * The final rendering. If you have passed a function to `options.render`
     * it will be executed here.
     */
    deferredRender() {
        if (typeof this.options.render === false) {
            return;
        } else if (typeof this.options.render == "function") {
            this.options.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

;

    /**
     * Shortcut method to add new geometry to the scene.
     * @param  {Geometry} geometry The Three.js geometry to add.
     */
    add(geometry) {
        this.scene.add(geometry);
    }

    /**
     * Shortcut method to remove existing geometry from to the scene.
     * @param  {Geometry} geometry The Three.js geometry to remove.
     */
    remove(geometry) {
        this.scene.remove(geometry);
    }

    /**
     * Helper method to convert for LatLng to vertex.
     * @param  {google.maps.LatLng} latLng - The LatLng to convert.
     * @return {THREE.Vector3} The resulting vertex.
     */
    fromLatLngToVertex(latLng) {
        const projection = this.map.getProjection();
        const point = projection.fromLatLngToPoint(latLng);
        const vertex = new THREE.Vector3();

        vertex.x = point.x;
        vertex.y = point.y;
        vertex.z = 0;

        return vertex;
    }
}

/**
 * Get browser specifiv CSS transform property.
 *
 * @return {String} The property.
 */
ThreejsLayer.CSS_TRANSFORM = (function () {
    const div = document.createElement('div');
    const props = [
        'transform',
        'WebkitTransform',
        'MozTransform',
        'OTransform',
        'msTransform'
    ];

    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
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
