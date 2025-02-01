const ctx = document.getElementById("canvas").getContext("2d");
var mesh = new Array(); var meshDepth = new Array();

var camera = {x: 0, y: 0, z: 30, xRotation: 0, yRotation: 0, zRotation: 0}

var fI; var vI;

// [[vert. coords], [vert. coords], ..., "#hex-colour"]

var verteciesOfMesh = [
    [[-5,-5, -5], [5, -5, -5], [5, -5, 5], [-5, -5, 5], "#ff0000"],
    [[-5,-5, -5], [5, -5, -5], [0, 5, 0], "#00ff00"],
    [[-5,-5, -5], [-5, -5, 5], [0, 5, 0], "#0000ff"],
    [[-5,-5, 5], [5, -5, 5], [0, 5, 0], "#ffff00"],
    [[5,-5, -5], [5, -5, 5], [0, 5, 0], "#ff00ff"]
]

var transformationsOfMesh = [];

// function = control crmXYZ
// cXYZ     = center of rotation
// rXYZ     = rotation
// MXYZ     = move

transformationsOfMesh.push(["10", {function: "self.rX += .1; self.rY += .1; self.rZ += .1", cX: 0, cY: 0, cZ: 0, rX: 0, rY: 0, rZ: 0, mX: 0, mY: 0, mZ: 0}]);

window.addEventListener("load", (e) => {
	setInterval(function() {
        calculateVerteciesOfCube(verteciesOfMesh);

        ctx.beginPath();
        ctx.rect(1, 1, canvas.width-1, canvas.height-1);
        ctx.clip();

        drawMeshData(mesh);
    }, 1000/60);
});

// rotate shtuff around other shtuff

function calculateVertex(x, y, z, cX, cY, cZ, rX, rY, rZ) {
    let nX, nY, nZ;

    x -= cX;
    y -= cY;
    z -= cZ;

    nX = Math.sin(rX)*z + Math.cos(rX)*x;
    nZ = Math.cos(rX)*z - Math.sin(rX)*x;

    x = nX; z = nZ;

    nY = Math.sin(rY)*z + Math.cos(rY)*y;
    nZ = Math.cos(rY)*z - Math.sin(rY)*y;

    y = nY; z = nZ;

    nX = Math.cos(rZ)*x - Math.sin(rZ)*y;
    nY = Math.sin(rZ)*x + Math.cos(rZ)*y;

    x = nX; y = nY;

    x += cX;
    y += cY;
    z += cZ;

    x += camera.x;
    y += camera.y;
    z += camera.z;

    nX = Math.sin(camera.xRotation)*z + Math.cos(camera.xRotation)*x;
    nZ = Math.cos(camera.xRotation)*z - Math.sin(camera.xRotation)*x;

    x = nX; z = nZ;

    nY = Math.sin(camera.yRotation)*z + Math.cos(camera.yRotation)*y;
    nZ = Math.cos(camera.yRotation)*z - Math.sin(camera.yRotation)*y;

    y = nY; z = nZ;

    nX = Math.cos(camera.zRotation)*x - Math.sin(camera.zRotation)*y;
    nY = Math.sin(camera.zRotation)*x + Math.cos(camera.zRotation)*y;

    x = nX; y = nY;

    return [x, -y, z];
}

function calculateVerteciesOfCube(rawMeshData) {
    mesh = [];
    meshDepth = [];

    for (fI = 0; fI < rawMeshData.length; fI ++) {
        let averageDepth = 0;
        let validVertecies = rawMeshData[fI].length-1;
        mesh.push([]);

        for (vI = 0; vI < rawMeshData[fI].length-1; vI ++) {
            let vertex = rawMeshData[fI][vI];
            let nVertex; let self = false;

            for (let i = 0; i < transformationsOfMesh.length; i ++) {
                if (transformationsOfMesh[i][0] == fI.toString()+vI.toString()) {
                    self = transformationsOfMesh[i][1];
                }
            }

            if (self != false) {
                eval(self.function);
                // calculateVertex(x, y, z, cX, cY, cZ, rX, rY, rZ)
                // {function: "self.rX += .01", cX: 0, cY: 0, cZ: 0, rX: 0, rY: 0, rZ: 0, mX: 0, mY: 0, mZ: 0}
                // function = control crmXYZ
                // cXYZ     = center of rotation
                // rXYZ     = rotation
                // MXYZ     = move
                nVertex = calculateVertex(
                    vertex[0], vertex[1], vertex[2],
                    self.cX, self.cY, self.cZ,
                    self.rX, self.rY, self.rZ
                );
            } else {
                nVertex = calculateVertex(vertex[0], vertex[1], vertex[2], 0, 0, 0, 0, 0, 0);
            }
            if (nVertex[2] > .1) { 
                mesh[fI].push(nVertex);
                averageDepth += nVertex[2];
            } else {
                validVertecies --; // dont put behind camera vertecies in my face
            }
        }

        if (validVertecies > 0) {
            averageDepth /= validVertecies;
            meshDepth.push({ index: fI, depth: averageDepth });
            mesh[fI].push(rawMeshData[fI][rawMeshData[fI].length - 1]);
        }
    }

    meshDepth.sort((a, b) => b.depth-a.depth);
    mesh = meshDepth.map(item => mesh[item.index]);
}

function drawMeshData(meshData) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (fI = 0; fI < meshData.length; fI++) {
        let face = meshData[fI];

        ctx.beginPath();
        for (vI = 0; vI < face.length-1; vI++) {
            let vertex = face[vI];
            ctx.lineTo((canvas.width/2)+(vertex[0]*(400/vertex[2])), (canvas.height/2)+(vertex[1]*(400/vertex[2])));
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = face[face.length-1];
        ctx.fill();
    }
}
