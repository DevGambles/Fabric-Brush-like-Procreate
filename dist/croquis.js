function Croquis(mainCanvas, imageDataList, properties) {
    var self = this;
    if (properties != null)
        for (var property in properties)
            self[property] = properties[property];
    var domElement = mainCanvas;
    var mycontext = mainCanvas.contextTop;
    self.getDOMElement = function () {
        return domElement;
    };
    self.setDomElement = function(element) {
        domElement = element;
        domElement.style.clear = 'both';
        domElement.style.setProperty('user-select', 'none');
        domElement.style.setProperty('-webkit-user-select', 'none');
        domElement.style.setProperty('-ms-user-select', 'none');
        domElement.style.setProperty('-moz-user-select', 'none');
    };
    self.getRelativePosition = function (absoluteX, absoluteY) {
        var rect = domElement.getBoundingClientRect();
        return {x: absoluteX - rect.left,y: absoluteY - rect.top};
    };
    var eventListeners = {
        'ondown': [],
        'onmove': [],
        'onup': [],
        'ontick': [],
        'onchange': [],
        'onlayeradd': [],
        'onlayerremove': [],
        'onlayerswap': [],
        'onlayerselect': []
    };
    function dispatchEvent(event, e) {
        event = event.toLowerCase();
        e = e || {};
        if (eventListeners.hasOwnProperty(event)) {
            eventListeners[event].forEach(function (listener) {
                listener.call(self, e);
            });
        }
        else throw 'don\'t support ' + event;
    }
    self.addEventListener = function (event, listener) {
        event = event.toLowerCase();
        if (eventListeners.hasOwnProperty(event)) {
            if (typeof listener !== 'function')
                throw listener + ' is not a function';
            eventListeners[event].push(listener);
        }
        else throw 'don\'t support ' + event;
    };
    self.removeEventListener = function (event, listener) {
        event = event.toLowerCase();
        if (eventListeners.hasOwnProperty(event)) {
            if (listener == null) { // remove all
                eventListeners[event] = [];
                return;
            }
            var listeners = eventListeners[event];
            var index = listeners.indexOf(listener);
            if (index >= 0) listeners.splice(index, 1);
        }
        else throw 'don\'t support ' + event;
    };
    self.hasEventListener = function (event, listener) {
        event = event.toLowerCase();
        if (eventListeners.hasOwnProperty(event)) {
            if (listener == null)
                return eventListeners[event].length > 0;
            return eventListeners[event].indexOf(listener) >= 0;
        }
        else return false;
    };
    var undoStack = [];
    var redoStack = [];
    var undoLimit = 10;
    var preventPushUndo = false;
    var pushToTransaction = false;
    self.getUndoLimit = function () {
        return undoLimit;
    };
    self.setUndoLimit = function (limit) {
        undoLimit = limit;
    };
    self.lockHistory = function () {
        preventPushUndo = true;
    };
    self.unlockHistory = function () {
        preventPushUndo = false;
    };
    self.beginHistoryTransaction = function () {
        undoStack.push([]);
        pushToTransaction = true;
    };
    self.endHistoryTransaction = function () {
        pushToTransaction = false;
    };
    self.clearHistory = function () {
        if (preventPushUndo)
            throw 'history is locked';
        undoStack = [];
        redoStack = [];
    };
    function pushUndo(undoFunction) {
        dispatchEvent('onchange');
        if (self.onChanged)
            self.onChanged();
        if (preventPushUndo)
            return;
        redoStack = [];
        if (pushToTransaction)
            undoStack[undoStack.length - 1].push(undoFunction);
        else
            undoStack.push([undoFunction]);
        while (undoStack.length > undoLimit)
            undoStack.shift();
    }
    self.undo = function () {
        if (pushToTransaction)
            throw 'transaction is not ended';
        if (preventPushUndo)
            throw 'history is locked';
        if (isDrawing || isStabilizing)
            throw 'still drawing';
        if (undoStack.length == 0)
            throw 'no more undo data';
        var undoTransaction = undoStack.pop();
        var redoTransaction = [];
        while (undoTransaction.length)
            redoTransaction.push(undoTransaction.pop()());
        redoStack.push(redoTransaction);
    };
    self.redo = function () {
        if (pushToTransaction)
            throw 'transaction is not ended';
        if (preventPushUndo)
            throw 'history is locked';
        if (isDrawing || isStabilizing)
            throw 'still drawing';
        if (redoStack.length == 0)
            throw 'no more redo data';
        var redoTransaction = redoStack.pop();
        var undoTransaction = [];
        while (redoTransaction.length)
            undoTransaction.push(redoTransaction.pop()());
        undoStack.push(undoTransaction);
    };
    function pushLayerOpacityUndo(index) {
        index = (index == null) ? layerIndex : index;
        var snapshotOpacity = self.getLayerOpacity(index);
        var swap = function () {
            self.lockHistory();
            var temp = self.getLayerOpacity(index);
            self.setLayerOpacity(snapshotOpacity, index);
            snapshotOpacity = temp;
            self.unlockHistory();
            return swap;
        }
        pushUndo(swap);
    }
    function pushLayerVisibleUndo(index) {
        index = (index == null) ? layerIndex : index;
        var snapshotVisible = self.getLayerVisible(index);
        var swap = function () {
            self.lockHistory();
            var temp = self.getLayerVisible(index);
            self.setLayerVisible(snapshotVisible, index);
            snapshotVisible = temp;
            self.unlockHistory();
            return swap;
        }
        pushUndo(swap);
    }
    function pushSwapLayerUndo(layerA, layerB) {
        var swap = function () {
            self.lockHistory();
            self.swapLayer(layerA, layerB);
            self.unlockHistory();
            return swap;
        }
        pushUndo(swap);
    }
    function pushAddLayerUndo(index) {
        var add = function () {
            self.lockHistory();
            self.addLayer(index);
            self.unlockHistory();
            return remove;
        }
        var remove = function () {
            self.lockHistory();
            self.removeLayer(index);
            self.unlockHistory();
            return add;
        }
        pushUndo(remove);
    }
    function pushRemoveLayerUndo(index) {
        var layerContext = getLayerContext(index);
        var w = size.width;
        var h = size.height;
        var snapshotData = layerContext.getImageData(0, 0, w, h);
        var add = function () {
            self.lockHistory();
            self.addLayer(index);
            var layerContext = getLayerContext(index);
            layerContext.putImageData(snapshotData, 0, 0);
            self.unlockHistory();
            return remove;
        }
        var remove = function () {
            self.lockHistory();
            self.removeLayer(index);
            self.unlockHistory();
            return add;
        }
        pushUndo(add);
    }
    function pushDirtyRectUndo(x, y, width, height, index) {
        index = (index == null) ? layerIndex : index;
        var w = size.width;
        var h = size.height;
        var right = x + width;
        var bottom = y + height;
        x = Math.min(w, Math.max(0, x));
        y = Math.min(h, Math.max(0, y));
        width = Math.min(w, Math.max(x, right)) - x;
        height = Math.min(h, Math.max(y, bottom)) - y;
        if ((x % 1) > 0)
            ++width;
        if ((y % 1) > 0)
            ++height;
        x = x | 0;
        y = y | 0;
        width = Math.min(w - x, Math.ceil(width));
        height = Math.min(h - y, Math.ceil(height));
        if ((width == 0) || (height == 0)) {
            var doNothing = function () {
                return doNothing;
            }
            pushUndo(doNothing);
        }
        else {
            var layerContext = getLayerContext(index);
            var snapshotData = layerContext.getImageData(x, y, width, height);
            var swap = function () {
                var layerContext = getLayerContext(index);
                var tempData = layerContext.getImageData(x, y, width, height);
                layerContext.putImageData(snapshotData, x, y);
                snapshotData = tempData;
                return swap;
            }
            pushUndo(swap);
        }
        if (renderDirtyRect)
            drawDirtyRect(x, y, width, height);
    }
    function pushContextUndo(index) {
        index = (index == null) ? layerIndex : index;
        pushDirtyRectUndo(0, 0, size.width, size.height, index);
    }
    function pushAllContextUndo() {
        var snapshotDatas = [];
        var i;
        var w = size.width;
        var h = size.height;
        for (i = 0; i < layers.length; ++i) {
            var layerContext = getLayerContext(i);
            snapshotDatas.push(layerContext.getImageData(0, 0, w, h));
        }
        var swap = function (index) {
            var layerContext = getLayerContext(index);
            var tempData = layerContext.getImageData(0, 0, w, h);
            layerContext.putImageData(snapshotDatas[index], 0, 0);
            snapshotDatas[index] = tempData;
        }
        var swapAll = function () {
            for (var i = 0; i < layers.length; ++i)
                swap(i);
            return swapAll;
        }
        pushUndo(swapAll);
    }
    function pushCanvasSizeUndo(width, height, offsetX, offsetY) {
        var snapshotSize = self.getCanvasSize();
        var snapshotDatas = [];
        var w = snapshotSize.width;
        var h = snapshotSize.height;
        for (var i = 0; i < layers.length; ++i) {
            var layerContext = getLayerContext(i);
            snapshotDatas[i] = layerContext.getImageData(0, 0, w, h);
        }
        function setSize(width, height, offsetX, offsetY) {
            self.lockHistory();
            self.setCanvasSize(width, height, offsetX, offsetY);
            self.unlockHistory();
        }
        var rollback = function () {
            setSize(w, h);
            for (var i = 0; i < layers.length; ++i) {
                var layerContext = getLayerContext(i);
                layerContext.putImageData(snapshotDatas[i], 0, 0);
            }
            return redo;
        }
        var redo = function () {
            rollback();
            setSize(width, height, offsetX, offsetY);
            return rollback;
        }
        pushUndo(rollback);
    }
    var size = {width: domElement.width, height: domElement.height};
    self.getCanvasSize = function () {
        return {width: size.width, height: size.height}; //clone size
    };
    self.setCanvasSize = function (width, height, offsetX, offsetY) {
        offsetX = (offsetX == null) ? 0 : offsetX;
        offsetY = (offsetY == null) ? 0 : offsetY;
        pushCanvasSizeUndo(width, height, offsetX, offsetY);
        size.width = width = Math.floor(width);
        size.height = height = Math.floor(height);
        paintingCanvas.width = width;
        paintingCanvas.height = height;
        dirtyRectDisplay.width = width;
        dirtyRectDisplay.height = height;
        // domElement.style.width = width + 'px';
        // domElement.style.height = height + 'px';
        for (var i=0; i<layers.length; ++i) {
            var canvas = getLayerCanvas(i);
            var context = getLayerContext(i);
            var imageData = context.getImageData(0, 0, width, height);
            canvas.width = width;
            canvas.height = height;
            context.putImageData(imageData, offsetX, offsetY);
        }
    };
    self.getCanvasWidth = function () {
        return size.width;
    };
    self.setCanvasWidth = function (width, offsetX) {
        self.setCanvasSize(width, size.height, offsetX, 0);
    };
    self.getCanvasHeight = function () {
        return size.height;
    };
    self.setCanvasHeight = function (height, offsetY) {
        self.setCanvasSize(size.width, height, 0, offsetY);
    };
    function getLayerCanvas(index) {
        // return layers[index].getElementsByClassName('croquis-layer-canvas')[0];
        return domElement;
    }
    self.getLayerCanvas = getLayerCanvas;
    function getLayerContext(index) {
        // return getLayerCanvas(index).getContext('2d');
        return mycontext;
    }
    var layers = [];
    var layerIndex = 0;
    var paintingCanvas = document.createElement('canvas');
    var paintingContext = paintingCanvas.getContext('2d');
    paintingCanvas.className = 'croquis-painting-canvas';
    paintingCanvas.style.position = 'absolute';
    var dirtyRectDisplay = document.createElement('canvas');
    var dirtyRectDisplayContext = dirtyRectDisplay.getContext('2d');
    dirtyRectDisplay.className = 'croquis-dirty-rect-display';
    dirtyRectDisplay.style.position = 'absolute';
    var renderDirtyRect = false;
    function sortLayers() {
        while (domElement.firstChild)
            domElement.removeChild(domElement.firstChild);
        for (var i = 0; i < layers.length; ++i) {
            var layer = layers[i];
            domElement.appendChild(layer);
        }
        domElement.appendChild(dirtyRectDisplay);
    }
    function drawDirtyRect(x, y, w, h) {
        var context = dirtyRectDisplayContext;
        context.fillStyle = '#f00';
        context.globalCompositeOperation = 'source-over';
        context.fillRect(x, y, w, h);
        if ((w > 2) && (h > 2)) {
            context.globalCompositeOperation = 'destination-out';
            context.fillRect(x + 1, y + 1, w - 2, h - 2);
        }
    }
    self.getRenderDirtyRect = function () {
        return renderDirtyRect;
    };
    self.setRenderDirtyRect = function (render) {
        renderDirtyRect = render;
        if (render == false)
            dirtyRectDisplayContext.clearRect(0, 0, size.width, size.height);
    };
    self.createLayerThumbnail = function (index, width, height) {
        index = (index == null) ? layerIndex : index;
        width = (width == null) ? size.width : width;
        height = (height == null) ? size.height : height;
        var canvas = getLayerCanvas(index);
        var thumbnail = document.createElement('canvas');
        var thumbnailContext = thumbnail.getContext('2d');
        thumbnail.width = width;
        thumbnail.height = height;
        thumbnailContext.drawImage(canvas, 0, 0, width, height);
        return thumbnail;
    };
    self.createFlattenThumbnail = function (width, height) {
        width = (width == null) ? size.width : width;
        height = (height == null) ? size.height : height;
        var thumbnail = document.createElement('canvas');
        var thumbnailContext = thumbnail.getContext('2d');
        thumbnail.width = width;
        thumbnail.height = height;
        for (var i = 0; i < layers.length; ++i) {
            if (!self.getLayerVisible(i))
                continue;
            var canvas = getLayerCanvas(i);
            thumbnailContext.globalAlpha = self.getLayerOpacity(i);
            thumbnailContext.drawImage(canvas, 0, 0, width, height);
        }
        return thumbnail;
    };
    self.getLayers = function () {
        return layers.concat(); //clone layers
    };
    self.getLayerCount = function () {
        return layers.length;
    };
    self.addLayer = function (index) {
        index = (index == null) ? layers.length : index;
        pushAddLayerUndo(index);
        var layer = document.createElement('div');
        layer.className = 'croquis-layer';
        layer.style.visibility = 'visible';
        layer.style.opacity = 1;
        var canvas = document.createElement('canvas');
        canvas.className = 'croquis-layer-canvas';
        canvas.width = size.width;
        canvas.height = size.height;
        canvas.style.position = 'absolute';
        layer.appendChild(canvas);
        domElement.appendChild(layer);
        layers.splice(index, 0, layer);
        sortLayers();
        self.selectLayer(layerIndex);
        dispatchEvent('onlayeradd', {index: index});
        if (self.onLayerAdded)
            self.onLayerAdded(index);
        return layer;
    };
    self.removeLayer = function (index) {
        index = (index == null) ? layerIndex : index;
        pushRemoveLayerUndo(index);
        domElement.removeChild(layers[index]);
        layers.splice(index, 1);
        if (layerIndex == layers.length)
            self.selectLayer(layerIndex - 1);
        sortLayers();
        dispatchEvent('onlayerremove', {index: index});
        if (self.onLayerRemoved)
            self.onLayerRemoved(index);
    };
    self.removeAllLayer = function () {
        while (layers.length)
            self.removeLayer(0);
    };
    self.swapLayer = function (layerA, layerB) {
        pushSwapLayerUndo(layerA, layerB);
        var layer = layers[layerA];
        layers[layerA] = layers[layerB];
        layers[layerB] = layer;
        sortLayers();
        dispatchEvent('onlayerswap', {a: layerA, b: layerB});
        if (self.onLayerSwapped)
            self.onLayerSwapped(layerA, layerB);
    };
    self.getCurrentLayerIndex = function () {
        return layerIndex;
    };
    self.selectLayer = function (index) {
        var lastestLayerIndex = layers.length - 1;
        if (index > lastestLayerIndex)
            index = lastestLayerIndex;
        layerIndex = index;
        if (paintingCanvas.parentElement != null)
            paintingCanvas.parentElement.removeChild(paintingCanvas);
        layers[index].appendChild(paintingCanvas);
        dispatchEvent('onlayerselect', {index: index});
        if (self.onLayerSelected)
            self.onLayerSelected(index);
    };
    self.clearLayer = function (index) {
        index = (index == null) ? layerIndex : index;
        pushContextUndo(index);
        var context = getLayerContext(index);
        context.clearRect(0, 0, size.width, size.height);
    };
    self.fillLayer = function (fillColor, index) {
        index = (index == null) ? layerIndex : index;
        pushContextUndo(index);
        var context = getLayerContext(index);
        context.fillStyle = fillColor;
        context.fillRect(0, 0, size.width, size.height);
    }
    self.fillLayerRect = function (fillColor, x, y, width, height, index) {
        index = (index == null) ? layerIndex : index;
        pushDirtyRectUndo(x, y, width, height, index);
        var context = getLayerContext(index);
        context.fillStyle = fillColor;
        context.fillRect(x, y, width, height);
    }
    self.floodFill = function (x, y, r, g, b, a, index) {
        index = (index == null) ? layerIndex : index;
        pushContextUndo(index);
        var context = getLayerContext(index);
        var w = size.width;
        var h = size.height;
        if ((x < 0) || (x >= w) || (y < 0) || (y >= h))
            return;
        var imageData = context.getImageData(0, 0, w, h);
        var d = imageData.data;
        var targetColor = getColor(x, y);
        var replacementColor = (r << 24) | (g << 16) | (b << 8) | a;
        if (targetColor === replacementColor)
            return;
        function getColor(x, y) {
            var index = ((y * w) + x) * 4;
            return ((d[index] << 24) | (d[index + 1] << 16) |
                (d[index + 2] << 8) | d[index + 3]);
        }
        function setColor(x, y) {
            var index = ((y * w) + x) * 4;
            d[index] = r;
            d[index + 1] = g;
            d[index + 2] = b;
            d[index + 3] = a;
        }
        var queue = [];
        queue.push(x, y);
        while (queue.length) {
            var nx = queue.shift();
            var ny = queue.shift();
            if ((nx < 0) || (nx >= w) || (ny < 0) || (ny >= h) ||
                (getColor(nx, ny) !== targetColor))
                continue;
            var west, east;
            west = east = nx;
            do {
                var wc = getColor(--west, ny);
            } while ((west >= 0) && (wc === targetColor));
            do {
                var ec = getColor(++east, ny);
            } while ((east < w) && (ec === targetColor));
            for (var i = west + 1; i < east; ++i) {
                setColor(i, ny);
                var north = ny - 1;
                var south = ny + 1;
                if (getColor(i, north) === targetColor)
                    queue.push(i, north);
                if (getColor(i, south) === targetColor)
                    queue.push(i, south);
            }
        }
        context.putImageData(imageData, 0, 0);
    }
    self.getLayerOpacity = function (index) {
        index = (index == null) ? layerIndex : index;
        var opacity = parseFloat(
            layers[index].style.getPropertyValue('opacity'));
        return window.isNaN(opacity) ? 1 : opacity;
    }
    self.setLayerOpacity = function (opacity, index) {
        index = (index == null) ? layerIndex : index;
        pushLayerOpacityUndo(index);
        layers[index].style.opacity = opacity;
    }
    self.getLayerVisible = function (index) {
        index = (index == null) ? layerIndex : index;
        var visible = layers[index].style.getPropertyValue('visibility');
        return visible != 'hidden';
    }
    self.setLayerVisible = function (visible, index) {
        index = (index == null) ? layerIndex : index;
        pushLayerVisibleUndo(index);
        layers[index].style.visibility = visible ? 'visible' : 'hidden';
    }
    var tool;
    var toolStabilizeLevel = 0;
    var toolStabilizeWeight = 0.8;
    var stabilizer = null;
    var stabilizerInterval = 5;
    var tick;
    var tickInterval = 10;
    var paintingOpacity = 1;
    var paintingKnockout = false;
    self.getTool = function () {
        return tool;
    }
    self.setTool = function (value) {
        tool = value;
        // paintingContext = paintingCanvas.getContext('2d');
        paintingContext = mycontext;
        if (tool && tool.setContext)
            tool.setContext(paintingContext);
    }
    self.setTool(new Croquis.Brush());
    self.getPaintingOpacity = function () {
        return paintingOpacity;
    }
    self.setPaintingOpacity = function (opacity) {
        paintingOpacity = opacity;
        paintingCanvas.style.opacity = opacity;
    }
    self.getPaintingKnockout = function () {
        return paintingKnockout;
    }
    self.setPaintingKnockout = function (knockout) {
        paintingKnockout = knockout;
        paintingCanvas.style.visibility = knockout ? 'hidden' : 'visible';
    }
    self.getTickInterval = function () {
        return tickInterval;
    }
    self.setTickInterval = function (interval) {
        tickInterval = interval;
    }
    /*
    stabilize level is the number of coordinate tracker.
    higher stabilize level makes lines smoother.
    */
    self.getToolStabilizeLevel = function () {
        return toolStabilizeLevel;
    }
    self.setToolStabilizeLevel = function (level) {
        toolStabilizeLevel = (level < 0) ? 0 : level;
    }
    /*
    higher stabilize weight makes trackers follow slower.
    */
    self.getToolStabilizeWeight = function () {
        return toolStabilizeWeight;
    }
    self.setToolStabilizeWeight = function (weight) {
        toolStabilizeWeight = weight;
    }
    self.getToolStabilizeInterval = function () {
        return stabilizerInterval;
    }
    self.setToolStabilizeInterval = function (interval) {
        stabilizerInterval = interval;
    }
    var isDrawing = false;
    var isStabilizing = false;
    var beforeKnockout = document.createElement('canvas');
    var knockoutTick;
    var knockoutTickInterval = 20;
    function gotoBeforeKnockout() {
        var context = getLayerContext(layerIndex);
        var w = size.width;
        var h = size.height;
        context.clearRect(0, 0, w, h);
        context.drawImage(beforeKnockout, 0, 0, w, h);
    }
    function drawPaintingCanvas() { //draw painting canvas on current layer
        var context = getLayerContext(layerIndex);
        var w = size.width;
        var h = size.height;
        context.save();
        context.globalAlpha = paintingOpacity;
        context.globalCompositeOperation = paintingKnockout ?
            'destination-out' : 'source-over';
        context.drawImage(paintingCanvas, 0, 0, w, h);
        context.restore();
    }
    function _move(x, y, pressure) {
        if (tool.move)
            tool.move(x, y, pressure);
        dispatchEvent('onmove', {x: x, y: y, pressure: pressure});
        if (self.onMoved)
            self.onMoved(x, y, pressure);
    }
    function _up(x, y, pressure) {
        isDrawing = false;
        isStabilizing = false;
        var dirtyRect;
        if (tool.up)
            dirtyRect = tool.up(x, y, pressure);
        if (paintingKnockout)
            gotoBeforeKnockout();
        if (dirtyRect)
            pushDirtyRectUndo(dirtyRect.x, dirtyRect.y,
                              dirtyRect.width, dirtyRect.height);
        else
            pushContextUndo();
        drawPaintingCanvas();
        paintingContext.clearRect(0, 0, size.width, size.height);
        dirtyRect = dirtyRect ||
            {x: 0, y: 0, width: size.width, height: size.height};
        dispatchEvent('onup',
            {x: x, y: y, pressure: pressure, dirtyRect: dirtyRect});
        if (self.onUpped)
            self.onUpped(x, y, pressure, dirtyRect);
        window.clearInterval(knockoutTick);
        window.clearInterval(tick);
    }
    self.down = function (x, y, pressure) {
        if (isDrawing || isStabilizing)
            throw 'still drawing';
        isDrawing = true;
        if (tool == null)
            return;
        if (paintingKnockout) {
            // var w = size.width;
            // var h = size.height;
            // var canvas = getLayerCanvas(layerIndex);
            // var beforeKnockoutContext = beforeKnockout.getContext('2d');
            // beforeKnockout.width = w;
            // beforeKnockout.height = h;
            // beforeKnockoutContext.clearRect(0, 0, w, h);
            // beforeKnockoutContext.drawImage(canvas, 0, 0, w, h);
        }
        pressure = (pressure == null) ? Croquis.Tablet.pressure() : pressure;
        var down = tool.down;
        if (toolStabilizeLevel > 0) {
            stabilizer = new Croquis.Stabilizer(down, _move, _up,
                toolStabilizeLevel, toolStabilizeWeight,
                x, y, pressure, stabilizerInterval);
            isStabilizing = true;
        }
        else if (down != null)
            down(x, y, pressure);
        dispatchEvent('ondown', {x: x, y: y, pressure: pressure});
        if (self.onDowned)
            self.onDowned(x, y, pressure);
        knockoutTick = window.setInterval(function () {
            if (paintingKnockout) {
                // gotoBeforeKnockout();
                // drawPaintingCanvas();
            }
        }, knockoutTickInterval);
        tick = window.setInterval(function () {
            if (tool.tick)
                tool.tick();
            dispatchEvent('ontick');
            if (self.onTicked)
                self.onTicked();
        }, tickInterval);
    };
    self.move = function (x, y, pressure) {
        if (!isDrawing)
            throw 'you need to call \'down\' first';
        if (tool == null)
            return;
        pressure = (pressure == null) ? Croquis.Tablet.pressure() : pressure;
        if (stabilizer != null)
            stabilizer.move(x, y, pressure);
        else if (!isStabilizing)
            _move(x, y, pressure);
    };
    self.up = function (x, y, pressure) {
        if (!isDrawing)
            throw 'you need to call \'down\' first';
        if (tool == null) {
            isDrawing = false;
            return;
        }
        pressure = (pressure == null) ? Croquis.Tablet.pressure() : pressure;
        if (stabilizer != null)
            stabilizer.up(x, y, pressure);
        else
            _up(x, y, pressure);
        stabilizer = null;
    };
    // apply image data
    (function (croquis, imageDataList) {
        if (imageDataList != null) {
            if (imageDataList.length == 0)
                return;
            croquis.lockHistory();
            var first = imageDataList[0];
            croquis.setCanvasSize(first.width, first.height);
            for (var i = 0; i < imageDataList.length; ++i) {
                var current = imageDataList[i];
                if ((current.width != first.width) ||
                    (current.height != first.height))
                    throw 'all image data must have same size';
                croquis.addLayer();
                var context = croquis.getLayerCanvas(i).getContext('2d');
                context.putImageData(current, 0, 0);
            }
            croquis.selectLayer(0);
            croquis.unlockHistory();
        }
    }).call(null, self, imageDataList);
}
Croquis.createChecker = function (cellSize, colorA, colorB) {
    cellSize = (cellSize == null) ? 10 : cellSize;
    colorA = (colorA == null) ? '#fff' : colorA;
    colorB = (colorB == null) ? '#ccc' : colorB;
    var size = cellSize + cellSize;
    var checker = document.createElement('canvas');
    checker.width = checker.height = size;
    var context = checker.getContext('2d');
    context.fillStyle = colorB;
    context.fillRect(0, 0, size, size);
    context.fillStyle = colorA;
    context.fillRect(0, 0, cellSize, cellSize);
    context.fillRect(cellSize, cellSize, size, size);
    return checker;
}
Croquis.createBrushPointer = function (brushImage, brushSize, brushAngle,
                                       threshold, antialias, color) {
    brushSize = brushSize | 0;
    var pointer = document.createElement('canvas');
    var pointerContext = pointer.getContext('2d');
    if (brushSize == 0) {
        pointer.width = 1;
        pointer.height = 1;
        return pointer;
    }
    if (brushImage == null) {
        var halfSize = (brushSize * 0.5) | 0;
        pointer.width = brushSize;
        pointer.height = brushSize;
        pointerContext.fillStyle = '#000';
        pointerContext.beginPath();
        pointerContext.arc(halfSize, halfSize, halfSize, 0, Math.PI * 2);
        pointerContext.closePath();
        pointerContext.fill();
    }
    else {
        var width = brushSize;
        var height = brushSize * (brushImage.height / brushImage.width);
        var toRad = Math.PI / 180;
        var ra = brushAngle * toRad;
        var abs = Math.abs;
        var sin = Math.sin;
        var cos = Math.cos;
        var boundWidth = abs(height * sin(ra)) + abs(width * cos(ra));
        var boundHeight = abs(width * sin(ra)) + abs(height * cos(ra));
        pointer.width = boundWidth;
        pointer.height = boundHeight;
        pointerContext.save();
        pointerContext.translate(boundWidth * 0.5, boundHeight * 0.5);
        pointerContext.rotate(ra);
        pointerContext.translate(width * -0.5, height * -0.5);
        pointerContext.drawImage(brushImage, 0, 0, width, height);
        pointerContext.restore();
    }
    return Croquis.createAlphaThresholdBorder(
            pointer, threshold, antialias, color);
};
Croquis.createAlphaThresholdBorder = function (image, threshold,
                                               antialias, color) {
    threshold = (threshold == null) ? 0x80 : threshold;
    color = (color == null) ? '#000' : color;
    var width = image.width;
    var height = image.height;
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    try {
        context.drawImage(image, 0, 0, width, height);
    }
    catch (e) {
        return canvas;
    }
    var imageData = context.getImageData(0, 0, width, height);
    var d = imageData.data;
    function getAlphaIndex(index) {
        return d[index * 4 + 3];
    }
    function setRedIndex(index, red) {
        d[index * 4] = red;
    }
    function getRedXY(x, y) {
        var red = d[((y * width) + x) * 4];
        return red ? red : 0;
    }
    function getGreenXY(x, y) {
        var green = d[((y * width) + x) * 4 + 1];
        return green;
    }
    function setColorXY(x, y, red, green, alpha) {
        var i = ((y * width) + x) * 4;
        d[i] = red;
        d[i + 1] = green;
        d[i + 2] = 0;
        d[i + 3] = alpha;
    }
    //threshold
    var pixelCount = (d.length * 0.25) | 0;
    for (var i = 0; i < pixelCount; ++i)
        setRedIndex(i, (getAlphaIndex(i) < threshold) ? 0 : 1);
    //outline
    var x;
    var y;
    for (x = 0; x < width; ++x) {
        for (y = 0; y < height; ++y) {
            if (!getRedXY(x, y)) {
                setColorXY(x, y, 0, 0, 0);
            }
            else {
                var redCount = 0;
                var left = x - 1;
                var right = x + 1;
                var up = y - 1;
                var down = y + 1;
                redCount += getRedXY(left, up);
                redCount += getRedXY(left, y);
                redCount += getRedXY(left, down);
                redCount += getRedXY(right, up);
                redCount += getRedXY(right, y);
                redCount += getRedXY(right, down);
                redCount += getRedXY(x, up);
                redCount += getRedXY(x, down);
                if (redCount != 8)
                    setColorXY(x, y, 1, 1, 255);
                else
                    setColorXY(x, y, 1, 0, 0);
            }
        }
    }
    //antialias
    if (antialias) {
        for (x = 0; x < width; ++x) {
            for (y = 0; y < height; ++y) {
                if (getGreenXY(x, y)) {
                    var alpha = 0;
                    if (getGreenXY(x - 1, y) != getGreenXY(x + 1, y))
                        setColorXY(x, y, 1, 1, alpha += 0x40);
                    if (getGreenXY(x, y - 1) != getGreenXY(x, y + 1))
                        setColorXY(x, y, 1, 1, alpha + 0x50);
                }
            }
        }
    }
    context.putImageData(imageData, 0, 0);
    context.globalCompositeOperation = 'source-in';
    context.fillStyle = color;
    context.fillRect(0, 0, width, height);
    return canvas;
}
Croquis.createFloodFill = function (canvas, x, y, r, g, b, a) {
    var result = document.createElement('canvas');
    var w = result.width = canvas.width;
    var h = result.height = canvas.height;
    if ((x < 0) || (x >= w) || (y < 0) || (y >= h) || !(r || g || b || a))
        return result;
    var originalContext = canvas.getContext('2d');
    var originalData = originalContext.getImageData(0, 0, w, h);
    var od = originalData.data;
    var resultContext = result.getContext('2d');
    var resultData = resultContext.getImageData(0, 0, w, h);
    var rd = resultData.data;
    var targetColor = getColor(x, y);
    var replacementColor = (r << 24) | (g << 16) | (b << 8) | a;
    function getColor(x, y) {
        var index = ((y * w) + x) * 4;
        return (rd[index] ? replacementColor :
            ((od[index] << 24) | (od[index + 1] << 16) |
             (od[index + 2] << 8) | od[index + 3]));
    }
    var queue = [];
    queue.push(x, y);
    while (queue.length) {
        var nx = queue.shift();
        var ny = queue.shift();
        if ((nx < 0) || (nx >= w) || (ny < 0) || (ny >= h) ||
            (getColor(nx, ny) !== targetColor))
            continue;
        var west, east;
        west = east = nx;
        do {
            var wc = getColor(--west, ny);
        } while ((west >= 0) && (wc === targetColor));
        do {
            var ec = getColor(++east, ny);
        } while ((east < w) && (ec === targetColor));
        for (var i = west + 1; i < east; ++i) {
            rd[((ny * w) + i) * 4] = 1;
            var north = ny - 1;
            var south = ny + 1;
            if (getColor(i, north) === targetColor)
                queue.push(i, north);
            if (getColor(i, south) === targetColor)
                queue.push(i, south);
        }
    }
    for (var i = 0; i < w; ++i) {
        for (var j = 0; j < h; ++j) {
            var index = ((j * w) + i) * 4;
            if (rd[index] == 0)
                continue;
            rd[index] = r;
            rd[index + 1] = g;
            rd[index + 2] = b;
            rd[index + 3] = a;
        }
    }
    resultContext.putImageData(resultData, 0, 0);
    return result;
}

