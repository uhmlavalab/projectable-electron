import { Marker } from '@app/interfaces';
import { PlanService } from '../../app/services/plan.service'

export const markers: Marker[] = [{
  markerId: 832,
  //markerId: 1,
  secondId: 3,
  job: 'year',
  delay: 30, 
  minRotation: 10,
  rotateLeft(planService: PlanService) {
   planService.decrementCurrentYear();
  },
  rotateRight(planService: PlanService) {
    planService.incrementCurrentYear();
  }
}, {
  markerId: 11,
  secondId: 6,
  job: 'layer',
  delay: 400, 
  minRotation: 10,
  rotateLeft(planService: PlanService) {
    planService.decrementNextLayer();
   },
   rotateRight(planService: PlanService) {
    planService.incrementNextLayer();
   }
}, {
  markerId: 5,
  secondId: 9,
  job: 'scenario',
  delay: 400, 
  minRotation: 10,
  rotateLeft(planService: PlanService) {
    this.planService.decrementScenario();
   },
   rotateRight(planService: PlanService) {
    this.planService.incrementScenario();
   }
}, {
  markerId: 7,
  secondId: 7,
  job: 'add',
  delay: 400, 
  minRotation: 10,
  rotateLeft(planService: PlanService) {
    planService.toggleLayer();
   },
   rotateRight(planService: PlanService) {
    planService.toggleLayer();
   }
}];