// import { TouchPoint } from './touchpoint';
// import { TouchService } from '@app/services/touch.service';
// import { Cluster } from './cluster';
// import { Trig } from '@app/classes/trig';
// import { TouchData } from '@app/interfaces/touch-data';

// export class PointDetectorComponent {

//     private TR: any;  // Object used to do trig math.
//     private data: TouchData;

//     constructor(private touchService: TouchService) {
//         this.TR = new Trig();
//         this.data = {
//             touchList: undefined,
//             clusters: undefined,
//             clicks: []
//         }
//     }

//     /** Whenewver a touch event occurs, this function directs the flow
//      * @param event the touch event
//      * @return the detector data -> touchpoints and clusters
//      */
//     update(event) {
//         const changes = event.changedTouches;
//         switch (event.type) {
//             case 'touchstart':
//                 this.addTouchPoints(changes).updateClusters(changes);
//                 break;
//             case 'touchmove':
//                 this.moveTouchPoints(changes).updateClusterData();
//                 break;
//             case 'touchend':
//                 this.removeTouchPoints(changes);
//                 break;
//             default:
//                 // Do Nothing
//                 break;
//         }
//         return this.data;
//     }

//     /** Adds a new touch point to the touchpoint data object
//      * @param changes changed touches
//      */
//     addTouchPoints(changes: TouchEvent) {
//         Object.values(changes).forEach(point => this.data.touchList[point.identifier] = new TouchPoint(point, this.touchService));
//         return this;
//     }

//     /** Updates positon of touch points
//      * @param changes changed touches
//      */
//     moveTouchPoints(changes: TouchEvent) {
//         Object.values(changes).forEach(point => this.data.touchList[point.identifier].setPosition(point.screenX, point.screenY).logHistory());
//         return this;
//     }

//     /** Removes a touchpoint after touchend
//      * @param changes Changed touchpoints
//      */
//     removeTouchPoints(changes: TouchEvent) {

//         Object.values(changes).forEach(point => {
//             const id = point.identifier;
//             const p = this.data.touchList[id];
//             this.removeMemberClusters(this.data.touchList[point.identifier].getMembership());
//             if (this.wasAClick(p)) {
//                 this.data.clicks.push(point);
//             } else if (p.isDragging() && p.wasThrown()) {
//                 p.getInteractionElement().throw(p.getThrowData());
//             }

//             delete this.data.touchList[id];
//             return this;
//         });
//     }

//     /** Finds all clusters currently located on the table.  Runs every time a touchpoint is added or removed */
//     updateClusters(changes: TouchEvent) {
//         const clustersFound = [];
//         if (Object.keys(this.data.touchList).length > this.touchService.getMinClusterSize() && Object.keys(this.data.touchList).length <= this.touchService.getMaxClusterSize()) {
//             const changedPoints = this.sortPoints(changes);
//             while (changedPoints.length > 0) {
//                 const pointOfInterest = changedPoints.shift();
//                 const cluster = [];
//                 Object.values(this.data.touchList).forEach(point => {
//                     if (this.isClusterMember(this.getSeparation(pointOfInterest.x, point.getX()), this.getSeparation(pointOfInterest.y, point.getY()))) {
//                         cluster.push(point);
//                         if (cluster.length > this.touchService.getMinClusterSize()) {
//                             clustersFound.push(new Cluster(cluster, this.touchService));
//                         }
//                     }
//                 });
//             }
//         }
//         if (clustersFound.length > 0) {
//             this.storeClusterData(clustersFound);
//         }
//         return this;
//     }

//     removeMemberClusters(list: number[]) {
//         list.forEach(id => {
//             Object.values(this.data.clusters).forEach(clusterList => {
//                 clusterList.forEach((cluster, index) => {
//                     if (cluster.getKey() === id) {
//                         delete clusterList[index];
//                         clusterList.splice(index, 1);
//                     }
//                 })
//             });
//         });
//     }

//     updateClusterData() {
//         Object.values(this.data.clusters).forEach(clusterList =>
//             clusterList.forEach(cluster => cluster.updateData()));
//     }

//     /** Finds the distance between two touchpoints */
//     getSeparation(a, b) {
//         return Math.abs(a - b);
//     }

//     /** After updateClusters runs, the data needs to be sorted by cluster size and stored in the data.cluster object
//      * @param clusters the active clusteres found.
//      */
//     storeClusterData(clusters) {
//         clusters.forEach(cluster => {
//             if (this.data.clusters[cluster.size] === undefined) {
//                 this.data.clusters[cluster.size] = [cluster];
//             } else {
//                 this.data.clusters[cluster.size].push(cluster);
//             }
//         });
//     }

//     /** Checks the distance between two touch points and determines if it belongs in a cluster
//      * @param x distance between two points.
//      * @param y the y distance between two points.
//      */
//     isClusterMember(x, y) {
//         const distance = this.TR.getHypotenuse(x, y);
//         return distance < this.touchService.getClusterRadius();
//     }

