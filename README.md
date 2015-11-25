Loadic
==========

Lightweight assets loader with retina support. Use it for loading images, styles and scripts.

###Install

Bower: ```bower install loadic```

Npm: ```npm install loadic```

### Usage

CommonJS enviroment (ES6)

```JavaScript
from 'loadic' import Loader;

let loader = new Loader({
    common: [
        'images/example1.jpg',
        'images/example3.bmp',
        'css/external.css'
    ],
    dpiDependent: [
        'images/example2.jpg'
    ]
});

loader.onProgress = (progress) => {
    console.log(`loaded: ${progress}%`);
}

loader.onComplete = () => {
    console.log('complete');
}

```


AMD enviroment

```JavaScript
require(['loadic/loadic.amd'], function(Loader){

    var loader = new Loader.default({
        common: [
            'images/example1.jpg',
            'images/example3.bmp',
            'css/external.css'
        ],
        dpiDependent: [
            'images/example2.jpg'
        ]
    });

    loader.onProgress = function(progress){
        console.log('loaded: ' + progress + '%');
    }

    loader.onComplete = function(){
        console.log('complete');
    }
});
```

### Options

#### common
Array of assets urls.
**Default: []**

#### dpiDependent
Array of dpi dependent images which have high resolution versions.
**Default: []**

#### highDpiSuffix
Suffix which will be appended to dpi dependent images in case of high resolution screen detection.
**Default: '@2x'**

#### highDpiCondition
This function is called to determine whether to use high definition resources or standard definition resources.
**Default: ```window.devicePixelRatio > 1```**

### License
MIT