import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {faArrowRight, faArrowLeft,faFileImport } from '@fortawesome/free-solid-svg-icons';
import { ProgramsAddService } from '../../add/programsadd.service';
import { DAOService } from 'src/app/private/dao/dao.service';
import { LoginService } from 'src/app/security/login/login.service';
import { ChannelService } from 'src/app/private/channel_socket/socket.service';

@Component({
  selector: 'app-publish-add',
  templateUrl: './publish-add.component.html'
})
export class PublishAddComponent implements OnInit {

  firstFormGroup! : FormGroup;
  secondFormGroup! : FormGroup;
  thirdFormGroup! : FormGroup;
  fourthFormGroup! : FormGroup;
  fifthFormGroup! : FormGroup;
  sixthFormGroup! : FormGroup;
  seventhFormGroup! : FormGroup;

  isLinear : boolean = false;

  arrowRight = faArrowRight;
  arrowLeft = faArrowLeft;
  fileImport = faFileImport;

  id!: number;
  editor : number=0;

  constructor(private _formBuilder: FormBuilder, private programsService: ProgramsAddService, private dao: DAOService, private activatedRoute: ActivatedRoute, private loginService: LoginService, private canal : ChannelService) { }

  ngOnInit() {
    this.id = this.programsService.program.id;

    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required],
    });
    this.thirdFormGroup = this._formBuilder.group({
      thirdCtrl: ['', Validators.required],
    });
    this.fourthFormGroup = this._formBuilder.group({
      fourthCtrl: ['', Validators.required],
    });
    this.fifthFormGroup = this._formBuilder.group({
      fifthCtrl: ['', Validators.required],
    });
    this.sixthFormGroup = this._formBuilder.group({
      sixtthCtrl: ['', Validators.required],
    });
    this.seventhFormGroup = this._formBuilder.group({
      seventhCtrl: ['', Validators.required],
    });

  }

  mostrar():boolean {
    //return this.programsService.program.id != -1;
    return false;
  }

}
