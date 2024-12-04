const ctx = document.getElementById('canvas').getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;

var camera = {"x": 0, "y": 0, "z": 0, "xRotation": 0, "yRotation": 0, "fov": 400, "speed": 5};
var triangleDistances = []; var calculatedTriangleData = []; var triangle = [];
var movementBools = [false, false, false, false, false, false, false, false, false, false];

const triangles = [
	[-5, 0, -50, 5, 0, -50, 0, 10, -50, "#FF0000"],
	[0, 0, -20, 10, 0, -20, 5, 10, -20, "#0000FF"]
]

function calculateVertex(x1, y1, z1) {
	triangleDistances.push(Math.sqrt(Math.pow(x1-camera.x, 2)+Math.pow(y1-camera.y, 2)+Math.pow(z1-camera.z, 2)));

	x1 += camera.x;
	y1 -= camera.y;
	z1 += camera.z;
  
	let newX1, newY1, newZ1;
  
	newX1 = Math.sin(camera.xRotation)*z1 + Math.cos(camera.xRotation)*x1;
	newZ1 = Math.cos(camera.xRotation)*z1 - Math.sin(camera.xRotation)*x1;
	
	x1 = newX1;
	z1 = newZ1;
	
	newY1 = Math.sin(camera.yRotation)*z1 + Math.cos(camera.yRotation)*y1;
	newZ1 = Math.cos(camera.yRotation)*z1 - Math.sin(camera.yRotation)*y1;
	
	y1 = newY1;
	z1 = newZ1;
  
	triangle.push(x1); triangle.push(y1); triangle.push(z1);
}

function calculateTriangle(triangleData) {
	calculatedTriangleData = [];
	for (index = 0; index < triangleData.length; index ++) {
		triangleDistances = [];
		triangle = [];
		var selected = triangleData[index];
		
		calculateVertex(selected[0], selected[1], selected[2]);
		calculateVertex(selected[3], selected[4], selected[5]);
		calculateVertex(selected[6], selected[7], selected[8]);
		
		triangle.push(selected[9]);
		triangle.push((triangleDistances[0]+triangleDistances[1]+triangleDistances[2])/3);
		calculatedTriangleData.push(triangle);
	}
	return calculatedTriangleData;
}

function drawTriangles(triangleData) {
	triangleData.sort((a, b) => parseInt(b[10]) - parseInt(a[10]));

	for (let index = 0; index < triangleData.length; index++) {
		var selected = triangleData[index];
		ctx.beginPath();
		for (let translateIndex = 0; translateIndex < 9; translateIndex += 3) {
			ctx.lineTo((selected[translateIndex]*(camera.fov/selected[translateIndex+2]))+canvas.width/2, (selected[translateIndex+1]*(camera.fov/selected[translateIndex + 2]))+canvas.height/2);
		}
		ctx.closePath();
		ctx.fillStyle = selected[9];
		ctx.fill();
	}
}

function keydown(evt) {
	switch (evt.keyCode) {
		case 87: movementBools[0] = true; break; // w
		case 65: movementBools[2] = true; break; // a
		case 83: movementBools[1] = true; break; // s
		case 68: movementBools[3] = true; break; // d
		
		case 32: movementBools[4] = true; break; // space key
		case 16: movementBools[5] = true; break; // shift key
	}
}

function keyup(evt) {
	switch (evt.keyCode) {
		case 87: movementBools[0] = false; break; // w
		case 65: movementBools[2] = false; break; // a
		case 83: movementBools[1] = false; break; // s
		case 68: movementBools[3] = false; break; // d
		
		case 32: movementBools[4] = false; break; // space key
		case 16: movementBools[5] = false; break; // shift key
	}
}

function controll() {
	document.addEventListener("keydown", keydown);
	document.addEventListener("keyup", keyup);
	
	if (movementBools[0]) {
		camera.x -= camera.speed*Math.sin(camera.xRotation);
		camera.z += camera.speed*Math.cos(camera.xRotation);
	}
	if (movementBools[1]) {
		camera.x += camera.speed*Math.sin(camera.xRotation);
		camera.z -= camera.speed*Math.cos(camera.xRotation);
	}
	if (movementBools[2]) {
		camera.x -= camera.speed*Math.cos(camera.xRotation);
		camera.z -= camera.speed*Math.sin(camera.xRotation);
	}
	if (movementBools[3]) {
		camera.x += camera.speed*Math.cos(camera.xRotation);
		camera.z += camera.speed*Math.sin(camera.xRotation);
	}
	if (movementBools[4]) {
		camera.y += camera.speed;
	}
	if (movementBools[5]) {
		camera.y -= camera.speed;
	}
}

function main() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
	ctx.rect(10, 10, canvas.width-20, canvas.height-20);
	ctx.clip();
	
	controll();

	drawTriangles(calculateTriangle(triangles));
}

setInterval(function() { main() }, 1000/60);
