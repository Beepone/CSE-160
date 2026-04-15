class Rectangle{
    //Constructor
  constructor(){
    this.type = 'rectangle';
    this.position = [0.0, 0.0, 0.0, 0.0]; // x1, y1, x2, y2
    this.color = [0.0, 0.0, 0.0, 0.0];
    this.size = 5.0;
  }
  // Tell the rectangle to render itself.
  render(){
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;
    
    // Pass the color to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Pass the size (though not used for rectangle)
    gl.uniform1f(u_Size, size);
    // Draw two triangles for the rectangle
    drawTriangle([xy[0], xy[1], xy[2], xy[1], xy[0], xy[3]]);   // first triangle
    drawTriangle([xy[2], xy[1], xy[2], xy[3], xy[0], xy[3]]); // second triangle
  }
}