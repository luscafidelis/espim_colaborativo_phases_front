import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observer} from '../../../models/observer.model';
import {Participant} from '../../../models/participant.model';

// This component is used on step2 & step3

@Component({
  selector: 'esm-user-checkbox',
  templateUrl: './user-checkbox.component.html'
})
export class UserCheckBoxComponent implements OnInit {

  @Input() user!: Observer | Participant;
  @Input() checked: boolean=false;
  @Input() disabled: boolean=false;

  @Output() removeUser = new EventEmitter<number>();
  @Output() addUser = new EventEmitter<number>();

  opcao : boolean = true;

  constructor() { 
    
  }

  ngOnInit() { }

  checkboxHandler() {
    if (!this.checked) {
      this.addUser.emit(this.user.id);
    }
    else  {
      this.removeUser.emit(this.user.id);
    }
  }

}
