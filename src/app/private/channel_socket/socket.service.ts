import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
//https://rxjs-dev.firebaseapp.com/api/webSocket/webSocket
import { webSocket } from "rxjs/webSocket";
import { CHANNEL_URL } from 'src/app/app.api';
//import { LoginService } from '../security/login/login.service';

@Injectable({
    providedIn: 'root'
  })
export class ChannelService { 
    //Para avisar quando chegar algum dado...
    getData$: Subject<any> = new Subject<any>();
    
    subject : any;

    constructor(){ }

    init(room : string = "espim"){
        this.subject = webSocket(`${CHANNEL_URL}${room}/`); 
        this.subject.subscribe(
            (msg: any) => this.receber(msg),
            (err: any) => console.log(err), // Called if at any point WebSocket API signals some kind of error.
            () => console.log('complete') // Called when connection is closed (for whatever reason).
        );
    }

    receber(data : any){
        //if (data.message == 'guto'){
        //    console.log("Enviado por mim..");
        //} else {
            this.getData$.next(data);
        //}
    }

    //Fazer funcionar o socket..
    sendMessage(mensa : any = {}){
        this.subject.next({message: mensa, event : 'MOVE'});
    }

    closeConnection() {
        this.subject.close(1000, 'disconnect');
        this.subject = undefined;
      }
}

