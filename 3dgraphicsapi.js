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
