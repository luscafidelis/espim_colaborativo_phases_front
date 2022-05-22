import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DAOService } from '../../dao/dao.service';
import { ESPIM_REST_Editores, ESPIM_REST_Programs } from '../../../app.api';
import { ProgramsAddService } from './programsadd.service';
import { Program } from '../../models/program.model';
import {LoginService} from '../../../security/login/login.service';
import { ChannelService } from '../../channel_socket/socket.service';
import { SubSink } from 'subsink';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {faArrowRight, faArrowLeft,faFileImport } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'esm-programsadd',
  templateUrl: './programsadd.component.html'
})
export class ProgramsAddComponent implements OnInit, OnDestroy {

  firstFormGroup! : FormGroup;
  secondFormGroup! : FormGroup;
  thirdFormGroup! : FormGroup;
  fourthFormGroup! : FormGroup;
  fifthFormGroup! : FormGroup;
  sixthFormGroup! : FormGroup;

  isLinear : boolean = false;

  arrowRight = faArrowRight;
  arrowLeft = faArrowLeft;
  fileImport = faFileImport;

  id!: number;
  editor : number=0;

  constructor(private _formBuilder: FormBuilder, private programsService: ProgramsAddService, private dao: DAOService, private activatedRoute: ActivatedRoute, private loginService: LoginService, private canal : ChannelService) { }

  ngOnInit() {
    // Subscribes to route changes
    //this.subSink.sink = this.activatedRoute.paramMap.subscribe(paramMap => {
      // Gets the id in the url
      //this.id = Number.parseInt(paramMap.get('id') || '-1');
      //if (this.id !== -1 && this.id === this.programsService.program.id){
      //  return;
      //}
      //this.programsService.setProgram(this.id);
      //if (this.id !== -1){
      //this.ligaEditor();
      //}
    //});
    this.id = this.programsService.program.id;
    this.ligaEditor();
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
  }

  mostrar():boolean {
    //return this.programsService.program.id != -1;
    return false;
  }

  ngOnDestroy(){
    this.desligaEditor();
    this.programsService.program = new Program();
  }

  //Método para informar que está editando o programa
  ligaEditor(){
    let locEmail = this.loginService.getUser().email;
    let volta : any;
    volta = {model : 'editor', program : this.id, addEditor : locEmail};
    console.log("programa", this.id);
    this.dao.postObject(ESPIM_REST_Editores,{program : this.id, email : locEmail}).subscribe((data:any) => { this.editor = data.id;
                                                                                                             this.canal.sendMessage(volta);
                                                                                                            });
  }

  //Método para informar que parou de editar o programa
  desligaEditor(){
    let locEmail = this.loginService.getUser().email;
    let volta : any;
    volta = {model : 'editor', program : this.id, delEditor : locEmail};
    console.log(this.editor);
    if (this.editor !== 0){
      this.dao.deleteObject(ESPIM_REST_Editores,this.editor.toString()).subscribe((data : any) => { this.canal.sendMessage(volta);
                                                                                                  console.log('Desligou');})
    }
  }

}
