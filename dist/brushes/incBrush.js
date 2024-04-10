var InkBrush = fabric.util.createClass(fabric.BaseBrush, {
	color: '#000',
	opacity: 1,
	width: 30,

	_baseWidth: 20,
	_inkAmount: 7,
	_lastPoint: null,
	_point: null,
	_range: 10,
	_strokes: null,

	initialize: function(canvas, opt) {
		opt = opt || {};

		this.canvas = canvas;
		this.width = opt.width || canvas.freeDrawingBrush.width;
		this.color = opt.color || canvas.freeDrawingBrush.color;
		this.opacity = opt.opacity || canvas.contextTop.globalAlpha;

		this._point = new fabric.Point();
	},

	_render: function(pointer) {
		var len, i, point = this.setPointer(pointer),
			subtractPoint = point.subtract(this._lastPoint),
			distance = point.distanceFrom(this._lastPoint),
			stroke;

		for (i = 0, len = this._strokes.length; i < len; i++) {
			stroke = this._strokes[i];
			stroke.update(point, subtractPoint, distance);
			stroke.draw();
		}

		if (distance > 30) {
			this.drawSplash(point, this._inkAmount);
		}
	},

	onMouseDown: function(pointer) {
		this.canvas.contextTop.globalAlpha = this.opacity;
		this._resetTip(pointer);
	},

	onMouseMove: function(pointer) {
		if (this.canvas._isCurrentlyDrawing) {
			this._render(pointer);
		}
	},

	onMouseUp: function() {
		this.convertToImg();
		this.canvas.contextTop.globalAlpha = 1;
	},

	drawSplash: function(pointer, maxSize) {
		var c, r, i, point,
			ctx = this.canvas.contextTop,
			num = fabric.util.getRandom(12),
			range = maxSize * 10,
			color = this.color;

		ctx.save();
		for (i = 0; i < num; i++) {
			r = fabric.util.getRandom(range, 1);
			c = fabric.util.getRandom(Math.PI * 2);
			point = new fabric.Point(pointer.x + r * Math.sin(c), pointer.y + r * Math.cos(c));

			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(point.x, point.y, fabric.util.getRandom(maxSize) / 2, 0, Math.PI * 2, false);
			ctx.fill();
		}
		ctx.restore();
	},

	setPointer: function(pointer) {
		var point = new fabric.Point(pointer.x, pointer.y);

		this._lastPoint = fabric.util.object.clone(this._point);
		this._point = point;

		return point;
	},

	_resetTip: function(pointer) {
		var len, i, point = this.setPointer(pointer);

		this._strokes = [];
		this._size = this.width / 5 + this._baseWidth;
		this._range = this._size / 2;

		for (i = 0, len = this._size; i < len; i++) {
			this._strokes[i] = new fabric.Stroke(this.canvas.contextTop, point, this._range, this.color, this.width, this._inkAmount);
		}
	}
}); // End InkBrush


export default InkBrush;