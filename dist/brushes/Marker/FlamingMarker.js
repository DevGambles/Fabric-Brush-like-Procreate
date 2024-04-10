var myInterval = null;
var FlamingMarker = fabric.util.createClass(fabric.BaseBrush, {
	color: '#000',
	opacity: 0.6,
	width: 30,
	_baseWidth: 5,
	_inkAmount: 10,
	_latestStrokeLength: 0,
	_point: null,
	_sep: 5,
	_size: 0,
	_latest: null,
	_drawn: false,
	_count: 0,
	rotate: 0,
	image: null,
	_lineWidth: 3,
	myInterval: null,
	ctx: null,
	refreshRate: 10,
	easing: 0.7,
	painters: [],
	strokes: 1,
	brush: null,
	brushCol: 'img/FlamingMarker.png',

	initialize: function (canvas, opt) {
		opt = opt || {};
		var context = this;
		this.canvas = canvas;
		this.ctx = this.canvas.contextTop;
		this.width = opt.width || canvas.freeDrawingBrush.width;
		this.color = opt.color || canvas.freeDrawingBrush.color;
		this.opacity = opt.opacity || canvas.contextTop.globalAlpha;
		this._point = new fabric.Point(0, 0);
		this.painters = [];
		fabric.Image.fromURL(this.brushCol, function (brush) {
			context.brush = brush;
			context.brush.filters = [];
			context.changeColor(context.color || this.color);
		}, { crossOrigin: "anonymous" });
		for (var i = 0; i < this.strokes; i++) {
			var ease = this.easing;
			this.painters.push({
				dx: 0,
				dy: 0,
				ax: 0,
				ay: 0,
				div: 0.1,
				ease: ease
			});
		}
		
		// if (myInterval)
		// 	clearInterval(myInterval);
		// myInterval = setInterval(function () {
		// 	context.draw();
		// }, context.refreshRate);
		// this.render();

		function render() {
			context.draw();
			requestAnimationFrame(render);
		}

		render();
	},

	changeColor: function (color) {
		// this.color = color;
		// this.brush.filters[0] = new fabric.Image.filters.Tint({ color: color });
		this.brush.filters[0] = new fabric.Image.filters.BlendColor({
			color: color,
			mode: 'tint',
			alpha: 0.7
		});
		this.brush.applyFilters(this.canvas.renderAll.bind(this.canvas));
	},

	set: function (p) {
		if (this._latest) {
			this._latest.setFromPoint(this._point);
		} else {
			this._latest = new fabric.Point(p.x, p.y);
		}
		fabric.Point.prototype.setFromPoint.call(this._point, p);
	},

	update: function (p) {
		this.set(p);
		this._latestStrokeLength = this._point.subtract(this._latest).distanceFrom({ x: 0, y: 0 });
	},

	distance: function (p1, p2) {
		return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
	},

	onMouseDown: function (pointer) {
		this._drawn = true;
		this._count = 0;
		this.rotate = fabric.util.getRandom(Math.PI * 2);
		this._size = this.width + this._baseWidth;
		this.set(pointer);
		for (var i = 0; i < this.painters.length; i++) {
			this.painters[i].dx = pointer.x;
			this.painters[i].dy = pointer.y;
		}
	},

	onMouseMove: function (pointer) {
		if (!this._drawn)
			return;
		this.changeColor(this.color);
		this.ctx.globalCompositeOperation = 'lighter';
		this.ctx.globalAlpha = this.opacity;
		this.update(pointer);
		this._count++;
	},

	draw: function () {
		for (var i = 0; i < this.painters.length; i++) {
			var dx = this.painters[i].dx;
			var dy = this.painters[i].dy;
			var dx1 = this.painters[i].ax = (this.painters[i].ax + (this.painters[i].dx - this._point.x) * this.painters[i].div) * this.painters[i].ease;
			this.painters[i].dx -= dx1;
			var dx2 = this.painters[i].dx;
			var dy1 = this.painters[i].ay = (this.painters[i].ay + (this.painters[i].dy - this._point.y) * this.painters[i].div) * this.painters[i].ease;
			this.painters[i].dy -= dy1;
			var dy2 = this.painters[i].dy;
			if (this._drawn) {
				var v, s, stepNum, p, j, x, y;
				var to = new fabric.Point(dx2, dy2), from = new fabric.Point(dx, dy);
				v = to.subtract(from); // vector from now point to last point
				//s is a foot width of two points.
				s = Math.ceil(this._size / 20);
				//calculate steps from foot width.
				stepNum = Math.floor(v.distanceFrom({ x: 0, y: 0 }) / s) + 1;
				v.normalize(s);
				var w = this._size;
				var h = (this.brush.height / this.brush.width) * this._size;
				for (j = 0; j < stepNum; j++) {
					this.ctx.save();
					var p = from.add(v.multiply(j));
					this.brush.rotate(this.rotate + fabric.util.getRandom(10, -10));
					this.ctx.drawImage(this.brush.toCanvasElement(), p.x - w / 2, p.y - h / 2, w, h);
					this.ctx.restore();
				}
			}
		}
	},

	onMouseUp: function () {
		if (this._drawn) {
			try {
				this.convertToImg();
			}
			catch (e) {
			}
		}
		this._drawn = false;
		this._latest = null;
		this._latestStrokeLength = 0;
	},

	_render: function() { 
	}

}); // End FlamingMarker

export default FlamingMarker;