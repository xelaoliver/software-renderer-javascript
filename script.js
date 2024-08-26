const ctx = document.getElementById('canvas').getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const fps = 60;
const speed = 1;
const turnSpeed = 1.5;
var zoom = 1;
var camX = 0;
var camY = 10;
var camZ = -50;
var camRotX = 0;
var camRotY = 0;
var moveBol = [false, false, false, false, false, false, false, false, false, false, false];

var oldVertX = NaN;
var oldVertY = NaN;
var oldVertZ = NaN;
let storeVertX = NaN;
let storeVertY = NaN;
let storeVertZ = NaN;

const model = [];
const faces = [];

function clipX(x1, y1, z1, x2, y2, z2, x) {
  const t = (x - x1) / (x2 - x1);
  const y = y1 + t * (y2 - y1);
  const z = z1 + t * (z2 - z1);
  return [y, z];
}

function vert(vertX, vertY, vertZ) {
  vertDistance.push(Math.sqrt(Math.pow(vertX - camX, 2) + Math.pow(vertY - camY, 2) + Math.pow(vertZ - camZ, 2)) + (Math.random() / 100));
  vertX -= camX;
  vertY -= camY;
  vertZ -= camZ;

  var storeVertX = vertX;
  var storeVertZ = vertZ;

  vertX = Math.sin(camRotX * Math.PI / 180) * storeVertZ + Math.cos(camRotX * Math.PI / 180) * storeVertX;
  vertZ = Math.cos(camRotX * Math.PI / 180) * storeVertZ - Math.sin(camRotX * Math.PI / 180) * storeVertX;

  var storeVertY = vertY;
  storeVertZ = vertZ;

  vertY = Math.sin(camRotY * Math.PI / 180) * storeVertZ + Math.cos(camRotY * Math.PI / 180) * storeVertY;
  vertZ = Math.cos(camRotY * Math.PI / 180) * storeVertZ - Math.sin(camRotY * Math.PI / 180) * storeVertY;

  storeVertX = vertX;
  storeVertY = vertY;
  storeVertZ = vertZ;

  if (vertX <= 0 && oldVertX != NaN) {
    vertX = 0;
    vertY = clipX(storeVertX, storeVertY, storeVertZ, oldVertX, oldVertY, oldVertZ, 0)[0];
    vertZ = clipX(storeVertX, storeVertY, storeVertZ, oldVertX, oldVertY, oldVertZ, 0)[1];
  }

  oldVertX = storeVertX;
  oldVertY = storeVertY;
  oldVertZ = storeVertZ;

  vertX = vertX * (250 / vertZ) * zoom;
  vertY = vertY * (250 / vertZ) * zoom;

  vertX = canvas.width / 2 + vertX;
  vertY = canvas.height / 2 - vertY;

  polygonCoordinates.push(Math.floor(vertX), Math.floor(vertY));
};

function endPath() {

  storeVertX = NaN;
  storeVertY = NaN;
  storeVertZ = NaN;

  var avg = vertDistance.map((c, i, vertDistance) => c / vertDistance.length).reduce((p, c) => c + p);
  polygonDistance.push(avg);
  vertDistance = [];
  allCoordinates[polygonIndex] = polygonCoordinates;
  allCoordinates[polygonIndex].unshift(avg);
  allCoordinates[polygonIndex].push(fillColour);
  polygonCoordinates = [];
  polygonIndex = polygonIndex + 1;
};

function changeColor(col, amt) {

  var usePound = false;

  if (col[0] == "#") {
    col = col.slice(1);
    usePound = true;
  }

  var num = parseInt(col, 16);
  var r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  var b = ((num >> 8) & 0x00FF) + amt;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  var g = (num & 0x0000FF) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);

}

function findIntercept(x1, y1, x2, y2, line) {
  return y1 + ((y2 - y1) / (x2 - x1)) * (line - x1);
}

function findXInterceptForY(x1, y1, x2, y2, line) {
  // Calculate the slope (m)
  const m = (y2 - y1) / (x2 - x1);

  // Calculate the x value where y = 10 using the line equation y = mx + c
  // Rearranged to x = (y - c) / m where y = 10 and c = y1 - m * x1
  const xIntercept = (canvas.height - line - y1) / m + x1;

  return xIntercept;
}

function XclipMinusPolygon(polygon, line) {
  let clippedPolygon = [];
  for (let i = 0; i < polygon.length; i += 2) {
    let x1 = polygon[i];
    let y1 = polygon[i + 1];
    let x2 = polygon[(i + 2) % polygon.length];
    let y2 = polygon[(i + 3) % polygon.length];

    if (x1 > line && x2 > line) {
      clippedPolygon.push(x1, y1);
    } else if (x1 <= line && x2 <= line) {
      // Skip the entire edge
    } else {
      let interceptY = findIntercept(x1, y1, x2, y2, line);
      if (x1 > line) {
        clippedPolygon.push(x1, y1);
        clippedPolygon.push(line, interceptY);
      } else {
        clippedPolygon.push(line, interceptY);
        clippedPolygon.push(x2, y2);
      }
    }
  }
  return clippedPolygon;
}

