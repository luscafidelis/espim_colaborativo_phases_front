import { Observer } from './observer.model';
import { Participant } from './participant.model';
import { Event } from './event.model';

export class  Program {
  public id: number;
  private title: string;
  private description: string;
  private starts: string;
  private ends: string;
  private updateDate: string;
  private hasPhases: boolean;
  private isPublic: boolean;
  private beingEdited: boolean;
  beingDuplicated: boolean;

  // composed entities
  private editor: Observer;
  private observers: Array<number>;
  private observersInstance: Array<Observer>;
  private participants: Array<number>;
  private participantsInstace: Array<Participant>;
  public events: Array<number>;
  public eventsInstance: Array<Event>;

  constructor(program: any = {}) {
    this.id = program.id || -1;
    this.title = program.title;
    this.description = program.description;
    this.starts = program.starts;
    this.ends = program.ends;
    this.updateDate = program.updateDate;
    this.hasPhases = program.hasPhases;
    this.isPublic = program.isPublic;
    this.beingEdited = program.beingEdited;
    this.beingDuplicated = program.beingDuplicated;
    this.editor = program.editor;
    this.observers = program.observers;
    this.observersInstance = [];
    this.participants = program.participants;
    this.participantsInstace = [];
    this.events = program.events;
  }

  reconstructor(program: any) {
    this.id = program.id || -1;
    this.title = program.title || this.title;
    this.description = program.description || this.description;
    this.starts = program.starts || this.starts;
    this.ends = program.ends || this.ends;
    this.updateDate = program.updateDate || this.updateDate;
    this.hasPhases = program.hasPhases != null ? program.hasPhases : this.hasPhases;
    this.isPublic = program.isPublic != null ? program.isPublic : this.isPublic;
    this.beingEdited = program.beingEdited != null ? program.beingEdited : this.beingEdited;
    this.beingDuplicated = program.beingDuplicated != null ? program.beingDuplicated : this.beingDuplicated;
    this.editor = program.editor || this.editor;
    this.observers = program.observers || this.observers;
    this.participants = program.participants || this.participants;
    this.events = program.events || this.events;
  }

  public getId(): number { return this.id; }
  public getTitle(): string { return this.title; }
  public getDescription(): string { return this.description; }
  public getStarts(): string { return this.starts; }
  public getEnds(): string { return this.ends; }
  public getIsPublic(): boolean { return this.isPublic; }
  public getBeingEdited() { return this.beingEdited; }
  public getBeingDuplicated() { return this.beingDuplicated; }
  public setBeingDuplicated(beingDuplicated: boolean) { this.beingDuplicated = beingDuplicated; }

  public getObserversId() { return this.observers; }
  public setObserversId(observersId: number[]) { this.observers = observersId; }
  public getObserversInstance() { return this.observersInstance; }
  public setObserversInstance(observersInstance: Observer[]) { this.observersInstance = observersInstance; }

  public getParticipantsId(): Array<number> { return this.participants; }
  public getParticipantsInstance() { return this.participantsInstace; }
  public setParticipantsInstance(participantsInstace: Participant[]) { this.participantsInstace = participantsInstace; }

  public getEventsId() { return this.events; }
  public getEventsInstance() { return this.eventsInstance; }
  public setEventsInstance(eventsInstance: Event[]) { this.eventsInstance = eventsInstance; }
  public removeEvent(eventId: number) {
    const eventIndex = this.events.findIndex(value => value === eventId);
    const eventInstancesIndex = this.eventsInstance.findIndex(value => value.getId() === eventId);

    this.events.splice(eventIndex, 1);
    this.eventsInstance.splice(eventInstancesIndex, 1);
  }
}
