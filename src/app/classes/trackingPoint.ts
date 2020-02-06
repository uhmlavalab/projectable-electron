/** This class is tracking points that are used to convert coordinates from the cameras to 
 * the table.  Each point has a value for camera 1, camera 2, and map.
 */
export class TrackingPoint {

    private mapX: number;
    private mapY: number;
    private camX: number;
    private camY: number;
    private cam2X: number;
    private cam2Y: number;
    public detected: boolean;

    constructor(camX: number, camY: number, cam2X: number, cam2Y: number, mapX: number, mapY: number) {
        this.mapX = mapX;
        this.mapY = mapY;
        this.camX = camX;
        this.camY = camY;
        this.cam2X = cam2X;
        this.cam2Y = cam2Y;
    }

    public getCam2X() {
        return this.cam2X
    }

    public getCamX() {
        return this.camX;
    }

    public getCamY() {
        return this.camY;
    }

    public getCam2Y() {
        return this.cam2Y;
    }

    public getMapX() {
        return this.mapX;
    }

    public getMapY() {
        return this.mapY;
    }
}