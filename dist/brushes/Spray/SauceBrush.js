var SauceBrush = fabric.util.createClass(fabric.BaseBrush, {

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
	brushCol : 'img/SauceBrush.png',
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
		this.changeColor(this.color);
		this.canvas.contextTop.globalCompositeOperation = 'source-over';
		// this._render();
		this.draw();
	},
  
	onMouseMove: function(pointer) {
	  this._point = new fabric.Point(pointer.x, pointer.y);
	  this.draw();
	},
  
	onMouseUp: function(pointer) {
		this.convertToImg();
	},
  
	_render: function() {
	//   setTimeout(draw, this._interval);
	},
	
	draw: function() {
		var context = this;
		var point, distance, angle, amount, x, y;

		point = new fabric.Point(context._point.x || 0, context._point.y || 0);
		distance = point.distanceFrom(context._lastPoint);
		angle = point.angleBetween(context._lastPoint);
		amount = (100 / context._size) / (Math.pow(distance, 2) + 1);

		context.canvas.contextTop.globalAlpha = context.opacity;
		var v, s, stepNum, p, j;
		v = context._point.subtract(context._lastPoint); // vector from now point to last point
		//s is a foot width of two points.
		s = Math.ceil(context._size / 10);
		//calculate steps from foot width.
		stepNum = Math.floor(v.distanceFrom({ x: 0, y: 0 }) / s) + 1;
		v.normalize(s);
		for (j = 0; j < stepNum; j ++) {
			context.canvas.contextTop.save();
			var p = context._lastPoint.add(v.multiply(j));
			x = p.x;
			y = p.y;
			context.brush.rotate((parseInt(fabric.util.getRandom(10)) % 4) * 90);
			context.canvas.contextTop.drawImage(context.brush.toCanvasElement(), x - context._size * 0.5, y - context._size * 0.5, context._size, context._size);
			context.canvas.contextTop.restore();
		}
		context._lastPoint = context._point;
		if (context.canvas._isCurrentlyDrawing) {
		//   setTimeout(draw, context._interval);
		} else {
			context._reset();
		}
	},
  
	_reset: function() {
	  this._drips.length = 0;
	  this._point = null;
	  this._lastPoint = null;
	}
  });
  
  export default SauceBrush;