//     /** Since data is normally stored in an object, this function takes that object and stores the values in an array, sorted by the x value
//      * from smallest to largest
//      * @return array of sorted touchpoints
//      */
//     sortPoints(changes: TouchEvent) {
//         let pointArray = [];
//         Object.values(changes).forEach(point => pointArray.push(this.data.touchList[point.identifier]));
//         pointArray = pointArray.sort((a, b) => a.x - b.x);
//         return pointArray;
//     }

//     wasAClick(point) {
//         const currentTime = new Date().getTime();
//         return currentTime - point.createdAt < this.touchService.getClickMax();
//     }

//     evaluateClickData(elements): void {
//         this.data.clicks.forEach(click => {
//             elements.forEach(e => {
//                 if (e.isInside(click.screenX, click.screenY)) {
//                     if (e.element.animations.rotation.interval > 0) {
//                         clearInterval(e.element.animations.rotation.interval);
//                         e.element.animations.rotation = {};
//                     } else {
//                         e.element.rotationAnimation('very fast', 2000, true);
//                     }
//                 }
//             });
//         });
//         this.data.clicks = [];
//     }

//     private checkFocus(results: TouchData, elements: any[]) {

//         elements.forEach(e => {
//             let found = false;
//             Object.values(results.touchList).forEach(point => {
//                 if (e.isInside(point.getX(), point.getY())) {
//                     found = true;
//                 }
//             });
//             e.toggleFocus(found);
//         });
//     }

//     evaluateTouchData(results: TouchData, elements) {

//         if (thereAreClustersOfThree()) {
//             checkThreeFingerMenuTouch(results, elements);
//         }

//         if (elements.length > 0) {
//             if (thereAreClustersOfTwo()) {
//                 evaluatePointsForRotation(results, elements);
//                 evaluatePointsForZoom(results, elements);
//             }
//             evaluatePointsForDrag(results, elements);
//         }

//         function checkThreeFingerMenuTouch(results: TouchData, elements) {

//             results.clusters['3'].forEach(cluster => {
//                 const pointArray = cluster.getPoints();
//                 if (!pointArray[0].isUnoccupied()) {
//                     let create = true;
//                     pointArray.forEach(point => {
//                         elements.forEach(e => {
//                             if (e.isInside(point.getX(), point.getY())) {
//                                 create = false;
//                             }
//                         });
//                     });
//                     if (create) {
//                         pointArray.forEach(point => point.setOccupied(true));
//                     }
//                 }
//             });
//         }

//         function evaluatePointsForRotation(results: TouchData, elements) {
//             Object.values(results.clusters['2']).forEach(cluster => {
//                 const pointArray = cluster.getPoints();
//                 const first = pointArray[0];
//                 if (!first.isUnoccupied()) {
//                     if (first.isRotating()) {
//                         cluster.setInteractionElement(first.getInteractionElement());
//                         cluster.twoFingerRotate();
//                     } else {
//                         if (elements.length > 0) {
//                             elements.forEach(e => {
//                                 if (e.rotatable()) {
//                                     cluster.setRotating(e.checkRotation(cluster));
//                                     if (cluster.isRotating()) {
//                                         cluster.setInteractionElement(e);
//                                     }
//                                 }
//                             });
//                         }
//                     }
//                 }
//             });
//         }

//         function evaluatePointsForZoom(results: TouchData, elements) {
//             Object.values(results.clusters['2']).forEach(cluster => {
//                 const pointArray = cluster.getPoints();
//                 const first = pointArray[0];
//                 if (!first.isRotating() && !first.isUnoccupied()) {
//                     if (first.isZooming()) {
//                         cluster.setInteractionElement(first.getInteractionElement());
//                         cluster.pinchZoom();
//                     } else {
//                         if (elements.length > 0) {
//                             elements.forEach(e => {
//                                 if (e.zoomable()) {
//                                     cluster.setZooming(e.checkZoom(first,pointArray[1]));
//                                     if (cluster.isZooming()) {
//                                         cluster.setInteractionElement(e);
//                                     }
//                                 }
//                             });
//                         }
//                     }
//                 }
//             });
//         }


//         function evaluatePointsForDrag(results: TouchData, elements) {
//             Object.values(results.touchList).forEach(point => {
//                 if (point.wasMoved()) {
//                     if (!point.isZooming() && !point.isRotating()) {
//                         if (point.isDragging()) {
//                             point.dragElement();
//                         } else {
//                             if (elements.length > 0) {
//                                 elements.forEach(e => {
//                                     if (e.draggable()) {
//                                         if (compareTime(point.getCreationTime(), new Date().getTime(), this.touchService.getMinDragTime())) {
//                                             e.checkDrag(point);
//                                         }
//                                     }
//                                 });
//                             }
//                         }
//                     }
//                 }
//             });
//         }

//         function thereAreClustersOfTwo() {
//             return (results.clusters['2'] !== undefined && Object.values(results.clusters['2']).length > 0);
//         }

//         function thereAreClustersOfThree() {
//             return (results.clusters['3'] !== undefined && Object.values(results.clusters['3']).length > 0);
//         }

//         function compareTime(timeA, timeB, threshold) {
//             return timeB - timeA > threshold;
//         }
//     }
// }
