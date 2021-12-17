import { Component, OnInit } from '@angular/core';
import { ESPIM_REST_Chat } from 'src/app/app.api';
import { ChannelService } from 'src/app/private/channel_socket/socket.service';
import { DAOService } from 'src/app/private/dao/dao.service';
import { ChatMessage } from 'src/app/private/models/chat.message.model';
import { Program } from 'src/app/private/models/program.model';
import { LoginService } from 'src/app/security/login/login.service';
import { ProgramsAddService } from '../programsadd.service';

@Component({
  selector: 'esm-program-chat',
  templateUrl: './program-chat.component.html',
  styleUrls: ['./program-chat.component.css']
})
export class ProgramChatComponent implements OnInit {

  loc_messages : ChatMessage[] = [];
  
  status: boolean = true;

  message : string = '';
  
  
  constructor(private dao : DAOService, private loginService : LoginService,  private programService : ProgramsAddService, channelService : ChannelService) { }  


  clickEvent(){
      this.status = !this.status;       
  }

  sendMessage(){
    let user_message = this.loginService.getUser().name.substring(0,30);
    let program_message = this.programService.program.id;
    let date_time = new Date();
    let volta_dat : string = date_time.getDate().toString() + "/"  + (date_time.getMonth() +1).toString() + "/" + date_time.getFullYear().toString() + "-" + date_time.getHours().toString() + ':' + date_time.getMinutes().toString();
    let loc_message = new ChatMessage({day_message : volta_dat, user_message: user_message, message : this.message, program: program_message})
    console.log(loc_message);
    this.dao.postObject(ESPIM_REST_Chat,loc_message).subscribe((data:any) => {this.message = '';
                                                                              this.loc_messages.push(data)});
  }
  

  ngOnInit(): void {
    //Este observer será executado toda vez que o programa no programaddservice mudar
    this.programService.getProgramObservable().subscribe( (program_ : Program) => {
      this.loc_messages = program_.chat_program;
      console.log(this.loc_messages);
    })
      //se conecta ao canal do chat daquele programa...
  }

  haveProgram():boolean{
    return (this.programService.program.id > 0)
  }

}
