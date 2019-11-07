import { Injectable } from '@angular/core';
import { _ } from 'underscore';
import { Subject } from 'rxjs';
import { PlanService } from '@app/plan';
import { Map, MapLayer } from '@app/plan';
import { SoundsService } from '@app/sounds';

@Injectable({
  providedIn: 'root'
})

export class MapService {

  /* Service Variables */
  private currentMap: Map;
  private layers: MapLayer[] = [];        // Array Holding All Layers

  private selectedLayer: MapLayer;
  public selectedLayerSubject = new Subject<MapLayer>();

  private circlePosition: [number, number];
  private boundingCoords: any;
  public circlePositionSub = new Subject<[any, any]>();

  /* Subjects */
  public toggleLayerSubject = new Subject<MapLayer>();      // Pubisher for when a layer is toggled
  public updateLayerSubject = new Subject<MapLayer>();
  public layerChangeSubject = new Subject<string>();

  private updateTimeout: any;

  constructor(private planService: PlanService, private soundsService: SoundsService) {

    // this.planService.getPlan().subscribe(plan => {
    //   if (plan === null) {
    //     this.layers = [];
    //     this.selectedLayer = null;
    //     this.currentMap = null;
    //     return;
    //   }
    //   this.currentMap = plan.map;
    //   this.currentMap.mapLayers.forEach(layer => {

    //       this.layers.push(layer);

    //   });
    //   this.selectedLayer = this.layers[0];
    //   this.selectedLayerSubject.next(this.selectedLayer);
    // });

    // this.planService.scenarioSubject.subscribe(scenario => {
    //   this.layers.forEach(layer => {
    //     this.updateLayerSubject.next(layer);
    //   });
    // });

    // this.planService.yearSubject.subscribe(year => {
    //   clearTimeout(this.updateTimeout);
    //   this.updateTimeout = setTimeout(() => {


    //   this.layers.forEach(layer => {
    //     this.updateLayerSubject.next(layer);
    //   });
    // }, 500);
    // });
  }

  // /** Gets the scale of the map
  //  * @return the scale of the map
  //  */
  // public getMapScale(): number {
  //   try {
  //     return this.currentMap.scale;
  //   } catch (error) {
  //     console.log('No Map Selected');
  //     return 0;
  //   }
  // }

  // /** Gets the map Image width
  //  * @return the map image width
  //  */
  // public getMapImageWidth(): number {
  //   try {
  //     return this.currentMap.width;
  //   } catch (error) {
  //     console.log('No Map Selected');
  //     return 0;
  //   }
  // }

  // /** Get the map Image height
  //  * @return the map Image height
  //  */
  // public getMapImageHeight(): number {
  //   try {
  //     return this.currentMap.height;
  //   } catch (error) {
  //     console.log('No Map Selected');
  //     return 0;
  //   }

  // }

  // /** Gets the map bounds
  //  * @return array of bounds.
  //  */
  // public getMapBounds(): any[] {
  //   try {
  //     return this.currentMap.bounds;
  //   } catch (error) {
  //     console.log('No Map Selected');
  //     return [];
  //   }

  // }

  // /** Gets the map image name
  //  * @return the path to the map Image
  //  */
  // public getBaseMapPath(): string {
  //   try {
  //     return this.currentMap.baseMapPath;
  //   } catch (error) {
  //     console.log('No Map Selected');
  //     return '';
  //   }
  // }


  /** Gets the active layers
   * @return the array of active layers.
   */
  public getLayers(): MapLayer[] {
    return this.layers;
  }

  public decrementNextLayer() {
    let index = this.layers.indexOf(this.selectedLayer) - 1;
    if (index === -1) {
      index = this.layers.length - 1;
    }
    this.selectedLayer = this.layers[(index) % this.layers.length];
    this.selectedLayerSubject.next(this.selectedLayer);
    this.layerChangeSubject.next('decrement');
    this.soundsService.playTick();

  }

  public incrementNextLayer() {
    const index = this.layers.indexOf(this.selectedLayer) + 1;
    this.selectedLayer = this.layers[(index) % this.layers.length];
    this.selectedLayerSubject.next(this.selectedLayer);
    this.layerChangeSubject.next('increment');
    this.soundsService.playTick();
  }

  public addLayer(): boolean {
    const layer = this.selectedLayer;
    if (!layer.active) {
      layer.active = true;
      this.toggleLayerSubject.next(layer);
      this.soundsService.playUp();
      return true;
    } else {
      return false;
    }
  }

  public removeLayer(): boolean {
    const layer = this.selectedLayer;
    if (layer.active) {
      layer.active = false;
      this.toggleLayerSubject.next(layer);
      this.soundsService.playDown();
      return true;
    } else {
      return false;
    }
  }

  public getSelectedLayer(): MapLayer  {
    return this.selectedLayer;
  }
  resetMap() {

  }

  public updateCirclePosition(position: [number, number], bounds: any) {
    this.circlePosition = position;
    this.boundingCoords = bounds;
    this.circlePositionSub.next([this.circlePosition, bounds]);
  }

}
