// import { TouchService } from '@app/services/touch.service';
// import { Trig } from '@app/classes/trig';
// import { TouchPoint } from './touchpoint';

// export class Cluster {

//     private TR: any; // Instance of a TRIG object for access to math methods.
//     private key: number;
//     private clusterKey: number;
//     private points: TouchPoint[];
//     private size: number;
//     private edgeValues: any;
//     private widthHistory: any;
//     private heightHistory: any;
//     private corners: any;
//     private center: {x: number; y: number;};
//     private edges: any;
//     private zooming: boolean;
//     private rotating: boolean;
//     private occupied: boolean;
//     private interactionElement: any;
  
//     constructor(points: any, private touchService: TouchService) {
//         this.TR = new Trig();
//         this.key = this.touchService.createNewClusterKey();
//         this.points = points; // The points that make up the cluster
//         points.forEach(point => point.membership.push(this.key));
//         this.size = points.length; // The size of the cluster
//         this.edgeValues = this.getEdgeValues(); // Minima and maxima
//         this.widthHistory = [this.getWidth()]; // Stores Historical width data
//         this.heightHistory = [this.getHeight()]; // Stores Historical Height data
//         this.corners = this.getCorners(); // Corners representing a rectangle around the cluster
//         this.center = this.getCenter(); // The center of the cluster based on a rectangle around it
//         this.edges = this.getEdges(); // Creates the edges of the graph
//         this.zooming = false;
//         this.rotating = false;
//         this.occupied = false;
//         this.interactionElement = null;
//      }

//      public setInteractionElement(e: any): boolean {
//          try{ 
//              this.interactionElement = e;
//              return true;
//          } catch(error) {
//              console.log('Unable to set interation element for this cluster.');
//              return false;
//          }
//      }

//      public getKey(): number {
//          return this.key;
//      }

//      public getPoints(): TouchPoint[] {
//          return this.points;
//      }

//      public isZooming(): boolean {
//          return this.zooming;
//      }

//      public setZooming(val: boolean): boolean {
//          try {
//              this.zooming = val;
//              return true;
//          } catch(error) {
//              console.log('Error Trying to set cluster zoom state.');
//              return false;
//          }
//      }

//      public isRotating(): boolean {
//          return this.rotating;
//      }

//      public setRotating(value: boolean): boolean {
//          try {
//              this.rotating = value;
//              return true;
//          } catch(error) {
//              console.log('Error setting rotating state of cluster.');
//              return false;
//          }
//      }
  
//     /** Gets the center of the cluster in pixels
//      * @return object containing x and y position of the cluster's center.
//      */
//     public getCenter() {
//         return {
//             x: 0.5 * (this.edgeValues.maxX + this.edgeValues.minX),
//             y: 0.5 * (this.edgeValues.maxY + this.edgeValues.minY)
//         }
//     }
  
//     /** Gets the width of the cluster at its widest point
//      * @return the width of the cluster.
//      */
//     getWidth() {
//         return Math.abs(this.edgeValues.maxX - this.edgeValues.minX);
//     }
  
//     /** Gets the height of the cluster at its tallest point
//      * @return the height of the cluster.
//      */
//     getHeight() {
//         return Math.abs(this.edgeValues.maxY - this.edgeValues.minY);
//     }
  
//     /** Gets the maximum and minimum values for x and y of the cluster.
//      * @return object containing the max and min position values.
//      */
//     getEdgeValues() {
//         const edgeValues = {
//             minX: 0,
//             maxX: 0,
//             minY: 0,
//             maxY: 0
//         }
//         this.points.sort((a, b) => {
//             return a.getX() - b.getX();
//         });
  
//         edgeValues.maxX = this.points[this.points.length - 1].getX();
//         edgeValues.minX = this.points[0].getX();
  
//         this.points.sort((a, b) => {
//             return a.getY() - b.getY();
//         });
  
