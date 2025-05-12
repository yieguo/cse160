// Camera.js
class Camera {
    constructor(mapWidth, mapDepth) {
        // Ensure G_MAP_WIDTH and G_MAP_DEPTH are accessible here
        // (e.g., defined globally in world.js before Camera.js is included,
        // or passed as arguments to this constructor)

        // Start somewhere inside the 32x32 walls, not too close to the edge.
        // For example, at (5, 0.5, 5) relative to map coordinates.
        // Player height (Y-coordinate) is 0.5 above the ground (y=0).
        let startX = 5;
        let startZ = 5;

        // Make sure the start position is not inside a wall if g_map is already generated
        // This is a simple check; more robust would be to find a guaranteed empty spot.
        if (typeof g_map !== 'undefined' && g_map[startZ] && g_map[startZ][startX] > 0) {
            console.warn(`Camera starting position (${startX},${startZ}) is a wall. Trying to find an empty spot.`);
            // Basic search for an empty spot (can be improved)
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
        // Look towards the center of the map initially, or just along an axis
        this.at = new Vector3([mapWidth / 2, 0.5, mapDepth / 2]); // Look towards map center
        // Or simply look forward along Z:
        // this.at = new Vector3([startX, 0.5, startZ - 10]);


        this.up = new Vector3([0, 1, 0]);

        this.speed = 0.2; // Might need to adjust speed for a larger map
        this.alpha = 3;   // Rotation speed
    }

    moveForward() {
        let d = new Vector3();
        d.set(this.at);
        d.sub(this.eye);
        d.normalize();
        d.mul(this.speed);

        this.eye.add(d);
        this.at.add(d);
    }

    moveBackward() {
        let d = new Vector3();
        d.set(this.at);
        d.sub(this.eye);
        d.normalize();
        d.mul(this.speed);

        this.eye.sub(d);
        this.at.sub(d);
    }

    moveLeft() {
        let forward = new Vector3();
        forward.set(this.at);
        forward.sub(this.eye); // forward = at - eye

        // Calculate the true "left" vector: up X forward
        let left = Vector3.cross(this.up, forward); // Corrected: up X forward for left
        left.normalize();
        left.mul(this.speed);

        this.eye.add(left);
        this.at.add(left);
    }

    moveRight() {
        let forward = new Vector3();
        forward.set(this.at);
        forward.sub(this.eye); // forward = at - eye

        // Calculate the true "right" vector: forward X up
        let right = Vector3.cross(forward, this.up); // Corrected: forward X up for right
        right.normalize();
        right.mul(this.speed);

        this.eye.add(right);
        this.at.add(right);
    }

    panLeft() {
        let d = new Vector3();
        d.set(this.at);
        d.sub(this.eye);

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        
        let d_rotated = rotationMatrix.multiplyVector3(d);

        this.at.set(this.eye);
        this.at.add(d_rotated);
    }

    panRight() {
        let d = new Vector3();
        d.set(this.at);
        d.sub(this.eye);

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let d_rotated = rotationMatrix.multiplyVector3(d);

        this.at.set(this.eye);
        this.at.add(d_rotated);
    }
}