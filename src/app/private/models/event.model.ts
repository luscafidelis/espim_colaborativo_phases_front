import { Intervention } from './intervention.model';
import { Trigger } from './trigger.model';
import { Sensor } from './sensor.model';

export class Event {
    public id: number;
    protected title: string;
    protected description: string;
    protected color: string;
    protected type: string;

    protected sensors: Array<number>;
    protected sensorsInstance: Array<Sensor>;
    protected complexConditions;
    protected triggers: Array<number>;
    protected triggersInstances: Array<Trigger>;

    constructor(event: any = {}) {
        this.id = event.id || -1;
        this.title = event.title;
        this.description = event.description;
        this.type = event.type;
        this.color = event.color || '#0a467f';
        this.sensors = event.sensors || new Array<number>();
        this.complexConditions = event.complexConditions;
        this.triggers = event.triggers || new Array<number>();
        this.sensorsInstance = new Array<Sensor>();
        this.triggersInstances = new Array<Trigger>();
    }

    public getId(): number { return this.id; }
    public getTitle(): string { return this.title; }
    public getDescription(): string { return this.description; }
    public getColor(): string { return this.color; }
    public getType(): string { return this.type; }
    public getTriggersId(): Array<number> { return this.triggers; }
    public getTriggersInstances(): Array<Trigger> { return this.triggersInstances; }
    public getSensorsId(): Array<number> { return this.sensors; }
    public hasSensorsInstance(): boolean { return this.sensorsInstance != null; }
    public getSensorsInstance(): Array<Sensor> { return this.sensorsInstance; }

    public getCollector(): string {
        if (this.hasSensorsInstance() && this.sensorsInstance.length > 0) {
            if (this.sensorsInstance.every(value => value.getCollector() === 'smartphone'))
                return 'smartphone';
            else if (this.sensorsInstance.every(value => value.getCollector() === 'smartwatch'))
                return 'smartwatch';
        }
        return 'none';
    }

    public getSensorOfType(type: string): Sensor { if (this.sensorsInstance && this.sensorsInstance.length > 0) return this.sensorsInstance.find(value => value.getSensor() === type); }
    public removeCollectorOfType(type: string): void {
        const indexInstanceToRemove = this.sensorsInstance.findIndex(value => value.getSensor() === type);
        const indexIdToRemove = this.sensors.findIndex(value => value === this.sensorsInstance[indexInstanceToRemove].getId());
        this.sensorsInstance.splice(indexInstanceToRemove, 1);
        this.sensors.splice(indexIdToRemove, 1);
    }
    public addSensor(instance: Sensor): void {
        this.sensors.push(instance.getId());
        this.sensorsInstance.push(instance);

        this.sensors.sort((a: number, b: number) => a - b);
        this.sensorsInstance.sort((a: Sensor, b: Sensor) => a.getId() - b.getId());

        return;
    }

    public setTitle(title: string): void { this.title = title; }
    public setColor(color: string): void { this.color = color; }
    public setDescription(description: string) { this.description = description; }
    public setType(type: string) { this.type = type; }
    public setTriggerInstance(triggersInstance: Array<Trigger>): void { this.triggersInstances = triggersInstance; }
    public setSensorsInstances(sensorsInstance: Array<Sensor>): void { this.sensorsInstance = sensorsInstance; }
}

export class ActiveEvent extends Event{
    public interventions: Array<number>;
    public interventionsInstances: Array<Intervention>;

    constructor(event: any = {}) {
        super(event);
        this.interventions = event.interventions;
        this.interventionsInstances = new Array<Intervention>();
    }

    public getInterventionsId(): Array<number> { return this.interventions; }
    public setInterventionsId(interventions: Array<number>): void { this.interventions = interventions; }
    public getInterventionsInstances(): Array<Intervention> { return this.interventionsInstances; }
    public setInterventionsInstances(interventions: Array<Intervention>): void { this.interventionsInstances = interventions; }
}
