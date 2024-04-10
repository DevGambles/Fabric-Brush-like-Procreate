/**
 * ShadedBrush
 * Based on code by Mr. Doob.
 */
var ShadedBrush = fabric.util.createClass(fabric.BaseBrush, {
	color: '#000',
	opacity: .1,
	width: 1,
	shadeDistance: 1000,

	_points: [],

	initialize: function(canvas, opt) {
		opt = opt || {};

		this.canvas = canvas;
		this.width = opt.width || canvas.freeDrawingBrush.width;
		this.color = opt.color || canvas.freeDrawingBrush.color;
		this.opacity = opt.opacity || .3;
		this.shadeDistance = opt.shadeDistance || 1000;
	},

	onMouseDown: function(pointer) {
		this._points = [pointer];

		var ctx = this.canvas.contextTop,
			color = fabric.util.colorValues(this.color);

		ctx.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + this.opacity + ')';
		ctx.lineWidth = this.width;
		ctx.lineJoin = ctx.lineCap = 'round';
	},

	onMouseMove: function(pointer) {
		this._points.push(pointer);

		var ctx = this.canvas.contextTop,
			points = this._points;

		ctx.beginPath();
		ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
		ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
		ctx.stroke();

		for (var i = 0, len = points.length; i < len; i++) {
			var dx = points[i].x - points[points.length-1].x;
			var dy = points[i].y - points[points.length-1].y;
			var d = dx * dx + dy * dy;

			if (d < this.shadeDistance) {
				ctx.beginPath();
				ctx.moveTo( points[points.length-1].x + (dx * 0.2), points[points.length-1].y + (dy * 0.2));
				ctx.lineTo( points[i].x - (dx * 0.2), points[i].y - (dy * 0.2));
				ctx.stroke();
			}
		}
	},

	onMouseUp: function(pointer) {
		if (this._points.length > 1) {
			this.convertToImg();
		}
	},

	_render: function() {}
}); // End ShadedBrush


export default ShadedBrush;