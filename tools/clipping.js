/* CLIPPING TO A 2D COORDINATE ON AN AXIS (3D) */

function clipX(x1, y1, z1, x2, y2, z2, x) {
  const t = (x - x1) / (x2 - x1);
  const y = y1 + t * (y2 - y1);
  const z = z1 + t * (z2 - z1);
  return [x, y, z];
}

function clipY(x1, y1, z1, x2, y2, z2, y) {
  const t = (y - y1) / (y2 - y1);
  const x = x1 + t * (x2 - x1);
  const z = z1 + t * (z2 - z1);
  return [x, y, z];
}

function clipZ(x1, y1, z1, x2, y2, z2, z) {
  const t = (z - z1) / (z2 - z1);
  const x = x1 + t * (x2 - x1);
  const y = y1 + t * (y2 - y1);
  return [x, y, z];
}

/* CLIPPING TO A 1D COORDINATE ON AN AXIS (2D) */

function clipX(x1, y1, x2, y2, line) {
  let intercept = y1 + ((y2 - y1) / (x2 - x1)) * (line - x1);
  
  if (intercept <= y1 && intercept >= y2) {
    return intercept;
  }
}

function clipY(x1, y1, x2, y2, line) {
  let intercept = x1 + (line - y1) * (x2 - x1) / (y2 - y1);
  
  if (intercept >= x1 && intercept <= x2) {
    return intercept;
  }
}
