// Cube.js
class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.vertexBuffer = null;
        this.numVertices = 36;

        if (typeof gl !== 'undefined' && gl) {
            this.initVertexBuffers(gl);
        }
    }

    initVertexBuffers(gl) {
        if (this.vertexBuffer) return;

        // cube (0,0,0) to (1,1,1)
        var vertices = new Float32Array([
            // Front face (Z=0)
            0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0,
            0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0,

            // Back face (Z=1)
            0.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 1.0, 1.0,
            0.0, 0.0, 1.0,   1.0, 1.0, 1.0,   0.0, 1.0, 1.0,

            // Top face (Y=1)
            0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0,
            0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0,

            // Bottom face (Y=0)
            0.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 1.0,
            0.0, 0.0, 0.0,   1.0, 0.0, 1.0,   0.0, 0.0, 1.0,

            // Left face (X=0)
            0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   0.0, 1.0, 1.0,
            0.0, 0.0, 0.0,   0.0, 1.0, 1.0,   0.0, 1.0, 0.0,

            // Right face (X=1)
            1.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 1.0,
            1.0, 0.0, 0.0,   1.0, 1.0, 1.0,   1.0, 0.0, 1.0
        ]);

        this.vertexBuffer = gl.createBuffer();
        if (!this.vertexBuffer) {
            console.error('Failed to create the buffer object for Cube');
            return;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    render() {
        if (typeof gl === 'undefined' || typeof a_Position === 'undefined' || a_Position < 0) {
            console.error('WebGL context or a_Position not available/valid for Cube rendering.');
            return;
        }

        if (!this.vertexBuffer) {
            this.initVertexBuffers(gl);
            if (!this.vertexBuffer) return;
        }

        var rgba = this.color;

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(a_Position);


        gl.uniform4f(u_FragColor, rgba[0] * 1.0, rgba[1] * 1.0, rgba[2] * 1.0, rgba[3]);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        gl.drawArrays(gl.TRIANGLES, 6, 6);

        gl.uniform4f(u_FragColor, rgba[0] * 1.1, rgba[1] * 1.1, rgba[2] * 1.1, rgba[3]);
        gl.drawArrays(gl.TRIANGLES, 12, 6);

        // Draw Bottom face
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        gl.drawArrays(gl.TRIANGLES, 18, 6);

        // Draw Left face
        gl.uniform4f(u_FragColor, rgba[0] * 0.85, rgba[1] * 0.85, rgba[2] * 0.85, rgba[3]);
        gl.drawArrays(gl.TRIANGLES, 24, 6);

        // Draw Right face
        gl.uniform4f(u_FragColor, rgba[0] * 0.95, rgba[1] * 0.95, rgba[2] * 0.95, rgba[3]);
        gl.drawArrays(gl.TRIANGLES, 30, 6);
    }
}