Croquis.Tablet = {};
Croquis.Tablet.plugin = function () {
    var plugin = document.querySelector(
        'object[type=\'application/x-wacomtabletplugin\']');
    if (!plugin) {
        plugin = document.createElement('object');
        plugin.type = 'application/x-wacomtabletplugin';
        plugin.style.position = 'absolute';
        plugin.style.top = '-1000px';
        document.body.appendChild(plugin);
    }
    return plugin;
}
Croquis.Tablet.pen = function () {
    var plugin = Croquis.Tablet.plugin();
    return plugin.penAPI;
}
Croquis.Tablet.pressure = function () {
    var pen = Croquis.Tablet.pen();
    return (pen && pen.pointerType) ? pen.pressure : 1;
}
Croquis.Tablet.isEraser = function () {
    var pen = Croquis.Tablet.pen();
    return pen ? pen.isEraser : false;
}

Croquis.Stabilizer = function (down, move, up, level, weight,
                               x, y, pressure, interval) {
    interval = interval || 5;
    var follow = 1 - Math.min(0.95, Math.max(0, weight));
    var paramTable = [];
    var current = { x: x, y: y, pressure: pressure };
    for (var i = 0; i < level; ++i)
        paramTable.push({ x: x, y: y, pressure: pressure });
    var first = paramTable[0];
    var last = paramTable[paramTable.length - 1];
    var upCalled = false;
    if (down != null)
        down(x, y, pressure);
    window.setTimeout(_move, interval);
    this.getParamTable = function () { //for test
        return paramTable;
    }
    this.move = function (x, y, pressure) {
        current.x = x;
        current.y = y;
        current.pressure = pressure;
    }
    this.up = function (x, y, pressure) {
        current.x = x;
        current.y = y;
        current.pressure = pressure;
        upCalled = true;
    }
    function dlerp(a, d, t) {
        return a + d * t;
    }
    function _move(justCalc) {
        var curr;
        var prev;
        var dx;
        var dy;
        var dp;
        var delta = 0;
        first.x = current.x;
        first.y = current.y;
        first.pressure = current.pressure;
        for (var i = 1; i < paramTable.length; ++i) {
            curr = paramTable[i];
            prev = paramTable[i - 1];
            dx = prev.x - curr.x;
            dy = prev.y - curr.y;
            dp = prev.pressure - curr.pressure;
            delta += Math.abs(dx);
            delta += Math.abs(dy);
            curr.x = dlerp(curr.x, dx, follow);
            curr.y = dlerp(curr.y, dy, follow);
            curr.pressure = dlerp(curr.pressure, dp, follow);
        }
        if (justCalc)
            return delta;
        if (upCalled) {
            while(delta > 1) {
                move(last.x, last.y, last.pressure);
                delta = _move(true);
            }
            up(last.x, last.y, last.pressure);
        }
        else {
            move(last.x, last.y, last.pressure);
            window.setTimeout(_move, interval);
        }
    }
}

