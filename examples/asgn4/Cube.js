// Cube.js
class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();

        this.textureNum = -2;
    }
    render() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        const faceUVs = [
            0,0, 1,0, 1,1,  // Triangle 1
            0,0, 1,1, 0,1   // Triangle 2
        ];

        const placeholderNormal = [1.0, 1.0, 0.0];
        const placeholderNormalsPerTriangle = [
            ...placeholderNormal, ...placeholderNormal, ...placeholderNormal
        ];

        const frontNormal = [0,0,-1]; const frontNormals = [...frontNormal, ...frontNormal, ...frontNormal];
        const backNormal  = [0,0,1];  const backNormals  = [...backNormal,  ...backNormal,  ...backNormal];
        const topNormal   = [0,1,0];  const topNormals   = [...topNormal,   ...topNormal,   ...topNormal];
        const bottomNormal= [0,-1,0]; const bottomNormals= [...bottomNormal,...bottomNormal,...bottomNormal];
        const leftNormal  = [-1,0,0]; const leftNormals  = [...leftNormal,  ...leftNormal,  ...leftNormal];
        const rightNormal = [1,0,0];  const rightNormals = [...rightNormal, ...rightNormal, ...rightNormal];

        // For debugging, use placeholder normals first:
        const useActualNormals = true; // Set to true to use calculated face normals
        const normTri1 = useActualNormals ? null : placeholderNormalsPerTriangle; // Will be replaced per face
        const normTri2 = useActualNormals ? null : placeholderNormalsPerTriangle; // Will be replaced per face


        let vertices_front1 = [0,0,0,  1,0,0,  1,1,0];
        let uvs_front1      = [0,0,  1,0,  1,1];
        let normals_front1  = useActualNormals ? frontNormals : placeholderNormalsPerTriangle;
        drawTriangle3DUVNormal(vertices_front1, uvs_front1, normals_front1);

        let vertices_front2 = [0,0,0,  1,1,0,  0,1,0];
        let uvs_front2      = [0,0,  1,1,  0,1];
        let normals_front2  = useActualNormals ? frontNormals : placeholderNormalsPerTriangle;
        drawTriangle3DUVNormal(vertices_front2, uvs_front2, normals_front2);

        let vertices_back1 = [0,0,1,  1,0,1,  1,1,1];
        let uvs_back1      = [0,0,  1,0,  1,1];     // Or [0,0, 1,1, 1,0]
        let normals_back1  = useActualNormals ? backNormals : placeholderNormalsPerTriangle;
        drawTriangle3DUVNormal(vertices_back1, uvs_back1, normals_back1);

        let vertices_back2 = [0,0,1,  1,1,1,  0,1,1];
        let uvs_back2      = [0,0,  1,1,  0,1];     // Or [0,0, 0,1, 1,1]
        let normals_back2  = useActualNormals ? backNormals : placeholderNormalsPerTriangle;
        drawTriangle3DUVNormal(vertices_back2, uvs_back2, normals_back2);

        let vertices_top1 = [0,1,0,  1,1,0,  1,1,1];
        let uvs_top1      = [0,0,  1,0,  1,1];
        let normals_top1  = useActualNormals ? topNormals : placeholderNormalsPerTriangle;
        drawTriangle3DUVNormal(vertices_top1, uvs_top1, normals_top1);

        let vertices_top2 = [0,1,0,  1,1,1,  0,1,1];
        let uvs_top2      = [0,0,  1,1,  0,1];
        let normals_top2  = useActualNormals ? topNormals : placeholderNormalsPerTriangle;
        drawTriangle3DUVNormal(vertices_top2, uvs_top2, normals_top2);


        let vertices_bottom1 = [0,0,0,  1,0,0,  1,0,1];
        let uvs_bottom1      = [0,0,  1,0,  1,1];
        let normals_bottom1  = useActualNormals ? bottomNormals : placeholderNormalsPerTriangle;
        drawTriangle3DUVNormal(vertices_bottom1, uvs_bottom1, normals_bottom1);

        let vertices_bottom2 = [0,0,0,  1,0,1,  0,0,1];
        let uvs_bottom2      = [0,0,  1,1,  0,1];
        let normals_bottom2  = useActualNormals ? bottomNormals : placeholderNormalsPerTriangle;
        drawTriangle3DUVNormal(vertices_bottom2, uvs_bottom2, normals_bottom2);


        let vertices_left1 = [0,0,0,  0,1,0,  0,1,1];
        let uvs_left1      = [0,0,  0,1,  1,1]; // might need adjustment
        let normals_left1  = useActualNormals ? leftNormals : placeholderNormalsPerTriangle;
        drawTriangle3DUVNormal(vertices_left1, uvs_left1, normals_left1);

        let vertices_left2 = [0,0,0,  0,1,1,  0,0,1];
        let uvs_left2      = [0,0,  1,1,  1,0]; // might need adjustment
        let normals_left2  = useActualNormals ? leftNormals : placeholderNormalsPerTriangle;
        drawTriangle3DUVNormal(vertices_left2, uvs_left2, normals_left2);


        let vertices_right1 = [1,0,0,  1,0,1,  1,1,1];
        let uvs_right1      = [0,0,  1,0,  1,1];
        let normals_right1  = useActualNormals ? rightNormals : placeholderNormalsPerTriangle;
        drawTriangle3DUVNormal(vertices_right1, uvs_right1, normals_right1);

        let vertices_right2 = [1,0,0,  1,1,1,  1,1,0];
        let uvs_right2      = [0,0,  1,1,  0,1];
        let normals_right2  = useActualNormals ? rightNormals : placeholderNormalsPerTriangle;
        drawTriangle3DUVNormal(vertices_right2, uvs_right2, normals_right2);
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