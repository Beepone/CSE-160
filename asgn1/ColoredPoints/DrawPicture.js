function drawPicture() {
    // Sky background - 2 triangles making a rectangle
    gl.uniform4f(u_FragColor, 0.4, 0.7, 1.0, 1.0); // light blue
    drawTriangle([-1.0, 1.0,  1.0, 1.0,  -1.0, 0.0]);
    drawTriangle([ 1.0, 1.0,  1.0, 0.0,  -1.0, 0.0]);

    // Ground - 2 triangles
    gl.uniform4f(u_FragColor, 0.3, 0.6, 0.2, 1.0); // green
    drawTriangle([-1.0, 0.04,  1.0, 0.04,  -1.0, -1.0]);
    drawTriangle([ 1.0, 0.04,  1.0, -1.0, -1.0, -1.0]);

    // Sun - 8 triangles as a rough circle
    gl.uniform4f(u_FragColor, 1.0, 0.9, 0.0, 1.0); // yellow
    var sun = new Circle();
    sun.segments = 8;
    sun.size = 40;
    sun.position = [0.65, 0.7, 0.0];
    sun.color = [1.0, 0.9, 0.0, 1.0];
    sun.render();

    
    // Mountain in background - 3 triangles
    gl.uniform4f(u_FragColor, 0.6, 0.6, 0.65, 1.0); // grey
    drawTriangle([-0.68, 0.04,  -0.2 , 0.52,   0.28, 0.04]);
    drawTriangle([ 0.28, 0.04,  -0.04, 0.36,   0.52, 0.04]); // second smaller peak
    // Snow cap
    gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0); // white
    drawTriangle([-0.36, 0.36,  -0.04, 0.36, -0.2 , 0.52]);


    // Tree trunk - 2 triangles
    gl.uniform4f(u_FragColor, 0.5, 0.3, 0.1, 1.0); // brown
    drawTriangle([-0.76, 0.12,  -0.6, -0.12,  -0.76, -0.12]);
    drawTriangle([-0.76, 0.12,  -0.6, -0.12,  -0.6, 0.12]);

    // Tree top - 3 stacked triangles
    gl.uniform4f(u_FragColor, 0.1, 0.5, 0.1, 1.0); // dark green
    drawTriangle([-0.92 , 0.12, -0.44, 0.12,  -0.68, 0.36]);
    drawTriangle([-0.84 , 0.28, -0.52, 0.28,  -0.68, 0.52]);
    drawTriangle([-0.80 , 0.44, -0.56,  0.44,  -0.68, 0.60]);

}