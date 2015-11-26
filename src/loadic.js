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
    }
};

export default class Loader {
    constructor(config){

        // config sanitization
        for (let key in DEFAULTS){
            if (!(config[key] instanceof DEFAULTS[key].type)) {
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
            this.preload(this.resources[i]);
        }

        this.simulateProgress();

        return this;
    }

    preload(resource) {
        let isStyle = /.css$/.test(resource.src),
            srcName = 'data',
            element = document.createElement('object');

        if (isStyle) {
            element = document.createElement('link');
            element.rel = 'stylesheet';
            srcName = 'href';
        } else {
            element.width = 0;
            element.height = 0;
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
            this.onComplete();
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
            let resource;

            if (typeof(url) === 'string') {
                if (url.lastIndexOf('!') === url.length - 1) {
                    resource = {
                        src: url.substr(0, url.length - 1),
                        required: true
                    };
                } else {
                    resource = { src: url };
                }
            } else {
                resource = url;
            }

            return resource;
        });

        return resources.sort((resource) => {
            return resource.required ? -1 : 1;
        });
    }
};
