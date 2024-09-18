const ctx = document.getElementById('canvas').getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const fps = 60;
var camera = {x: 0, y: 0, z: 0, rotx: 0, roty: 0, speed: 1};
var zoom = 1;
var movebool = new Array(7); movebool.fill(0);
var store = new Array(3); store.fill(null);
var vertdistance = [];

function vert(x, y, z) {
    vertdistance.push(Math.sqrt(Math.pow(x-camera.x, 2) + Math.pow(y-camera.y, 2) + Math.pow(z-camera.z, 2)) + (Math.random()/100));
    
    x -= camera.x;
    y -= camera.y;
    z -= camera.z;

    store.x = x;
    store.y = y;
    store.z = z;

    x = Math.sin(camera.rotx*Math.PI/180)*store.z + Math.cos(camera.rotx*Math.PI/ 180)*store.x;
    store.z = Math.cos(camera.rotx*Math.PI/180)*store.z - Math.sin(camera.rotx*Math.PI/ 180)*store.x;

    y = Math.sin(camera.roty*Math.PI/180)*store.z + Math.cos(camera.roty*Math.PI/180)*store.y;
    z = Math.cos(camera.roty*Math.PI/180)*store.z - Math.sin(camera.roty*Math.PI/180)*store.y;

    polycoords.push(x, y, z);
}

function clipz(x1, y1, z1, x2, y2, z2, z) {
    const t = (z - z1) / (z2 - z1);
    return [x1 + t * (x2 - x1), y = y1 + t * (y2 - y1), z];
}

function findIntercept(x1, y1, x2, y2, line) {
    return y1+((y2-y1)/(x2-x1))*(line-x1);
}

function clip(polygon, line, type) {
    let clippedpoly = [];
    if (type == "z") {
        for (let i = 0; i < polygon.length; i += 3) {
            let coords = {x1: polygon[i], y1: polygon[i+1], x1: polygon[i+2], x2: polygon[(i+3)%polgyon.length], y2: polygon[(i+4)%polgyon.length], z2: polygon[(i+5)%polgyon.length]};
            
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
    } else if (type == "x-") {
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
    } else if (type == "x+") {
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
    }
    return clippedpoly;
}

function sortndraw() {
    polydistance.sort(function(a, b) { return a - b; });
    polydistance.reverse();

    for (let i = 0; i < polydistance.length; i++) {
        const key = polydistance[i];
        let polygon = 0;

        /*
        for (polygon = 0; polygon < polydistance.length; polygon++) {
            if (allcoords[polygon][0] === key) {
                break;
            }
        }
        */
    
        if (polygon < polydistance.length) {
            ctx.beginPath();
    
            // let clippedpoly = clip(allcoords[polygon].slice(1, allcoords[polygon].length - 1), "x-",10);
            // clippedpoly = clip(clippedpoly, "x+",canvas.width - 10);

            clippedpoly = allcoords[polygon].slice(1, allcoords[polygon].length-1);


            console.log(clippedpoly);
            for (let j = 0; j != clippedpoly.length-1; j += 2) {
                ctx.lineTo(clippedpoly[j], clippedpoly[j+1]);
            }
            
            ctx.fillStyle = allcoords[polygon][allcoords[polygon].length - 1];
            console.log(allcoords[polygon][allcoords[polygon].length - 1]);
            ctx.fill();
    
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#000000";
            ctx.stroke();
        }
    }
}

function endpath() {
    var avg = vertdistance.reduce((p, c) => c + p, 0) / vertdistance.length;
    polydistance.push(avg);
    vertdistance = [];
    
    // polycoords = clip(polycoords, "z", 1);
    
    var storecoords = [];
    for (let v = 0; v < polycoords.length; v += 3) {
        store.x = polycoords[v];
        store.y = polycoords[v + 1];
        store.z = polycoords[v + 2];

        store.x = store.x*(250/store.z)*zoom;
        store.y = store.y*(250/store.z)*zoom;
        store.x += canvas.width/2;
        store.y -= canvas.height/2;
        storecoords.push(store.x, store.y);
    }

    console.log(storecoords);
    allcoords[polygonindex] = storecoords;
    allcoords[polygonindex].unshift(avg);
    allcoords[polygonindex].push(fillColour);

    polycoords = [];
    polygonindex++;

    store.x = null;
    store.y = null;
    store.z = null;
}

function gameloop() {
    polygonindex = 0;
    allcoords = [];
    polycoords = [];
    polydistance = [];

    fillColour = "#e3a48c";
    vert(2, 0, 2);
    vert(-2, 0, 2);
    vert(0, 2, 2);
    endpath();
    
    sortndraw();
}

gameloop();