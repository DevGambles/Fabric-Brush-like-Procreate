/**
 * SquaresBrush
 * Based on code by Mr. Doob.
 */
 var SquaresBrush = fabric.util.createClass(fabric.BaseBrush, {
	color: '#000',
	bgColor: '#fff',
	opacity: 1,
	width: 1,

	_lastPoint: null,
	_drawn: false,

	initialize: function(canvas, opt) {
		opt = opt || {};

		this.canvas = canvas;
		this.width = opt.width || canvas.freeDrawingBrush.width;
		this.color = opt.color || canvas.freeDrawingBrush.color;
		this.bgColor = opt.bgColor || '#fff';
		this.opacity = opt.opacity || canvas.contextTop.globalAlpha;
	},

	onMouseDown: function(pointer) {
		var ctx = this.canvas.contextTop,
			color = fabric.util.colorValues(this.color),
			bgColor = fabric.util.colorValues(this.bgColor);

		this._lastPoint = pointer;
		this._drawn = false;

		//ctx.globalCompositeOperation = 'source-over';
		this.canvas.contextTop.globalAlpha = this.opacity;
		ctx.fillStyle = 'rgba(' + bgColor[0] + ',' + bgColor[1] + ',' + bgColor[2] + ',' + bgColor[3] + ')';
		ctx.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + color[3] + ')';
		ctx.lineWidth = this.width;
	},

	onMouseMove: function(pointer) {
		var ctx = this.canvas.contextTop,
			dx = pointer.x - this._lastPoint.x,
			dy = pointer.y - this._lastPoint.y,
			angle = 1.57079633,
			px = Math.cos(angle) * dx - Math.sin(angle) * dy,
			py = Math.sin(angle) * dx + Math.cos(angle) * dy;

		ctx.beginPath();
		ctx.moveTo(this._lastPoint.x - px, this._lastPoint.y - py);
		ctx.lineTo(this._lastPoint.x + px, this._lastPoint.y + py);
		ctx.lineTo(pointer.x + px, pointer.y + py);
		ctx.lineTo(pointer.x - px, pointer.y - py);
		ctx.lineTo(this._lastPoint.x - px, this._lastPoint.y - py);
		ctx.fill();
		ctx.stroke();

		this._lastPoint = pointer;
		this._drawn = true;
	},

	onMouseUp: function(pointer) {
		if (this._drawn) {
			this.convertToImg();
		}
		this.canvas.contextTop.globalAlpha = 1;
	},

	_render: function() {}
}); // End SquaresBrush


export default SquaresBrush;