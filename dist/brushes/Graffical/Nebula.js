var Nebula = fabric.util.createClass(fabric.BaseBrush, {

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
    brushCol : 'img/Nebula.png',
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
    //   this.color = color;
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
	  this.draw();
    },

    onMouseMove: function(pointer) {
		// if (this.distance(this._lastPoint, pointer) < this._size / 2)
		// {
		// 	return;
		// }
		this._lastPoint = this._point;
		this._point = new fabric.Point(pointer.x, pointer.y);
		this.draw();
    },

    onMouseUp: function(pointer) {
		this.convertToImg();
    },

    distance: function(p1, p2) {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    },

    componentToHex: function(c) {
      var hex = parseInt(c).toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    },
      
    rgbToHex: function(r, g, b) {
      return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    },

    draw: function() {
          var point, distance, angle, amount, x, y;
      this.canvas.contextTop.save();
          point = new fabric.Point(this._point.x || 0, this._point.y || 0);
          distance = point.distanceFrom(this._lastPoint);
          angle = point.angleBetween(this._lastPoint);
          amount = (100 / this._size) / (Math.pow(distance, 2) + 1);

          this._inkAmount += amount;
          this._inkAmount = Math.max(this._inkAmount - distance / 10, 0);
          if (this._inkAmount > this._dripThreshold) {
          //   this._drips.push(new fabric.Drip(this.canvas.thisTop, point, this._inkAmount / 2, this.color, this._strokeId));
            this._inkAmount = 0;
          }

      var v, r, s, stepNum, p, j;
      v = this._point.subtract(this._lastPoint); // vector from now point to last point
      //s is a foot width of two points.
      s = Math.ceil(this._size / 10);
      //calculate steps from foot width.
      stepNum = Math.floor(v.distanceFrom({ x: 0, y: 0 }) / s) + 1;
      v.normalize(s);
      for (j = 0; j < stepNum; j += this._size / 3) {
        r = fabric.util.getRandom(this._size * 3 / 2) + this._size / 2;
        this.canvas.contextTop.save();
        var p = this._lastPoint.add(v.multiply(j));
        x = p.x + Math.sin(angle);
        y = p.y + Math.cos(angle);
        this.canvas.contextTop.translate(x, y);
        this.rotate = fabric.util.getRandom(Math.PI / 3, -Math.PI / 3);
        this.canvas.contextTop.rotate(this.rotate);
        this.canvas.contextTop.translate(-x, -y);
        var color = new fabric.util.colorValues(this.color);
        color[0] = Math.min(255, Math.max(0, color[0] + fabric.util.getRandom(125, -125)));
        color[1] = Math.min(255, Math.max(0, color[1] + fabric.util.getRandom(125, -125)));
        color[2] = Math.min(255, Math.max(0, color[2] + fabric.util.getRandom(125, -125)));
        this.changeColor(this.rgbToHex(color[0], color[1], color[2]));
        this.canvas.contextTop.globalCompositeOperation = 'destination-over';
        this.canvas.contextTop.globalAlpha = this.opacity;
        this.canvas.contextTop.drawImage(this.brush.toCanvasElement(), x - r / 2, y - r / 2, r, r);
        this.changeColor("white");
        this.canvas.contextTop.globalCompositeOperation = 'source-over';
        this.canvas.contextTop.globalAlpha = this.opacity * 0.3;
        var w = r * 0.7;
        this.canvas.contextTop.drawImage(this.brush.toCanvasElement(), x - w / 2, y - w / 2, w, w);
        this.canvas.contextTop.restore();
      }
      
      if (this.canvas._isCurrentlyDrawing) {
      //   setTimeout(draw, this._interval);
      } else {
        this._reset();
      }
    },

    _render: function() {
    },

    _reset: function() {
      this._drips.length = 0;
      this._point = null;
      this._lastPoint = null;
    }
  });

  export default Nebula;