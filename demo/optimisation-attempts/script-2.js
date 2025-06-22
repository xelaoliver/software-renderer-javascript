const ctx = document.getElementById('canvas').getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;

var camera = {"x": 0, "y": 40, "z": -90, "xRotation": 0, "yRotation": 0.1, "fov": 400, "speed": 3.5};
var triangleDistances = []; var calculatedTriangleData = []; var triangle = []; var distanceAverage = []; var triangleCoordinates = []; var calculatedBulletinData = [];
var movementBools = [false, false, false, false, false, false, false, false, false, false];

const triangles = [
  [-50, 0, -50, 50, 0, -50, 50, 0, 50, -50, 0, 50, "#007e7d"],
	[-5, 0, -5, 5, 0, -5, 5, 0, 5, -5, 0, 5, "#00FF00"],
	[-5, 0, -5, 5, 0, -5, 0, 10, 0,"#0000FF"],
	[-5, 0, 5, 5, 0, 5, 0, 10, 0,"#FFFF00"],
	[-5, 0, 5, -5, 0, -5, 0, 10, 0,"#00FFFF"],
	[5, 0, -5, 5, 0, 5, 0, 10, 0,"#FF00FF"]
]

var bulletins = [];

var time = 0;

function calculateVertex(x1, y1, z1) {
	let newX1, newY1, newZ1;

  /*

	newX1 = Math.sin(time)*z1 + Math.cos(time)*x1;
	newZ1 = Math.cos(time)*z1 - Math.sin(time)*x1;
	
	x1 = newX1;
	z1 = newZ1;

  */
  
	x1 += camera.x;
	y1 -= camera.y;
	z1 += camera.z;
  
	newX1 = Math.sin(camera.xRotation)*z1 + Math.cos(camera.xRotation)*x1;
	newZ1 = Math.cos(camera.xRotation)*z1 - Math.sin(camera.xRotation)*x1;
	
	x1 = newX1;
	z1 = newZ1;
	
	newY1 = Math.sin(camera.yRotation)*z1 + Math.cos(camera.yRotation)*y1;
	newZ1 = Math.cos(camera.yRotation)*z1 - Math.sin(camera.yRotation)*y1;
	
	y1 = newY1;
	z1 = newZ1;

	triangleDistances.push(Math.sqrt(Math.pow(x1+camera.x, 2)+Math.pow(y1+camera.y, 2)+Math.pow(z1+camera.z, 2)));
  
	triangleCoordinates.push(x1); triangleCoordinates.push(y1); triangleCoordinates.push(z1);
}

function zClip(x1, y1, z1, x2, y2, z2, distance) {
	let t = (distance-z1)/(z2 - z1);
	return [x1+t*(x2-x1), y1+t*(y2-y1), distance];
}

function clipNearPlane(triangleData, distance) {
	let clippedTriangle = [];
	for (let index = 0; index < triangleData.length; index += 3) {
		let x1 = triangleData[index];
		let y1 = triangleData[index + 1];
		let z1 = triangleData[index + 2];
		let x2 = triangleData[(index + 3) % triangleData.length];
		let y2 = triangleData[(index + 4) % triangleData.length];
		let z2 = triangleData[(index + 5) % triangleData.length];

		if (z1 <= distance && z2 <= distance) {
			clippedTriangle.push(x1, y1, z1);
		} else if (z1 > distance && z2 > distance) {
			continue;
		} else {
			let intercept = zClip(x1, y1, z1, x2, y2, z2, distance);
			if (z1 <= distance) {
				clippedTriangle.push(x1, y1, z1);
				clippedTriangle.push(intercept[0], intercept[1], intercept[2]);
			} else {
				clippedTriangle.push(intercept[0], intercept[1], intercept[2]);
				clippedTriangle.push(x2, y2, z2);
			}
		}
	}
	return clippedTriangle;
}

