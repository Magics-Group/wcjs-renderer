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
```
<canvas id="canvas"/>
```
JS:
```
var renderer = require("wcjs-renderer");
var wcjs = require("wcjs-prebuilt");
var vlcFlags = [/* Add VLC flags here */];
var options = { /* Add renderer options here */ }
var player = renderer.init(document.getElementById("canvas"), wcjs, vlcFlags, options);
player.play("http://archive.org/download/CartoonClassics/Krazy_Kat_-_Keeping_Up_With_Krazy.mp4");
```

### JavaScript API

- ``init(canvas, wcjs, vlcFlags, options)``: initiate the renderer:
``canvas`` can be a DOM node or selector (mandatory) 
``wcjs`` is a WebChimera.js instance ex: wcjs-prebuilt (mandatory)
``vlcFlags`` is an array of vlc parameters (optional), 
``options`` is a object mentioning if the fallback non-WebGL renderer should be used (optional),

- ``clearCanvas()``: draws a single black frame on the canvas, should be used after stopping the player and/or when the media file has changes (otherwise the frame from the previous video will be kept on the canvas)
