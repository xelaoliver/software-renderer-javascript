const ctx = document.getElementById('canvas').getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;

var camera = {"x": 0, "y": 40, "z": -40, "xRotation": 0, "yRotation": -.8, "fov": 400, "speed": 2};
var triangleDistances = []; var calculatedTriangleData = []; var triangle = [];
var movementBools = [false, false, false, false, false, false, false, false, false, false];

const triangles = [
	[-5, 0, -5, 5, 0, -5, -5, 0, 5,"#FF0000"],
  [5, 0, -5, 5, 0, 5, -5, 0, 5,"#00FF00"],
  [-5, 0, -5, 5, 0, -5, 0, 10, 0,"#0000FF"],
  [-5, 0, 5, 5, 0, 5, 0, 10, 0,"#FFFF00"],
  [-5, 0, 5, -5, 0, -5, 0, 10, 0,"#00FFFF"],
  [5, 0, -5, 5, 0, 5, 0, 10, 0,"#FF00FF"]
]
var triangleRotation = 0;

function calculateVertex(x1, y1, z1) {
  let newX1, newY1, newZ1;

  newX1 = Math.sin(triangleRotation)*z1 + Math.cos(triangleRotation)*x1;
	newZ1 = Math.cos(triangleRotation)*z1 - Math.sin(triangleRotation)*x1;
	
	x1 = newX1;
	z1 = newZ1;
  
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
  
	triangle.push(x1); triangle.push(y1); triangle.push(z1);
}

function zClip(x1, y1, z1, x2, y2, z2, distance) {
  let t = (distance-z1)/(z2-x1);
  return [x1+t*(x2-x1), y1+t*(y2-y1), distance];
}

function nearClipTriangle(triangleData, distance) {
  for (let index = 0; index < triangleData.length; index += 3) {
    let x1 = triangleData[index];
    let y1 = triangleData[index + 1];
    let z1 = triangleData[index + 2];
    let x2 = triangleData[(index + 3) % triangleData.length];
    let y2 = triangleData[(index + 4) % triangleData.length];
    let z2 = triangleData[(index + 5) % triangleData.length];
  
    if (z1 >= distance && z2 >= distance) {
      clippedPolygon.push(x1, y1, z1);
    } else if (z1 < distance && z2 < distance) {
      // continue
    } else {
      let intercept = zClip(x1, y1, z1, x2, y2, z2, distance);
      if (z1 >= distance) {
        clippedPolygon.push(x1, y1, z1);
        clippedPolygon.push(intercept[0], intercept[1], intercept[2]);
      } else {
        clippedPolygon.push(intercept[0], intercept[1], intercept[2]);
        clippedPolygon.push(x2, y2, z2);
      }
    }
  }
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

    nearClipTriangle(triangle, .1);
		
		triangle.push(selected[9]);
		triangle.push((triangleDistances[0]+triangleDistances[1]+triangleDistances[2])/3);
		calculatedTriangleData.push(triangle);
	}
	return calculatedTriangleData;
}

function drawTriangles(triangleData) {
	triangleData.sort((a, b) => b[10] - a[10]);

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

function main() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
	ctx.rect(10, 10, canvas.width-20, canvas.height-20);
	ctx.clip();
	
	controll();

	drawTriangles(calculateTriangle(triangles));

  triangleRotation += 0.01;
}

setInterval(function() { main() }, 1000/60);
