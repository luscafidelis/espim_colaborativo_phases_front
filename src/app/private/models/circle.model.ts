import { Event } from 'src/app/private/models/event.model';

export interface CircleRelationship {
    id? : number;
    id_target : number;
    id_type : number;
    id_circle : number;
}

export interface CircleType {
    id? : number;
    description : string;
}

export interface SameCircleEvent{
    id? : number;
    event : Event;
    circle_type : CircleType[];
    selected : boolean;
}

export interface RespostCircleEvent{
    id? : number;
    event : Event;
    circle_type : CircleType[];
    selected : boolean;
    need_autorization : boolean;
}

export interface TargetCircleEvent{
    id? : number;
    event : Event;
    selected : boolean;
    need_autorization : boolean;
    circle_type : CircleType[];
}

export interface CustomCircleEvent{
    id? : number;
    event : Event;
    circle_type : CircleType[];
    interventions : any[]; 
    title : string;
    description : string;
}

