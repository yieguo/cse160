class Circle {
    constructor(segSize) {
        this.type = 'circle'
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = segSize; // Store the number of segments

      
        this.vertexBuffer = null; 
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;
        var segments = this.segments;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // --- Optimization Start ---

        var d = this.size / 200.0;
        let angleStep = 360 / segments;
        let vertices = []; // Array to hold all vertex coordinates (x, y)

        for (var angle = 0; angle < 360; angle = angle + angleStep) {
            let centerPt = [xy[0], xy[1]];
            let angle1 = angle;
            let angle2 = angle + angleStep;
            let vec1 = [Math.cos(angle1 * Math.PI / 180) * d, Math.sin(angle1 * Math.PI / 180) * d];
            let vec2 = [Math.cos(angle2 * Math.PI / 180) * d, Math.sin(angle2 * Math.PI / 180) * d];
            let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
            let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];

            // Add vertices for one triangle: Center, Point1, Point2
            vertices.push(centerPt[0], centerPt[1]);
            vertices.push(pt1[0], pt1[1]);
            vertices.push(pt2[0], pt2[1]);
        }

        if (!this.vertexBuffer) {
            this.vertexBuffer = gl.createBuffer();
            if (!this.vertexBuffer) {
                console.log('Failed to create the buffer object for Circle');
                return;
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW); // Use DYNAMIC_DRAW

        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0); // 2 components (x, y) per vertex

        gl.enableVertexAttribArray(a_Position);

        //Draw all triangles at once
        gl.drawArrays(gl.TRIANGLES, 0, segments * 3);

        //Unbind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}