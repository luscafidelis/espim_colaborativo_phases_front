import { Intervention, MediaIntervention, QuestionIntervention, TaskIntervention } from './intervention.model';
import { Trigger } from './trigger.model';
import { Sensor } from './sensor.model';
import { forkJoin } from 'rxjs';
import { trigger } from '@angular/animations';

export class Event {
    public id: number;
    public title: string;
    public description: string;
    public color: string;
    public type: string;
    public program : number;

    public sensors: Array<Sensor>;
    public complexConditions: Array<any>;
    public triggers: Array<Trigger>;

    constructor(event: any = {}) {
        this.id = event.id || -1;
        this.title = event.title;
        this.description = event.description;
        this.type = event.type;
        this.color = event.color || '#0a467f';
        if (event.sensors){
            this.criaSensors(event.sensors);
         } else {
            this.sensors = [];
        }
        this.complexConditions = event.complexConditions;
        if (event.triggers){
            this.criaTriggers(event.triggers);
        } else {
            this.triggers=[];
        }
    }
    //É necessário instanciar os objetos pq senão não reconhece os métodos..
    private criaTriggers(triggerIn : Trigger[]){
        this.triggers=[];
        for (let i=0; i < triggerIn.length; i++){
            this.triggers.push(new Trigger(triggerIn[i]));
        }
    }

    private criaSensors (sensorsIn: Sensor[]) {
        this.sensors=[];
        for (let i=0; i < sensorsIn.length; i++){
            this.sensors.push(new Sensor(sensorsIn[i]));
        }
    }

    public getId(): number { return this.id; }
    public getTitle(): string { return this.title; }
    public getDescription(): string { return this.description; }
    public getColor(): string { return this.color; }
    public getType(): string { return this.type; }
    public getTriggersId(): Array<number> { return this.triggers.map(trigger => trigger.getId()); }
    public getTriggersInstances(): Array<Trigger> { return this.triggers; }
    public getSensorsId(): Array<number> { return this.sensors.map(sensor => sensor.getId()); }
    public hasSensorsInstance(): boolean { return this.sensors != null; }
    public getSensorsInstance(): Array<Sensor> { return this.sensors; }

    public getCollector(): string {
        if (this.hasSensorsInstance() && this.sensors.length > 0) {
            if (this.sensors.every(value => value.getCollector() === 'smartphone'))
                return 'smartphone';
            else if (this.sensors.every(value => value.getCollector() === 'smartwatch'))
                return 'smartwatch';
        }
        return 'none';
    }

    public getSensorOfType(type: string): Sensor { if (this.sensors && this.sensors.length > 0) return this.sensors.find(value => value.getSensor() === type); }
    public removeCollectorOfType(type: string): void {
        const indexInstanceToRemove = this.sensors.findIndex(value => value.getSensor() === type);
        this.sensors.splice(indexInstanceToRemove, 1);
    }
    public addSensor(instance: Sensor): void {
        this.sensors.push(instance);
        this.sensors.sort((a: Sensor, b: Sensor) => a.getId() - b.getId());

        return;
    }

    public setTitle(title: string): void { this.title = title; }
    public setColor(color: string): void { this.color = color; }
    public setDescription(description: string) { this.description = description; }
    public setType(type: string) { this.type = type; }
    public setTriggerInstance(triggersInstance: Array<Trigger>): void { this.triggers = triggersInstance; }
    public setSensorsInstances(sensorsInstance: Array<Sensor>): void { this.sensors = sensorsInstance; }
}

export class ActiveEvent extends Event{
    public interventions:  Array<Intervention>;

    constructor(event: any = {}) {
        super(event);
        if (event.interventions){
            this.criaInterventions(event.interventions);
        } else {
            this.interventions = [];
        }
        //this.interventionsInstances = [];
    }

    criaInterventions (interventions : Intervention[]){
        this.interventions = [];
        for (let i = 0; i < interventions.length; i++) {
            if (interventions[i].type === 'empty')
                this.interventions.push(new Intervention(interventions[i]));
            else if (interventions[i].type === 'media')
                this.interventions.push(new MediaIntervention(interventions[i]));
            else if (interventions[i].type === 'question')
                this.interventions.push(new QuestionIntervention(interventions[i]));
            else
                this.interventions.push(new TaskIntervention(interventions[i]));
        }
        this.interventions.sort((a: Intervention, b: Intervention) => a.orderPosition - b.orderPosition);
    }

    //public getInterventionsId(): Array<number> { return this.interventions; }
    //public setInterventionsId(interventions: Array<number>): void { this.interventions = interventions; }
    public getInterventionsInstances(): Array<Intervention> { return this.interventions; }
    public setInterventionsInstances(interventions: Array<Intervention>): void { this.interventions = interventions; }
}
