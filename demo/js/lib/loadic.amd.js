'use strict';

define(['exports'], function (exports) {
    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = (function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    })();

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

            for (var key in DEFAULTS) {
                if (!config[key] instanceof DEFAULTS[key].type) {
                    config[key] = DEFAULTS[key].value;
                }
            }

            if (config.highDpiCondition()) {
                config.dpiDependent = config.dpiDependent.map(function (item) {
                    return item = item.replace(/(\..+)$/, config.highDpiSuffix + '$1');
                });
            }

            var resources = config.common.concat(config.dpiDependent);
            this.loadedCount = 0;
            this.resourcesTotal = resources.length;
            this.progress = 0;

            if (config.timeout) {
                this.scheduleComplete(config.timeout);
            }

            for (var i in resources) {
                this.preload(resources[i]);
            }

            this.simulateProgress();
            return this;
        }

        _createClass(Loader, [{
            key: 'preload',
            value: function preload(url) {
                var _this = this;

                var isStyle = /.css$/.test(url),
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
                    _this.loaded();
                };

                resource.onerror = function () {
                    _this.loaded();
                };

                resource[srcName] = url;
                document.body.appendChild(resource);
            }
        }, {
            key: 'loaded',
            value: function loaded() {
                this.loadedCount++;
                this.updateProgress();

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
                    this.onComplete();
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
                var _this2 = this;

                this.timeoutId = setTimeout(function () {
                    _this2.complete();
                }, timeout);
            }
        }, {
            key: 'simulateProgress',
            value: function simulateProgress() {
                var _this3 = this;

                var iteration = 0;
                this.intervalId = setInterval(function () {
                    iteration++;
                    var progressInc = 5 / Math.ceil(iteration / 10) * (1 - _this3.progress / 100);

                    if (_this3.progress + progressInc < 95) {
                        _this3.updateProgress(_this3.progress + progressInc);
                    }
                }, INTERVAL_TIME);
            }
        }]);

        return Loader;
    })();

    exports.default = Loader;
    ;
});