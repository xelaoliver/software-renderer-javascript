const ctx = document.getElementById("canvas").getContext("2d");
var mesh = new Array(); var meshDepth = new Array();

var rotation = {x: 0, y: 0}

var verteciesOfCube = new Array();

var rubiksCubeFaces = [
    new Array(9).fill("green"),
    new Array(9).fill("blue"),
    new Array(9).fill("white"),
    new Array(9).fill("yellow"),
    new Array(9).fill("orange"),
    new Array(9).fill("red")
];

// lol programmically adding faces of cube, did this before in monopoly.js

for (let i = 0; i < 12; i += 4) {
    verteciesOfCube.push([[-6+i, 6, -6], [-2+i, 6, -6], [-2+i, 6, -2], [-6+i, 6, -2], rubiksCubeFaces[0][i/4]]);
    verteciesOfCube.push([[-6+i, 6, -2], [-2+i, 6, -2], [-2+i, 6, 2], [-6+i, 6, 2], rubiksCubeFaces[0][(i+4)/4]]);
    verteciesOfCube.push([[-6+i, 6, 2], [-2+i, 6, 2], [-2+i, 6, 6], [-6+i, 6, 6], rubiksCubeFaces[0][(i+8)/4]]);
}

for (let i = 0; i < 12; i += 4) {
    verteciesOfCube.push([[-6+i, -6, -6], [-2+i, -6, -6], [-2+i, -6, -2], [-6+i, -6, -2], rubiksCubeFaces[1][i/4]]);
    verteciesOfCube.push([[-6+i, -6, -2], [-2+i, -6, -2], [-2+i, -6, 2], [-6+i, -6, 2], rubiksCubeFaces[1][(i+4)/4]]);
    verteciesOfCube.push([[-6+i, -6, 2], [-2+i, -6, 2], [-2+i, -6, 6], [-6+i, -6, 6], rubiksCubeFaces[1][(i+8)/4]]);
}

for (let i = 0; i < 12; i += 4) {
    verteciesOfCube.push([[-6, -6, -6+i], [-6, -6, -2+i], [-6, -2, -2+i], [-6, -2, -6+i], rubiksCubeFaces[2][i/4]]);
    verteciesOfCube.push([[-6, -2, -6+i], [-6, -2, -2+i], [-6, 2, -2+i], [-6, 2, -6+i], rubiksCubeFaces[2][(i+4)/4]]);
    verteciesOfCube.push([[-6, 2, -6+i], [-6, 2, -2+i], [-6, 6, -2+i], [-6, 6, -6+i], rubiksCubeFaces[2][(i+8)/4]]);
}

for (let i = 0; i < 12; i += 4) {
    verteciesOfCube.push([[6, -6, -6+i], [6, -6, -2+i], [6, -2, -2+i], [6, -2, -6+i], rubiksCubeFaces[3][i/4]]);
    verteciesOfCube.push([[6, -2, -6+i], [6, -2, -2+i], [6, 2, -2+i], [6, 2, -6+i], rubiksCubeFaces[3][(i+4)/4]]);
    verteciesOfCube.push([[6, 2, -6+i], [6, 2, -2+i], [6, 6, -2+i], [6, 6, -6+i], rubiksCubeFaces[3][(i+8)/4]]);
}

for (let i = 0; i < 12; i += 4) {
    verteciesOfCube.push([[-6+i, -6, -6], [-2+i, -6, -6], [-2+i, -2, -6], [-6+i, -2, -6], rubiksCubeFaces[4][i/4]]);
    verteciesOfCube.push([[-6+i, -2, -6], [-2+i, -2, -6], [-2+i, 2, -6], [-6+i, 2, -6], rubiksCubeFaces[4][(i+4)/4]]);
    verteciesOfCube.push([[-6+i, 2, -6], [-2+i, 2, -6], [-2+i, 6, -6], [-6+i, 6, -6], rubiksCubeFaces[4][(i+8)/4]]);
}

for (let i = 0; i < 12; i += 4) {
    verteciesOfCube.push([[-6+i, -6, 6], [-2+i, -6, 6], [-2+i, -2, 6], [-6+i, -2, 6], rubiksCubeFaces[5][i/4]]);
    verteciesOfCube.push([[-6+i, -2, 6], [-2+i, -2, 6], [-2+i, 2, 6], [-6+i, 2, 6], rubiksCubeFaces[5][(i+4)/4]]);
    verteciesOfCube.push([[-6+i, 2, 6], [-2+i, 2, 6], [-2+i, 6, 6], [-6+i, 6, 6], rubiksCubeFaces[5][(i+8)/4]]);
}

// lol now for the fun shtuff, i should rl make the 3d functions into a graphics api. but hey, im not paid, working/learning 8-3:30 AT SCHOOL, NOW PROGRAMMING. so idc, this'll just be for extra aura

window.addEventListener("load", (e) => {
	setInterval(function() {calculateVerteciesOfCube(verteciesOfCube); ctx.globalAlpha = document.getElementById("transparency").value; drawMeshData(mesh)}, 1000/60);
});

function calculateVertex(x, y, z) {
	let nX, nY, nZ;

	nX = Math.sin(rotation.x)*z+Math.cos(rotation.x)*x;
	nZ = Math.cos(rotation.x)*z-Math.sin(rotation.x)*x;

	x = nX; z = nZ;

	nY = Math.sin(rotation.y)*z+Math.cos(rotation.y)*y;
	nZ = Math.cos(rotation.y)*z-Math.sin(rotation.y)*y;
	
	y = nY; z = nZ;

	z += 30;

	return [x, -y, z];
}

function calculateVerteciesOfCube(rawMeshData) {
    mesh = [];
    meshDepth = [];

    for (let fI = 0; fI < rawMeshData.length; fI ++) {
        let averageDepth = 0;
        mesh.push([]);

        for (let vI = 0; vI < rawMeshData[fI].length - 1; vI ++) {
            let vertex = rawMeshData[fI][vI];
            let nVertex = calculateVertex(vertex[0], vertex[1], vertex[2]);
            mesh[fI].push(nVertex);
            averageDepth += nVertex[2];
        }

        averageDepth /= (rawMeshData[fI].length-1);
        meshDepth.push({index: fI, depth: averageDepth});
        mesh[fI].push(rawMeshData[fI][rawMeshData[fI].length-1]);
    }

    meshDepth.sort((a, b) => b.depth-a.depth);
    mesh = meshDepth.map(item => mesh[item.index]);

    rotation.x += .025;
    rotation.y = (Math.sin(rotation.x)*.75)*.75;
}

function drawMeshData(meshData) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let fI = 0; fI < meshData.length; fI++) {
        ctx.beginPath();
        for (let vI = 0; vI < meshData[fI].length-1; vI ++) {
            let vertex = meshData[fI][vI];
            ctx.lineTo((canvas.width/2)+(vertex[0]*(400/vertex[2])), (canvas.height/2)+(vertex[1]*(400/vertex[2])));
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = meshData[fI][meshData[fI].length-1];
        ctx.fill();
    }
}
