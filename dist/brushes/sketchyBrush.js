
/**
 * SketchyBrush
 * Based on code by Mr. Doob.
 */
 var SketchyBrush = fabric.util.createClass(fabric.BaseBrush, {
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
		this._count = 0;
		this._points = [pointer];

		var ctx = this.canvas.contextTop,
			color = fabric.util.colorValues(this.color);
		//ctx.globalCompositeOperation = 'source-over';
		ctx.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (0.05 * this.opacity) + ')';
		ctx.lineWidth = this.width;
	},

	onMouseMove: function(pointer) {
		this._points.push(pointer);

		var i, dx, dy, d, factor = .3 * this.width,
			ctx = this.canvas.contextTop,
			points = this._points,
			count = this._count,
			lastPoint = points[points.length - 2];

		ctx.beginPath();
		ctx.moveTo(lastPoint.x, lastPoint.y);
		ctx.lineTo(pointer.x, pointer.y);
		ctx.stroke();

		for (i = 0; i < points.length; i++) {
			dx = points[i].x - points[count].x;
			dy = points[i].y - points[count].y;
			d = dx * dx + dy * dy;

			if (d < 4000 && Math.random() > d / 2000)	{
				ctx.beginPath();
				ctx.moveTo(points[count].x + (dx * factor), points[count].y + (dy * factor));
				ctx.lineTo(points[i].x - (dx * factor), points[i].y - (dy * factor));
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
}); // End SketchyBrush

export default SketchyBrush;