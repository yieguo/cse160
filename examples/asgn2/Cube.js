// class Cube{
// 	constructor(){
// 		this.type='cube';

// 		this.color=[1.0,1.0,1.0,1.0];

// 		this.matrix = new Matrix4();
// 	}

// 	render(){
// 		var rgba = this.color;

// 		gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

// 		gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

// 		drawTriangle3D([0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0]);
// 		drawTriangle3D([0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0]);

// 		gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
// 		//top of cube
// 		drawTriangle3D([0,1,0, 0,1,1, 1,1,1]);
// 		drawTriangle3D([0,1,0, 1,1,1, 1,1,0]);

// 	}
// }
// Cube.js
class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0]; // Default color
        this.matrix = new Matrix4();       // Transformation matrix
        this.vertexBuffer = null;          // To store the VBO
        this.numVertices = 36;             // 6 faces * 2 triangles/face * 3 vertices/triangle

        // Try to initialize buffers immediately if gl context is available
        if (typeof gl !== 'undefined' && gl) {
            this.initVertexBuffers(gl);
        }
    }

    initVertexBuffers(gl) {
        // Check if buffers are already initialized
        if (this.vertexBuffer) return;

        // Define vertices for a unit cube (0,0,0) to (1,1,1)
        // Each face is composed of two triangles
        var vertices = new Float32Array([
            // Front face (Z=0)
            0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0, // Triangle 1
            0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0, // Triangle 2

            // Back face (Z=1)
            0.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 1.0, 1.0, // Triangle 3
            0.0, 0.0, 1.0,   1.0, 1.0, 1.0,   0.0, 1.0, 1.0, // Triangle 4

            // Top face (Y=1)
            0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0, // Triangle 5
            0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0, // Triangle 6

            // Bottom face (Y=0)
            0.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 1.0, // Triangle 7
            0.0, 0.0, 0.0,   1.0, 0.0, 1.0,   0.0, 0.0, 1.0, // Triangle 8

            // Left face (X=0)
            0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   0.0, 1.0, 1.0, // Triangle 9
            0.0, 0.0, 0.0,   0.0, 1.0, 1.0,   0.0, 1.0, 0.0, // Triangle 10

            // Right face (X=1)
            1.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 1.0, // Triangle 11
            1.0, 0.0, 0.0,   1.0, 1.0, 1.0,   1.0, 0.0, 1.0  // Triangle 12
        ]);

        // Create a buffer object
        this.vertexBuffer = gl.createBuffer();
        if (!this.vertexBuffer) {
            console.error('Failed to create the buffer object for Cube');
            return;
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        // Write data into the buffer object (STATIC_DRAW because cube vertices don't change)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Unbind the buffer (good practice after setup)
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    render() {
        // Ensure WebGL context `gl` and attribute `a_Position` are available
        // These should be initialized and fetched in your main script (BlockyAnimal.js)
        if (typeof gl === 'undefined' || typeof a_Position === 'undefined' || a_Position < 0) {
            console.error('WebGL context or a_Position not available/valid for Cube rendering.');
            return;
        }

        // Initialize buffers if they haven't been already (e.g., if gl wasn't ready at construction)
        if (!this.vertexBuffer) {
            this.initVertexBuffers(gl);
            // If initialization failed, don't proceed
            if (!this.vertexBuffer) return;
        }

        var rgba = this.color; // Base color

        // Pass the model matrix to the u_ModelMatrix variable
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Bind the vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        // Assign the buffer object to the a_Position variable
        // 3 components per vertex (x, y, z)
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        // --- Draw the cube face by face with slightly varied colors ---
        // This helps visualize the shape without lighting

        // Draw Front face (vertices 0-5) - slightly bright
        gl.uniform4f(u_FragColor, rgba[0] * 1.0, rgba[1] * 1.0, rgba[2] * 1.0, rgba[3]);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Draw Back face (vertices 6-11) - slightly darker
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        gl.drawArrays(gl.TRIANGLES, 6, 6);

        // Draw Top face (vertices 12-17) - brightest
        gl.uniform4f(u_FragColor, rgba[0] * 1.1, rgba[1] * 1.1, rgba[2] * 1.1, rgba[3]); // Clamping might be needed for >1.0
        gl.drawArrays(gl.TRIANGLES, 12, 6);

        // Draw Bottom face (vertices 18-23) - darkest
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        gl.drawArrays(gl.TRIANGLES, 18, 6);

        // Draw Left face (vertices 24-29) - medium dark
        gl.uniform4f(u_FragColor, rgba[0] * 0.85, rgba[1] * 0.85, rgba[2] * 0.85, rgba[3]);
        gl.drawArrays(gl.TRIANGLES, 24, 6);

        // Draw Right face (vertices 30-35) - medium bright
        gl.uniform4f(u_FragColor, rgba[0] * 0.95, rgba[1] * 0.95, rgba[2] * 0.95, rgba[3]);
        gl.drawArrays(gl.TRIANGLES, 30, 6);


        // --- Alternative: Single Draw Call (if not varying color per face) ---
        // If you don't need the per-face color variation, you can use one draw call:
        // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // gl.drawArrays(gl.TRIANGLES, 0, this.numVertices); // Draw all 36 vertices

        // --- Cleanup ---
        // It's generally good practice to unbind buffers after drawing,
        // though WebGL often handles the state changes automatically.
        // gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}