function drawPicture() {
  // Sky background - 2 triangles making a rectangle
  gl.uniform4f(u_FragColor, 0.4, 0.7, 1.0, 1.0); // light blue
  drawTriangle([-1.0, 1.0,  1.0, 1.0,  -1.0, 0.0]);
  drawTriangle([ 1.0, 1.0,  1.0, 0.0,  -1.0, 0.0]);

  // Ground - 2 triangles
  gl.uniform4f(u_FragColor, 0.3, 0.6, 0.2, 1.0); // green
  drawTriangle([-1.0, 0.0,  1.0, 0.0,  -1.0, -1.0]);
  drawTriangle([ 1.0, 0.0,  1.0, -1.0, -1.0, -1.0]);

  // Sun - 4 triangles as a rough diamond/star
  gl.uniform4f(u_FragColor, 1.0, 0.9, 0.0, 1.0); // yellow
//   drawTriangle([0.5, 1.0,   0.75, 0.75,  0.9, 1.0]);
   drawTriangle([0.55, 0.65,   0.85, 0.9,  0.85, 0.65]);
   drawTriangle([0.75, 0.9,  0.75, 0.6,   0.55, 0.75]); // actually center quad split
   drawTriangle([0.75, 0.9,  0.95, 0.75,  0.75, 0.6]);

  // Tree trunk - 2 triangles
  gl.uniform4f(u_FragColor, 0.5, 0.3, 0.1, 1.0); // brown
  drawTriangle([-0.7, 0.0,  -0.55, 0.0,  -0.7, -0.3]);
  drawTriangle([-0.55, 0.0, -0.55, -0.3, -0.7, -0.3]);

  // Tree top - 3 stacked triangles
  gl.uniform4f(u_FragColor, 0.1, 0.5, 0.1, 1.0); // dark green
  drawTriangle([-0.625, 0.5,  -0.4, 0.0,  -0.85, 0.0]);
  drawTriangle([-0.625, 0.7,  -0.45, 0.25, -0.8, 0.25]);
  drawTriangle([-0.625, 0.9,  -0.5, 0.5,  -0.75, 0.5]);

  // Letter J - made of triangles
  // J top bar (horizontal) - 2 triangles
  gl.uniform4f(u_FragColor, 0.8, 0.2, 0.2, 1.0); // red
  drawTriangle([0.1, 0.5,   0.5, 0.5,   0.1, 0.4]);
  drawTriangle([0.5, 0.5,   0.5, 0.4,   0.1, 0.4]);

  // J vertical stem
  drawTriangle([0.35, 0.4,  0.5, 0.4,   0.35, -0.1]);
  drawTriangle([0.5,  0.4,  0.5, -0.1,  0.35, -0.1]);

  // J curve bottom-left hook
  drawTriangle([0.15, -0.1,  0.5, -0.1,  0.15, -0.25]);
  drawTriangle([0.5,  -0.1,  0.5, -0.25, 0.15, -0.25]);
  drawTriangle([0.1,  -0.25, 0.3, -0.25, 0.1,  -0.4]);

  // Mountain in background - 3 triangles
  gl.uniform4f(u_FragColor, 0.6, 0.6, 0.65, 1.0); // grey
  drawTriangle([-0.2, 0.6,  0.2, 0.0,  -0.6, 0.0]);
  drawTriangle([ 0.1, 0.5,  0.5, 0.0,   0.2, 0.0]); // second smaller peak
  // Snow cap
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0); // white
  drawTriangle([-0.2, 0.6,  -0.05, 0.35, -0.35, 0.35]);
}