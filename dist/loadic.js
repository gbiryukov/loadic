'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var INTERVAL_TIME = 500;
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
    },
    timeout: {
        type: Number,
        value: false
    }
};

var Loader = (function () {
    function Loader(config) {
        _classCallCheck(this, Loader);

        // config sanitization
        for (var key in DEFAULTS) {
            if (!(config[key] instanceof DEFAULTS[key].type)) {
                config[key] = DEFAULTS[key].value;
            }
        }

        // update filenames for high dpi resources
        if (config.highDpiCondition()) {
            config.dpiDependent = config.dpiDependent.map(function (item) {
                return item = item.replace(/(\..+)$/, config.highDpiSuffix + '$1');
            });
        }

        this.progress = 0;
        this.loadedCount = 0;
        this.resources = this.getManifest(config);
        this.resourcesTotal = this.resources.length;

        if (config.timeout) {
            this.scheduleComplete(config.timeout);
        }

        for (var i in this.resources) {
            var res = this.resources[i];

            if (res.xhr) {
                this.XhrPreload(res);
            } else {
                this.preload(res);
            }
        }

        this.simulateProgress();

        return this;
    }

    _createClass(Loader, [{
        key: 'preload',
        value: function preload(resource) {
            var _this = this;

            var isStyle = /.css$/.test(resource.src),
                isScript = /.js$/.test(resource.src),
                srcName = 'data',
                element = document.createElement('object');

            if (isStyle) {
                element = document.createElement('link');
                element.rel = 'stylesheet';
                srcName = 'href';
            } else if (isScript) {
                element = document.createElement('script');
                srcName = 'src';
            } else {
                element.style.width = 0;
                element.style.height = 0;
            }

            element.onload = function () {
                resource.loaded = true;
                _this.loaded(resource);
            };

            element.onerror = function () {
                _this.loaded(resource);
            };

            element[srcName] = resource.src;
            document.body.appendChild(element);
        }
    }, {
        key: 'XhrPreload',
        value: function XhrPreload(resource) {
            var _this2 = this;

            var xhr = new XMLHttpRequest();
            xhr.open('GET', resource.src, true);
            xhr.responseType = 'arraybuffer';

            xhr.onload = function (event) {
                resource.loaded = true;
                resource.data = event.target.response;
                _this2.loaded(resource);
            };

            xhr.onerror = function () {
                _this2.loaded(resource);
            };

            xhr.send();
        }
    }, {
        key: 'loaded',
        value: function loaded(resource) {
            this.loadedCount++;
            this.updateProgress();

            if (resource.required && this.loadingTimedOut) {
                this.scheduleComplete(0);
            }

            if (this.loadedCount === this.resourcesTotal) {
                this.complete();
            }
        }
    }, {
        key: 'complete',
        value: function complete() {
            clearInterval(this.intervalId);
            clearInterval(this.timeoutId);

            if ('onComplete' in this) {
                this.onComplete(this.resources);
            }
        }
    }, {
        key: 'updateProgress',
        value: function updateProgress(forcePercent) {
            var realProgress = parseInt(this.loadedCount / this.resourcesTotal * 100);

            if (this.progress < realProgress) {
                this.progress = realProgress;
            }

            if (this.progress < forcePercent) {
                this.progress = forcePercent;
            }

            if ('onProgress' in this) {
                this.onProgress(this.progress);
            }
        }
    }, {
        key: 'scheduleComplete',
        value: function scheduleComplete(timeout) {
            var _this3 = this;

            this.timeoutId = setTimeout(function () {
                var isAllRequiredLoaded = _this3.resources.some(function (resource) {
                    return resource.required && resource.loaded;
                });

                if (isAllRequiredLoaded) {
                    _this3.complete();
                } else {
                    _this3.loadingTimedOut = true;
                }
            }, timeout);
        }
    }, {
        key: 'simulateProgress',
        value: function simulateProgress() {
            var _this4 = this;

            var iteration = 0;

            this.intervalId = setInterval(function () {
                iteration++;

                var progressInc = 5 / Math.ceil(iteration / 10) * (1 - _this4.progress / 100);

                if (_this4.progress + progressInc < 95) {
                    _this4.updateProgress(_this4.progress + progressInc);
                } else {
                    clearInterval(_this4.intervalId);
                }
            }, INTERVAL_TIME);
        }
    }, {
        key: 'getManifest',
        value: function getManifest(config) {
            var urls = config.common.concat(config.dpiDependent);

            var resources = urls.map(function (url) {
                var resource = {};

                if (typeof url === 'string') {
                    if (url.lastIndexOf('!') === url.length - 1) {
                        resource.src = url.substr(0, url.length - 1);
                        resource.required = true;
                    } else if (url.lastIndexOf('*') === url.length - 1) {
                        resource.src = url.substr(0, url.length - 1);
                        resource.required = true;
                        resource.xhr = true;
                    } else {
                        resource.src = url;
                    }
                } else {
                    resource = url;
                }

                return resource;
            });

            return resources.sort(function (resource) {
                return resource.required ? -1 : 1;
            });
        }
    }]);

    return Loader;
})();

exports.default = Loader;
;