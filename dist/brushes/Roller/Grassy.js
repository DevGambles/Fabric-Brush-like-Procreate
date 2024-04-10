var Grassy = fabric.util.createClass(fabric.BaseBrush, {
	color: '#000',
	opacity: 0.6,
	width: 30,

	_baseWidth: 20,
	_inkAmount: 10,
	_latestStrokeLength: 0,
	_point: null,
	_sep: 5,
	_size: 0,
	_latest: null,
	_drawn: false,
	_count: 0,
	_imgload: false,
	image: null,

	initialize: function(canvas, opt) {
		opt = opt || {};

		this.canvas = canvas;
		this.width = opt.width || canvas.freeDrawingBrush.width;
		this.color = opt.color || canvas.freeDrawingBrush.color;
		this.opacity = opt.opacity || canvas.contextTop.globalAlpha;
		this._point = new fabric.Point(0, 0);
		this.image = new Image();
		this.image.src = "img/Grassy.png";
		this.image.onload = () => {
			this._imgload = true;
		};
	},

	onMouseDown: function(pointer) {
		if (!this._imgload)
			return;
		this.canvas.contextTop.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.canvas.contextTop.globalAlpha = this.opacity;
		this._size = this.width / 2 + this._baseWidth;
		this._drawn = true;
		this._count = 0;
		this.set(pointer);
		this.makePattern();
		this.draw(this.canvas.contextTop);
	},

	makePattern: function() {
		var patternCanvas = document.createElement("canvas");
		patternCanvas.width = this.image.width;
		patternCanvas.height = this.image.height;
		var color = fabric.util.colorValues(this.color);
		const patternContext = patternCanvas.getContext("2d", {willReadFrequently: true});
		patternContext.drawImage(this.image, 0, 0);
		var imageData = patternContext.getImageData(0, 0, patternCanvas.width, patternCanvas.height);
		var pixelData = imageData.data;
		for (var i = 0; i < pixelData.length; i += 4)
		{
			if (pixelData[i + 3] != 0)
			{
				pixelData[i] = color[0];
				pixelData[i + 1] = color[1];
				pixelData[i + 2] = color[2];
			}
		}
		patternContext.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
		patternContext.putImageData(imageData, 0, 0);
		var pattern = this.canvas.contextTop.createPattern(patternCanvas, "repeat");
		const matrix = new DOMMatrix([1, 0, 0, 1, 0, 0]);
		pattern.setTransform(matrix.translate(fabric.util.getRandom(this.image.width / 2), fabric.util.getRandom(this.image.height / 2)).scale(1));
		this.canvas.contextTop.fillStyle = pattern;
	},

	onMouseMove: function(pointer) {
		if (!this._drawn)
			return false;
		// if (this.distance(this._point, pointer) < 3)
		// {
		// 	return;
		// }
		this.update(pointer);
		this._count ++;
		this.draw(this.canvas.contextTop);
	},

	onMouseUp: function() {
		if (this._drawn) {
			this.convertToImg();
		}
		this._drawn = false;
		this._latest = null;
		this._latestStrokeLength = 0;
	},

	set: function(p) {
		if (this._latest) {
			this._latest.setFromPoint(this._point);
		} else {
			this._latest = new fabric.Point(p.x, p.y);
		}
		fabric.Point.prototype.setFromPoint.call(this._point, p);
	},

	distance: function(p1, p2) {
		return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
	},

	update: function(p) {
		this.set(p);
		this._latestStrokeLength = this._point.subtract(this._latest).distanceFrom({ x: 0, y: 0 });
	},

	draw: function(ctx) {
		var l, i, j, p, r, c, x, y, w, h, v, s, stepNum, dotSize, dotNum, range;
		v = this._point.subtract(this._latest); // vector from now point to last point
		//s is a foot width of two points.
		s = Math.ceil(this._size / 10);
		//calculate steps from foot width.
		stepNum = Math.floor(v.distanceFrom({ x: 0, y: 0 }) / s) + 1;
		v.normalize(s);

		dotSize = this._sep * fabric.util.clamp(this._inkAmount / this._latestStrokeLength * 3, 1, 0.5) / 7 * 4;
		dotNum = Math.ceil(this._size * this._sep);
		range = this._size / 2;
		ctx.save();
		ctx.filter = 'blur(1px)';
		ctx.globalCompositeOperation = "source-over";
		for (j = 0; j < stepNum; j ++) {
			p = this._latest.add(v.multiply(j));
			ctx.beginPath();
			ctx.arc(p.x, p.y, range, 0, 2 * Math.PI);
			ctx.fill();
		}
		// Add three color stops
		ctx.restore();
	},

	_render: function() {}

}); // End Grassy

export default Grassy;