import './fabric.brushes.js'
export const DatGui = (props, _fabricCanvas) => {
	let fabricCanvas = _fabricCanvas;

	const gui = new dat.GUI({autoPlace:false});
	for (let p in props) {
		gui['brush'+p.charAt(0).toUpperCase() + p.slice(1)] = props[p];
	}

	let currentBrush = null;

	function addButtons() {
		gui.clear = () => {
			fabricCanvas.clear();
		}
		gui.save = () => {
			const a = document.createElement('a');
			a.download = 'sample.png';
			a.href = fabricCanvas.toDataURL();
			a.click();
		}
		gui.stopDraw = () => {
			currentBrush = fabricCanvas.freeDrawingBrush;
			fabricCanvas.isDrawingMode = false;
		}
		gui.startDraw = () => {
			fabricCanvas.freeDrawingBrush = currentBrush;
			fabricCanvas.isDrawingMode = true;
		}
		gui.EraseBrush = () => {
			fabricCanvas.isDrawingMode = true;
			var width = fabricCanvas.freeDrawingBrush.width;
			fabricCanvas.freeDrawingBrush = new fabric.EraserBrush(fabricCanvas);
			fabricCanvas.freeDrawingBrush.width = width;
			// fabricCanvas.freeDrawingBrush.color = "#ffffff";
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.UndoBrush = () => {
			fabricCanvas.isDrawingMode = true;
			var width = fabricCanvas.freeDrawingBrush.width;
			fabricCanvas.freeDrawingBrush = new fabric.EraserBrush(fabricCanvas);
			fabricCanvas.freeDrawingBrush.width = width;
			// fabricCanvas.freeDrawingBrush.color = "#ffffff";
			fabricCanvas.freeDrawingBrush.inverted = true;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.CrayonBrush = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['CrayonBrush'](fabricCanvas,  {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.FurBrush = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['FurBrush'](fabricCanvas,  {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.InkBrush = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['InkBrush'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}

		gui.LongFurBrush = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['LongFurBrush'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.RibbonBrush = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['RibbonBrush'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.ShadedBrush = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['ShadedBrush'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.SketchyBrush = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['SketchyBrush'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.SprayPaintBrush = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['SprayPaintBrush'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.SquaresBrush = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['SquaresBrush'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.WebBrush = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['WebBrush'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		//Spray
		gui.QueensBrush = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['QueensBrush'](fabricCanvas);
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.SauceBrush = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['SauceBrush'](fabricCanvas);
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.FatNozzle = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['FatNozzle'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.FellasBrush = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['FellasBrush'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		//Marker
		gui.FlamingMarker = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['FlamingMarker'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.HandstylerOne = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['HandstylerOne'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.RoughMarker = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['RoughMarker'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.RoundDopeMarker = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['RoundDopeMarker'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.RoundOutliner = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['RoundOutliner'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		//Roller
		gui.Grassy = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['Grassy'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.GrungyLinen = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['GrungyLinen'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.Pandani = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['Pandani'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.Tulle = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['Tulle'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		//Brush
		gui.Ink17SparklingBlade2 = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['Ink17SparklingBlade2'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.Ink39DryingBright = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['Ink39DryingBright'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.Ink54WideAngleRish = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['Ink54WideAngleRish'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.Watercolor = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['Watercolor'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.WetAcrylic = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['WetAcrylic'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		//Graffical
		gui.LightPen = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['LightPen'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.ThreeDimBrush8 = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['ThreeDimBrush8'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.Nebula = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['Nebula'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}
		gui.Swordgrass = () => {
			fabricCanvas.isDrawingMode = true;
			var oldColor = fabricCanvas.freeDrawingBrush.color;
			fabricCanvas.freeDrawingBrush = new fabric['Swordgrass'](fabricCanvas, {});
			if(oldColor)	fabricCanvas.freeDrawingBrush.color = oldColor;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}




		gui.add(gui, 'stopDraw');
		gui.add(gui, 'startDraw');
		gui.add(gui, 'save');
		gui.add(gui, 'clear');
		gui.add(gui, 'EraseBrush');
		gui.add(gui, 'UndoBrush');
		
		// gui.add(gui, 'CrayonBrush');
		// gui.add(gui, 'FurBrush');
		// gui.add(gui, 'InkBrush');
		// gui.add(gui, 'ShadedBrush');
		// gui.add(gui, 'SketchyBrush');
		// gui.add(gui, 'SprayPaintBrush');
		// gui.add(gui, 'LongFurBrush');
		// gui.add(gui, 'RibbonBrush');
		// gui.add(gui, 'WebBrush');
		// gui.add(gui, 'SquaresBrush');

		gui.add(gui, 'SauceBrush');
		gui.add(gui, 'FatNozzle');
		gui.add(gui, 'QueensBrush');
		gui.add(gui, 'FellasBrush');

		gui.add(gui, 'FlamingMarker');
		gui.add(gui, 'HandstylerOne');
		gui.add(gui, 'RoughMarker');
		gui.add(gui, 'RoundDopeMarker');
		gui.add(gui, 'RoundOutliner');

		gui.add(gui, 'Grassy');
		gui.add(gui, 'GrungyLinen');
		gui.add(gui, 'Pandani');
		gui.add(gui, 'Tulle');

		gui.add(gui, 'Ink17SparklingBlade2');
		gui.add(gui, 'Ink39DryingBright');
		gui.add(gui, 'Ink54WideAngleRish');
		gui.add(gui, 'Watercolor');
		gui.add(gui, 'WetAcrylic');

		gui.add(gui, 'LightPen');
		gui.add(gui, 'ThreeDimBrush8');
		gui.add(gui, 'Nebula');
		gui.add(gui, 'Swordgrass');
	}

	return {
		addButtons,
		getGui: () => {
			return gui;
		}
	}
};

export const getFabricCanvas = (canvasID, brushName, brushOpts) => {
	const fabricCanvas = new fabric.Canvas(canvasID, {
		isDrawingMode: true,
		// renderOnAddRemove: false,
		noScaleCache: false,
		cacheProperties: (
			'fill stroke strokeWidth strokeDashArray width height stroke strokeWidth strokeDashArray' +
			' strokeLineCap strokeLineJoin strokeMiterLimit fillRule backgroundColor'
		  ).split(' '),
		dirty: true,
		needsItsOwnCache: function() {
			return false;
		},
		perfLimitSizeTotal : 2097152,
		maxCacheSideLimit: 4096,
		minCacheSideLimit: 256,
		//enableRetinaScaling: false
	})
	.setWidth(window.outerWidth-20)
	.setHeight(window.outerHeight);
	fabric.util.enlivenObjects([{}, {}, {}], (objs) => {
		objs.forEach((item) => {
			fabricCanvas.add(item);
		});
		fabricCanvas.renderAll(); // Make sure to call once we're ready!
	});
	fabric.Object.prototype.objectCaching = true;
	fabricCanvas.freeDrawingBrush = new fabric[brushName](fabricCanvas, brushOpts || {});

	return fabricCanvas;
}
