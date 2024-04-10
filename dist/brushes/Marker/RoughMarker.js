var myInterval = null;
var RoughMarker = fabric.util.createClass(fabric.BaseBrush, {
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
	_color: [0, 0, 0, 0],
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
	pattern: null,

	initialize: function(canvas, opt) {
		opt = opt || {};

		this.canvas = canvas;
		this.ctx = this.canvas.contextTop;
		this.ctx.willReadFrequently = true;
		this.width = opt.width || canvas.freeDrawingBrush.width;
		this.color = opt.color || canvas.freeDrawingBrush.color;
		this.opacity = opt.opacity || canvas.contextTop.globalAlpha;
		this._point = new fabric.Point(0, 0);
		this.painters = [];
		this.image = new Image();
		this.image.src = "img/RoughMarker.png";
		this.image.onload = () => {
			this._imgload = true;
		};
		for(var i = 0; i < this.strokes; i++) {
			var ease = this.easing;
			this.painters.push({
				dx : 0,
				dy : 0,
				ax : 0,
				ay : 0,
				div : 0.1,
				ease : ease
			});
		}
		var self = this;
		if (myInterval)
			clearInterval(myInterval);
		myInterval = setInterval(function() {
			self.draw();
		}, this.refreshRate);
	},

	set: function(p) {
		if (this._latest) {
			this._latest.setFromPoint(this._point);
		} else {
			this._latest = new fabric.Point(p.x, p.y);
		}
		fabric.Point.prototype.setFromPoint.call(this._point, p);
	},

	update: function(p) {
		this.set(p);
		this._latestStrokeLength = this._point.subtract(this._latest).distanceFrom({ x: 0, y: 0 });
	},

	distance: function(p1, p2) {
		return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
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
		this.pattern = this.canvas.contextTop.createPattern(patternCanvas, "repeat");
		const matrix = new DOMMatrix([1, 0, 0, 1, 0, 0]);
		this.pattern.setTransform(matrix.translate(fabric.util.getRandom(this.image.width), 0).scale(1));
		this.canvas.contextTop.fillStyle = this.pattern;
	},
	
	onMouseDown: function(pointer) {
		if (!this._imgload)
			return;
		this.canvas.contextTop.globalAlpha = this.opacity;
		this.canvas.contextTop.lineWidth = this._lineWidth;
		this._size = this.width / 2 + this._baseWidth;
		this._drawn = true;
		this._count = 0;
		this._color = fabric.util.colorValues(this.color);
		this.set(pointer);
		for(var i = 0; i < this.painters.length; i++) {
			this.painters[i].dx = pointer.x;
			this.painters[i].dy = pointer.y;
		}
		this.makePattern();
	},

	onMouseMove: function(pointer) {
		if (!this._drawn)
			return;
		this.update(pointer);
		this._count += 30;
	},

	draw: function() {
        for(var i = 0; i < this.painters.length; i++) {
            var dx = this.painters[i].dx;
            var dy = this.painters[i].dy;
			var fromX = dx, fromY = dy;
            var dx1 = this.painters[i].ax = (this.painters[i].ax + (this.painters[i].dx - this._point.x) * this.painters[i].div) * this.painters[i].ease;
            this.painters[i].dx -= dx1;
            var dx2 = this.painters[i].dx;
            var dy1 = this.painters[i].ay = (this.painters[i].ay + (this.painters[i].dy - this._point.y) * this.painters[i].div) * this.painters[i].ease;
            this.painters[i].dy -= dy1;
            var dy2 = this.painters[i].dy;
			if (this._drawn)
			{
				this.ctx.save();

				const matrix = new DOMMatrix([1, 0, 0, 1, 0, 0]);
				this.pattern.setTransform(matrix.translate(fabric.util.getRandom(this.image.width), fabric.util.getRandom(this.image.height)).scale(1));
				this.canvas.contextTop.fillStyle = this.pattern;


				this.ctx.globalCompositeOperation = 'source-over';
				var lineWidthDiff = (this._lineWidth - 1) * (this._size / this._lineWidth) / 2;

				this.ctx.globalAlpha = 0.8 * this.opacity;
				this.ctx.beginPath();
				this.ctx.moveTo(dx - lineWidthDiff, dy + lineWidthDiff);
				this.ctx.lineTo(dx2 - lineWidthDiff, dy2 + lineWidthDiff);
				this.ctx.lineTo(dx2 + lineWidthDiff, dy2 - lineWidthDiff);
				this.ctx.lineTo(dx + lineWidthDiff, dy - lineWidthDiff);
				this.ctx.closePath();
				this.ctx.fill();
				// Add three color stops
				this.ctx.restore();
			}
        }
	},

	onMouseUp: function() {
		if (this._drawn) {
			try
			{
				this.convertToImg();
			}
			catch(e)
			{

			}
			
		}
		this._drawn = false;
		this._latest = null;
		this._latestStrokeLength = 0;
	},

	_render: function() {}

}); // End RoughMarker

export default RoughMarker;