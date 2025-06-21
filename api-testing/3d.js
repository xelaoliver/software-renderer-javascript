const ctx = document.getElementById("canvas").getContext("2d");
var mesh = new Array(); var meshDepth = new Array();

var fI; var vI;

function calculateVertex(x, y, z, cX, cY, cZ, rX, rY, rZ, mX, mY, mZ) {
    let nX, nY, nZ;
    
    x -= cX;
    y -= cY;
    z -= cZ;

    x += mX;
    y += mY;
    z += mZ;

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

function findInTransformationOfMesh(index) {
    for (let j = transformationsOfMesh.length-1; j >= 0; j--) {
        if (transformationsOfMesh[j][0] == index) {
            return transformationsOfMesh[j][1];
        }
    }
    return null;
}

function calculateVerteciesOfMesh(rawVerteciesData) {
    meshVertecies = [];

    for (let i = 0; i < rawVerteciesData.length; i ++) {
        let vertex = rawVerteciesData[i];
        let self = false;
        
        self = findInTransformationOfMesh(i+1);
        
        if (self != null) {
            eval(self.operation);
            meshVertecies.push(calculateVertex(
                vertex[0], vertex[1], vertex[2],
                self.cX, self.cY, self.cZ,
                self.rX, self.rY, self.rZ,
                self.mX, self.mY, self.mZ
            ));
        } else {
            meshVertecies.push(calculateVertex(vertex[0], vertex[1], vertex[2], 0, 0, 0, 0, 0, 0, 0, 0, 0));
        }
    }
}

function drawMeshData(meshVertecies, meshIndecies) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let facesWithDepth = meshIndecies.map((face, index) => {
        let totalDepth = 0;
        let validVertices = 0;

        for (let j = 0; j < face.length-1; j++) {
            let vertexIndex = face[j]-1;
            let vertex = meshVertecies[vertexIndex];
            if (vertex !== undefined && vertex[2] > 0) {
                totalDepth += vertex[2];
                validVertices ++;
            }
        }

        let averageDepth = validVertices > 0 ? totalDepth / validVertices : -Infinity;

        return {face, averageDepth, index};
    });

    facesWithDepth.sort((a, b) => b.averageDepth-a.averageDepth);

    for (let i = 0; i < facesWithDepth.length; i++) {
        let {face, averageDepth} = facesWithDepth[i];

        if (averageDepth <= 0) continue;

        ctx.beginPath();
        let vertex = meshVertecies[face[0]-1];
        if (vertex[2] > 0) {
            ctx.moveTo((canvas.width/2)+(vertex[0]*(400/vertex[2])), (canvas.height/2)+(vertex[1]*(400/vertex[2])));
        }
        for (let j = 1; j < face.length-1; j++) {
            let vertexIndex = face[j]-1;
            vertex = meshVertecies[vertexIndex];
            if (vertex !== undefined && vertex[2] > 0) {
                ctx.lineTo((canvas.width/2)+(vertex[0]*(400/vertex[2])), (canvas.height/2)+(vertex[1]*(400/vertex[2])));
                // ctx.fillStyle = "black";
                // ctx.fillText(vertexIndex+1, (canvas.width/2)+(vertex[0]*(400/vertex[2])), (canvas.height/2)+(vertex[1]*(400/vertex[2])));
            }
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = face[face.length-1];
        ctx.fill();
    }
}