function calculateTriangle(triangleData) {
	calculatedTriangleData = [];
	for (index = 0; index < triangleData.length; index ++) {
		triangleDistances = [];
		triangle = [];
		triangleCoordinates = [];
		var selected = triangleData[index];
		
		for (let triangleIndex = 0; triangleIndex < selected.length-1; triangleIndex += 3) {
			calculateVertex(selected[triangleIndex], selected[triangleIndex+1], selected[triangleIndex+2]);
		}
		
		triangle = triangle.concat(clipNearPlane(triangleCoordinates, -.1));
		triangle.push(selected[selected.length-1]);
		
		distanceAverage = 0;
		for (let distanceIndex = 0; distanceIndex < triangleDistances.length; distanceIndex ++) {
			distanceAverage += triangleDistances[distanceIndex];
		}
		
		triangle.push(distanceAverage/triangleDistances.length);
		triangle.unshift("vec");
		calculatedTriangleData.push(triangle);
	}
	return calculatedTriangleData;
}

function calculateBulletins(bulletinData) {
	calculatedBulletinData = [];
	for (index = 0; index < bulletinData.length; index ++) {
		triangleCoordinates = [];
		triangleDistances = [];
		triangle = [];
    
		calculateVertex(bulletinData[index][0], bulletinData[index][1], bulletinData[index][2]);
		
		triangle.push("bul");
		triangle = triangle.concat(triangleCoordinates);
		triangle.push(bulletinData[index][3]);
		triangle = triangle.concat(triangleDistances);
		
		if (triangleCoordinates[2] < .1) {
			calculatedBulletinData.push(triangle);
		} else {
			continue;
		}
	}
	return calculatedBulletinData;
}

function drawTriangles(triangleData) {
	triangleData.sort((a, b) => b[b.length-1] - a[a.length-1]);

	for (let index = 0; index < triangleData.length; index++) {
		var selected = triangleData[index];
		ctx.beginPath();
		for (let translateIndex = 0; translateIndex < selected.length-2; translateIndex += 3) {
			if (selected[translateIndex] == "bul") {
				let x = (selected[translateIndex+1]*(camera.fov/selected[translateIndex+3]))+canvas.width/2;
				let y = (selected[translateIndex+2]*(camera.fov/selected[translateIndex+3]))+canvas.height/2;
				let divider = selected[selected.length-1]/100;
				
				ctx.beginPath();
				ctx.rect(x-(5/divider), y-(5/divider), 10/divider, 10/divider);
				ctx.fillStyle = selected[translateIndex+4];
				ctx.fill();
			} else {
				ctx.lineTo((selected[translateIndex+1]*(camera.fov/selected[translateIndex+3]))+canvas.width/2, (selected[translateIndex+2]*(camera.fov/selected[translateIndex+3]))+canvas.height/2);
			}
		}
		ctx.closePath();
		ctx.fillStyle = selected[selected.length-2];
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

		case 38: movementBools[6] = true; break; // up arrow
		case 40: movementBools[7] = true; break; // down arrow
		case 37: movementBools[8] = true; break; // left arrow
		case 39: movementBools[9] = true; break; // right arrow
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

		case 38: movementBools[6] = false; break; // up arrow
		case 40: movementBools[7] = false; break; // down arrow
		case 37: movementBools[8] = false; break; // left arrow
		case 39: movementBools[9] = false; break; // right arrow
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

	if (movementBools[6]) {camera.yRotation += camera.speed*(Math.PI/360)};
	if (movementBools[7]) {camera.yRotation -= camera.speed*(Math.PI/360)};
	if (movementBools[8]) {camera.xRotation += camera.speed*(Math.PI/360)};
	if (movementBools[9]) {camera.xRotation -= camera.speed*(Math.PI/360)};
}

function random(min, max) {
  return Math.random()*(max-min)+min;
}

function main() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
	ctx.rect(10, 10, canvas.width-20, canvas.height-20);
	ctx.clip();
	
	controll();
  
	drawTriangles(calculateTriangle(triangles).concat(calculateBulletins(bulletins)));

	time += 0.01;

  bulletins.push([random(-5, 5), 10, random(-5, 5), "#FF0000"]);

  for (let index = 0; index < bulletins.length; index ++) {
    if (bulletins[index][1] > random(50, 90)) {
      bulletins[index] = [0, 0, "#000000"];
    } else {
      bulletins[index][1] += random(.25, .5);
    }
  }
}

setInterval(function() { main() }, 1000/60);
