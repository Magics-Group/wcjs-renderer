# wcjs-renderer
renderer for WebChimera.js

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
var wcjs = require("wcjs-renderer");
var player = wcjs.init(document.getElementById("canvas"));
player.play("http://archive.org/download/CartoonClassics/Krazy_Kat_-_Keeping_Up_With_Krazy.mp4");
```

### JavaScript API

- ``init( canvas, vlcArgs, fallbackRenderer )``: initiate the renderer, ``canvas`` can be a DOM node or selector (mandatory), ``vlcArgs`` is an array of vlc parameters (optional), ``fallbackRenderer`` is a boolean mentioning if the fallback non-WebGL renderer should be used (optional, defaults to *false*)

- ``clearCanvas()``: draws a single black frame on the canvas, should be used after stopping the player and/or when the media file has changes (otherwise the frame from the previous video will be kept on the canvas)
