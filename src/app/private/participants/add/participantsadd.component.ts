import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ESPIM_REST_CircleTypes, ESPIM_REST_Participants } from 'src/app/app.api';
import { Participant } from '../../models/participant.model';
import { DAOService } from '../../dao/dao.service';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { CircleRelationship, CircleType } from '../../models/circle.model';

@Component({
  selector: 'esm-participants-add',
  templateUrl: './participantsadd.component.html'
})
export class ParticipanstAddComponent implements OnInit {

  list_type : CircleType[] = [];
  list_participant : Participant[] =[];


  urlParticipants: string = ESPIM_REST_Participants;
  participantForm: FormGroup;
  circuloForm:FormGroup;
  addParticipantForm : FormGroup;
  addCircleTypeForm : FormGroup;
  editing: boolean = false;

  //sweet alert elements
  @ViewChild('swalSaveSuccess') private swalSaveSuccess: SwalComponent;
  @ViewChild('swalSaveAndAddAnotherSuccess') private swalSaveAndAddAnotherSuccess: SwalComponent;

  constructor(private _daoService: DAOService, private _activatedRoute: ActivatedRoute, private _formBuilder: FormBuilder, private route: Router) { }

  ngOnInit() {
    this.participantForm = this._formBuilder.group({
      id: this._formBuilder.control(''),
      name: this._formBuilder.control('', [Validators.required]),
      email: this._formBuilder.control('', [Validators.required, Validators.email]),
      alias: this._formBuilder.control(''),
      circle : this._formBuilder.array([])
    });

    this.addParticipantForm = this._formBuilder.group({
      name: this._formBuilder.control('', [Validators.required]),
      email: this._formBuilder.control('', [Validators.required, Validators.email]),
      alias: this._formBuilder.control(''),
    });

    this.addCircleTypeForm = this._formBuilder.group({
      description : this._formBuilder.control('', [Validators.required])
    })

    let id: string = this._activatedRoute.snapshot.params['id'];
    if (id) {
      this._daoService.getObject(this.urlParticipants, id).subscribe(response => {
        console.log(response);
        let participant = new Participant(response);
        console.log(participant);
        this.participantForm.patchValue({ id: participant.getId() });
        this.participantForm.patchValue({ name: participant.getName() });
        this.participantForm.patchValue({ email: participant.getEmail(), disabled: true });
        this.participantForm.patchValue({ alias: participant.getAlias() });
        let circuloFormArray = this.participantForm.get('circle') as FormArray;
        for (let i=0;  i < participant.circle.length; i++){
          circuloFormArray.push(this._formBuilder.group({
            id : [participant.circle[i].id],
            id_target : [participant.circle[i].id_target], 
            id_type : [participant.circle[i].id_type,[Validators.required]],
            id_circle : [participant.circle[i].id_circle,[Validators.required]],
          }))
        }
        console.log(this.participantForm);
        this.editing = true;
      });
    }

    this._daoService.getNewObject(ESPIM_REST_Participants,{}).subscribe((data : any) => {this.list_participant = data} );
    this._daoService.getNewObject(ESPIM_REST_CircleTypes,{}).subscribe((data: any) => {this.list_type = data});

  }


  get circuloList(): FormArray {
    return this.participantForm.get('circle') as FormArray;
  }

  addCirculo(){
    this.circuloList.push(this._formBuilder.group({
      id : [''],
      id_type : ['',[Validators.required]],
      id_circle : ['',[Validators.required]]
    }));
  }

  removeCirculo(i : number) {
    this.circuloList.removeAt(i);
  }


  save(event) {
    if (this.participantForm.value.id) {
      this._daoService.putObject(this.urlParticipants, this.participantForm.value).subscribe(response => {
        this.swalSaveSuccess.show();

      });
    } else {
      this._daoService.postObject(this.urlParticipants, this.participantForm.value).subscribe(response => {
        this.swalSaveSuccess.show();
      });
    } 
  }

  onSaveSuccess(event) {
    this.route.navigate(['private/participants/list'])
  }

  saveAndAddAnother(event) {
    this._daoService.postObject(this.urlParticipants, this.participantForm.value).subscribe(response => {
      this.swalSaveAndAddAnotherSuccess.show();
    });
  }

  onSaveAndAddAnotherSuccess(event) {
    this.participantForm.patchValue({ id: '' }),
      this.participantForm.patchValue({ name: '' }),
      this.participantForm.patchValue({ email: '' }),
      this.participantForm.patchValue({ alias: '' })
  }

  /**
   * Métodos para cadastrar os círculos
   */

  addParticipant(){
    this._daoService.postObject(ESPIM_REST_Participants, new Participant(this.addParticipantForm.getRawValue())).subscribe(data => {
      const participant = new Participant(data);
      this.list_participant.push(participant);
      this.list_participant.sort((a: Participant, b: Participant) => a.name.localeCompare(b.name));
      new SwalComponent ({
        title: 'Participante adicionado aos contatos!',
        type: 'success'
      }).show();
      this.addParticipantForm.reset();
    }, error => new SwalComponent({
      title: 'Falha ao adicionar o contato',
      type: 'error'
    }).show());
  }

  addCircleType(){
    this._daoService.postObject(ESPIM_REST_CircleTypes, this.addCircleTypeForm.getRawValue()).subscribe((data : any) => {
      this.list_type.push(data);
      this.list_type.sort((a: CircleType, b: CircleType) => a.description.localeCompare(b.description));
      new SwalComponent ({
        title: 'Tipo de Círculo adicionado !',
        type: 'success'
      }).show();
      this.addParticipantForm.reset();
    }, error => new SwalComponent({
      title: 'Falha ao adicionar o contato',
      type: 'error'
    }).show());
  }

}
