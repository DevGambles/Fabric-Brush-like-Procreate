/**
 * LongfurBrush
 * Based on code by Mr. Doob.
 */
var LongFurBrush = fabric.util.createClass(fabric.BaseBrush, {
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

		//ctx.globalCompositeOperation = 'source-over';
		ctx.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (0.05 * this.opacity) + ')';
		ctx.lineWidth = this.width;
	},

	onMouseMove: function(pointer) {
		this._points.push(pointer);

		var i, dx, dy, d, size,
			ctx = this.canvas.contextTop,
			points = this._points;

		for (i = 0; i < this._points.length; i++) {
			size = -Math.random();

			dx = this._points[i].x - this._points[this._count].x;
			dy = this._points[i].y - this._points[this._count].y;
			d = dx * dx + dy * dy;

			if (d < 4000 && Math.random() > d / 4000)	{
				ctx.beginPath();
				ctx.moveTo(this._points[this._count].x + (dx * size), this._points[this._count].y + (dy * size));
				ctx.lineTo(this._points[i].x - (dx * size) + Math.random() * 2, this._points[i].y - (dy * size) + Math.random() * 2);
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
}); // End LongfurBrush

export default LongFurBrush;