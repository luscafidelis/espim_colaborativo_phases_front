import { Component, ComponentRef, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActiveEvent } from 'src/app/private/models/event.model';

@Component({
    selector: 'chatbot',
    templateUrl: './chatbot.component.html'
  })
  export class ChatbotComponent implements OnInit {
    @Input() event : ActiveEvent = new ActiveEvent();
    
    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }
}