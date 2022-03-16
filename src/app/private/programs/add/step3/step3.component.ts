import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Participant } from '../../../models/participant.model';
import { ProgramsAddService } from '../programsadd.service';
import {DAOService} from '../../../dao/dao.service';
import {Program} from '../../../models/program.model';
import {ESPIM_REST_Participants} from '../../../../app.api';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import {faSearch} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'esm-step3',
  templateUrl: './step3.component.html'
})
export class Step3Component implements OnInit, OnDestroy {

  fasearch = faSearch;
  subSynk = new SubSink();

  participants: Participant[] = []; // These are the general participants
  programParticipants: Participant[] = []; // These are the participants of this program

  hasChanged = false; // True if some change was applied

  addParticipantForm: FormGroup = this.formBuilder.group({
    email: ['', Validators.required],
    name: ['', Validators.required],
    nickname: ['']
  });

  @ViewChild('alphabet1') alphabet1!: ElementRef;
  @ViewChild('alphabet2') alphabet2!: ElementRef;
  @ViewChild('alphabetAll') alphabetAll!: ElementRef;


  constructor(private dao: DAOService, private programAddService: ProgramsAddService, private formBuilder: FormBuilder) { }
  
  ngOnDestroy(): void {
    this.subSynk.unsubscribe();
  }

  /**
   * Checks if @participant is also in programParticipant
   * @param participant
   */
  isChecked(participant: Participant) { return !!(this.programParticipants ? this.programParticipants.find(value => value.id === participant.id) : undefined); }

  ngOnInit() {
    this.participants = this.programAddService.getParticipants();
    this.programParticipants = this.programAddService.getParticipantsInstance();

    /**
     * Subscribes to changes in the program (whenever the program in programsadd.service.ts is changed, it reflects here too)
     */
    this.subSynk.sink = this.programAddService.getProgramObservable().subscribe((programInstance: Program) => {
      this.participants = this.programAddService.getParticipants();
      this.programParticipants = this.programAddService.getParticipantsInstance();
    });
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
    this.programAddService.saveStep({addParticipant : locparticipant});
  }

  /**
   * Removes an participant from the programParticipants
   */
  removeProgramObserver(participantId: number) {
    //this.programParticipants.splice(this.programParticipants.findIndex((value: Participant) => value.id === participantId), 1);
    //this.hasChanged = true;
    this.programAddService.saveStep({delParticipant : participantId});
  }

  /**
   * Handles filtering observers by the alphabet
   * @param letter
   * @param event
   */
  filter_by(letter: string, event: any) {
    if (letter === '*') {
      this.participants = this.programAddService.getParticipants();
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
      this.participants = this.participants.concat(this.programAddService.getParticipants().filter((value: Participant) => value.name.startsWith(letter.toLowerCase()) || value.name.startsWith(letter.toUpperCase())));
      this.participants.sort((first: Participant, second: Participant) => first.name.localeCompare(second.name));
    }
  }

  /**
   * Handles searching observers by the alphabet
   * @param event
   */
  search_by(event: any) {
    this.participants = this.programAddService.getParticipants().filter((value: Participant) => value.name.includes(event.target.value));
  }

  submit(): void {
    //if (this.hasChanged){ 
    //  let participants_loc = {participants : this.programParticipants};
    //  this.programAddService.saveStep(participants_loc);
    //}
  }
}
