import { Plan } from '@app/interfaces';


import { HecoPlan } from './oahu-heco/plan';
import { MauiPlan } from './maui/plan';
import { BigIslandPlan } from './bigisland/plan';


export const Plans: Plan[] = [ HecoPlan, MauiPlan, BigIslandPlan ];


