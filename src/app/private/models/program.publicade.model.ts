import { ExpertsProgramPublicade } from './experts.program.publicade.model';
import { Observer } from './observer.model';
import { Participant } from './participant.model';
import { PhasePublicade } from './phase.publicade.model';

export class  ProgramPublicade {
  public id: number;
  public title: string;
  public description: string;
  public starts: string;
  public ends: string;
  public is_active : boolean;
  public is_finished : boolean;
  public created_at : string;
  public modified_at : string;
  public beingDuplicated : boolean;
  
  // composed entities
  public owner: Observer;
  public expertsPublicade!:  ExpertsProgramPublicade[];
  public participants!: Participant[];
  public phasesPublicade! : PhasePublicade[];
  
  constructor(program: any = {}) {
    this.id = program.id || -1;
    this.title = program.title;
    this.description = program.description;
    this.starts = program.starts;
    this.ends = program.ends;
    this.is_active = program.is_active;
    this.is_finished = program.is_finished;
    this.created_at = program.created_at;
    this.modified_at = program.modified_at;
    this.beingDuplicated = false;
  
    // composed entities
    if (program.editor){ 
      this.owner = new Observer(program.editor) ;
    } else {
      this.owner = new Observer() ;
    }
    if (program.expertsPublicade) {
      this.expertsPublicade = program.expertsPublicade;
    } else {
      this.expertsPublicade = [];
    }
    if (program.participants){
      this.criaParticipants(program.participants);
    } else {
      this.participants = [];
    }
    if (program.phasesPublicade){
        this.phasesPublicade = program.phasesPublicade;
    } else {
        this.phasesPublicade = [];
    }
  }

  criaParticipants(dados : any[]){
    this.participants=[];
    for (let i=0; i < dados.length; i++) {
      this.participants.push(new Participant(dados[i]));
    }
  }
}