import { Component, Input, OnInit } from '@angular/core';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ESPIM_REST_Phases } from 'src/app/app.api';
import { ChannelService } from 'src/app/private/channel_socket/socket.service';
import { DAOService } from 'src/app/private/dao/dao.service';
import Swal from 'sweetalert2';
import { ProgramsAddService } from '../../programsadd.service';

@Component({
  selector: 'esm-phases',
  templateUrl: './phases.component.html'
})
export class PhasesComponent implements OnInit {

  @Input() phase: any;

  isOpen = false;
  isAddPhase = false; // This is only true if this instance is gonna be the one to add

  constructor(private dao: DAOService, private programsAddService: ProgramsAddService, private canal : ChannelService) { }

  ngOnInit() {
    if (!this.phase) {
      this.resetPhase();
      this.isAddPhase = true;
    } else {
      this.phase = this.phase;
    }
    this.canal.getData$.subscribe( data => this.sincronizePhase(data));
  }

  resetPhase() {
    //this.phase = new Event();
    //this.phase.setTitle('Sem nome');
    //this.isAddPhase = true;
  }

    /**
 * Este método recebe as atualizações que são enviadas pelo canal e atualiza o programa 
 * que está em edição...
 */
  sincronizePhase(data:any){
    let locdata = data.payload.message;
    if (locdata.model == 'phase' && locdata.id == this.phase.id ){
      for (let prop in locdata){
        if (prop != 'model' && prop != 'id'){
        }
      }
    }
  }
 
  addPhase() {
    this.dao.postObject(ESPIM_REST_Phases, this.phase).subscribe((data : any) => {
        const event = new Event(data);
        this.programsAddService.saveStep({addEvent : event})
    });
  }

  delete_phase() {
    Swal.fire({
      title: 'Deletar evento?',
      text: `Você tem certeza que deseja deletar ${this.phase.getTitle()}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    }).then((result:any) => {
      if (result.isConfirmed) {
        this.programsAddService.saveStep({delEvent : this.phase.getId()});
      }
    });
  }

  updatePhase(phaseChanges: any) {
    phaseChanges.id = this.phase.getId();
    this.dao.patchObject(ESPIM_REST_Phases, phaseChanges).subscribe((data:any) => {
      phaseChanges.model = 'phase';
      this.canal.sendMessage(phaseChanges);
    } );
  }


}
