import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Participant } from '../../../models/participant.model';
import {DAOService} from '../../../dao/dao.service';
import {ESPIM_REST_Participants} from '../../../../app.api';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import {faSearch, faCircleCheck, faCircleExclamation, faTrash, faEdit} from '@fortawesome/free-solid-svg-icons';
import { PublishService } from '../publish.service';


@Component({
  selector: 'app-publish-participants',
  templateUrl: './publish-participants.component.html'
})
export class PublishParticipantsComponent implements OnInit, OnDestroy {

  fatrash = faTrash;
  faedit = faEdit;
  facheck = faCircleCheck;
  faexclamation = faCircleExclamation;
  fasearch = faSearch;
  subSynk = new SubSink();

  participants: Participant[] = []; // These are the general participants
  programParticipants: Participant[] = []; // These are the participants of this program
  setParticipants : Participant [] = [];

  hasChanged = false; // True if some change was applied

  addParticipantForm: FormGroup = this.formBuilder.group({
    email: ['', Validators.required],
    name: ['', Validators.required],
    nickname: ['']
  });

  @ViewChild('alphabet1') alphabet1!: ElementRef;
  @ViewChild('alphabet2') alphabet2!: ElementRef;
  @ViewChild('alphabetAll') alphabetAll!: ElementRef;


  constructor(private dao: DAOService, private publishService: PublishService, private formBuilder: FormBuilder) { }
  
  ngOnDestroy(): void {
    this.subSynk.unsubscribe();
  }

  /**
   * Checks if @participant is also in programParticipant
   * @param participant
   */
  isChecked(participant: Participant) { return !!(this.programParticipants ? this.programParticipants.find(value => value.id === participant.id) : undefined); }

  ngOnInit() {
    this.programParticipants = this.publishService.program.participants;
    this.getParticipants()
    /**
     * Subscribes to changes in the program (whenever the program in programsadd.service.ts is changed, it reflects here too)
     */
    this.subSynk.sink = this.publishService.getProgramObservable().subscribe((programInstance: any) => {
      this.programParticipants = this.publishService.program.participants;
      this.getParticipants();
    });
  }

  getParticipants (){
    this.dao.getNewObject(ESPIM_REST_Participants,{}).subscribe( (data : any) =>   {this.participants = data; this.setParticipants = data});
  }

  /**
   * Adds an participant
   */
  addParticipant(): void {
    this.subSynk.sink = this.dao.postObject(ESPIM_REST_Participants, new Participant(this.addParticipantForm.getRawValue())).subscribe(data => {
      const participant = new Participant(data);
      //this.participants.push(participant);
      //this.participants.sort((a: Participant, b: Participant) => a.name.localeCompare(b.name));
      this.addProgramParticipant(participant);
      Swal.fire('Sucesso','Participante adicionado aos contatos!','success');
      this.addParticipantForm.reset();
    })
  }

  /**
   * Adds an participant to the programParticipants
   */
  addProgramParticipant(participant: Participant | number) {
    //Caso seja passado um número ao invés de um objeto..
    let locparticipant : any = {};
    if (!(participant instanceof Participant)) {
      locparticipant = this.participants.find((value: Participant) => value.id === participant);
    } else {
      locparticipant = participant;
    }
    //this.programParticipants.push(participant);
    //this.programParticipants.sort((a: Participant, b: Participant) => a.name.localeCompare(b.name));
    //this.hasChanged = true;
    this.publishService.saveStep({addParticipant : locparticipant});
  }

  /**
   * Removes an participant from the programParticipants
   */
  removeProgramObserver(participantId: number) {
    this.publishService.saveStep({delParticipant : participantId});
  }

  verifyCircle(loc_id : number): boolean {
    if (loc_id % 2 == 0){
      return true;
    } else {
      return false;
    }
  }
  

  submit(): void {
    //if (this.hasChanged){ 
    //  let participants_loc = {participants : this.programParticipants};
    //  this.programAddService.saveStep(participants_loc);
    //}
  }

  getSetParticipants():Participant[]{
    return this.setParticipants;
  }


  /**
   * Handles filtering observers by the alphabet
   * @param letter
   * @param event
   */
   filter_by(letter: string, event: any) {
    if (letter === '*') {
      this.participants = this.getSetParticipants();
      event.target.classList.add('btn-default-active');
      for (const button of this.alphabet1.nativeElement.children)
        button.classList.remove('btn-default-active');
      for (const button of this.alphabet2.nativeElement.children)
        button.classList.remove('btn-default-active');
      return;
    } else if (this.alphabetAll.nativeElement.classList.contains('btn-default-active')) {
      this.alphabetAll.nativeElement.classList.remove('btn-default-active');
      this.participants = new Array<Participant>();
    }
    if (event.target.classList.contains('btn-default-active')) {
      event.target.classList.remove('btn-default-active');
      this.participants = this.participants.filter((value: Participant) => !value.name.startsWith(letter.toLowerCase()) && !value.name.startsWith(letter.toUpperCase()));
    } else {
      event.target.classList.add('btn-default-active');
      this.participants = this.participants.concat(this.getSetParticipants().filter((value: Participant) => value.name.startsWith(letter.toLowerCase()) || value.name.startsWith(letter.toUpperCase())));
      this.participants.sort((first: Participant, second: Participant) => first.name.localeCompare(second.name));
    }
  }

}
