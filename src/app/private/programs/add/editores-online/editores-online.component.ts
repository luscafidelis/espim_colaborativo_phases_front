import { Component, OnInit } from '@angular/core';
import { ESPIM_REST_Editores } from 'src/app/app.api';
import { ChannelService } from 'src/app/private/channel_socket/socket.service';
import { DAOService } from 'src/app/private/dao/dao.service';
import { LoginService } from 'src/app/security/login/login.service';
import { ProgramsAddService } from '../programsadd.service';

@Component({
  selector: 'esm-editores-online',
  templateUrl: './editores-online.component.html'
})
export class EditoresOnlineComponent implements OnInit {

  editores : string[] = [];

  program : number;
  
  constructor(private canal : ChannelService, private loginService : LoginService, private programService : ProgramsAddService, private dao : DAOService ) { }

  ngOnInit(): void {
    //Este observer será executado toda vez que o programa no programaddservice mudar
    //Nesta linha o service irá escutar o websocket..
    this.canal.getData$.subscribe((data : any) => { 
      this.controlaEditores(data);
    });

    //Adiciona o edito no vetor de editores
    this.editores.push(this.loginService.getUser().email);
    this.programService.getProgramObservable().subscribe( (dataProgram : any) => {
        //Pega os editores que já estão no programa
        this.program = dataProgram.id;
        if (this.program != -1) {
          this.dao.getNewObject(ESPIM_REST_Editores,{idProgram : this.program}).subscribe((data : any) => {
            for (let locEditor of data){
              this.addEditor(locEditor.email);
            }
          })
        }
    });
  }

  controlaEditores(data: any){
    let locdata = data.payload.message;
    console.log(locdata);
    console.log(this.program);
    if (locdata.model == 'editor' && locdata.program == this.program){
      console.log('Passou aqui...');
      for (let prop in locdata){
        if (prop != 'model' && prop != 'program'){
          //Adicionar Editor
          if (prop == 'addEditor'){
            this.addEditor(locdata[prop]);
          } else {
            if (prop == 'delEditor'){
              this.delEditor(locdata[prop]);
            }
          }
        }
      }  
    }
  }

  addEditor(editor : string){
    let achou : boolean = false;
    for (let i =0; i < this.editores.length; i++){
      if (this.editores[i] == editor){
        achou = true;
      }
    }
    if (!achou){
      this.editores.push(editor);
    }
  }

  delEditor(editor : string){
    let pos : number = -1;
    for (let i =0; i < this.editores.length; i++){
      if (this.editores[i] == editor){
        pos = i;
      }
    }
    if (pos >= 0){
      this.editores.splice(pos,1);
    }
  }

}
