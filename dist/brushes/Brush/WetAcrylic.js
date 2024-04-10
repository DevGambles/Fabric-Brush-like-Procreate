var WetAcrylic = fabric.util.createClass(fabric.BaseBrush, {

  opacity: .2,
  width: 30,
  _baseWidth: 5,
  _drips: [],
  _dripThreshold: 15,
  _interval: 10,
  _lastPoint: null,
  _point: null,
  _strokeId: 0,
  brush: null,
  brushCol : 'img/WetAcrylic.png',
  rotate: 0,

  initialize: function(canvas, opt) {
    var context = this;
    opt = opt || {};

    this.canvas = canvas;
    this.width = opt.width || canvas.freeDrawingBrush.width;
    this.opacity = opt.opacity || canvas.contextTop.globalAlpha;
    this.color = opt.color || canvas.freeDrawingBrush.color;

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
    this.rotate = fabric.util.getRandom(Math.PI * 2);
    this.changeColor(this.color);
    this.draw();
  },

  onMouseMove: function(pointer) {
    this._point = new fabric.Point(pointer.x, pointer.y);
    this.draw();
    this._lastPoint = this._point;
  },

  onMouseUp: function(pointer) {
    this.convertToImg();
  },

  draw: function() {
    var point, distance, angle, x, y;
    this.canvas.contextTop.save();
    point = new fabric.Point(this._point.x || 0, this._point.y || 0);
    distance = point.distanceFrom(this._lastPoint);
    angle = point.angleBetween(this._lastPoint);
    this.canvas.contextTop.globalAlpha = this.opacity * 0.7;
    var v, s, stepNum, p, j;
    v = this._point.subtract(this._lastPoint); // vector from now point to last point
    //s is a foot width of two points.
    s = Math.ceil(this._size / 10);
    //calculate steps from foot width.
    stepNum = Math.floor(v.distanceFrom({ x: 0, y: 0 }) / s) + 1;
    v.normalize(s);
    this.canvas.contextTop.globalCompositeOperation = 'xor';
    for (j = 0; j < stepNum; j ++) {
      this.canvas.contextTop.save();
      var p = this._lastPoint.add(v.multiply(j));
      x = p.x + Math.sin(angle);
      y = p.y + Math.cos(angle);
      // this.canvas.contextTop.translate(x, y);
      // this.canvas.contextTop.rotate(fabric.util.getRandom(Math.PI / 3, -Math.PI / 3));
      // this.canvas.contextTop.translate(-x, -y);
      var w = this._size;
      var h = (this.brush.height / this.brush.width) * this._size;
      this.canvas.contextTop.drawImage(this.brush.toCanvasElement(), x - w / 2, y - h / 2, w, h);
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

export default WetAcrylic;