//         edgeValues.maxY = this.points[this.points.length - 1].getY();
//         edgeValues.minY = this.points[0].getY();
  
//         return edgeValues;
//     }
  
//     /** Calculates the corners of a rectangle that surrounds the cluster.  0 represents top left, 1 top right
//      * 2 bottom right, 3 bottom left.
//      * @return object containing the 4 corners of the rectangle
//      */
//     getCorners() {
//         return [{
//             x: this.edgeValues.minX,
//             y: this.edgeValues.minY
//         },
//         {
//             x: this.edgeValues.maxX,
//             y: this.edgeValues.minY
//         },
//         {
//             x: this.edgeValues.maxX,
//             y: this.edgeValues.maxY
//         },
//         {
//             x: this.edgeValues.minX,
//             y: this.edgeValues.maxY
//         }];
//     }
  
//     /* When Touchpoints are moved, cluster data is updated */
//     updateData() {
//         this.edgeValues = this.getEdgeValues(); // Minima and maxima
//         this.widthHistory.unshift(this.getWidth()); // Stores Historical width data
//         this.heightHistory.unshift(this.getHeight()); // Stores Historical Height data
//         this.corners = this.getCorners(); // Corners representing a rectangle around the cluster
//         this.center = this.getCenter(); // The center of the cluster based on a rectangle around it
//         this.edges = this.getEdges(); // Creates the edges of the graph
//         this.touchService.trimArray(this.widthHistory, this.touchService.getPointHistoryMax());
//         this.touchService.trimArray(this.heightHistory, this.touchService.getPointHistoryMax());
//     }
  
//     /** Creates edges of the graph by connecting the closest points */
//     getEdges() {
//         const edges = [];
//         const pointQueue = [...this.points];
//         pointQueue.sort((a, b) => a.getX() - b.getX());
//         while (pointQueue.length > 1) {
//             const node = pointQueue.shift();
//             const weights = [];
//             pointQueue.forEach((point, index) => {
//                 weights.push({
//                     weight: this.TR.getHypotenuse(this.TR.getSideLength(node.getX(), point.getX()), this.TR.getSideLength(node.getY(), point.getY())),
//                     pointIndex: index
//                 });
//             });
//             weights.sort((a, b) => a - b);
//             edges.push({
//                 nodes: [node, pointQueue[weights[0].pointIndex]],
//                 weight: parseInt(weights[0].weight, 10)
//             });
//             const temp = pointQueue[0];
//             pointQueue[0] = pointQueue[weights[0].pointIndex];
//             pointQueue[weights[0].pointIndex] = temp;
//         }
//         return edges;
//     }
  
  
//     pinchZoom() {
//         if (this.widthHistory.length > this.touchService.getPointHistoryMax() - 1 && this.heightHistory.length > this.touchService.getPointHistoryMax() - 1) {
//             const zoomValue = this.TR.getHypotenuse(this.widthHistory[0], this.heightHistory[0]) - this.TR.getHypotenuse(this.widthHistory[this.widthHistory.length - 1], this.heightHistory[this.heightHistory.length - 1]);
//             const w = this.widthHistory[0];
//             const h = this.heightHistory[0];
//             this.touchService.trimArray(this.widthHistory, this.touchService.getPointHistoryMax());
//             this.touchService.trimArray(this.heightHistory, this.touchService.getPointHistoryMax());
//             this.widthHistory.unshift(w);
//             this.heightHistory.unshift(h);
//             this.interactionElement.zoom(zoomValue);
//         }
//     }
  
//     twoFingerRotate() {
//         const point1 = this.points[0];
//         const point2 = this.points[1];
//         const sum = -(this.TR.getRotationSum(point1.getPositionHistory(), point2.getPositionHistory()) / 2);
//         this.interactionElement.rotation += sum;
//         this.interactionElement.element.rotate(this.interactionElement.rotation);
  
//     }
  
  
//   }
  