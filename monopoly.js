const ctx = document.getElementById("canvas").getContext("2d");

var rotation = {"x": 0, "y": -.3}
var calculatedPolygon = [];
var calculatedDistance = [];

var polygons = [
	[[18.9, 0, 18.9], [-18.9, 0, 18.9], [-18.9, 0, -18.9], [18.9, 0, -18.9], [18.9, 0, 18.9], "#CBE7D0"], // main board
	[[25.4, 0, 25.4], [18.9, 0, 25.4], [18.9, 0, 18.9], [25.4, 0, 18.9], [25.4, 0, 25.4], "#FFFFFF"], // goto jail
	[[-25.4, 0, 25.4], [-18.9, 0, 25.4], [-18.9, 0, 18.9], [-25.4, 0, 18.9], [-25.4, 0, 25.4], "#FFFFFF"], // free parking
	[[-25.4, 0, -25.4], [-18.9, 0, -25.4], [-18.9, 0, -18.9], [-25.4, 0, -18.9], [-25.4, 0, -25.4], "#FFFFFF"], // jail
	[[25.4, 0, -25.4], [18.9, 0, -25.4], [18.9, 0, -18.9], [25.4, 0, -18.9], [25.4, 0, -25.4], "#FFFFFF"], // go
	[[22.15, 0, 22.15], ["favicon.png"]], // 2d sprites will be the players
	[[-22.15, 0, -22.15], ["favicon.png"]],
	[[-22.15, 0, 22.15], ["favicon.png"]],
	[[22.15, 0, -22.15], ["favicon.png"]],
	[[0, -10, 0], ["A video game version of Monopoly but with Capitalism."]] // testing text
];

const streets = [
	["#a8e1fb", "#a8e1fb", "#FFFFFF", "#a8e1fb", "#FFFFFF", "#FFFFFF", "#995334", "#FFFFFF", "#995334"],
	["#0071c5", "#FFFFFF", "#0071c5", "#FFFFFF", "#FFFFFF", "#22b25a", "#FFFFFF", "#22b25a", "#22b25a"],
	["#fef200", "#FFFFFF", "#fef200", "#fef200", "#FFFFFF", "#ec1a21", "#ec1a21", "#FFFFFF", "#ec1a21"],
	["#f6951d", "#f6951d", "#FFFFFF", "#f6951d", "#FFFFFF", "#db3798", "#db3798", "#FFFFFF", "#db3798"]
];

// calculate all streets. what a task that can be just done once and pasted into the polygon array to be a const! >:P

for (let index = 0; index < 9; index ++) {
	let factor = index*4.2;
	polygons.push([[-18.9+factor, 0, -20.8], [-18.9+factor+4.2, 0, -20.8], [-18.9+factor+4.2, 0, -25.4], [-18.9+factor, 0, -25.4], [-18.9+factor, 0, -25.4], streets[0][index]]);
	polygons.push([[-18.9+factor, 0, -18.9], [-18.9+factor+4.2, 0, -18.9], [-18.9+factor+4.2, 0, -20.8], [-18.9+factor, 0, -20.8], [-18.9+factor, 0, -20.8], streets[0][index]]);
}
for (let index = 0; index < 9; index ++) {
	let factor = index*4.2;
	polygons.push([[-18.9+factor, 0, 20.8], [-18.9+factor+4.2, 0, 20.8], [-18.9+factor+4.2, 0, 25.4], [-18.9+factor, 0, 25.4], [-18.9+factor, 0, 25.4], streets[2][index]]);
	polygons.push([[-18.9+factor, 0, 18.9], [-18.9+factor+4.2, 0, 18.9], [-18.9+factor+4.2, 0, 20.8], [-18.9+factor, 0, 20.8], [-18.9+factor, 0, 20.8], streets[2][index]]);
}
for (let index = 0; index < 9; index ++) {
	let factor = index*4.2;
	polygons.push([[-25.4, 0, -18.9+factor], [-20.8, 0, -18.9+factor], [-20.8, 0, -18.9+factor+4.2], [-25.4, 0, -18.9+factor+4.2], [-25.4, 0, -18.9+factor], streets[3][index]]);
	polygons.push([[-20.8, 0, -18.9+factor], [-18.9, 0, -18.9+factor], [-18.9, 0, -18.9+factor+4.2], [-20.8, 0, -18.9+factor+4.2], [-20.8, 0, -18.9+factor], streets[3][index]]);
}
for (let index = 0; index < 9; index ++) {
	let factor = index*4.2;
	polygons.push([[25.4, 0, -18.9+factor], [20.8, 0, -18.9+factor], [20.8, 0, -18.9+factor+4.2], [25.4, 0, -18.9+factor+4.2], [25.4, 0, -18.9+factor], streets[1][index]]);
	polygons.push([[20.8, 0, -18.9+factor], [18.9, 0, -18.9+factor], [18.9, 0, -18.9+factor+4.2], [20.8, 0, -18.9+factor+4.2], [20.8, 0, -18.9+factor], streets[1][index]]);
}

