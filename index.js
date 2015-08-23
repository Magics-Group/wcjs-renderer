function Texture(gl, width, height) {
    this.gl = gl;
    this.width = width; this.height = height;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}
Texture.prototype.bind = function (n, program, name) {
    var gl = this.gl;
    gl.activeTexture([gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2][n]);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(gl.getUniformLocation(program, name), n);
}
Texture.prototype.fill = function (data) {
    var gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, this.width, this.height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, data);
}

function render(canvas, videoFrame, vlc) {
    if (!vlc.playing) return;
    var gl = canvas.gl;
    var len = videoFrame.length;
    gl.y.fill(videoFrame.subarray(0, videoFrame.uOffset));
    gl.u.fill(videoFrame.subarray(videoFrame.uOffset, videoFrame.vOffset));
    gl.v.fill(videoFrame.subarray(videoFrame.vOffset, len));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

var renderFallback = function(canvas, videoFrame) {
    var buf = canvas.img.data;
    var width = videoFrame.width;
    var height = videoFrame.height;
    for (var i = 0; i < height; ++i) {
        for (var j = 0; j < width; ++j) {
            var o = (j + (width*i))*4;
            buf[o + 0] = videoFrame[o+2];
            buf[o + 1] = videoFrame[o+1];
            buf[o + 2] = videoFrame[o+0];
            buf[o + 3] = videoFrame[o+3];
        }
    };
    canvas.ctx.putImageData(canvas.img, 0, 0);
}

function setupCanvas(canvas, vlc, fallbackRenderer) {
    if (!fallbackRenderer) canvas.gl = canvas.getContext("webgl"); // Comment this line out to test fallback
    var gl = canvas.gl;
    if (!gl || fallbackRenderer) {
        console.log(fallbackRenderer ? "Fallback renderer forced, not using WebGL" : "Unable to initialize WebGL, falling back to canvas rendering");
        vlc.pixelFormat = vlc.RV32;
        canvas.ctx = canvas.getContext("2d");
        delete canvas.gl; // in case of fallback renderer
        return;
    }

    vlc.pixelFormat = vlc.I420;
    canvas.I420Program = gl.createProgram();
    var program = canvas.I420Program;
    var vertexShaderSource = [
        "attribute highp vec4 aVertexPosition;",
        "attribute vec2 aTextureCoord;",
        "varying highp vec2 vTextureCoord;",
        "void main(void) {",
        " gl_Position = aVertexPosition;",
        " vTextureCoord = aTextureCoord;",
        "}"].join("\n");
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    var fragmentShaderSource = [
        "precision highp float;",
        "varying lowp vec2 vTextureCoord;",
        "uniform sampler2D YTexture;",
        "uniform sampler2D UTexture;",
        "uniform sampler2D VTexture;",
        "const mat4 YUV2RGB = mat4",
        "(",
        " 1.1643828125, 0, 1.59602734375, -.87078515625,",
        " 1.1643828125, -.39176171875, -.81296875, .52959375,",
        " 1.1643828125, 2.017234375, 0, -1.081390625,",
        " 0, 0, 0, 1",
        ");",
        "void main(void) {",
        " gl_FragColor = vec4( texture2D(YTexture, vTextureCoord).x, texture2D(UTexture, vTextureCoord).x, texture2D(VTexture, vTextureCoord).x, 1) * YUV2RGB;",
        "}"].join("\n");

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log("Shader link failed.");
    }
    var vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
    var textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");
    gl.enableVertexAttribArray(textureCoordAttribute);

    var verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
                  new Float32Array([1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0]),
                  gl.STATIC_DRAW);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
                  new Float32Array([1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0]),
                  gl.STATIC_DRAW);
    gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
}

function frameSetup(canvas, width, height, pixelFormat) {
    var gl = canvas.gl;
    canvas.width = width;
    canvas.height = height; 
    if (!gl) {
        canvas.img = canvas.ctx.createImageData(width, height);
        return;
    }
    var program = canvas.I420Program;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.y = new Texture(gl, width, height);
    gl.u = new Texture(gl, width >> 1, height >> 1);
    gl.v = new Texture(gl, width >> 1, height >> 1);
    gl.y.bind(0, program, "YTexture");
    gl.u.bind(1, program, "UTexture");
    gl.v.bind(2, program, "VTexture");
}

module.exports = {
    init: function(canvas,params,fallbackRenderer) {
        var wcAddon = require("webchimera.js");
        
        this._canvas = canvas;
        
        if (typeof params !== 'undefined') var vlc = wcAddon.createPlayer(params);
        else var vlc = wcAddon.createPlayer();
    
        if (typeof canvas === 'string') setupCanvas(window.document.querySelector(canvas), vlc, fallbackRenderer);
        else setupCanvas(canvas, vlc, fallbackRenderer);
    
        vlc.onFrameSetup =
            function(width, height, pixelFormat) {
                frameSetup(canvas, width, height, pixelFormat);
    
                canvas.addEventListener("webglcontextlost",
                    function(event) {
                        event.preventDefault();
                        console.log("webgl context lost");
                    }, false);
    
                canvas.addEventListener("webglcontextrestored",
                    function(w,h,p) {
                        return function(event) {
                            setupCanvas(canvas, vlc);
                            frameSetup(canvas, w, h, p);
                            console.log("webgl context restored");
                        }
                    }(width,height,pixelFormat), false);
    
            };
        setFrame = this;
        vlc.onFrameReady =
            function(videoFrame) {
                (canvas.gl ? render : renderFallback)(canvas, videoFrame, vlc);
                setFrame._lastFrame = videoFrame;
            };
        return vlc;
    },

    clearCanvas: function() {
        if (this._lastFrame) {
            var gl = this._canvas.gl,
                arr1 = new Uint8Array(this._lastFrame.uOffset),
                arr2 = new Uint8Array(this._lastFrame.vOffset - this._lastFrame.uOffset);
                
            for (var i = 0; i < arr2.length; ++i) arr2[i] = 128;

            gl.y.fill(arr1);
            gl.u.fill(arr2);
            gl.v.fill(arr2);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
    },
    
    _lastFrame: false,
    _canvas: false
};
