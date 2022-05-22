import { Component, OnInit } from '@angular/core';
import { faClone, faEdit, faLock, faTrashAlt, faUsers } from '@fortawesome/free-solid-svg-icons';
import {Router} from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ESPIM_REST_ProgramPublicade, ESPIM_REST_Programs } from 'src/app/app.api';
import { DAOService } from 'src/app/private/dao/dao.service';
import { ProgramPublicade } from 'src/app/private/models/program.publicade.model';
import { Pagination } from 'src/app/private/pagination/pagination.model';
import Swal from 'sweetalert2';
import { PublishService } from '../publish.service';


@Component({
  selector: 'app-publish-list',
  templateUrl: './publish-list.component.html'
})
export class PublishListComponent implements OnInit {

  lock = faLock;
  users = faUsers;
  edit = faEdit;
  trash = faTrashAlt;
  clone = faClone;

  urlPrograms: string = ESPIM_REST_ProgramPublicade;
  programs!: ProgramPublicade[];
  totalPrograms!: string;
  pagination!: Pagination;

  loading = false;

  // temp program stored for deleting program
  tempProgram!: ProgramPublicade;

  constructor(private dao: DAOService,  private spinner: NgxSpinnerService, private programService : PublishService, private router: Router) { }

  ngOnInit() {
    this.getPrograms();
  }

  getPrograms(url: string = this.urlPrograms) {
    this.loading = true;
    this.dao.getObjects(url).subscribe(
      response => {
        this.setPrograms(response);
        this.loading = false;
      });
  }

  onNext(event:any) {
    this.getPrograms(event.url);
  }

  onNextSearch(event:any) {
    this.setPrograms(event.response);
  }

  setPrograms(response:any) {
    this.totalPrograms = response.count;
    this.programs = response.results.map((responseIn:any) => {
      const program = responseIn;
      if (program.beingDuplicated) this.checkDuplication(program);
      return program;
    });
    console.log(this.programs);
    this.pagination = new Pagination(response);
  }

  // deleting a program from list
  deleteProgram(program: ProgramPublicade) {
    if (program.beingDuplicated) return;
    Swal.fire({
      title: program.title,
      html: '<b>A deleção irá apagar todos os dados da Coleta de Dados, inclusive respostas dos participantes, tem certeza que deseja "DELETAR" a Coleta de Dados? </b>',
      showDenyButton: true,
      //showCancelButton: true,
      confirmButtonText: 'Deletar',
      denyButtonText: 'Não Deletar',
      icon: 'warning'
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        Swal.fire('A Deleção está temporariamente desabilitada', '', 'error')
        //this.dao.deleteObject(this.urlPrograms, program.id.toString()).subscribe(response => {
        //});
      } else if (result.isDenied) {
        Swal.fire('Cancelada a deleção do programa', '', 'info')
      }
    })
  }


  checkDuplication(program: ProgramPublicade) {
    if (!program.beingDuplicated) return;
    console.log('Requesting program');
    this.dao.getObject(ESPIM_REST_Programs, program.id.toString()).subscribe((dataIn2: any) => {
      console.log(`Response received\nBeingDuplicated: ${dataIn2.beingDuplicated}`);
      if (!dataIn2.beingDuplicated) this.getPrograms(`http://localhost:8000/program-publicade/?page=${this.pagination.actualPage}`);
    });
    setTimeout(() => this.checkDuplication(program), 30000);
  }

  goToProgram(program: ProgramPublicade) {
    if (program.beingDuplicated) return;
    this.spinner.show();    
    //Irá navegar para a próxima página quando o programa estiver pronto..
    this.programService.getProgramObservable().subscribe((data:any) => {
      this.spinner.hide();      
      this.router.navigateByUrl('private/programs/add').then();
    });
    this.programService.setProgram(program.id);
  }


  duplicateProgram(program: ProgramPublicade) {
    if (program.beingDuplicated) return;
    Swal.fire({ title: 'Duplicar um programa',
      text: `Essa ação pode demorar muito tempo, deseja continuar? Você ainda poderá mexer em outros programas, entretanto a cópia somente será editável após o fim do processo.`,
      icon : 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, Copiar o programa'      
    }).then((response:any) => {
      if (response.isConfirmed) {
        this.dao.getObjects(ESPIM_REST_ProgramPublicade + `${program.id.toString()}/duplicate/`).subscribe((data: any) => this.dao.getObject(ESPIM_REST_ProgramPublicade, data.id.toString()).subscribe((dataIn : any) => {
          Swal.fire({ title: 'Duplicação realizada!',
            icon: 'success',
            text: 'Em caso de qualquer problema, reinicie a página'
          });
        }));
      }
    });
  }

}
