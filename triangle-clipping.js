function findIntercept(x1, y1, x2, y2, line) {
	return y1+((y2-y1)/(x2-x1))*(line-x1);
}

function clipX(triangle, x) {
    var clippedTriangle = [];
    for (let i = 0; i < triangle.length; i += 2) {
        let store = {"x1": triangle[i], "y1": triangle[i+1], "x2": triangle[(i+2) % triangle.length], "y2": triangle[(i+3) % triangle.length]};

        if (store.x1 >= x && store.x2 >= x) {
            clippedTriangle.push(store.x2, store.y2);
        } else if (store.x1 < x && store.x2 >= x) {
            let yIntercept = findIntercept(store.x1, store.y1, store.x2, store.y2, x);
            clippedTriangle.push(x, yIntercept, store.x2, store.y2);
        } else if (store.x1 >= x && store.x2 < x) {
            let yIntercept = findIntercept(store.x1, store.y1, store.x2, store.y2, x);
            clippedTriangle.push(x, yIntercept);
        }
    }
    return clippedTriangle;
}

polygon = [0, 0, 10, 0, 5, 10];

console.log(polygon); 
polygon = clipX(polygon, 5);
console.log(polygon);
