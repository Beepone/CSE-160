class Cube {
    //Constructor
  constructor(){
    this.type = 'cube';
    this.color = [0.0, 0.0, 0.0, 0.0];
    this.matrix = new Matrix4();
  }
  // Tell the point to render itself.
  render(){
  
    var rgba = this.color;
   
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
    // Pass the matrix to the u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    drawTriangle3D([0,1,0,  0,1,1, 1,1,1]);
    drawTriangle3D([0,1,0,  1,1,1, 1,1,0]);

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    
    drawTriangle3D([0.0,0.0,0.0,  1.0,1.0,0.0,  1.0,0.0,0.0]);
    drawTriangle3D([0.0,0.0,0.0,  0.0,1.0,0.0,  1.0,1.0,0.0]);
  }
}