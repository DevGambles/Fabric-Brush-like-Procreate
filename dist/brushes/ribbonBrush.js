

/**
 * RibbonBrush
 * Based on code by Mr. Doob.
 */
 var RibbonBrush = fabric.util.createClass(fabric.BaseBrush, {
	color: '#000',
	opacity: 1,
	width: 1,

	_nrPainters: 50,
	_painters: [],
	_lastPoint: null,
	_interval: null,

	initialize: function(canvas, opt) {
		opt = opt || {};

		this.canvas = canvas;
		this.width = opt.width || canvas.freeDrawingBrush.width;
		this.color = opt.color || canvas.freeDrawingBrush.color;
		this.opacity = opt.opacity || 1;

		for (var i = 0; i < this._nrPainters; i++) {
			this._painters.push({ dx:this.canvas.width / 2, dy:this.canvas.height / 2, ax:0, ay:0, div:.1, ease:Math.random() * .2 + .6 });
		}
	},

	update: function() {
		var ctx = this.canvas.contextTop, painters = this._painters;
		for (var i = 0; i < painters.length; i++)	{
			ctx.beginPath();
			ctx.moveTo(painters[i].dx, painters[i].dy);
			painters[i].dx -= painters[i].ax = (painters[i].ax + (painters[i].dx - this._lastPoint.x) * painters[i].div) * painters[i].ease;
			painters[i].dy -= painters[i].ay = (painters[i].ay + (painters[i].dy - this._lastPoint.y) * painters[i].div) * painters[i].ease;
			ctx.lineTo(painters[i].dx, painters[i].dy);
			ctx.stroke();
		}
	},

	onMouseDown: function(pointer) {
		var ctx = this.canvas.contextTop,
			color = fabric.util.colorValues(this.color);

		this._painters = [];
		for (var i = 0; i < this._nrPainters; i++) {
			this._painters.push({ dx:this.canvas.width / 2, dy:this.canvas.height / 2, ax:0, ay:0, div:.1, ease:Math.random() * .2 + .6 });
		}

		this._lastPoint = pointer;

		//ctx.globalCompositeOperation = 'source-over';
		ctx.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (0.05 * this.opacity) + ')';
		ctx.lineWidth = this.width;

		for (var i = 0; i < this._nrPainters; i++) {
			this._painters[i].dx = pointer.x;
			this._painters[i].dy = pointer.y;
		}

		var self = this;
		this._interval = setInterval(function() { self.update() }, 1000/60);
	},

	onMouseMove: function(pointer) {
		this._lastPoint = pointer;
	},

	onMouseUp: function(pointer) {
		clearInterval(this._interval);
		this.convertToImg();
	},

	_render: function() {}
}); // End RibbonBrush

export default RibbonBrush;