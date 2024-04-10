var croquis = null, brush = null;
var HandstylerOne = fabric.util.createClass(fabric.BaseBrush, {
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
	_lineWidth: 3,
	_imgload: false,
	_patternload: false,
	myInterval: null,
	ctx: null,
	image: null,
	pattern: null,
	brushCol: 'img/Nebula.png',
	patternCol: 'img/texture.png',

	initialize: function (canvas, opt) {
		opt = opt || {};
		var context = this;
		this.canvas = canvas;
		this.ctx = this.canvas.contextTop;
		this.width = opt.width || canvas.freeDrawingBrush.width;
		this.color = opt.color || canvas.freeDrawingBrush.color;
		this.opacity = opt.opacity || canvas.contextTop.globalAlpha;
		this._point = new fabric.Point(0, 0);

		// Initialize croquis
		croquis = new Croquis(this.canvas);
		// croquis.lockHistory();
		// croquis.setCanvasSize(640, 480);
		// croquis.addLayer();
		// croquis.fillLayer('#fff');
		// // croquis.addLayer();
		// croquis.selectLayer(0);
		// croquis.unlockHistory();

		brush = new Croquis.Brush();
		brush.setAngle(0);//0-360
		// brush.setRotateToDirection(true);
		// brush.setRotateToRandom(true);
		brush.setHoldEffect(true);
		brush.setGrainEffect(true);
		brush.setFallOff(50);//0-100
		// brush.setNormalSpread(1);//0-10
		// brush.setTangentSpread(0.1);//0-10

		croquis.setTool(brush);
		croquis.setToolStabilizeLevel(20);//3-20
		croquis.setToolStabilizeWeight(0.2);//0.2-0.8

		this.image = new Image();
		this.image.src = this.brushCol;
		this.image.onload = () => {
			this._imgload = true;
			brush.setImage(this.image);
			this.pattern = new Image();
			this.pattern.src = this.patternCol;
			this.pattern.onload = () => {
				this.makePattern();
				this._patternload = true;
			};
		};
	},

	changeColor: function (color) {
		brush.setColor(color);
		this.makePattern();
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
		var color = fabric.util.colorValues(this.color);
		var brushContext = brush.getBrushContext();
		if (brush.getGrainEffect())
		{
			var patternCanvas = document.createElement("canvas");
			patternCanvas.width = this.pattern.width;
			patternCanvas.height = this.pattern.height;
			const patternContext = patternCanvas.getContext("2d", { willReadFrequently: true });
			patternContext.drawImage(this.pattern, 0, 0);
			var imageData = patternContext.getImageData(0, 0, patternCanvas.width, patternCanvas.height);
			var pixelData = imageData.data;
			for (var i = 0; i < pixelData.length; i += 4) {
				// if (pixelData[i] == 255 && pixelData[i + 1] == 255 && pixelData[i + 2] == 255)
				// 	pixelData[i + 3] = 0;
				// else {
					pixelData[i] = color[0] + pixelData[i] * 1; 
					pixelData[i + 1] = color[1] + pixelData[i + 1] * 1;
					pixelData[i + 2] = color[2] + pixelData[i + 2] * 1;
				// }
			}
			patternContext.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
			patternContext.putImageData(imageData, 0, 0);
			var pattern = brushContext.createPattern(patternCanvas, "repeat");
			brush.setPattern(pattern);
		}
		else {
			brush.setPattern(this.color);
		}
	},

	onMouseDown: function (pointer, param) {
		if (!this._imgload || !this._patternload)
			return;
		this.ctx.globalCompositeOperation = 'source-over';
		this.ctx.globalAlpha = this.opacity;
		this._size = this.width + this._baseWidth;
		this._drawn = true;
		this._count = 0;
		let e = param.e;
		this.setPointerEvent(e);
		this.changeColor(this.color);
		brush.setSize(this._size);
		brush.setSpacing(0.02);
		brush.setFlow(this.opacity);
		this.set(pointer);
		if (e.pointerType === "pen" && e.button == 5)
        	croquis.setPaintingKnockout(true);
		croquis.down(pointer.x, pointer.y, e.pointerType === "pen" ? e.pressure : 1);
	},

	onMouseMove: function (pointer, param) {
		if (!this._drawn)
			return;
		this.update(pointer);
		this._count++;
		let e = param.e;
		this.setPointerEvent(e);
		croquis.move(pointer.x, pointer.y, e.pointerType === "pen" ? e.pressure : 1);
	},

	onMouseUp: function (param) {
		try {
			if (this._drawn) {
				let e = param.e;
				var pointer = param.pointer;
				this.setPointerEvent(e);
				croquis.up(pointer.x, pointer.y, e.pointerType === "pen" ? e.pressure : 1);
				if (e.pointerType === "pen" && e.button == 5)
					setTimeout(function() {croquis.setPaintingKnockout(false)}, 30);//timeout should be longer than 20 (knockoutTickInterval in Croquis)
				this._latest = null;
				this._latestStrokeLength = 0;
				this._drawn = false;
				this.convertToImg();
			}
		}
		catch (e) {
			console.log(e);
		}
	},

	setPointerEvent: function(e) {
		if (e.pointerType !== "pen" && Croquis.Tablet.pen() && Croquis.Tablet.pen().pointerType) {//it says it's not a pen but it might be a wacom pen
			e.pointerType = "pen";
			e.pressure = Croquis.Tablet.pressure();
			if (Croquis.Tablet.isEraser()) {
				Object.defineProperties(e, {
					"button": { value: 5 },
					"buttons": { value: 32 }
				});
			}
		}
	},

	_render: function () { }

}); // End HandstylerOne

export default HandstylerOne;