function calculateVertex(x, y, z) {
	let nX, nY, nZ;

	nX = Math.sin(rotation.x)*z+Math.cos(rotation.x)*x;
	nZ = Math.cos(rotation.x)*z-Math.sin(rotation.x)*x;

	x = nX; z = nZ;

	nY = Math.sin(rotation.y)*z+Math.cos(rotation.y)*y;
	nZ = Math.cos(rotation.y)*z-Math.sin(rotation.y)*y;

	y = nY; z = nZ;

	z += 70;

	return [x, y, z];
}

function calculatePolygons() {
	calculatedPolygon = [];
	calculatedDistance = [];
	for (let polygonIndex = 0; polygonIndex < polygons.length; polygonIndex++) {
        	let avgDepth = 0;
        	calculatedPolygon.push([]);
        	for (let vertexIndex = 0; vertexIndex < polygons[polygonIndex].length - 1; vertexIndex++) {
            		let item = polygons[polygonIndex][vertexIndex];
            		let vertex = calculateVertex(item[0], item[1], item[2]);
            		avgDepth += vertex[2];
            		calculatedPolygon[polygonIndex].push(vertex);
        	}
        	avgDepth /= polygons[polygonIndex].length-1;
        	
		calculatedDistance.push({index: polygonIndex, depth: avgDepth});
        	calculatedPolygon[polygonIndex].push(polygons[polygonIndex][polygons[polygonIndex].length-1]);
	}
    	
	calculatedDistance.sort((a, b) => b.depth-a.depth);
	
    	calculatedPolygon = calculatedDistance.map(item => calculatedPolygon[item.index]);

    	rotation.x += .02;
    	rotation.y = Math.sin(rotation.x)*0.5;
}

/*
function calculateSprites() {
	for (let spriteIndex = 0; spriteIndex < sprites.length; spriteIndex ++) {
		let spriteVertex = calculateVertex(sprites[spriteIndex][0], sprites[spriteIndex][1], sprites[spriteIndex][2]);
		ctx.drawImage(sprite, spriteVertex[0]*(400/spriteVertex[2])+canvas.width/2-15, spriteVertex[1]*(400/spriteVertex[2])+canvas.height/2-27, 30, 30);
	}
}
*/

function drawAll() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let polygonIndex = 0; polygonIndex < calculatedPolygon.length; polygonIndex ++) {
	 	let polygonOfPolygon = calculatedPolygon[polygonIndex];
		if (polygonOfPolygon.length == 2) {
			let vertexOfSprite = polygonOfPolygon[0];
			if (polygonOfPolygon[1] == "favicon.png") {
				let sprite = new Image(); sprite.src = polygonOfPolygon[1];
				ctx.drawImage(sprite, vertexOfSprite[0]*(400/vertexOfSprite[2])+canvas.width/2-15, vertexOfSprite[1]*(400/vertexOfSprite[2])+canvas.height/2-27, 30, 30);
			} else {
				ctx.fillStyle = "#000000";
				ctx.font = "16px serif";
				ctx.fillText(polygonOfPolygon[1], vertexOfSprite[0]*(400/vertexOfSprite[2])+canvas.width/2-(ctx.measureText(polygonOfPolygon[1]).width/2), vertexOfSprite[1]*(400/vertexOfSprite[2])+canvas.height/2);
			}
		} else {
			ctx.beginPath();
			for (let vertexIndex = 0; vertexIndex < polygonOfPolygon.length; vertexIndex ++) {
				let vertexOfPolygon = polygonOfPolygon[vertexIndex];
				ctx.lineTo(vertexOfPolygon[0]*(400/vertexOfPolygon[2])+canvas.width/2, vertexOfPolygon[1]*(400/vertexOfPolygon[2])+canvas.height/2);	
			}
			ctx.fillStyle = polygonOfPolygon[polygonOfPolygon.length-1];
			ctx.fill();
			ctx.stroke();
		}
	}
}

const sprite = new Image();
sprite.src = "favicon.png";

function all() {
	calculatePolygons(); drawAll();
}

sprite.addEventListener("load", () => {
	setInterval(function() { all() }, 1000/60);
});
