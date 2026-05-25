class Cube {
    //Constructor
  constructor(){
    this.type = 'cube';
    this.color = [0.0, 0.0, 0.0, 0.0];
    this.matrix = new Matrix4();
    this.textureNum = -2;
  }
  // Tell the point to render itself.
  render(){
  
    var rgba = this.color;

    gl.uniform1i(u_whichTexture, this.textureNum)

    // Pass the matrix to the u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    //top face 
    drawTriangle3DUVNormal([-0.5,.5,-.5,  -.5,.5,.5,  .5,.5,.5], [0,0,  0,1,  1,1], [0,1,0,  0,1,0,  0,1,0]);
    drawTriangle3DUVNormal([-.5,.5,-.5,  .5,.5,.5,  .5,.5,-.5], [0,0,  1,1,  1,0], [0,1,0,  0,1,0,  0,1,0]);
    // drawTriangle3D([-0.5,.5,-.5,  -.5,.5,.5,  .5,.5,.5]);
    // drawTriangle3D([-.5,.5,-.5,  .5,.5,.5,  .5,.5,-.5]);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    //bottom face : (0,0,0), (1,0,0), (0,0,1) | (1,0,1), (1,0,0), (0,0,1)
    drawTriangle3DUVNormal([-.5,-.5,-.5,  .5,-.5,-.5,  -.5,-.5,.5], [0,1,  1,1,  0,0], [0,-1,0,  0,-1,0,  0,-1,0]);
    drawTriangle3DUVNormal([.5,-.5,.5,  .5,-.5,-.5,  -.5,-.5,.5], [1,0,  1,1,  0,0], [0,-1,0,  0,-1,0,  0,-1,0]);
    // drawTriangle3D([-.5,-.5,-.5,  .5,-.5,-.5,  -.5,-.5,.5]);
    // drawTriangle3D([.5,-.5,.5,  .5,-.5,-.5,  -.5,-.5,.5]);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // front face
    drawTriangle3DUVNormal([-.5,-.5,-.5,  -.5,.5,-.5,  .5,-.5,-.5], [0,1,  0,0,  1,1], [0,0,-1,  0,0,-1,  0,0,-1]);
    drawTriangle3DUVNormal([.5,.5,-.5,  -.5,.5,-.5,  .5,-.5,-.5], [1,0,  0,0,  1,1], [0,0,-1,  0,0,-1,  0,0,-1]);
    // drawTriangle3D([-.5,-.5,-.5,  -.5,.5,-.5,  .5,-.5,-.5]);
    // drawTriangle3D([.5,.5,-.5,  -.5,.5,-.5,  .5,-.5,-.5]);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    //back face: (0,0,1), (1,0,1), (0,1,1) | (1,1,1), (1,0,1), (0,1,1)
    drawTriangle3DUVNormal([-.5,-.5,.5,  .5,-.5,.5, -.5,.5,.5], [0,0,  1,0,  0,1], [0,0,1,  0,0,1,  0,0,1]);
    drawTriangle3DUVNormal([.5,.5,.5,  .5,-.5,.5, -.5,.5,.5], [1,1,  1,0,  0,1], [0,0,1,  0,0,1,  0,0,1]);
    // drawTriangle3D([-.5,-.5,.5,  .5,-.5,.5, -.5,.5,.5]);
    // drawTriangle3D([.5,.5,.5,  .5,-.5,.5, -.5,.5,.5]);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    //left face: (0,0,0), (0,1,0), (0,0,1) | (0,1,1), (0,1,0), (0,0,1)
    drawTriangle3DUVNormal([-.5,-.5,-.5,  -.5,.5,-.5, -.5,-.5,.5], [1,0,  1,1,  0,0], [-1,0,0,  -1,0,0,  -1,0,0]);
    drawTriangle3DUVNormal([-.5,.5,.5,  -.5,.5,-.5, -.5,-.5,.5], [0,1,  1,1,  0,0], [-1,0,0,  -1,0,0,  -1,0,0]);
    // drawTriangle3D([-.5,-.5,-.5,  -.5,.5,-.5, -.5,-.5,.5]);
    // drawTriangle3D([-.5,.5,.5,  -.5,.5,-.5, -.5,-.5,.5]);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    //right face: (1,1,0), (1,0,0), (1,1,1) | (1,0,1), (1,0,0), (1,1,1)
    drawTriangle3DUVNormal([.5,.5,-.5,  .5,-.5,-.5, .5,.5,.5], [1,0,  1,1,  0,0], [1,0,0,  1,0,0,  1,0,0]);
    drawTriangle3DUVNormal([.5,-.5,.5,  .5,-.5,-.5, .5,.5,.5], [0,1,  1,1,  0,0], [1,0,0,  1,0,0,  1,0,0]);
    // drawTriangle3D([.5,.5,-.5,  .5,-.5,-.5, .5,.5,.5]);
    // drawTriangle3D([.5,-.5,.5,  .5,-.5,-.5, .5,.5,.5]);
  }
}