function XclipPositivePolygon(polygon, line) {
  let clippedPolygon = [];
  for (let i = 0; i < polygon.length; i += 2) {
    let x1 = polygon[i];
    let y1 = polygon[i + 1];
    let x2 = polygon[(i + 2) % polygon.length];
    let y2 = polygon[(i + 3) % polygon.length];

    if (x1 < line && x2 < line) {
      clippedPolygon.push(x1, y1);
    } else if (x1 >= line && x2 >= line) {
      // Skip the entire edge
    } else {
      let interceptY = findIntercept(x1, y1, x2, y2, line);
      if (x1 < line) {
        clippedPolygon.push(x1, y1);
        clippedPolygon.push(line, interceptY);
      } else {
        clippedPolygon.push(line, interceptY);
        clippedPolygon.push(x2, y2);
      }
    }
  }
  return clippedPolygon;
}

function YclipMinusPolygon(polygon, line) {
  let clippedPolygon = [];
  for (let i = 0; i < polygon.length; i += 2) {
    let x1 = polygon[i];
    let y1 = polygon[i + 1];
    let x2 = polygon[(i + 2) % polygon.length];
    let y2 = polygon[(i + 3) % polygon.length];

    if (y1 <= line && y2 <= line) {
      clippedPolygon.push(x1, y1);
    } else {
      let interceptX = findXInterceptForY(x1, y1, x2, y2, 10);
      if (y1 > line) {
        clippedPolygon.push(x1, y1);
        clippedPolygon.push(interceptX, line);
      } else {
        clippedPolygon.push(interceptX, line);
        clippedPolygon.push(x2, y2);
      }
    }
  }
  return clippedPolygon;
}

function YclipPositivePolygon(polygon, line) {
  let clippedPolygon = [];
  for (let i = 0; i < polygon.length; i += 2) {
    let x1 = polygon[i];
    let y1 = polygon[i + 1];
    let x2 = polygon[(i + 2) % polygon.length];
    let y2 = polygon[(i + 3) % polygon.length];

    if (y1 >= line && y2 >= line) { // Check if both points are above the line
      clippedPolygon.push(x1, y1);
    } else if (y1 < line && y2 < line) { // Check if both points are below the line
      // Skip the entire edge
    } else {
      let interceptX = findXInterceptForY(x1, y1, x2, y2, canvas.height - 10); // Use canvas.height - 10 for the bottom edge
      if (y1 < line) {
        clippedPolygon.push(x1, y1);
        clippedPolygon.push(interceptX, line);
      } else {
        clippedPolygon.push(interceptX, line);
        clippedPolygon.push(x2, y2);
      }
    }
  }
  return clippedPolygon;
}

function sortAndDraw() {
  polygonDistance.sort(function(a, b) { return a - b; });
  polygonDistance.reverse();

  for (let i = 0; i < polygonDistance.length; i++) {
    const key = polygonDistance[i];
    let polygon = 0;

    for (polygon = 0; polygon < polygonDistance.length; polygon++) {
      if (allCoordinates[polygon][0] === key) {
        break;
      }
    }

    if (polygon < polygonDistance.length) {
      ctx.beginPath();

      // let clippedPolygon = XclipMinusPolygon(allCoordinates[polygon].slice(1, allCoordinates[polygon].length - 1), 10);

      let clippedPolygon = allCoordinates[polygon].slice(1, allCoordinates[polygon].length - 1);
      // clippedPolygon = XclipPositivePolygon(clippedPolygon, canvas.width - 10);
      // clippedPolygon = YclipMinusPolygon(clippedPolygon, canvas.height - 10);
      // clippedPolygon = YclipPositivePolygon(clippedPolygon, 10);

      for (let j = 0; j < clippedPolygon.length; j += 2) {
        ctx.lineTo(clippedPolygon[j], clippedPolygon[j + 1]);
      }
      // ctx.fillStyle = changeColor(allCoordinates[polygon][allCoordinates[polygon].length - 1], polygonDistance[i] / 3);
      ctx.fillStyle = allCoordinates[polygon][allCoordinates[polygon].length - 1];
      ctx.fill();
      /*
      ctx.lineWidth = 1;
      ctx.strokeStyle = changeColor(allCoordinates[polygon][allCoordinates[polygon].length - 1], polygonDistance[i] / 3);
      ctx.stroke();
      */
    }
  }

}

