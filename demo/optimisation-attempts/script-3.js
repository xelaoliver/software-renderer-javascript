const ctx = document.getElementById('canvas').getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;

var camera = {fov: 70, xPosition: 0, yPosition: 0, zPosition: 10, xRotation: 0, yRotation: 0, movementSpeed: .75}
var movebool = {w: false, s: false, a: false, d: false, leftarrow: false, rightarrow: false, uparrow: false, downarrow: false, space: false, shift: false, zoom: false}
var translatedCoordinates = [];
var justTriangleCoordinates = [];
var verticesDistances = [];
var store = {x: null, y: null, z: null}

function initializeVariables() {
  verticesDistances = [];
  triangleCoordinates = [];
  translatedCoordinates = [];
  allDistances = [];
  store.x = null;
  store.y = null;
  store.z = null;
}

function calculateVertex(vertexX, vertexY, vertexZ) {
  verticesDistances.push(Math.sqrt(Math.pow(vertexX-camera.xPosition, 2) + Math.pow(vertexY-camera.yPosition, 2) + Math.pow(vertexZ-camera.zPosition, 2)));
  vertexX += camera.xPosition;
  vertexY += camera.yPosition;
  vertexZ += camera.zPosition;

  store.x = vertexX;
  store.z = vertexZ;
  store.y = vertexY;

  vertexX = Math.sin(camera.xRotation)*store.z + Math.cos(camera.xRotation)*store.x;
  store.z = Math.cos(camera.xRotation)*store.z - Math.sin(camera.xRotation)*store.x;

  vertexY = Math.sin(camera.yRotation)*store.z + Math.cos(camera.yRotation)*store.y;
  vertexZ = Math.cos(camera.yRotation)*store.z - Math.sin(camera.yRotation)*store.y;

  triangleCoordinates.push(vertexX, -vertexY, vertexZ);
}

function triangle(vertCoords1, vertCoords2, vertCoords3, colour) {
  calculateVertex(vertCoords1[0], vertCoords1[1], vertCoords1[2]);
  calculateVertex(vertCoords2[0], vertCoords2[1], vertCoords2[2]);
  calculateVertex(vertCoords3[0], vertCoords3[1], vertCoords3[2]);
  const triangleDistance = verticesDistances.reduce((p, c) => c+p, 0)/verticesDistances.length;
  triangleCoordinates.push(triangleDistance);
  triangleCoordinates.push(colour);
  allDistances.push(triangleDistance);
}

function returnZeroIfInfinity(int1, int2) {
    return int2 === 0 ? 1 : int1 / int2;
}

function translateTriangleCoordinates(amountOfTriangles, focalLength) {
  justTriangleCoordinates = [];
  for (let index = 0; index < amountOfTriangles; index += 11) {
    justTriangleCoordinates.push(
      triangleCoordinates[index],
      triangleCoordinates[index+1],
      triangleCoordinates[index+2],
      triangleCoordinates[index+3],
      triangleCoordinates[index+4],
      triangleCoordinates[index+5],
      triangleCoordinates[index+6],
      triangleCoordinates[index+7],
      triangleCoordinates[index+8],
    );
  }
  
  for (let index = 0; index < (amountOfTriangles/11)*9; index+=3) {
    const key = index;
    store.x = justTriangleCoordinates[key]*returnZeroIfInfinity(focalLength, justTriangleCoordinates[key+2]);
    store.y = justTriangleCoordinates[key+1]*returnZeroIfInfinity(focalLength, justTriangleCoordinates[key+2]);

    translatedCoordinates.push(Math.floor(store.x+canvas.width/2), Math.floor(store.y+canvas.height/2));
  }
}

function indexOf(array, string) {
  for (let index = 0; index < array.length; index ++) {
    if (array[index] == string) {
      return index;
    }
  }
}

