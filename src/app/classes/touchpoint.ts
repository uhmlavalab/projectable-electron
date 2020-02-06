import { TouchService } from '@app/services/touch.service';
import { Trig } from '@app/classes/trig';

export class TouchPoint {

    private TR: any;  // Object used to do trig math.
    private createdAt: number;
    private x: number;
    private y: number;
    private identifier: number;
    private interactionElement: any;
    private positionHistory: any;
    private membership: number[];
    private dragging: any;
    private zooming: boolean;
    private rotating: boolean;
    private occupied: boolean;
    private throwData: any;

    constructor(point, private touchService: TouchService) {
        
        this.TR = new Trig();
        this.createdAt = new Date().getTime();
        this.x = point.screenX;  // Current X position
        this.y = point.screenY;  // Current Y position
        this.identifier = point.identifier;  // Unique identifier given by the browser.
        this.interactionElement = undefined; // When a point is interacting with an element, that element is stored here.
        this.positionHistory = [];  // Holds the historical point data. Used for zooming
        this.membership = [];  // keys of clusters that this point is a part of.
        /* State Identifiers */
        this.dragging = false;
        this.zooming = false;
        this.rotating = false;
        this.occupied = false;
        this.throwData = { distance: 0, time: 0, start: { x: 0, y: 0 }, finish: { x: 0, y: 0 } };

    }

    ngOnInit() {
    }



    /** Sets the position of the point in pixels
     * @param x the x position.
     * @param y the y position.
     * @return this object
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /* logs the historical Position */
    logHistory() {
        this.positionHistory.unshift({ x: this.x, y: this.y, created: new Date().getTime() });
        this.touchService.trimArray(this.positionHistory, this.touchService.getPointHistoryMax());
        return this;
    }

    dragElement() {
        if (this.dragging && this.interactionElement) {
            this.interactionElement.repositionCenter(this.x, this.y);
        }
        return this;
    }

    wasMoved() {
        let moved = false;
        if (this.positionHistory.length > 4) {
            const value = this.getMovementValue(this.x, this.positionHistory[this.positionHistory.length - 1].x, this.y, this.positionHistory[this.positionHistory.length - 1].y);
            if (Math.abs(value.x) > this.touchService.getPixelMovementThreshold() || Math.abs(value.y) > this.touchService.getPixelMovementThreshold()) {
                moved = true;
            }
        }
        return moved;
    }

    wasThrown() {
        let thrown = false;
        if (this.positionHistory.length > 4) {
            const value = this.getMovementValue(this.x, this.positionHistory[this.positionHistory.length - 1].x, this.y, this.positionHistory[this.positionHistory.length - 1].y);
            if (Math.abs(value.x) > this.touchService.getThrowThreshold() || Math.abs(value.y) > this.touchService.getThrowThreshold()) {
                thrown = true;
                this.throwData = {
                    distance: this.TR.getHypotenuse(Math.abs(value.x), Math.abs(value.y)),
                    time: (this.positionHistory[0].created - this.positionHistory[this.positionHistory.length - 1].created),
                    start: {
                        x: this.positionHistory[this.positionHistory.length - 1].x,
                        y: this.positionHistory[this.positionHistory.length - 1].y
                    },
                    finish: {
                        x: this.positionHistory[0].x,
                        y: this.positionHistory[0].y
                    }
                };
            }
        }
        return thrown;
    }

    getMovementValue(x1, x2, y1, y2) {
        const xDiff = x1 - x2;
        const yDiff = y1 - y2;
        return { x: xDiff, y: yDiff };
    }

    startZooming() {
        this.dragging = false;
        this.rotating = false;
        this.zooming = true;
    }

    startRotating() {
        this.dragging = false;
        this.rotating = true;
        this.zooming = false;
    }

    isUnoccupied() {
        return !(this.dragging || this.rotating || this.zooming);
    }

    // Setters and Getters //

    /** Gets an array of cluster keys that this point belongs to.
     * @return array of cluster keys.
     */
    public getMembership(): number[] {
        return this.membership;
    }

    /** Toggles the dragging state. */
    public toggleDragging(): void {
        this.dragging = !this.dragging;
    }

    /** Returns the dragging state.
     * True if the point is currently dragging something.
     * False if the point is not currently dragging something.
     * @return dragging state.
     */
    public isDragging(): boolean {
        return this.dragging;
    }

    public isZooming(): boolean {
        return this.zooming;
    }

    public isRotating(): boolean {
        return this.rotating;
    }

    /** Gets the element that this point is currently interacting with.
     * @return the interacton element */
    public getInteractionElement(): any {
        return this.interactionElement;
    }

    /** Sets the element that this point is currently interacting with. 
     * @param element the element that is being interacted with.
     * @return true if successful, false if failure.
    */
    public setInteractionElement(element: any): boolean {
        try {
            this.interactionElement = element;
            return true;
        } catch(error) {
            console.log('Failed To set interaction Element.');
            return false;
        }
    }

    /** Gets the throw data.  Throw data contains information about the speed and
     * direction of an object when it is let go by the user while moving it.
     * @return the throw data object.
     */
    public getThrowData(): any {
        return this.throwData;
    }

    /** Sets the x position of the touch point.
     * @param value the current positon of the point.
     * @return true if successful, false if error.
     */
    public setX(value: number): boolean {
        try {
            this.x = value;
            return true;
        } catch(error) {
            console.log('Failed to set X position.');
            return false;
        }
    }

    public getX(): number {
        return this.x;
    }

    /** Sets the y position of the touch point.
     * @param value the current positon of the point.
     * @return true if successful, false if error.
     */
    public setY(value: number): boolean {
        try {
            this.y = value;
            return true;
        } catch(error) {
            console.log('Failed to set Y position.');
            return false;
        }
    }

    public getY(): number {
        return this.y;
    }

    public getPositionHistory(): any {
        return this.positionHistory;
    }

    public setOccupied(val: boolean): void {
        try {
            this.occupied = val;
        } catch(error) {
            console.log('Could not set occupied state of touch point.');
        }
    }

    public getCreationTime(): number {
        return this.createdAt;
    }

}