function loadData() {
  polygonIndex = 0;
  polygonCoordinates = [];
  allCoordinates = new Array();
  polygonDistance = [];
  vertDistance = [];
  fillColour = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // loading in obj file from model and faces.

  /*
  fillColour = "#3d4275";
  vert(-10, 20, 10);
  vert(10, 20, 10);
  vert(10, 20, -10);
  vert(-10, 20, -10);
  endPath();

  fillColour = "#63753d";
  vert(-10, 0, 10);
  vert(10, 0, 10);
  vert(10, 0, -10);
  vert(-10, 0, -10);
  endPath();

  fillColour = "#a83260";
  vert(-10, 20, 10);
  vert(-10, 0, 10);
  vert(-10, 0, -10);
  vert(-10, 20, -10);
  endPath();

  fillColour = "#a86332";
  vert(10, 20, 10);
  vert(10, 0, 10);
  vert(10, 0, -10);
  vert(10, 20, -10);
  endPath();
  */

  fillColour = "#00FFFF";
  vert(10, 10, -10);
  vert(-10, 10, -10);
  vert(0, 0, -10);
  endPath();

  /*
  for (let q = 0; q < faces.length; q = q + 3) {
    fillColour = "#e3a48c";
    vert(model[(faces[q] * 3) - 3] * 10, model[(faces[q] * 3) - 2] * 10, model[(faces[q] * 3) - 1] * 10);
    vert(model[(faces[q + 1] * 3) - 3] * 10, model[(faces[q + 1] * 3) - 2] * 10, model[(faces[q + 1] * 3) - 1] * 10);
    vert(model[(faces[q + 2] * 3) - 3] * 10, model[(faces[q + 2] * 3) - 2] * 10, model[(faces[q + 2] * 3) - 1] * 10);
    endPath();
  }
  */
};

function keydown(evt) {
  switch (evt.keyCode) {
    case 68: moveBol[3] = true; break; // d
    case 65: moveBol[2] = true; break; // a
    case 87: moveBol[0] = true; break; // w
    case 83: moveBol[1] = true; break; // s
    case 32: moveBol[4] = true; break; // space key
    case 16: moveBol[5] = true; break; // shift key
    case 38: moveBol[6] = true; break; // up arrow
    case 40: moveBol[7] = true; break; // down arrow
    case 37: moveBol[8] = true; break; // left arrow
    case 39: moveBol[9] = true; break; // right arrow
    case 67: moveBol[10] = true; break; // c
  }
};

function keyup(evt) {
  switch (evt.keyCode) {
    case 65: moveBol[2] = false; break; // a
    case 68: moveBol[3] = false; break; // d
    case 87: moveBol[0] = false; break; // w
    case 83: moveBol[1] = false; break; // s
    case 32: moveBol[4] = false; break; // space key
    case 16: moveBol[5] = false; break; // shift key
    case 38: moveBol[6] = false; break; // up arrow
    case 40: moveBol[7] = false; break; // down arrow
    case 37: moveBol[8] = false; break; // left arrow
    case 39: moveBol[9] = false; break; // right arrow
    case 67: moveBol[10] = false; break; // c
  }
};

function controlLogic() {
  document.addEventListener("keydown", keydown);
  document.addEventListener("keyup", keyup);

  if (moveBol[10]) {
    zoom = 3;
  } else if (!moveBol[10]) {
    zoom = 1;
  };

  if (moveBol[0]) {
    camX = camX + (0 - (speed * Math.sin(camRotX * Math.PI / 180)));
    camZ = camZ + ((speed * Math.cos(camRotX * Math.PI / 180)));
  };
  if (moveBol[1]) {
    camX = camX + ((speed * Math.sin(camRotX * Math.PI / 180)));
    camZ = camZ + (0 - (speed * Math.cos(camRotX * Math.PI / 180)));
  };
  if (moveBol[2]) {
    camX = camX + (0 - (speed * Math.cos(camRotX * Math.PI / 180)));
    camZ = camZ + (0 - (speed * Math.sin(camRotX * Math.PI / 180)));
  };
  if (moveBol[3]) {
    camX = camX + (speed * Math.cos(camRotX * Math.PI / 180));
    camZ = camZ + (speed * Math.sin(camRotX * Math.PI / 180));
  };

  if (moveBol[4]) { camY = camY + speed };
  if (moveBol[5]) { camY = camY - speed };

  if (moveBol[6]) { camRotY = camRotY - turnSpeed };
  if (moveBol[7]) { camRotY = camRotY + turnSpeed };
  if (moveBol[9]) { camRotX = camRotX - turnSpeed };
  if (moveBol[8]) { camRotX = camRotX + turnSpeed };

  if (camRotX > 360) { camRotX = -360 };
  if (camRotX < -360) { camRotX = 360 };

  if (camRotY < -90) { camRotY = -90 };
  if (camRotY > 90) { camRotY = 90 };
};

function gameLoop() {
  loadData();
  sortAndDraw();
  controlLogic();

  ctx.fillStyle = "#000";
  ctx.font = "13px Arial";
  ctx.fillText(" camX: " + Math.floor(camX) + " camY: " + Math.floor(camY) + " camZ: " + Math.floor(camZ) + " camRotX: " + Math.floor(camRotX) + " camRotY: " + Math.floor(camRotY), 0, 10);
};

setInterval(function() { gameLoop() }, 1000 / fps);
