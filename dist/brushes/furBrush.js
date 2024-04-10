var FurBrush = fabric.util.createClass(fabric.BaseBrush, {
	color: '#000',
	opacity: 1,
	width: 1,

	_count: 0,
	_points: [],

	initialize: function(canvas, opt) {
		opt = opt || {};

		this.canvas = canvas;
		this.width = opt.width || canvas.freeDrawingBrush.width;
		this.color = opt.color || canvas.freeDrawingBrush.color;
		this.opacity = opt.opacity || 1;
	},

	onMouseDown: function(pointer) {
		this._points = [pointer];
		this._count = 0;

		var ctx = this.canvas.contextTop,
			color = fabric.util.colorValues(this.color);

		ctx.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (0.1 * this.opacity) + ')';
		ctx.lineWidth = this.width;

		this._points.push(pointer);
	},

	onMouseMove: function(pointer) {
		this._points.push(pointer);

		var i, dx, dy, d,
			ctx = this.canvas.contextTop,
			points = this._points,
			lastPoint = points[points.length - 2];

		ctx.beginPath();
		ctx.moveTo(lastPoint.x, lastPoint.y);
		ctx.lineTo(pointer.x, pointer.y);
		ctx.stroke();

		for (i = 0; i < this._points.length; i++) {
			dx = this._points[i].x - this._points[this._count].x;
			dy = this._points[i].y - this._points[this._count].y;
			d = dx * dx + dy * dy;

			if (d < 2000 && Math.random() > d / 2000)	{
				ctx.beginPath();
				ctx.moveTo(pointer.x + (dx * 0.5), pointer.y + (dy * 0.5));
				ctx.lineTo(pointer.x - (dx * 0.5), pointer.y - (dy * 0.5));
				ctx.stroke();
			}
		}

		this._count++;
	},

	onMouseUp: function(pointer) {
		if (this._count > 0) {
			this.convertToImg();
		}
	},

	_render: function() {}
});

export default FurBrush;
