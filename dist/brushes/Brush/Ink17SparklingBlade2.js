var myInterval = null;
var Ink17SparklingBlade2 = fabric.util.createClass(fabric.BaseBrush, {
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
	image: null,
	_lineWidth: 3,
	_imgload: false,
	range: 1,
	myInterval: null,
	ctx: null,
	refreshRate: 10,
	easing: 0.7,
	painters: [],
	strokes: 1,
	brush: null,
	brushCol: 'img/Ink17SparklingBlade2.png',

	initialize: function (canvas, opt) {
		1
		opt = opt || {};
		var context = this;
		this.canvas = canvas;
		this.ctx = this.canvas.contextTop;
		this.width = opt.width || canvas.freeDrawingBrush.width;
		this.color = opt.color || canvas.freeDrawingBrush.color;
		this.opacity = opt.opacity || canvas.contextTop.globalAlpha;
		this._point = new fabric.Point(0, 0);
		this.painters = [];
		// this.image = new Image();
		// this.image.src = "img/Ink17SparklingBlade2.png";
		// this.image.onload = () => {
		// 	this._imgload = true;
		// };
		fabric.Image.fromURL(this.brushCol, function (brush) {
			// brush.scale(1).set({
			//   left: 0,
			//   top: 0,
			//   clipPath: new fabric.Circle({
			//     radius: 30,
			//     originX: "center",
			//     originY: "center"
			//   })
			// });
			// brush.rotate(90);
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
		if (myInterval)
			clearInterval(myInterval);
		myInterval = setInterval(function () {
			context.draw();
		}, context.refreshRate);
	},

	changeColor: function (color) {
		// this.color = color;
		// this.brush.filters[0] = new fabric.Image.filters.Tint({ color: color });
		this.brush.filters[0] = new fabric.Image.filters.BlendColor({
			color: color,
			mode: 'tint',
			alpha: 1
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

	getVectorAngle: function (p1, p2) {
		var v = p2.subtract(p1); // vector from now point to last point
		var angleRad = Math.acos(v.x / Math.sqrt(v.x * v.x + v.y * v.y));
		var angle = angleRad * 180 / Math.PI;
		if (v.y > 0)
			angle = 360 - angle;
		if (angle.toString() == 'NaN')
			angle = 0;
		return angle;
	},

	makePattern: function () {
		var patternCanvas = document.createElement("canvas");
		patternCanvas.width = this.image.width;
		patternCanvas.height = this.image.height;
		var color = fabric.util.colorValues(this.color);
		const patternContext = patternCanvas.getContext("2d", { willReadFrequently: true });
		patternContext.drawImage(this.image, 0, 0);
		var imageData = patternContext.getImageData(0, 0, patternCanvas.width, patternCanvas.height);
		var pixelData = imageData.data;
		for (var i = 0; i < pixelData.length; i += 4) {
			if (pixelData[i] == 255 && pixelData[i + 1] == 255 && pixelData[i + 2] == 255)
				pixelData[i + 3] = 0;
			else {
				pixelData[i] = color[0];
				pixelData[i + 1] = color[1];
				pixelData[i + 2] = color[2];
			}
		}
		patternContext.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
		patternContext.putImageData(imageData, 0, 0);
		var pattern = this.ctx.createPattern(patternCanvas, "repeat");
		this.ctx.fillStyle = pattern;
	},

	onMouseDown: function (pointer) {
		// if (!this._imgload)
		// 	return;
		// this.makePattern();
		this.ctx.globalAlpha = this.opacity;
		this._drawn = true;
		this._count = 0;
		this._size = 0;
		this.set(pointer);
		for (var i = 0; i < this.painters.length; i++) {
			this.painters[i].dx = pointer.x;
			this.painters[i].dy = pointer.y;
		}
	},

	onMouseMove: function (pointer) {
		if (!this._drawn)
			return;
		if (this._size < this.width + this._baseWidth)
			this._size += (this.width + this._baseWidth) / 3;
		this.update(pointer);
		this._count++;
	},

	draw: function () {
		for (var i = 0; i < this.painters.length; i++) {
			var dx = this.painters[i].dx;
			var dy = this.painters[i].dy;
			var fromX = dx, fromY = dy;
			var dx1 = this.painters[i].ax = (this.painters[i].ax + (this.painters[i].dx - this._point.x) * this.painters[i].div) * this.painters[i].ease;
			this.painters[i].dx -= dx1;
			var dx2 = this.painters[i].dx;
			var dy1 = this.painters[i].ay = (this.painters[i].ay + (this.painters[i].dy - this._point.y) * this.painters[i].div) * this.painters[i].ease;
			this.painters[i].dy -= dy1;
			var dy2 = this.painters[i].dy;
			if (this._drawn) {
				this.ctx.globalAlpha = this.opacity;
				this.ctx.globalCompositeOperation = 'source-over';
				this.changeColor(this.color);
				var v, s, stepNum, p, j, angle, x, y;
				var to = new fabric.Point(dx2, dy2), from = new fabric.Point(dx, dy);
				v = to.subtract(from); // vector from now point to last point
				//s is a foot width of two points.
				s = Math.ceil((this.width / 2 + this._baseWidth) / 20);
				//calculate steps from foot width.
				stepNum = Math.floor(v.distanceFrom({ x: 0, y: 0 }) / s) + 1;
				v.normalize(s);
				var w = this._size;
				var h = (this.brush.height / this.brush.width) * this._size;
				angle = this.getVectorAngle(from, to);
				for (j = 0; j < stepNum; j++) {
					this.ctx.save();
					var p = from.add(v.multiply(j));
					x = p.x;
					y = p.y;
					this.ctx.translate(x, y);
					this.ctx.rotate((-angle * Math.PI / 180) + fabric.util.getRandom(0.1, -0.1));
					this.ctx.translate(-x, -y);
					// this.brush.rotate(-angle);
					this.ctx.drawImage(this.brush.toCanvasElement(), x - w / 2, y - h / 2, w, h);
					this.ctx.restore();
				}
				// this.ctx.moveTo(from.x, from.y);
				// this.ctx.lineTo(to.x, to.y);
				// this.ctx.strokeStyle = "black";
				// this.ctx.stroke();
				// Add three color stops
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

	_render: function () { }

}); // End Ink17SparklingBlade2

export default Ink17SparklingBlade2;