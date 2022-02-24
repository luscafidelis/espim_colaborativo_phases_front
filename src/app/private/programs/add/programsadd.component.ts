import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DAOService } from '../../dao/dao.service';
import { ESPIM_REST_Editores, ESPIM_REST_Programs } from '../../../app.api';
import { ProgramsAddService } from './programsadd.service';
import { Program } from '../../models/program.model';
import {LoginService} from '../../../security/login/login.service';
import { ChannelService } from '../../channel_socket/socket.service';
import { SubSink } from 'subsink';


@Component({
  selector: 'esm-programsadd',
  templateUrl: './programsadd.component.html'
})
export class ProgramsAddComponent implements OnInit, OnDestroy {

  subSink = new SubSink();
  id: number;
  editor : number=0;

  constructor(private programsService: ProgramsAddService, private dao: DAOService, private activatedRoute: ActivatedRoute, private loginService: LoginService, private canal : ChannelService) { }

  ngOnInit() {
    // Subscribes to route changes
    this.subSink.sink = this.activatedRoute.paramMap.subscribe(paramMap => {
      // Gets the id in the url
      console.log("Passou no inicio");
      this.id = Number.parseInt(paramMap.get('id'));
      //if (this.id !== -1 && this.id === this.programsService.program.id){
      //  return;
      //}
      this.programsService.setProgram(this.id);
      if (this.id !== -1){
          this.ligaEditor();
      }
    });
  }

  mostrar():boolean {
    //return this.programsService.program.id != -1;
    return false;
  }

  ngOnDestroy(){
    this.desligaEditor();
    this.programsService.program = null;
    this.subSink.unsubscribe();

  }

  //Método para informar que está editando o programa
  ligaEditor(){
    let locEmail = this.loginService.getUser().email;
    let volta : any;
    volta = {model : 'editor', program : this.id, addEditor : locEmail};
    console.log("programa", this.id);
    this.subSink.sink = this.dao.postObject(ESPIM_REST_Editores,{program : this.id, email : locEmail}).subscribe((data:any) => {this.editor = data.id;
                                                                                                            console.log('Ligou');
                                                                                                            this.canal.sendMessage(volta);
    });
   
  }

  //Método para informar que parou de editar o programa
  desligaEditor(){
    let locEmail = this.loginService.getUser().email;
    let volta : any;
    volta = {model : 'editor', program : this.id, delEditor : locEmail};
    if (this.editor !== 0){
      this.subSink.sink = this.dao.deleteObject(ESPIM_REST_Editores,this.editor.toString()).subscribe((data : any) => { this.canal.sendMessage(volta);
                                                                                                  console.log('Desligou')})
    }
  }

}
