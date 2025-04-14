class recurseStructs {
    static generate(shapeList, initialShapeType, initialColor, initialSize, initialSegments, maxSteps) {
        function recursiveStep(currentPos, currentColor, currentSize, currentSegments, shapeType, depth) {
            if (depth >= maxSteps) {
                return;
            }

            let shape;
            if (shapeType === POINT) {
                shape = new Point();
            } else if (shapeType === TRIANGLE) {
                shape = new Triangle();
            } else { // CIRCLE
                shape = new Circle(Math.max(3, Math.round(currentSegments)));
            }

            shape.position = [currentPos[0], currentPos[1]]; 
            shape.color = currentColor.slice();
            shape.size = Math.max(5, currentSize);

            shapeList.push(shape);
            let angle = depth * (Math.PI / 18); // Angle changes with depth (controls rotation)
            let radius = depth * 0.015; // Distance from center increases with depth
            let nextPosX = Math.cos(angle) * radius;
            let nextPosY = Math.sin(angle) * radius;

            let nextSize = currentSize * 0.97;

            let nextColor = [
                Math.max(0, currentColor[0] - 0.1),
                Math.min(1, currentColor[1] + 0.005), //shift towards green/cyan
                currentColor[2],
                Math.max(0.1, currentColor[3] * 0.99) // Fade alpha slightly
            ];
            // let nextColor = currentColor; // Keep color

            recursiveStep([nextPosX, nextPosY], nextColor, nextSize, currentSegments, shapeType, depth + 1);
        }

        // Initial call
        recursiveStep([0.0, 0.0], initialColor, initialSize, initialSegments, initialShapeType, 0);
    }
}