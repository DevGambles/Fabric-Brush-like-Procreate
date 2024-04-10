var SprayPaintBrush = fabric.util.createClass(fabric.BaseBrush, {

    opacity: .2,
    width: 30,

    _baseWidth: 5,
    _drips: [],
    _dripThreshold: 15,
    _inkAmount: 0,
    _interval: 10,
    _lastPoint: null,
    _point: null,
    _strokeId: 0,
    brush: null,
    brushCol : 'img/Fellas.png',
	rotate: 0,

    initialize: function(canvas, opt) {
      var context = this;
      opt = opt || {};

      this.canvas = canvas;
      this.width = opt.width || canvas.freeDrawingBrush.width;
      this.opacity = opt.opacity || canvas.contextTop.globalAlpha;
      this.color = opt.color || canvas.freeDrawingBrush.color;

      this.canvas.contextTop.lineJoin = "round";
      this.canvas.contextTop.lineCap = "round";

      this._reset();
 
      fabric.Image.fromURL(this.brushCol, function(brush) {
        context.brush = brush;
        context.brush.filters = [];
        context.changeColor(context.color || this.color);
      }, { crossOrigin: "anonymous" });
    },

    changeColor: function(color) {
      this.color = color;
	//   this.brush.filters[0] = new fabric.Image.filters.Tint({ color: color });
	this.brush.filters[0] = new fabric.Image.filters.BlendColor({
		color: color,
		mode: 'tint',
		alpha: 1
	  });
	  
      this.brush.applyFilters(this.canvas.renderAll.bind(this.canvas));
    },

    changeOpacity: function(value) {
      this.opacity = value;
      this.canvas.contextTop.globalAlpha = value;
    },

    onMouseDown: function(pointer) {
      this._point = new fabric.Point(pointer.x, pointer.y);
      this._lastPoint = this._point;

      this._size = this.width + this._baseWidth;
      this._strokeId = +new Date();
      this._inkAmount = 0;
	  this.rotate = fabric.util.getRandom(Math.PI / 4, -Math.PI / 4);
      this.changeColor(this.color);
	  this._render();
    },

    onMouseMove: function(pointer) {
      this._lastPoint = this._point;
      this._point = new fabric.Point(pointer.x, pointer.y);
    },

    onMouseUp: function(pointer) {
		this.convertToImg();
    },

    _render: function() {
      var context = this;

      setTimeout(draw, this._interval);

      function draw() {
        var point, distance, angle, amount, x, y;

        point = new fabric.Point(context._point.x || 0, context._point.y || 0);
        distance = point.distanceFrom(context._lastPoint);
        angle = point.angleBetween(context._lastPoint);
        amount = (100 / context._size) / (Math.pow(distance, 2) + 1);

        context._inkAmount += amount;
        context._inkAmount = Math.max(context._inkAmount - distance / 10, 0);
        if (context._inkAmount > context._dripThreshold) {
        //   context._drips.push(new fabric.Drip(context.canvas.contextTop, point, context._inkAmount / 2, context.color, context._strokeId));
          context._inkAmount = 0;
        }

        context.canvas.contextTop.globalAlpha = this.opacity;
        var v, s, stepNum, p, j;
        v = context._point.subtract(context._lastPoint); // vector from now point to last point
        //s is a foot width of two points.
        s = Math.ceil(context._size / 20);
        //calculate steps from foot width.
        stepNum = Math.floor(v.distanceFrom({ x: 0, y: 0 }) / s) + 1;
        v.normalize(s);
        for (j = 0; j < stepNum; j ++) {
          context.canvas.contextTop.save();
          var p = context._lastPoint.add(v.multiply(j));
          x = p.x + Math.sin(angle);
          y = p.y + Math.cos(angle);
          context.canvas.contextTop.translate(x, y);
          context.rotate = fabric.util.getRandom(Math.PI * 2);
          context.canvas.contextTop.rotate(context.rotate);
          context.canvas.contextTop.translate(-x, -y);
          context.canvas.contextTop.drawImage(context.brush.toCanvasElement(), x - context._size / 2, y - context._size / 2, context._size, context._size);
          context.canvas.contextTop.restore();
        }

        if (context.canvas._isCurrentlyDrawing) {
          setTimeout(draw, context._interval);
        } else {
          context._reset();
        }
      }
    },

    _reset: function() {
      this._drips.length = 0;
      this._point = null;
      this._lastPoint = null;
    }
  });

  export default SprayPaintBrush;