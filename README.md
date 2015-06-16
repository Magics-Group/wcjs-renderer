# wcjs-renderer
renderer for WebChimera.js

### Prerequisites
* [WebChimera.js prerequisites](https://github.com/RSATom/WebChimera.js#build-prerequisites)

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
