import { Component, OnInit } from '@angular/core';
import { DAOService } from 'src/app/private/dao/dao.service';
import { Program } from 'src/app/private/models/program.model';
import Swal from 'sweetalert2';
import { ProgramsAddService } from '../programsadd.service';

@Component({
  selector: 'app-step-publish',
  templateUrl: './step-publish.component.html'
})
export class StepPublishComponent implements OnInit {

  program : Program = new Program();
  
  constructor(private programAddService: ProgramsAddService, private dao : DAOService) { }

  ngOnInit(): void {
    this.program = this.programAddService.program;
    this.programAddService.getProgramObservable().subscribe((programInstance: Program) => this.program = programInstance);
  }

  createNewVersion(){
    Swal.fire({
      title: this.program.title,
      html: '<b>Criar uma nova versão de coleta de dados para o programa?</b>',
      showDenyButton: true,
      //showCancelButton: true,
      confirmButtonText: 'Criar',
      denyButtonText: 'Cancelar',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.dao.createProgramVersion(this.program).subscribe((volta : any) => {this.program.versions.push(volta)});
      } else if (result.isDenied) {
        Swal.fire('Criação da Versão Cancelada!!!', '', 'warning')
      }
    })
  }

}
