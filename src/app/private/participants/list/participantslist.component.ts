import { Component, OnInit, Injectable, Input, ViewChild } from '@angular/core';
import { Pagination } from 'src/app/private/pagination/pagination.model';
import { ESPIM_REST_Participants } from 'src/app/app.api';
import { DAOService } from '../../dao/dao.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Participant } from '../../models/participant.model';

@Component({
  selector: 'esm-particpants-list',
  templateUrl: './participantslist.component.html'
})
@Injectable()
export class ParticipantsListComponent implements OnInit {

  urlParticipants: string = ESPIM_REST_Participants;
  participants: Participant[];
  totalParticipants: string;
  pagination: Pagination;

  // sweet alert elements
  @ViewChild('swalDeleteParticipant') private swalDeleteParticipant: SwalComponent;
  @ViewChild('swalAfterDelete') private swalAfterDelete: SwalComponent;

  // temp program stored for deleting program
  tempParticipant: Participant;

  constructor(private daoService: DAOService) { }

  ngOnInit() {
    this.getParticipants();
  }

  getParticipants(url: string = this.urlParticipants) {
    this.daoService.getObjects(url).subscribe(
      response => {
        this.setParticipants(response);
      });
  }

  onNext(event) {
    this.getParticipants(event.url);
  }

  onNextSearch(event) {
    this.setParticipants(event.response);
  }

  setParticipants(response) {
    this.totalParticipants = response.count;
    this.participants = response.results.map(reponse => new Participant(reponse));
    this.pagination = new Pagination(response);
  }

  // deleting a program from list
  deleteParticipant(participant: Participant) {
    this.tempParticipant = participant;
    this.swalDeleteParticipant.show();
  }

  onConfirmDeleteParticipant(event) {
    this.daoService.deleteObject(this.urlParticipants, this.tempParticipant.getId().toString()).subscribe(response => {
      this.swalAfterDelete.show();
      this.getParticipants();
    });
  }
}
