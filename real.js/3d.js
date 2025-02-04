const ctx = document.getElementById("canvas").getContext("2d");
var mesh = new Array(); var meshDepth = new Array();

var fI; var vI;

function calculateVertex(x, y, z, cX, cY, cZ, rX, rY, rZ, mX, mY, mZ) {
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

    x += mX;
    y += mY;
    z += mZ;

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
                nVertex = calculateVertex(
                    vertex[0], vertex[1], vertex[2],
                    self.cX, self.cY, self.cZ,
                    self.rX, self.rY, self.rZ,
                    self.mX, self.mY, self.mZ
                );
            } else {
                nVertex = calculateVertex(vertex[0], vertex[1], vertex[2], 0, 0, 0, 0, 0, 0, 0, 0, 0);
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