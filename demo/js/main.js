'use strict';

require(['lib/loadic.amd'], function(Loadic){

    var button = document.getElementById('load');

    button.addEventListener('click', function(){

        var progressBar = document.querySelector('.progress-bar'),
            loader = new Loadic.default({
                common: [
                    'images/example1.jpg',
                    'images/example3.bmp!',
                    'css/external.css'
                ],
                dpiDependent: [
                    'images/example2.jpg'
                ],
                highDpiSuffix: '@2x',
                highDpiCondition: function(){
                    return window.innerHeight > 800 || window.devicePixelRatio > 1;
                },
                timeout: 3000
            });

        loader.onProgress = function(progress){
            progressBar.style.width = progress + '%';
        };

        loader.onComplete = function(){
            button.innerHTML = 'Готово';
        };

        button.setAttribute('disabled', true);
    });
});
