'use strict';

const INTERVAL_TIME = 500;
const DEFAULTS = {
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
        value: () => {
            return window.devicePixelRatio > 1;
        }
    },
    timeout: {
        type: Number,
        value: false
    },
    baseUrl: {
        type: String,
        value: ''
    }
};

export default class Loader {
    constructor(config){

        // config sanitization
        for (let key in DEFAULTS){
            if (!(config[key] && config[key].constructor === DEFAULTS[key].type)) {
                config[key] = DEFAULTS[key].value;
            }
        }

        // update filenames for high dpi resources
        if (config.highDpiCondition()) {
            config.dpiDependent = config.dpiDependent.map(function(item){
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

        for (let i in this.resources){
            let res = this.resources[i];

            if (res.xhr) {
                this.XhrPreload(res);
            } else {
                this.preload(res);
            }
        }

        this.simulateProgress();

        return this;
    }

    preload(resource) {
        let isStyle = /.css$/.test(resource.src),
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

        element.onload = () => {
            resource.loaded = true;
            this.loaded(resource);
        };

        element.onerror = () => {
            this.loaded(resource);
        };

        element[srcName] = resource.src;
        document.body.appendChild(element);
    }

    XhrPreload(resource){
        let xhr = new XMLHttpRequest();
        xhr.open('GET', resource.src, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = (event) => {
            resource.loaded = true;
            resource.data = event.target.response;
            this.loaded(resource);
        };

        xhr.onerror = () => {
            this.loaded(resource);
        };

        xhr.send();
    }

    loaded(resource) {
        this.loadedCount++;
        this.updateProgress();

        if (resource.required && this.loadingTimedOut) {
            this.scheduleComplete(0);
        }

        if (this.loadedCount === this.resourcesTotal) {
            this.complete();
        }
    }

    complete() {
        clearInterval(this.intervalId);
        clearInterval(this.timeoutId);

        if ('onComplete' in this){
            this.onComplete(this.resources);
        }
    }

    updateProgress(forcePercent){
        let realProgress = parseInt(this.loadedCount / this.resourcesTotal * 100);

        if (this.progress < realProgress){
            this.progress = realProgress;
        }

        if (this.progress < forcePercent){
            this.progress = forcePercent;
        }

        if ('onProgress' in this){
            this.onProgress(this.progress);
        }
    }

    scheduleComplete(timeout){
        this.timeoutId = setTimeout(() => {
            let isAllRequiredLoaded = this.resources.some((resource) => {
                return resource.required && resource.loaded;
            });

            if (isAllRequiredLoaded){
                this.complete();
            } else {
                this.loadingTimedOut = true;
            }

        }, timeout);
    }

    simulateProgress(){
        let iteration = 0;

        this.intervalId = setInterval(() => {
            iteration++;

            let progressInc = 5 / Math.ceil(iteration / 10) * (1 - this.progress / 100);

            if (this.progress + progressInc < 95) {
                this.updateProgress(this.progress + progressInc);
            } else {
                clearInterval(this.intervalId);
            }
        }, INTERVAL_TIME);
    }

    getManifest(config){
        let urls = config.common.concat(config.dpiDependent);

        let resources = urls.map((url) => {
            let resource = {};

            if (typeof(url) === 'string') {
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

            if (resource.src.indexOf('http') !== 0) {
                resource.src = `${config.baseUrl}${resource.src}`;
            }

            return resource;
        });

        return resources.sort(res => res.required ? -1 : 1);
    }
};
