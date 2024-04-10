
/**
 * WebBrush
 * Based on code by Mr. Doob.
 */
 var WebBrush = fabric.util.createClass(fabric.BaseBrush, {
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
		this._colorValues = fabric.util.colorValues(this.color);
	},

	onMouseMove: function(pointer) {
		this._points.push(pointer);

		var ctx = this.canvas.contextTop,
			points = this._points,
			lastPoint = points[points.length - 2],
			colorValues = this._colorValues,
			i, dx, dy, d;

		ctx.lineWidth = this.width;
		ctx.strokeStyle = 'rgba(' + colorValues[0] + ',' + colorValues[1] + ',' + colorValues[2] + ',' + (.5 * this.opacity) + ')';

		ctx.beginPath();
		ctx.moveTo(lastPoint.x, lastPoint.y);
		ctx.lineTo(pointer.x, pointer.y);
		ctx.stroke();

		ctx.strokeStyle = 'rgba(' + colorValues[0] + ',' + colorValues[1] + ',' + colorValues[2] + ',' + (.1 * this.opacity) + ')';

		for (i = 0; i < points.length; i++) {
			dx = points[i].x - points[this._count].x;
			dy = points[i].y - points[this._count].y;
			d = dx * dx + dy * dy;

			if (d < 2500 && Math.random() > .9) {
				ctx.beginPath();
				ctx.moveTo(points[this._count].x, points[this._count].y);
				ctx.lineTo(points[i].x, points[i].y);
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
}); // End WebBrush


export default WebBrush;