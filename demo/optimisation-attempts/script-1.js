const ctx = document.getElementById('canvas').getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;

var camera = { x: 0, y: 0, z: -10, rotx: 0, roty: 0, speed: 0.5};
var zoom = 1;
var movebool = {w: false, s: false, a: false, d: false, leftarrow: false, rightarrow: false, uparrow: false, downarrow: false, space: false, shift: false, zoom: false};
var store = {x: null, y: null, z: null};
var vertdistance = [];

function vert(x, y, z) {
  vertdistance.push(Math.sqrt(Math.pow(x-camera.x, 2) + Math.pow(y-camera.y, 2) + Math.pow(z-camera.z, 2)) + Math.random()/100);

  x -= camera.x;
  y -= camera.y;
  z -= camera.z;

  store.x = x;
  store.y = y;
  store.z = z;

  x = Math.sin((camera.rotx*Math.PI)/180)*store.z + Math.cos((camera.rotx*Math.PI)/180)*store.x;
  store.z = Math.cos((camera.rotx*Math.PI)/180)*store.z - Math.sin((camera.rotx*Math.PI)/180)*store.x;

  y = Math.sin((camera.roty*Math.PI)/180)*store.z + Math.cos((camera.roty*Math.PI)/180)*store.y;
  z = Math.cos((camera.roty*Math.PI)/180)*store.z - Math.sin((camera.roty*Math.PI)/180)*store.y;

  if (y < 0) {y = Math.abs(y)} else {y = y-(y*2)} // invert y-coordinate

  polycoords.push(x, y, z);
}

function findinterceptz(x1, y1, z1, x2, y2, z2, z) {
  const t = (z-z1)/(z2-z1);
  return [x1+t*(x2-x1), (y1+t*(y2-y1)), z];
}

function clipz(polygon, line) {
  let clippedPolygon = [];
  for (let i = 0; i < polygon.length; i += 3) {
      let x1 = polygon[i];
      let y1 = polygon[i + 1];
      let z1 = polygon[i + 2];
      let x2 = polygon[(i + 3) % polygon.length];
      let y2 = polygon[(i + 4) % polygon.length];
      let z2 = polygon[(i + 5) % polygon.length];

      if (z1 >= line && z2 >= line) {
          clippedPolygon.push(x1, y1, z1);
      } else if (z1 < line && z2 < line) {
          // Both vertices are behind the clipping plane, skip this edge.
          continue;
      } else {
          // Clip the line against the z-plane
          let intercept = findinterceptz(x1, y1, z1, x2, y2, z2, line);
          if (z1 >= line) {
              clippedPolygon.push(x1, y1, z1);
              clippedPolygon.push(intercept[0], intercept[1], intercept[2]);
          } else {
              clippedPolygon.push(intercept[0], intercept[1], intercept[2]);
              clippedPolygon.push(x2, y2, z2);
          }
      }
  }
  return clippedPolygon;
}

function findIntercept(x1, y1, x2, y2, line) {
  return y1+((y2-y1)/(x2-x1))*(line-x1);
}

function clip(polygon, line, type) {
  let clippedpoly = [];
  
  if (type === 'x-') {
    for (let i = 0; i < polygon.length; i += 2) {
      let coords = {x1: polygon[i], y1: polygon[i+1], x2: polygon[(i+2)%polygon.length], y2: polygon[(i+3)%polygon.length]};

      if (coords.x1 > line && coords.x2 > line) {
        clippedpoly.push(x1, y1);
      } else if (coords.x1 <= line && coords.x2 <= line) {
        // skip
      } else {
        let intercept = findintercept(coords.x1, coords.y1, coords.x2, coords.y2, line);
        if (coords.x1 > line) {
          clippedpoly.push(coords.x1, coords.y1);
          clippedpoly.push(line, intercept);
        } else {
          clippedpoly.push(line, intercept);
          clippedpoly.push(coords.x2, coords.y2);
        }
      }
    }
  } else if (type === 'x+') {
    for (let i = 0; i < polygon.length; i += 2) {
      let coords = {x1: polygon[i], y1: polygon[i+1], x2: polygon[(i+2)%polygon.length], y2: polygon[(i+3)%polygon.length]};

      if (coords.x1 < line && coords.x2 < line) {
        clippedpoly.push(x1, y1);
      } else if (coords.x1 >= line && coords.x2 >= line) {
        // skip
      } else {
        let intercept = findintercept(coords.x1, coords.y1, coords.x2, coords.y2, line);
        if (coords.x1 < line) {
          clippedpoly.push(coords.x1, coords.y1);
          clippedpoly.push(line, intercept);
        } else {
          clippedpoly.push(line, intercept);
          clippedpoly.push(coords.x2, coords.y2);
        }
      }
    }
  } else {
    for (let i = 0; i < polygon.length; i += 3) {
      let coords = {x1: polygon[i], y1: polygon[i+1], z1: polygon[i+2], x2: polygon[(i+3)%polygon.length], y2: polygon[(i+4)%polygon.length], z2: polygon[(i+5)%polygon.length]};

      if (coords.z1 >= line && coords.z2 >= line) {
        clippedpoly.push(coords.x1, coords.y1, coords.z1);
      } else if (coords.z1 < line && coords.z2 < line) {
        continue;
      } else {
        // Clip the line against the axis/plane
        let intercept = clipz(coords.x1, coords.y1, coords.z1, coords.x2, coords.y2, coords.z2, line);
          
        if (coords[2] >= line) {
          clippedpoly.push(coords.x1, coords.y1, coords.z1);
          clippedpoly.push(intercept[0], intercept[1], intercept[2]);
        } else {
          clippedpoly.push(intercept[0], intercept[1], intercept[2]);
          clippedpoly.push(coords.x2, coords.y2, coords.z2);
        }
      }
    }
  }
  return clippedpoly;
}