Croquis.Random = {};
Croquis.Random.LFSR113 = function (seed) {
    var IA = 16807;
    var IM = 2147483647;
    var IQ = 127773;
    var IR = 2836;
    var a, b, c, d, e;
    this.get = function () {
        var f = ((a << 6) ^ a) >> 13;
        a = ((a & 4294967294) << 18) ^ f;
        f  = ((b << 2) ^ b) >> 27;
        b = ((b & 4294967288) << 2) ^ f;
        f  = ((c << 13) ^ c) >> 21;
        c = ((c & 4294967280) << 7) ^ f;
        f  = ((d << 3) ^ d) >> 12;
        d = ((d & 4294967168) << 13) ^ f;
        return (a ^ b ^ c ^ d) * 2.3283064365386963e-10 + 0.5;
    }
    seed |= 0;
    if (seed <= 0) seed = 1;
    e = (seed / IQ) | 0;
    seed = (((IA * (seed - ((e * IQ) | 0))) | 0) - ((IR * e) | 0)) | 0;
    if (seed < 0) seed = (seed + IM) | 0;
    if (seed < 2) a = (seed + 2) | 0 ; else a = seed;
    e = (seed / IQ) | 0;
    seed = (((IA * (seed - ((e * IQ) | 0))) | 0) - ((IR * e) | 0)) | 0;
    if (seed < 0) seed = (seed + IM) | 0;
    if (seed < 8) b = (seed + 8) | 0; else b = seed;
    e = (seed / IQ) | 0;
    seed = (((IA * (seed - ((e * IQ) | 0))) | 0) - ((IR * e) | 0)) | 0;
    if (seed < 0) seed = (seed + IM) | 0;
    if (seed < 16) c = (seed + 16) | 0; else c = seed;
    e = (seed / IQ) | 0;
    seed = (((IA * (seed - ((e * IQ) | 0))) | 0) - ((IR * e) | 0)) | 0;
    if (seed < 0) seed = (seed + IM) | 0;
    if (seed < 128) d = (seed + 128) | 0; else d = seed;
    this.get();
}

