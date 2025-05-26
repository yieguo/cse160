class Sphere {
    constructor() {
        this.type = 'sphere';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.segments = 12;
    }

    render() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let d = Math.PI / this.segments;
        let dd = (2 * Math.PI) / this.segments;

        for (let i = 0; i < this.segments; i++) {
            for (let j = 0; j < this.segments; j++) {
                let p1 = [
                    Math.sin(d * i) * Math.cos(dd * j),
                    Math.cos(d * i),
                    Math.sin(d * i) * Math.sin(dd * j)
                ];
                let p2 = [
                    Math.sin(d * (i + 1)) * Math.cos(dd * j),
                    Math.cos(d * (i + 1)),
                    Math.sin(d * (i + 1)) * Math.sin(dd * j)
                ];
                let p3 = [
                    Math.sin(d * (i + 1)) * Math.cos(dd * (j + 1)),
                    Math.cos(d * (i + 1)),
                    Math.sin(d * (i + 1)) * Math.sin(dd * (j + 1))
                ];
                let p4 = [
                    Math.sin(d * i) * Math.cos(dd * (j + 1)),
                    Math.cos(d * i),
                    Math.sin(d * i) * Math.sin(dd * (j + 1))
                ];


                let uv1 = [j / this.segments, i / this.segments];
                let uv2 = [j / this.segments, (i + 1) / this.segments];
                let uv3 = [(j + 1) / this.segments, (i + 1) / this.segments];
                let uv4 = [(j + 1) / this.segments, i / this.segments];


                let n1 = [...p1];
                let n2 = [...p2];
                let n3 = [...p3];
                let n4 = [...p4];

                let vertices1 = [...p1, ...p2, ...p3];
                let uvs1 = [...uv1, ...uv2, ...uv3];
                let normals1 = [...n1, ...n2, ...n3];
                drawTriangle3DUVNormal(vertices1, uvs1, normals1);

                let vertices2 = [...p1, ...p3, ...p4];
                let uvs2 = [...uv1, ...uv3, ...uv4];
                let normals2 = [...n1, ...n3, ...n4];
                drawTriangle3DUVNormal(vertices2, uvs2, normals2);
            }
        }
    }
}