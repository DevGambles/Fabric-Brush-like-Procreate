var Pandani = fabric.util.createClass(fabric.BaseBrush, {

  opacity: .2,
  width: 30,
  _baseWidth: 5,
  _drips: [],
  _dripThreshold: 15,
  _interval: 10,
  _lastPoint: null,
  _point: null,
  _strokeId: 0,
  _drawn: false,
  brush: null,
  brushCol : 'img/Pandani.png',
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
      // brush.scale(1).set({
      //   left: 0,
      //   top: 0,
      //   clipPath: new fabric.Circle({
      //     radius: 30,
      //     originX: "center",
      //     originY: "center"
      //   })
      // });
      // brush.rotate(90);
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
    this._drawn = true;
    this._point = new fabric.Point(pointer.x, pointer.y);
    this._lastPoint = this._point;
    this._size = this.width + this._baseWidth;
    this._strokeId = +new Date();
    this.changeColor(this.color);
    this.canvas.contextTop.globalCompositeOperation = 'source-over';
    this.draw();
  },

  onMouseMove: function(pointer) {
    if (!this._drawn)
      return;
    // if (this.distance(this._lastPoint, pointer) < 50)
		// {
		// 	return;
		// }
    this._point = new fabric.Point(pointer.x, pointer.y);
    this.draw();
    this._lastPoint = this._point;
  },

  onMouseUp: function(pointer) {
    if (this._drawn)
      this.convertToImg();
    this._drawn = false;
  },

  distance: function(p1, p2) {
		return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
	},

  getVectorAngle: function(p1, p2) {
    var v = p2.subtract(p1); // vector from now point to last point
		var angleRad = Math.acos( v.x / Math.sqrt(v.x*v.x + v.y*v.y) );
		var angle = angleRad * 180 / Math.PI;
		if (v.y > 0)
      angle = 360 - angle;
    if (angle.toString() == 'NaN')
      angle = 0;
    return angle;
  },

  draw: function() {
    var point, distance, angle, x, y;
    this.canvas.contextTop.save();
    point = new fabric.Point(this._point.x || 0, this._point.y || 0);
    distance = point.distanceFrom(this._lastPoint);
    this.canvas.contextTop.globalAlpha = this.opacity;
    var v, s, stepNum, p, j;
    v = this._point.subtract(this._lastPoint); // vector from now point to last point
    //s is a foot width of two points.
    s = Math.ceil(this._size / 10);
    //calculate steps from foot width.
    stepNum = Math.floor(v.distanceFrom({ x: 0, y: 0 }) / s) + 1;
    v.normalize(s);
    var w = this._size;
    var h = (this.brush.height / this.brush.width) * this._size;
    angle = this.getVectorAngle(this._lastPoint, this._point);
    for (j = 0; j < stepNum; j ++) {
      this.canvas.contextTop.save();
      var p = this._lastPoint.add(v.multiply(j));
      x = p.x;
      y = p.y;
      this.canvas.contextTop.translate(x, y);
      this.canvas.contextTop.rotate((-angle * Math.PI / 180));
      this.canvas.contextTop.translate(-x, -y);
      this.canvas.contextTop.fillStyle = "red";
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

export default Pandani;