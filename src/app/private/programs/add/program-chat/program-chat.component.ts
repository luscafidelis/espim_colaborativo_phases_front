import { Component, OnDestroy, OnInit } from '@angular/core';
import { ESPIM_REST_Chat } from 'src/app/app.api';
import { ChannelService } from 'src/app/private/channel_socket/socket.service';
import { DAOService } from 'src/app/private/dao/dao.service';
import { ChatMessage } from 'src/app/private/models/chat.message.model';
import { Program } from 'src/app/private/models/program.model';
import { LoginService } from 'src/app/security/login/login.service';
import { ProgramsAddService } from '../programsadd.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'esm-program-chat',
  templateUrl: './program-chat.component.html'
})
export class ProgramChatComponent implements OnInit, OnDestroy {

  loc_messages : ChatMessage[] = [];
  
  status: boolean = true;

  message : string = '';

  subSink = new SubSink();

  
  
  constructor(private dao : DAOService, private loginService : LoginService,  private programService : ProgramsAddService,  private canal : ChannelService) { }  
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  clickEvent(){
      this.status = !this.status;       
  }

  sendMessage(){
    let user_message = this.loginService.getUser().name.substring(0,30);
    let program_message = this.programService.program.id;
    let date_time = new Date();
    let volta_dat : string = date_time.getDate().toString() + "/"  + (date_time.getMonth() +1).toString() + "/" + date_time.getFullYear().toString() + "-" + date_time.getHours().toString() + ':' + date_time.getMinutes().toString();
    let loc_message = new ChatMessage({day_message : volta_dat, user_message: user_message, message : this.message, program: program_message})
    this.subSink.sink = this.dao.postObject(ESPIM_REST_Chat,loc_message).subscribe((data:any) => {this.message = '';
                                                                              data.model = 'chat';
                                                                              this.canal.sendMessage(data)});
  }
  

  ngOnInit(): void {
    //Colocar a lista de mensagens...
    this.subSink.sink = this.programService.getProgramObservable().subscribe((data : any) => 
        { if (data.id != -1) {   
             this.subSink.sink = this.dao.getNewObject(ESPIM_REST_Chat,{idProgram : data.id}).subscribe ((data2 : any) => {this.loc_messages = data2})
         }});

    //Este observer será executado toda vez que o programa no programaddservice mudar
    //Nesta linha o service irá escutar o websocket..
    this.subSink.sink = this.canal.getData$.subscribe( (data : any) => { 
                                    let locdata = data.payload.message;
                                    if (locdata.program == this.programService.program.id && locdata.model == 'chat'){
                                      let locChat = new ChatMessage(locdata);
                                      this.loc_messages.push(locChat);
                                    }});
  }

  haveProgram():boolean{
    return (this.programService.program.id > 0)
  }

}
