class OBJObject {
  constructor() {
    this.type      = 'obj';
    this.color     = [1.0, 1.0, 1.0, 1.0];
    this.matrix    = new Matrix4();
    this.textureNum = -2;   // solid color by default
    this.ready     = false;
    this.vertF32   = new Float32Array([]);
    this.uvF32     = new Float32Array([]);
    this.normalF32 = new Float32Array([]);
  }

  // Async — sets this.ready = true when parsing finishes.
  async load(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      this.parse(text);
      this.ready = true;
      console.log('OBJ loaded: ' + url +
                  ' (' + (this.vertF32.length / 3) + ' vertices)');
    } catch (e) {
      console.log('Failed to load OBJ "' + url + '": ' + e);
    }
  }

  // Parse OBJ text into flat Float32Arrays.
  parse(text) {
    const posArr  = [];   // vec3 positions
    const normArr = [];   // vec3 normals
    const uvArr   = [];   // vec2 tex-coords

    const outVerts  = [];
    const outNorms  = [];
    const outUVs    = [];

    for (let raw of text.split('\n')) {
      const line  = raw.trim();
      const parts = line.split(/\s+/);

      if (parts[0] === 'v') {
        posArr.push([parseFloat(parts[1]),
                     parseFloat(parts[2]),
                     parseFloat(parts[3])]);

      } else if (parts[0] === 'vn') {
        normArr.push([parseFloat(parts[1]),
                      parseFloat(parts[2]),
                      parseFloat(parts[3])]);

      } else if (parts[0] === 'vt') {
        uvArr.push([parseFloat(parts[1]),
                    parseFloat(parts[2])]);

      } else if (parts[0] === 'f') {
        // Fan-triangulate polygons (handles tris and quads)
        const tokens = parts.slice(1);
        for (let i = 1; i < tokens.length - 1; i++) {
          this._pushVert(tokens[0],   posArr, normArr, uvArr, outVerts, outNorms, outUVs);
          this._pushVert(tokens[i],   posArr, normArr, uvArr, outVerts, outNorms, outUVs);
          this._pushVert(tokens[i+1], posArr, normArr, uvArr, outVerts, outNorms, outUVs);
        }
      }
    }

    this.vertF32   = new Float32Array(outVerts);
    this.normalF32 = new Float32Array(outNorms);
    this.uvF32     = new Float32Array(outUVs);
  }

  // Parse one face token ("v", "v/vt", "v//vn", "v/vt/vn") and push components.
  _pushVert(token, posArr, normArr, uvArr, outVerts, outNorms, outUVs) {
    const idx = token.split('/');
    const vi  = parseInt(idx[0]) - 1;
    const vti = (idx[1] && idx[1] !== '') ? parseInt(idx[1]) - 1 : -1;
    const vni = (idx[2] && idx[2] !== '') ? parseInt(idx[2]) - 1 : -1;

    const p = posArr[vi] || [0, 0, 0];
    outVerts.push(p[0], p[1], p[2]);

    if (vni >= 0 && normArr[vni]) {
      const n = normArr[vni];
      outNorms.push(n[0], n[1], n[2]);
    } else {
      outNorms.push(0, 1, 0);  // fallback up-normal
    }

    if (vti >= 0 && uvArr[vti]) {
      const uv = uvArr[vti];
      outUVs.push(uv[0], uv[1]);
    } else {
      outUVs.push(0, 0);
    }
  }

  // Batch-render all triangles in one drawArrays call.
  render() {
    if (!this.ready || this.vertF32.length === 0) return;

    const rgba = this.color;
    gl.uniform1i(u_whichTexture, g_normalViz ? -3 : this.textureNum);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertF32, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // UV coordinates
    gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvF32, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    // Normals
    gl.bindBuffer(gl.ARRAY_BUFFER, g_normalBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.normalF32, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertF32.length / 3);
  }
}
