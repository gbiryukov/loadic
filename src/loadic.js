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
            if (!config[key] instanceof DEFAULTS[key].type) {
                config[key] = DEFAULTS[key].value;
            }
        }

        // update filenames for high dpi resources
        if (config.highDpiCondition()) {
            config.dpiDependent = config.dpiDependent.map(function(item){
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

        for (var i in resources){
            this.preload(resources[i]);
        }

        this.simulateProgress();

        return this;
    }

    preload(url) {
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

        resource.onload = () => {
            this.loaded();
        };

        resource.onerror = () => {
            this.loaded();
        };

        resource[srcName] = url;
        document.body.appendChild(resource);
    }

    loaded() {
        this.loadedCount++;
        this.updateProgress();

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
            this.complete();
        }, timeout);
    }

    simulateProgress(){
        var iteration = 0;

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
};
