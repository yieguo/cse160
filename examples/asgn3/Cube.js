// Cube.js
class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();

        this.textureNum = 0;
    }
    render(){
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        const standardFaceUVs = [
            0,0,  1,0,  1,1,
            0,0,  1,1,  0,1 
        ];

        drawTriangle3DUV([0.0,0.0,0.0,  1.0,0.0,0.0,  1.0,1.0,0.0], standardFaceUVs.slice(0,6) );
        drawTriangle3DUV([0.0,0.0,0.0,  1.0,1.0,0.0,  0.0,1.0,0.0], standardFaceUVs.slice(6,12));

        drawTriangle3DUV([0.0,0.0,0.0,   1.0,1.0,0.0,   1.0,0.0,0.0], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([0.0,0.0,0.0,   0.0,1.0,0.0,   1.0,1.0,0.0], [0,0,  0,1,  1,1]);

        drawTriangle3DUV([0.0,0.0,1.0,   1.0,1.0,1.0,   1.0,0.0,1.0], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([0.0,0.0,1.0,   0.0,1.0,1.0,   1.0,1.0,1.0], [0,0,  0,1,  1,1]);

        drawTriangle3DUV([0.0,1.0,0.0,   1.0,1.0,1.0,   1.0,1.0,0.0], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([0.0,1.0,0.0,   0.0,1.0,1.0,   1.0,1.0,1.0], [0,0,  0,1,  1,1]);

        drawTriangle3DUV([0.0,0.0,0.0,   1.0,0.0,1.0,   1.0,0.0,0.0], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([0.0,0.0,0.0,   0.0,0.0,1.0,   1.0,0.0,1.0], [0,0,  0,1,  1,1]);

        drawTriangle3DUV([0.0,0.0,0.0,   0.0,1.0,1.0,   0.0,0.0,1.0], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([0.0,0.0,0.0,   0.0,1.0,0.0,   0.0,1.0,1.0], [0,0,  0,1,  1,1]);

        drawTriangle3DUV([1.0,0.0,0.0,   1.0,1.0,1.0,   1.0,0.0,1.0], [0,0,  1,1,  1,0]);
        drawTriangle3DUV([1.0,0.0,0.0,   1.0,1.0,0.0,   1.0,1.0,1.0], [0,0,  0,1,  1,1]);
    }

    renderfast(){
        var rgba = this.color;

        // gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts=[];
        //front
        allverts=allverts.concat([0,0,0, 1,1,0, 1,0,0]);
        allverts=allverts.concat([0,0,0, 0,1,0, 1,1,0]);

        //front
        // drawTriangle3DUV([0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0], [0,0, 1,1 ,1,0]);
        // drawTriangle3DUV([0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0], [0,0, 0,1, 1,1]);

        //for depth
        // gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        //top
        // drawTriangle3DUV([0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0], [0,0, 0,1, 1,1]);
        // drawTriangle3DUV([0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0], [0,0, 1,1, 1,0]);
        allverts=allverts.concat([0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0]);
        allverts=allverts.concat([0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0]);

        // gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

        //back
        // drawTriangle3DUV([0.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 1.0, 1.0], [1,0, 0,1 ,1,1]);
        // drawTriangle3DUV([0.0, 0.0, 1.0,   1.0, 1.0, 1.0,   0.0, 1.0, 1.0], [0,0, 0,1, 1,1]);
        allverts=allverts.concat([0.0, 0.0, 1.0,   1.0, 0.0, 1.0,   1.0, 1.0, 1.0]);
        allverts=allverts.concat([0.0, 0.0, 1.0,   1.0, 1.0, 1.0,   0.0, 1.0, 1.0]);

        // gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

        //bottom
        // drawTriangle3DUV([0.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 1.0], [1,0, 0,1 ,1,1]);
        // drawTriangle3DUV([0.0, 0.0, 0.0,   1.0, 0.0, 1.0,   0.0, 0.0, 1.0], [0,0, 0,1, 1,1]);
        allverts=allverts.concat([0.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 1.0]);
        allverts=allverts.concat([0.0, 0.0, 0.0,   1.0, 0.0, 1.0,   0.0, 0.0, 1.0]);

        //left
        // drawTriangle3DUV([0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   0.0, 0.0, 0.0], [1,0, 0,1 ,1,1]);
        // drawTriangle3DUV([0.0, 0.0, 0.0,   0.0, 1.0, 1.0,   0.0, 0.0, 1.0], [0,0, 0,1, 1,1]);
        allverts=allverts.concat([0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   0.0, 0.0, 0.0]);
        allverts=allverts.concat([0.0, 0.0, 0.0,   0.0, 1.0, 1.0,   0.0, 0.0, 1.0]);

        // gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
        
        //right
        // drawTriangle3DUV([1.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 0.0, 0.0], [1,0, 0,1 ,1,1]);
        // drawTriangle3DUV([1.0, 0.0, 0.0,   1.0, 1.0, 1.0,   1.0, 0.0, 1.0], [0,0, 0,1, 1,1]);
        allverts=allverts.concat([1.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 0.0, 0.0]);
        allverts=allverts.concat([1.0, 0.0, 0.0,   1.0, 1.0, 1.0,   1.0, 0.0, 1.0]);

        // gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        drawTriangle3D(allverts);
    }
}