Croquis.Brush = function () {
    // math shortcut
    var min = Math.min;
    var max = Math.max;
    var abs = Math.abs;
    var sin = Math.sin;
    var cos = Math.cos;
    var sqrt = Math.sqrt;
    var atan2 = Math.atan2;
    var PI = Math.PI;
    var ONE = PI + PI;
    var QUARTER = PI * 0.5;
    var random = Math.random;
    this.setRandomFunction = function (value) {
        random = value;
    }
    this.clone = function () {
        var clone = new Brush(context);
        clone.setColor(this.getColor());
        clone.setFlow(this.getFlow());
        clone.setSize(this.getSize());
        clone.setSpacing(this.getSpacing());
        clone.setAngle(this.getAngle());
        clone.setRotateToDirection(this.getRotateToDirection());
        clone.setNormalSpread(this.getNormalSpread());
        clone.setTangentSpread(this.getTangentSpread());
        clone.setImage(this.getImage());
    }
    var context = null;
    this.getContext = function () {
        return context;
    }
    this.setContext = function (value) {
        context = value;
    }
    var color = '#000';
    this.getColor = function () {
        return color;
    }
    this.setColor = function (value) {
        color = value;
        transformedImageIsDirty = true;
    }
    var flow = 1;
    this.getFlow = function() {
        return flow;
    }
    this.setFlow = function(value) {
        flow = value;
        transformedImageIsDirty = true;
    }
    var size = 10;
    this.getSize = function () {
        return size;
    }
    this.setSize = function (value) {
        size = (value < 1) ? 1 : value;
        transformedImageIsDirty = true;
    }
    var spacing = 0.2;
    this.getSpacing = function () {
        return spacing;
    }
    this.setSpacing = function (value) {
        spacing = (value < 0.01) ? 0.01 : value;
    }
    var toRad = PI / 180;
    var toDeg = 1 / toRad;
    var angle = 0; // radian unit
    this.getAngle = function () { // returns degree unit
        return angle * toDeg;
    }
    this.setAngle = function (value) {
        angle = value * toRad;
    }
    var rotateToDirection = false;
    this.getRotateToDirection = function () {
        return rotateToDirection;
    }
    this.setRotateToDirection = function (value) {
        rotateToDirection = value;
    }
    var rotateToRandom = false;
    this.getRotateToRandom = function () {
        return rotateToRandom;
    }
    this.setRotateToRandom = function (value) {
        rotateToRandom = value;
    }
    var holdEffect = false;
    this.getHoldEffect = function () {
        return holdEffect;
    }
    this.setHoldEffect = function (value) {
        holdEffect = value;
    }
    var grainEffect = 0;
    this.getGrainEffect = function () {
        return grainEffect;
    }
    this.setGrainEffect = function (value) {
        grainEffect = value;
    }
    var normalSpread = 0;
    this.getNormalSpread = function () {
        return normalSpread;
    }
    this.setNormalSpread = function (value) {
        normalSpread = value;
    }
    var tangentSpread = 0;
    this.getTangentSpread = function () {
        return tangentSpread;
    }
    this.setTangentSpread = function (value) {
        tangentSpread = value;
    }
    //stroke attributes
    var fallOff = 0;
    this.getFallOff = function () {
        return fallOff;
    }
    this.setFallOff = function (value) {
        fallOff = value;
    }
    //taper attributes
    var taperAmount = 0;
    this.getTaperAmount = function () {
        return taperAmount;
    }
    this.setTaperAmount = function (value) {
        taperAmount = value;
    }
    var taperSize = 0;
    this.getTaperSize = function () {
        return taperSize;
    }
    this.setTaperSize = function (value) {
        taperSize = value;
    }
    var taperOpacity = 0;
    this.getTaperOpacity = function () {
        return taperOpacity;
    }
    this.setTaperOpacity = function (value) {
        taperOpacity = value;
    }
    var taperTip = 0;
    this.getTaperTip = function () {
        return taperTip;
    }
    this.setTaperTip = function (value) {
        taperTip = value;
    }
    //shape attributes
    var shapeScatter = 0;
    this.getShapeScatter = function () {
        return shapeScatter;
    }
    this.setShapeScatter = function (value) {
        shapeScatter = value;
    }
    var shapeRotation = 0;
    this.getShapeRotation = function () {
        return shapeRotation;
    }
    this.setShapeRotation = function (value) {
        shapeRotation = value;
    }
    var shapeCount = 0;
    this.getShapeCount = function () {
        return shapeCount;
    }
    this.setShapeCount = function (value) {
        shapeCount = value;
    }
    var shapeCountJitter = 0;
    this.getShapeCountJitter = function () {
        return shapeCountJitter;
    }
    this.setShapeCountJitter = function (value) {
        shapeCountJitter = value;
    }
    var shapeRandomized = false;
    this.getShapeRandomized = function () {
        return shapeRandomized;
    }
    this.setShapeRandomized = function (value) {
        shapeRandomized = value;
    }
    var shapeAzimuth = 0;
    this.getShapeAzimuth = function () {
        return shapeAzimuth;
    }
    this.setShapeAzimuth = function (value) {
        shapeAzimuth = value;
    }
    var shapeFlipX = 0;
    this.getShapeFlipX = function () {
        return shapeFlipX;
    }
    this.setShapeFlipX = function (value) {
        shapeFlipX = value;
    }
    var shapeFlipY = 0;
    this.getShapeFlipY = function () {
        return shapeFlipY;
    }
    this.setShapeFlipY = function (value) {
        shapeFlipY = value;
    }
    //grain attributes
    var grainMovement = 0;
    this.getGrainMovement = function () {
        return grainMovement;
    }
    this.setGrainMovement = function (value) {
        grainMovement = value;
    }
    var grainMoveScale = 0;
    this.getGrainMoveScale = function () {
        return grainMoveScale;
    }
    this.setGrainMoveScale = function (value) {
        grainMoveScale = value;
    }
    var grainMoveZoom = 0;
    this.getGrainMoveZoom = function () {
        return grainMoveZoom;
    }
    this.setGrainMoveZoom = function (value) {
        grainMoveZoom = value;
    }
    var grainMoveRotation = 0;
    this.getGrainMoveRotation = function () {
        return grainMoveRotation;
    }
    this.setGrainMoveRotation = function (value) {
        grainMoveRotation = value;
    }
    var grainMoveDepth = 0;
    this.getGrainMoveDepth = function () {
        return grainMoveDepth;
    }
    this.setGrainMoveDepth = function (value) {
        grainMoveDepth = value;
    }
    var grainMoveOffsetJitter = 0;
    this.getGrainMoveOffsetJitter = function () {
        return grainMoveOffsetJitter;
    }
    this.setGrainMoveOffsetJitter = function (value) {
        grainMoveOffsetJitter = value;
    }

    var grainTexScale = 0;
    this.getGrainTexScale = function () {
        return grainTexScale;
    }
    this.setGrainTexScale = function (value) {
        grainTexScale = value;
    }
    var grainTexDepth = 0;
    this.getGrainTexDepth = function () {
        return grainTexDepth;
    }
    this.setGrainTexDepth = function (value) {
        grainTexDepth = value;
    }
    var grainTexBrightness = 0;
    this.getGrainTexBrightness = function () {
        return grainTexBrightness;
    }
    this.setGrainTexBrightness = function (value) {
        grainTexBrightness = value;
    }
    var grainTexContrast = 0;
    this.getGrainTexContrast = function () {
        return grainTexContrast;
    }
    this.setGrainTexContrast = function (value) {
        grainTexContrast = value;
    }
    //dynamic attributes
    var dynamicSpeedSize = 0;
    this.getDynamicSpeedSize = function () {
        return dynamicSpeedSize;
    }
    this.setDynamicSpeedSize = function (value) {
        dynamicSpeedSize = value;
    }
    var dynamicSpeedOpacity = 0;
    this.getDynamicSpeedOpacity = function () {
        return dynamicSpeedOpacity;
    }
    this.setDynamicSpeedOpacity = function (value) {
        dynamicSpeedOpacity = value;
    }
    var dynamicJitterSize = 0;
    this.getDynamicJitterSize = function () {
        return dynamicJitterSize;
    }
    this.setDynamicJitterSize = function (value) {
        dynamicJitterSize = value;
    }
    var dynamicJitterOpacity = 0;
    this.getDynamicJitterOpacity = function () {
        return dynamicJitterOpacity;
    }
    this.setDynamicJitterOpacity = function (value) {
        dynamicJitterOpacity = value;
    }
    var dynamicBrushMaxSize = 0;
    this.getDynamicBrushMaxSize = function () {
        return dynamicBrushMaxSize;
    }
    this.setDynamicBrushMaxSize = function (value) {
        dynamicBrushMaxSize = value;
    }
    var dynamicBrushMinSize = 0;
    this.getDynamicBrushMinSize = function () {
        return dynamicBrushMinSize;
    }
    this.setDynamicBrushMinSize = function (value) {
        dynamicBrushMinSize = value;
    }
    var dynamicBrushMaxOpacity = 0;
    this.getDynamicBrushMaxOpacity = function () {
        return dynamicBrushMaxOpacity;
    }
    this.setDynamicBrushMaxOpacity = function (value) {
        dynamicBrushMaxOpacity = value;
    }
    var dynamicBrushMinOpacity = 0;
    this.getDynamicBrushMinOpacity = function () {
        return dynamicBrushMinOpacity;
    }
    this.setDynamicBrushMinOpacity = function (value) {
        dynamicBrushMinOpacity = value;
    }
    var image = null;
    var transformedImage = null;
    var transformedImageIsDirty = true;
    var imageRatio = 1;
    var brushContext = null;
    this.getImage = function () {
        return image;
    }
    this.setImage = function (value) {
        if (value == null) {
            transformedImage = image = null;
            imageRatio = 1;
            drawFunction = drawCircle;
        }
        else if (value != image) {
            image = value;
            imageRatio = image.height / image.width;
            transformedImage = document.createElement('canvas');
            brushContext = transformedImage.getContext('2d');
            drawFunction = drawImage;
            transformedImageIsDirty = true;
        }
    }
    this.getBrushContext = function() {
        return brushContext;
    }
    
    var brushPattern = null;
    this.setPattern = function(pattern) {
        brushPattern = pattern;
    }

    var delta = 0;
    var prevX = 0;
    var prevY = 0;
    var lastX = 0;
    var lastY = 0;
    var dir = 0;
    var prevScale = 0;
    var drawFunction = drawCircle;
    var reserved = null;
    var dirtyRect;
    function spreadRandom() {
        return random() - 0.5;
    }
    function drawReserved() {
        if (reserved != null) {
            drawTo(reserved.x, reserved.y, reserved.scale);
            reserved = null;
        }
    }
    function appendDirtyRect(x, y, width, height) {
        if (!(width && height))
            return;
        var dxw = dirtyRect.x + dirtyRect.width;
        var dyh = dirtyRect.y + dirtyRect.height;
        var xw = x + width;
        var yh = y + height;
        var minX = dirtyRect.width ? min(dirtyRect.x, x) : x;
        var minY = dirtyRect.height ? min(dirtyRect.y, y) : y;
        dirtyRect.x = minX;
        dirtyRect.y = minY;
        dirtyRect.width = max(dxw, xw) - minX;
        dirtyRect.height = max(dyh, yh) - minY;
    }

    function transformImage(x, y, ra, size) {
        var w = size, h = size * imageRatio;
        var ts = Math.max(w, h);
        transformedImage.width = ts;
        transformedImage.height = ts;
        brushContext.clearRect(0, 0,
            transformedImage.width, transformedImage.height);
        brushContext.save();
        brushContext.translate(ts / 2, ts / 2);
        brushContext.rotate(ra);
        brushContext.translate(-ts / 2, -ts / 2);
        brushContext.drawImage(image, ts / 2 - w / 2, ts / 2 - h / 2, w, h);
        brushContext.restore();
        brushContext.globalCompositeOperation = 'source-in';
        brushContext.globalAlpha = flow;
        if (grainEffect)
        {
            var matrix = new DOMMatrix([1, 0, 0, 1, 0, 0]);
            brushPattern.setTransform(matrix.translate(-x + ts / 2, -y + ts / 2));
        }
        brushContext.fillStyle = brushPattern;
        brushContext.fillRect(0, 0, ts, ts);
    }
    function drawCircle(size) {
        var halfSize = size * 0.5;
        context.fillStyle = color;
        context.globalAlpha = flow;
        context.beginPath();
        context.arc(halfSize, halfSize, halfSize, 0, ONE);
        context.closePath();
        context.fill();
    }
    function drawImage(x, y, ra, size) {
        var w = size, h = size * imageRatio;
        var ts = Math.max(w, h);
        if (transformedImageIsDirty)
            transformImage(x, y, ra, size);
        try {
            context.drawImage(transformedImage, x - ts / 2, y - ts / 2);
        }
        catch (e) {
            drawCircle(size);
        }
    }
    function drawTo(x, y, scale) {//venus
        var scaledSize = size * scale;
        var nrm = dir + QUARTER;
        var nr = normalSpread * scaledSize * spreadRandom();
        var tr = tangentSpread * scaledSize * spreadRandom();
        var ra = rotateToDirection ? angle + dir : angle;
        ra = rotateToRandom ? fabric.util.getRandom(360) : ra;
        var width = scaledSize;
        var height = width * imageRatio;
        var boundWidth = abs(height * sin(ra)) + abs(width * cos(ra));
        var boundHeight = abs(width * sin(ra)) + abs(height * cos(ra));
        x += Math.cos(nrm) * nr + Math.cos(dir) * tr;
        y += Math.sin(nrm) * nr + Math.sin(dir) * tr;
        context.save();
        // context.translate(x, y);
        // context.rotate(ra);
        // context.translate(-(width * 0.5), -(height * 0.5));
        drawImage(x, y, ra, width);
        context.restore();
        appendDirtyRect(x - (boundWidth * 0.5),
                        y - (boundHeight * 0.5),
                        boundWidth, boundHeight);
    }
    this.down = function(x, y, scale) {
        if (context == null)
            throw 'brush needs the context';
        dir = 0;
        dirtyRect = {x: 0, y: 0, width: 0, height: 0};
        if (scale > 0) {
            if (rotateToDirection || normalSpread != 0 || tangentSpread != 0)
                reserved = {x: x, y: y, scale: scale};
            else
                drawTo(x, y, scale);
        }
        delta = 0;
        lastX = prevX = x;
        lastY = prevY = y;
        prevScale = scale;
    }
    this.move = function(x, y, scale) {
        if (context == null)
            throw 'brush needs the context';
        if (scale <= 0) {
            delta = 0;
            prevX = x;
            prevY = y;
            prevScale = scale;
            return;
        }
        var dx = x - prevX;
        var dy = y - prevY;
        var ds = scale - prevScale;
        var d = sqrt(dx * dx + dy * dy);
        prevX = x;
        prevY = y;
        delta += d;
        var midScale = (prevScale + scale) * 0.5;
        var drawSpacing = size * spacing * midScale;
        var ldx = x - lastX;
        var ldy = y - lastY;
        var ld = sqrt(ldx * ldx + ldy * ldy);
        dir = atan2(ldy, ldx);
        if (ldx || ldy)
            drawReserved();
        if (drawSpacing < 0.5)
            drawSpacing = 0.5;
        if (delta < drawSpacing) {
            prevScale = scale;
            return;
        }
        var scaleSpacing = ds * (drawSpacing / delta);
        if (ld < drawSpacing) {
            lastX = x;
            lastY = y;
            drawTo(lastX, lastY, scale);
            delta -= drawSpacing;
        } else {
            if (holdEffect)
                context.globalAlpha = flow * Math.sqrt(drawSpacing * 1.5 / delta); //venus
            else
                context.globalAlpha = flow;
            while(delta >= drawSpacing) { //venus
                ldx = x - lastX;
                ldy = y - lastY;
                var tx = cos(dir);
                var ty = sin(dir);
                lastX += tx * drawSpacing;
                lastY += ty * drawSpacing;
                prevScale += scaleSpacing;
                drawTo(lastX, lastY, prevScale);
                delta -= drawSpacing;
            }
        }
        prevScale = scale;
    }
    this.up = function (x, y, scale) {
        dir = atan2(y - lastY, x - lastX);
        drawReserved();
        return dirtyRect;
    }
}
