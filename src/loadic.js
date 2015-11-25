'use strict';

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
    }
};

export default class Loader {
    constructor(config){

        // config sanitization
        for (let key in config){
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

        for (var i in resources){
            this.preload(resources[i]);
        }

        return this;
    }

    preload(url) {
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

        resource.onload = function() {
            self.loaded();
        };

        resource.onerror = function() {
            self.loaded();
        };


        resource[srcName] = url;
        document.body.appendChild(resource);
    }

    loaded() {
        this.loadedCount++;

        if ('onProgress' in this){
            this.onProgress(parseInt(this.loadedCount/this.resourcesTotal*100));
        }

        if (this.loadedCount === this.resourcesTotal) {
            this.complete();
        }
    }

    complete() {
        if ('onComplete' in this){
            this.onComplete();
        }
    }
};