function sortndraw() {
  polydistance.sort(function (a, b) {
    return a - b;
  });
  polydistance.reverse();

  for (let i = 0; i < polydistance.length; i++) {
    const key = polydistance[i];
    let polygon = 0;

    for (polygon = 0; polygon < polydistance.length; polygon++) {
      if (allcoords[polygon][0] === key) {
        break;
      }
    }

    if (polygon < polydistance.length) {
      ctx.beginPath();

      // let clippedpoly = clip(allcoords[polygon].slice(1, allcoords[polygon].length - 1), "x-", 10);
      // clippedpoly = clip(clippedpoly, "x+",canvas.width - 10);

      let clippedpoly = allcoords[polygon].slice(1, allcoords[polygon].length-1);
        
      for (let j = 0; j < clippedpoly.length; j += 2) {
        ctx.lineTo(clippedpoly[j], clippedpoly[j+1]);
      }

      ctx.fillStyle = allcoords[polygon][allcoords[polygon].length-1];
      ctx.fill();

      ctx.lineTo(clippedpoly[0], clippedpoly[1]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = allcoords[polygon][allcoords[polygon].length-1];
      ctx.stroke();
    }
  }
}

function endpath() {
  var avg = vertdistance.reduce((p, c) => c + p, 0) / vertdistance.length;
  polydistance.push(avg);
  vertdistance = [];

  polycoords = clipz(polycoords, 0.001);
  // fix this bug ^^

  var storecoords = [];
  for (let v = 0; v < polycoords.length; v += 3) {
    store.x = polycoords[v];
    store.y = polycoords[v+1];
    store.z = polycoords[v+2];

    store.x = store.x*(250/store.z)*camera.zoom;
    store.y = store.y*(250/store.z)*camera.zoom;
    store.x += canvas.width/2;
    store.y += canvas.height/2;
    storecoords.push(store.x, store.y);
  }

  allcoords[polygonindex] = storecoords;
  allcoords[polygonindex].unshift(avg);
  allcoords[polygonindex].push(fillColour);

  polycoords = [];
  polygonindex++;

  store.x = null;
  store.y = null;
  store.z = null;
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

  if (movebool.w) {
    camera.x -= camera.speed*Math.sin(camera.rotx*Math.PI/180);
    camera.z += camera.speed*Math.cos(camera.rotx*Math.PI/180);
  } 
  if (movebool.s) {
    camera.x += camera.speed*Math.sin(camera.rotx*Math.PI/180);
    camera.z -= camera.speed*Math.cos(camera.rotx*Math.PI/180);
  }
  if (movebool.a) {
    camera.z -= camera.speed*Math.sin(camera.rotx*Math.PI/180);
    camera.x -= camera.speed*Math.cos(camera.rotx*Math.PI/180);
  }
  if (movebool.d) {
    camera.z += camera.speed*Math.sin(camera.rotx*Math.PI/180);
    camera.x += camera.speed*Math.cos(camera.rotx*Math.PI/180);
  }
  
  if (movebool.leftarrow) {camera.rotx += camera.speed*Math.PI}
  if (movebool.rightarrow) {camera.rotx -= camera.speed*Math.PI}
  if (movebool.uparrow) {camera.roty -= camera.speed*Math.PI}
  if (movebool.downarrow) {camera.roty += camera.speed*Math.PI}
  if (movebool.space) {camera.y += camera.speed}
  if (movebool.shift) {camera.y -= camera.speed}
  if (movebool.zoom) {camera.zoom = 3} else {camera.zoom = 1}
}

function gameloop() {
  controllmanager();
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  polygonindex = 0;
  allcoords = [];
  polycoords = [];
  polydistance = [];

  fillColour = '#e3a48c';
  vert(1, -1, 2);
  vert(-1, -1, 2);
  vert(0, 1, 2);
  endpath();

  fillColour = '#000000';
  vert(1, -1, -2);
  vert(-1, -1, -2);
  vert(0, 1, -2);
  endpath();

  sortndraw();

  requestAnimationFrame(gameloop);
}

requestAnimationFrame(gameloop);
