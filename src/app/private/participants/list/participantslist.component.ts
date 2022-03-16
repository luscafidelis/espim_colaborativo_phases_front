import { Component, OnInit, Injectable, Input, ViewChild } from '@angular/core';
import { Pagination } from 'src/app/private/pagination/pagination.model';
import { ESPIM_REST_Participants } from 'src/app/app.api';
import { DAOService } from '../../dao/dao.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Participant } from '../../models/participant.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'esm-particpants-list',
  templateUrl: './participantslist.component.html'
})
@Injectable()
export class ParticipantsListComponent implements OnInit {

  urlParticipants: string = ESPIM_REST_Participants;
  participants: Participant[] =[];
  totalParticipants: string = '';
  pagination!: Pagination;

  // temp program stored for deleting program
  tempParticipant: Participant = new Participant();

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

  onNext(event : any) {
    this.getParticipants(event.url);
  }

  onNextSearch(event : any) {
    this.setParticipants(event.response);
  }

  setParticipants(response : any) {
    this.totalParticipants = response.count;
    this.participants = response.results.map((reponse : any) => new Participant(reponse));
    this.pagination = new Pagination(response);
  }

  // deleting a program from list
  deleteParticipant(participant: Participant) {
    this.tempParticipant = participant;
    Swal.fire({
      title: 'Deletar Participante?',
      text: 'O participante será excluido de forma definitiva',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
    }).then((result) => {
      if (result.value) {
        this.onConfirmDeleteParticipant();
      } 
    });
  }

  onConfirmDeleteParticipant() {
    this.daoService.deleteObject(this.urlParticipants, this.tempParticipant.getId().toString()).subscribe(response => {
      Swal.fire('Participante Excluido', 'O participante foi excluído com sucesso', 'success');
      this.getParticipants();
    });
  }
}
