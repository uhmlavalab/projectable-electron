export class Trig {
    private ROTATION_THRESHOLD: number;
    
    constructor() {
        this.ROTATION_THRESHOLD = 150;
     }

    /** Used to find the quadrant of an angle in the unit circle.  b is the reference point, a is the point
     * that is being investigated.  
     * @param a point to investigate
     * @param b reference point
     * @return the quadrant that a is in.
     */
    getQuadrant(a, b) {
        let quadrant = 0;
        if (a.x < b.x && a.y > b.y) {
            quadrant = 1;
        } else if (a.x > b.x && a.y > b.y) {
            quadrant = 2;
        } else if (a.x > b.x && a.y < b.y) {
            quadrant = 3;
        } else {
            quadrant = 4;
        }
        return quadrant;
    }

    /** finds the angle of a right triangle when opposite and adjacent sides are known
     * @param adjacent adj side of right triangle.
     * @param opposite opp side of right triangle.
     * @param quadrant The quadrant of the triangle based on the unit circle.
     * @retrun the angle in degrees.
     */
    getTheta(adjacent, opposite, quadrant) {
        // tangent of opposite over adjacent
        let theta = Math.atan(opposite / adjacent);
        switch (quadrant) {
            case 2:
                theta = Math.PI - theta;
                break;
            case 3:
                theta += Math.PI;
                break;
            case 4:
                theta = 2 * Math.PI - theta;
                break;
        }
        return this.radToDegrees(theta);
    }

    /** Converts an angle in radians to degrees
     * @param theta the angle to convert in rads
     * @return the angle in degrees
     */
    radToDegrees(theta) {
        return theta * 180 / Math.PI;
    }

    /** Gets hypotenuse of right triangle
     * @param adjacent adj side of right triangle
     * @param opposite opp side of right triangle
     * @return hypotenuse of right triangle.
     */
    getHypotenuse(adjacent, opposite) {
        return Math.sqrt(Math.pow(adjacent, 2) + Math.pow(opposite, 2));
    }

    /** Gets the side of a triangle
     * @param a point a in pixels
     * @param b point b in pixels
     * @return the length of the side.
     */
    getSideLength(a, b) {
        return Math.abs(a - b);
    }

    /** Finds the sum or rotation over a series of points stored in two separate arrays
     * @param pointArray_A the array of x, y pairs
     * @param pointArray_B the array of x, y paris
     * @return the sum of the rotations without the anomoly points.
     */
    getRotationSum(pointArray_A, pointArray_B) {
        const rotationArray = [];
        pointArray_A.forEach((point, index) => {
            if (pointArray_B[index] != undefined) {
                rotationArray.push(this.getAngleFromZero(point, pointArray_B[index]));
            }
        });

        let sum = 0;
        rotationArray.forEach((angle, index) => {
            if (index < rotationArray.length - 1) {
                const difference = angle - rotationArray[index + 1];
                if (difference < this.ROTATION_THRESHOLD) {
                    sum += angle - rotationArray[index + 1];
                }
            }
        });

        return sum;
    }

    getAngleFromZero(point_a, point_b) {
        const x = this.getSideLength(point_a.x, point_b.x);
        const y = this.getSideLength(point_a.y, point_b.y);
        return this.getTheta(x, y, this.getQuadrant(point_a, point_b));
    }

    getHypotenuseWithThetaAndOpposite(opposite, theta) {
        // Sin = O/H
        const theta_rads = this.degreesToRads(theta);
        return opposite / Math.sin(theta_rads)
    }

    getHypotenuseWithThetaAndAdjacent(opposite, theta) {
        // Cosine = O/H
        const theta_rads = this.degreesToRads(theta);
        return opposite / Math.sin(theta_rads)
    }

    degreesToRads(theta) {
        return theta * Math.PI / 180;
    }

    getOppositeWithThetaAndHypotenuse(hypotenuse, theta) {
        // o = sin(theta)* h
        return hypotenuse * Math.sin(this.degreesToRads(theta));
    }

    getAdjacentWithThetaAndHypotenuse(hypotenuse, theta) {
        // a = sin(theta)* h
        return hypotenuse * Math.cos(this.degreesToRads(theta));
    }
    
    getAdjustedTheta(theta, quadrant) {
        
        switch (quadrant) {
            case 2:
                return 180 - theta;
            case 3: 
                return theta - 180;
            case 4:
                return 360 - theta;
            default:
                return theta;
        }
    }
}