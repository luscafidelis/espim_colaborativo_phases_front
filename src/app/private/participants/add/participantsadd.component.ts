import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ESPIM_REST_Participants } from 'src/app/app.api';
import { Participant } from '../../models/participant.model';
import { DAOService } from '../../dao/dao.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'esm-participants-add',
  templateUrl: './participantsadd.component.html'
})
export class ParticipanstAddComponent implements OnInit {

  urlParticipants: string = ESPIM_REST_Participants;
  participantForm: FormGroup;
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
      alias: this._formBuilder.control('')
    });
    let id: string = this._activatedRoute.snapshot.params['id'];
    if (id) {
      this._daoService.getObject(this.urlParticipants, id).subscribe(response => {
        let participant = new Participant(response);
        this.participantForm.patchValue({ id: participant.getId() });
        this.participantForm.patchValue({ name: participant.getName() });
        this.participantForm.patchValue({ email: participant.getEmail(), disabled: true });
        this.participantForm.patchValue({ alias: participant.getAlias() });
        this.editing = true;
      });
    }
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

}
