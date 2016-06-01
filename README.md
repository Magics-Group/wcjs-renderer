# <img alt="WebChimera.js Renderer" src="https://raw.githubusercontent.com/jaruba/wcjs-logos/master/logos/small/wcjs-renderer.png">
Renderer for WebChimera.js

### Prerequisites
* [WebChimera.js prerequisites](https://github.com/RSATom/WebChimera.js#build-prerequisites)

### Install

``
npm install wcjs-renderer
``

### Usage example

HTML:
```HTML
<canvas id="canvas"/>
```
JS:
```JavaScript
var renderer = require("wcjs-renderer");
var vlc = require("wcjs-prebuilt").createPlayer();
var options = { /* Add renderer options here */ }
renderer.bind(document.getElementById("canvas"), vlc, options);
vlc.play("http://archive.org/download/CartoonClassics/Krazy_Kat_-_Keeping_Up_With_Krazy.mp4");
```

### JavaScript API

- `bind(canvas, vlc options)`: bind the Webchimera VLC player to a canvas element:
    - `canvas` can be a DOM node or selector (mandatory) 
    - `vlc` is a VLC player created with WebChimera.js (mandatory)
    - `options`:
        - `fallbackRenderer` is a boolean mentioning if the fallback non-WebGL renderer should be used (optional, defaults to false),
        - `preserveDrawingBuffer` is a boolean mentioning if we should preserve the drawing buffer (optional, defaults to false),
        - `onFrameSetup` will be called when VLC's `onFrameSetup` callback is called, with the same arguments, after the canvas has been setup.
        - `onFrameReady` will be called when VLC's `onFrameReady` callback is called, with the same arguments, after the frame has been rendered to the canvas.
        - `onFrameCleanup` will be called when VLC's `onFrameCleanup` callback is called, with the same arguments, after the frame was cleaned up.

- `clear(canvas)`: draws a single black frame on a canvas element (it's recommended to clear the canvas when the `Media Changed` and `Ended` events are triggered)

- `getFps(function)`: returns int in callback, the number of frames that wore rendered in 1 seconds after the request was made (useful for performance tests and getting the current fps of a live stream as it normally returns as `0` with the WebChimera.js native method, to note: even when playback is paused it still renders at 10 fps)
