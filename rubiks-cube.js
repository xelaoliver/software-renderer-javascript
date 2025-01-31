const ctx = document.getElementById("canvas").getContext("2d");
var mesh = new Array(); var meshDepth = new Array();

var rotation = {x: 0, y: 0}

const verteciesOfCube = [
	[1, 1, 1, "#ff0000"]
]

window.addEventListener("load", (e) => {
	calculateVerteciesOfCube(verteciesOfCube);

	console.log("mesh:", mesh);
});

function calculateVertex(x, y, z) {
	let nX, nY, nZ;

	nX = Math.sin(rotation.x)*z+Math.cos(rotation.x)*x;
	nZ = Math.cos(rotation.x)*z-Math.sin(rotation.x)*x;

	x = nX; z = nZ;

	nY = Math.sin(rotation.y)*z+Math.cos(rotation.y)*y;
	nZ = Math.cos(rotation.y)*z-Math.sin(rotation.y)*y;
	
	y = nY; z = nZ;

	z += 60;

	return [x, y, z];
}

function calculateVerteciesOfCube(rawMeshData) {
	mesh = []; meshDepth = [];

	for (let fI = 0; fI < rawMeshData.length; fI ++) {
		let averageDepth = 0;
		mesh.push([]);

		for (let vI = 0; vI < rawMeshData[fI].length-1; vI ++) {
			let vertex = rawMeshData[fI];
			let nVertex = calculateVertex(vertex[0], vertex[1], vertex[2]);
			averageDepth += nVertex[2];
			mesh[fI].push(nVertex);
		}

		averageDepth /= rawMeshData[fI];
		meshDepth.push({index: fI, depth: averageDepth});
		mesh[fI].push(rawMeshData[fI][rawMeshData[fI].length-1]);
	}

	meshDepth.sort((a, b) => b.depth-a.depth);
	mesh = meshDepth.map(item => mesh[item.index]);

	rotation.x += .1; rotation.y = (Math.sin(rotation.x)*.75)*.75;
}
