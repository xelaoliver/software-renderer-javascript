const ctx = document.getElementById("canvas").getContext("2d");

var rotation = {"x": 0, "y": -.3}
var calculatedPolygon = [];

function calculateVertex(x, y, z) {
	let nX, nY, nZ;

	nX = Math.sin(rotation.x)*z+Math.cos(rotation.x)*x;
	nZ = Math.cos(rotation.x)*z-Math.sin(rotation.x)*x;

	x = nX; z = nZ;

	nY = Math.sin(rotation.y)*z+Math.cos(rotation.y)*y;
	nZ = Math.cos(rotation.y)*z-Math.sin(rotation.y)*y;

	y = nY; z = nZ;

	z += 40;

	return [x, y, z];
}

const polygons = [[[10, 0, 10], [-10, 0, 10], [-10, 0, -10], [10, 0, -10], [10, 0, 10], "rgba(203, 231, 208, .5)"], [[10, 10, 10], [-10, 10, 10], [-10, 10, -10], [10, 10, -10], [10, 10, 10], "rgba(999, 0, 0, .5)"]];

function calculateAll() {
	calculatedPolygon = [];
	for (let polygonIndex = 0; polygonIndex < polygons.length; polygonIndex ++) {
		calculatedPolygon.push([]);
		for (let vertexIndex = 0; vertexIndex < polygons[polygonIndex].length-1; vertexIndex ++) {
			let item = polygons[polygonIndex][vertexIndex];
			calculatedPolygon[polygonIndex].push(calculateVertex(item[0], item[1], item[2]));
		}
		calculatedPolygon[polygonIndex].push(polygons[polygonIndex][polygons[polygonIndex].length-1]);
		// todo: add distance formula for polygon sorting ig? - Math.sqrt(Math.pow(x-x, 2)+Math.pow(y-y, 2)+Math.pow(z-z, 2));
	}
	rotation.x += .02;
	rotation.y = Math.sin(rotation.x)*.5;
}

function drawAll() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let polygonIndex = 0; polygonIndex < calculatedPolygon.length; polygonIndex ++) {
		ctx.beginPath();
	 	let polygonOfPolygon = calculatedPolygon[polygonIndex];
		for (let vertexIndex = 0; vertexIndex < polygonOfPolygon.length; vertexIndex ++) {
			let vertexOfPolygon = polygonOfPolygon[vertexIndex];
			ctx.lineTo(vertexOfPolygon[0]*(400/vertexOfPolygon[2])+canvas.width/2, vertexOfPolygon[1]*(400/vertexOfPolygon[2])+canvas.height/2);	
		}
		ctx.fillStyle = polygonOfPolygon[polygonOfPolygon.length-1];
		ctx.fill();
		ctx.stroke();
	}
}

function all() {
	calculateAll(); drawAll();
}

setInterval(function() { all() }, 1000/60);
