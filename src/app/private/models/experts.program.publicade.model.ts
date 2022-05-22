import { Observer } from "./observer.model";

export interface ExpertsProgramPublicade{
    id? : number;
    observer : Observer;
    isObserver : boolean;
    isEvaluator : boolean;
    isMonitor : boolean;
}