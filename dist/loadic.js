'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULTS = {
    common: {
        type: Array,
        value: []
    },
    dpiDependent: {
        type: Array,
        value: []
    },
    highDpiSuffix: {
        type: String,
        value: '@2x'
    },
    highDpiCondition: {
        type: Function,
        value: function value() {
            return window.devicePixelRatio > 1;
        }
    }
};

var Loader = (function () {
    function Loader(config) {
        _classCallCheck(this, Loader);

        // config sanitization
        for (var key in config) {
            if (!config[key] instanceof DEFAULTS[key].type) {
                config[key] = DEFAULTS[key].value;
            }
        }

        // update filenames for high dpi resources
        if (config.highDpiCondition()) {
            config.dpiDependent = config.dpiDependent.map(function (item) {
                return item = item.replace(/(\..+)$/, config.highDpiSuffix + '$1');
            });
        }

        var resources = config.common.concat(config.dpiDependent);

        this.loadedCount = 0;
        this.resourcesTotal = resources.length;

        for (var i in resources) {
            this.preload(resources[i]);
        }

        return this;
    }

    _createClass(Loader, [{
        key: 'preload',
        value: function preload(url) {
            var self = this,
                isStyle = /.css$/.test(url),
                srcName = 'data',
                resource = document.createElement('object');

            if (isStyle) {
                resource = document.createElement('link');
                resource.rel = 'stylesheet';
                srcName = 'href';
            } else {
                resource.width = 0;
                resource.height = 0;
            }

            resource.onload = function () {
                self.loaded();
            };

            resource.onerror = function () {
                self.loaded();
            };

            resource[srcName] = url;
            document.body.appendChild(resource);
        }
    }, {
        key: 'loaded',
        value: function loaded() {
            this.loadedCount++;

            if ('onProgress' in this) {
                this.onProgress(parseInt(this.loadedCount / this.resourcesTotal * 100));
            }

            if (this.loadedCount === this.resourcesTotal) {
                this.complete();
            }
        }
    }, {
        key: 'complete',
        value: function complete() {
            if ('onComplete' in this) {
                this.onComplete();
            }
        }
    }]);

    return Loader;
})();

exports.default = Loader;
;