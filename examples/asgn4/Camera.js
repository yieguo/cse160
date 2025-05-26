// Camera.js
class Camera {
    constructor(mapWidth, mapDepth) {
        let startX = 5;
        let startZ = 5;

        if (typeof g_map !== 'undefined' && g_map[startZ] && g_map[startZ][startX] > 0) {
            //leftovers
            console.warn(`Camera starting position (${startX},${startZ}) is a wall. Trying to find an empty spot.`);
            searchLoop:
            for (let zOffset = 0; zOffset < 5; zOffset++) {
                for (let xOffset = 0; xOffset < 5; xOffset++) {
                    if (g_map[startZ + zOffset] && g_map[startZ + zOffset][startX + xOffset] === 0) {
                        startX += xOffset;
                        startZ += zOffset;
                        break searchLoop;
                    }
                }
            }
        }

        this.eye = new Vector3([startX, 0.5, startZ]);
        this.at = new Vector3([startX + 1, 0.5, startZ]);
        
        this.worldUp = new Vector3([0, 1, 0]);
        this.up = new Vector3([0, 1, 0]);

        this.speed = 0.2;
        this.alpha = 3;
        this.mouseSensitivity = 0.25;

        this.recalculateLocalUp();
    }

    getForward() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        return f;
    }

    getRight() {
        let f = this.getForward();
        let r = Vector3.cross(f, this.worldUp);
        r.normalize();

        if (r.magnitude() < 0.0001 && (Math.abs(f.elements[1]) > 0.999)) {

            r = Vector3.cross(this.worldUp, new Vector3([-1,0,0]));
            r.normalize();
        }
        return r;
    }

    recalculateLocalUp() {
        let f = this.getForward();
        let r = this.getRight();
        this.up = Vector3.cross(r, f);
        this.up.normalize();
    }

    moveForward() {
        let d = this.getForward();
        d.mul(this.speed);
        this.eye.add(d);
        this.at.add(d);
    }

    moveBackward() {
        let d = this.getForward();
        d.mul(this.speed);
        this.eye.sub(d);
        this.at.sub(d);
    }

    moveLeft() {
        let r = this.getRight();
        r.mul(this.speed);
        this.eye.sub(r);
        this.at.sub(r);
    }

    moveRight() {
        let r = this.getRight();
        r.mul(this.speed);
        this.eye.add(r);
        this.at.add(r);
    }

    panLeft() {
        this.pan(this.alpha);
    }

    panRight() {
        this.pan(-this.alpha);
    }

    pan(angleDegrees) {
        let f = this.getForward();

        // Pan around the WORLD_UP axis to prevent roll
        let rotMatrix = new Matrix4().setRotate(angleDegrees, this.worldUp.elements[0], this.worldUp.elements[1], this.worldUp.elements[2]);
        let f_rotated = rotMatrix.multiplyVector3(f);

        this.at.set(this.eye);
        this.at.add(f_rotated);

        this.recalculateLocalUp(); // Keep local up orthogonal
    }

    tilt(angleDegrees) {
        let f = this.getForward();
        let r = this.getRight(); // This 'right' is horizontal

        let currentAngleFromWorldY = Math.acos(Vector3.dot(f, this.worldUp)) * (180 / Math.PI);

        let newAngleFromWorldY = currentAngleFromWorldY - angleDegrees;

        if (newAngleFromWorldY < 1.0) {
            angleDegrees = currentAngleFromWorldY - 1.0;
        }
        else if (newAngleFromWorldY > 179.0) {
            angleDegrees = currentAngleFromWorldY - 179.0;
        }
        
        if (Math.abs(angleDegrees) < 0.001) return;

        let rotMatrix = new Matrix4().setRotate(angleDegrees, r.elements[0], r.elements[1], r.elements[2]);
        let f_rotated = rotMatrix.multiplyVector3(f);

        if (Math.abs(Vector3.dot(f_rotated, this.worldUp)) > 0.9999) {

        }


        this.at.set(this.eye);
        this.at.add(f_rotated);

        this.recalculateLocalUp(); // Keep local up orthogonal
    }
}