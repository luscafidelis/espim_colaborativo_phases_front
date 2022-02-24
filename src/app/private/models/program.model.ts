import { Observer } from './observer.model';
import { Participant } from './participant.model';
import { ActiveEvent, Event } from './event.model';
import { ChatMessage } from './chat.message.model';

export class  Program {
  public id: number;
  public title: string;
  public description: string;
  public starts: string;
  public ends: string;
  public updateDate: string;
  public hasPhases: boolean;
  public isPublic: boolean;
  public beingEdited: boolean;
  public beingDuplicated: boolean;

  // composed entities
  public editor: Observer;
  public observers:  Observer[];
  public participants: Participant[];
  public events: Event[];
  public chat_program: ChatMessage[];
  
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
  
    // composed entities
    if (program.editor){ 
      this.editor = new Observer(program.editor) ;
    } else {
      this.editor = new Observer() ;
    }
    if (program.observers) {
      this.criaObservers(program.observers);
    } else {
      this.observers = [];
    }
    if (program.participants){
      this.criaParticipants(program.participants);
    } else {
      this.participants = [];
    }
    if (program.events) {
      this.criaEvents(program.events);
    } else {
      this.events = [];
    }
    if (program.chat_program){
      this.criaChatMessage(program.chat_program);
    } else {
      this.chat_program = []
    }
  }

  criaObservers(dados : any[]){
    this.observers = [];
    for (let i=0; i < dados.length; i++) {
      this.observers.push(new Observer(dados[i]));
    }
     
  }

  criaParticipants(dados : any[]){
    this.participants=[];
    for (let i=0; i < dados.length; i++) {
      this.participants.push(new Participant(dados[i]));
    }
  }

  criaEvents(dados : any[]){
    this.events = [];
    for (let i=0; i < dados.length; i++) {
      if (dados[i].type == "active" ){
          this.events.push(new ActiveEvent(dados[i]));
      } else {
        this.events.push(new Event(dados[i]));
      }
    }
  }

  criaChatMessage(dados : any[]) {
    this.chat_program=[];
    for (let i=0; i < dados.length; i++) {
      this.chat_program.push(new ChatMessage(dados[i]));
    }
  }
}