function draw() {
  allDistances.sort(function(a, b){return b-a});
  allDistances.reverse();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < allDistances.length; index++) {
    let coordinateIndex = (indexOf(triangleCoordinates, allDistances[index])-9)/11*6;
    
    ctx.beginPath();
    ctx.lineTo(translatedCoordinates[coordinateIndex], translatedCoordinates[coordinateIndex+1]);
    ctx.lineTo(translatedCoordinates[coordinateIndex+2], translatedCoordinates[coordinateIndex+3]);
    ctx.lineTo(translatedCoordinates[coordinateIndex+4], translatedCoordinates[coordinateIndex+5]);
    /*
    console.log(1, translatedCoordinates[coordinateIndex], translatedCoordinates[coordinateIndex+1]);
    console.log(2, translatedCoordinates[coordinateIndex+2], translatedCoordinates[coordinateIndex+3]);
    console.log(3, translatedCoordinates[coordinateIndex+4], translatedCoordinates[coordinateIndex+5]);
    */
    ctx.fillStyle = "rgb("+triangleCoordinates[((coordinateIndex*11)/6)+10][0]+" "+triangleCoordinates[((coordinateIndex*11)/6)+10][1]+" "+triangleCoordinates[((coordinateIndex*11)/6)+10][2]+")";
    ctx.fill();
  }
}

function keydown(evt) {
	switch (evt.keyCode) {
		case 87: movebool.w = true; break;
		case 83: movebool.s = true; break;
		case 65: movebool.a = true; break;
		case 68: movebool.d = true; break;
		case 37: movebool.leftarrow = true; break;
		case 39: movebool.rightarrow = true; break;
		case 38: movebool.uparrow = true; break;
		case 40: movebool.downarrow = true; break;
		case 32: movebool.space = true; break;
		case 16: movebool.shift = true; break;
		case 67: movebool.zoom = true; break;
	}
}

function keyup(evt) {
	switch (evt.keyCode) {
		case 87: movebool.w = false; break;
		case 83: movebool.s = false; break;
		case 65: movebool.a = false; break;
		case 68: movebool.d = false; break;
		case 37: movebool.leftarrow = false; break;
		case 39: movebool.rightarrow = false; break;
		case 38: movebool.uparrow = false; break;
		case 40: movebool.downarrow = false; break;
		case 32: movebool.space = false; break;
		case 16: movebool.shift = false; break;
		case 67: movebool.zoom = false; break;
	}
}

function controllmanager() {
  document.addEventListener("keydown", keydown);
  document.addEventListener("keyup", keyup);

  if (movebool.s) {
    camera.xPosition -= camera.movementSpeed * Math.sin(camera.xRotation);
        camera.zPosition += camera.movementSpeed * Math.cos(camera.xRotation);
  }
  if (movebool.w) {
      camera.xPosition += camera.movementSpeed * Math.sin(camera.xRotation);
      camera.zPosition -= camera.movementSpeed * Math.cos(camera.xRotation);
  }
  if (movebool.d) {
    camera.zPosition -= camera.movementSpeed * Math.sin(camera.xRotation);
    camera.xPosition -= camera.movementSpeed * Math.cos(camera.xRotation);
  }
  if (movebool.a) {
    camera.zPosition += camera.movementSpeed * Math.sin(camera.xRotation);
    camera.xPosition += camera.movementSpeed * Math.cos(camera.xRotation);
  }

  if (movebool.leftarrow) camera.xRotation += camera.movementSpeed * (Math.PI / 180);
  if (movebool.rightarrow) camera.xRotation -= camera.movementSpeed * (Math.PI / 180);
  if (movebool.uparrow) camera.yRotation -= camera.movementSpeed * (Math.PI / 180);
  if (movebool.downarrow) camera.yRotation += camera.movementSpeed * (Math.PI / 180);
  if (movebool.shift) camera.yPosition += camera.movementSpeed;
  if (movebool.space) camera.yPosition -= camera.movementSpeed;
}

function mainGameLoop() {
	initializeVariables();
	controllmanager();
	triangle([-1, 0, 0], [1, 0, 0], [0, 2, 0], [255, 0, 0]);
	triangle([-0.5, 0, 1], [1.5, 0, 1], [0.5, 2, 1], [0, 0, 255]);
	translateTriangleCoordinates(triangleCoordinates.length, (canvas.width/2)/Math.tan((camera.fov*Math.PI/180)/2));
	draw();
}

setInterval(function() { mainGameLoop() }, 1000/60);
