import { Component, OnInit, Injectable, Input, ViewChild } from '@angular/core';
import { Program } from '../../models/program.model';
import { Pagination } from 'src/app/private/pagination/pagination.model';
import { ESPIM_REST_Programs } from 'src/app/app.api';
import { DAOService } from '../../dao/dao.service';
import {Router} from '@angular/router';
import Swal from 'sweetalert2';
import {faLock, faUsers, faEdit, faTrashAlt, faClone } from '@fortawesome/free-solid-svg-icons';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProgramsAddService } from '../add/programsadd.service';

@Component({
  selector: 'esm-particpants-list',
  templateUrl: './programlist.component.html'
})
@Injectable()
export class ProgramsListComponent implements OnInit {

  lock = faLock;
  users = faUsers;
  edit = faEdit;
  trash = faTrashAlt;
  clone = faClone;

  urlPrograms: string = ESPIM_REST_Programs;
  programs!: Program[];
  totalPrograms!: string;
  pagination!: Pagination;

  loading = false;

  // temp program stored for deleting program
  tempProgram!: Program;

  constructor(private dao: DAOService, private router: Router,  private spinner: NgxSpinnerService, private programService : ProgramsAddService) { }

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
  deleteProgram(program: Program) {
    if (program.beingDuplicated) return;
    Swal.fire({
      title: program.title,
      html: '<b>A deleção irá apagar todos os dados do programa, tem certeza que deseja "DELETAR" o programa? </b>',
      showDenyButton: true,
      //showCancelButton: true,
      confirmButtonText: 'Deletar',
      denyButtonText: 'Não Deletar',
      icon: 'warning'
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        Swal.fire('A Deleção de programas está temporariamente desabilitada', '', 'error')
        //this.dao.deleteObject(this.urlPrograms, program.id.toString()).subscribe(response => {
        //});
      } else if (result.isDenied) {
        Swal.fire('Cancelada a deleção do programa', '', 'info')
      }
    })
  }


  checkDuplication(program: Program) {
    if (!program.beingDuplicated) return;
    console.log('Requesting program');
    this.dao.getObject(ESPIM_REST_Programs, program.id.toString()).subscribe((dataIn2: any) => {
      console.log(`Response received\nBeingDuplicated: ${dataIn2.beingDuplicated}`);
      if (!dataIn2.beingDuplicated) this.getPrograms(`http://localhost:8000/programs/?page=${this.pagination.actualPage}`);
    });
    setTimeout(() => this.checkDuplication(program), 30000);
  }

  goToProgram(program: Program) {
    if (program.beingDuplicated) return;
    this.spinner.show();    
    //Irá navegar para a próxima página quando o programa estiver pronto..
    this.programService.getProgramObservable().subscribe((data:any) => {
      this.spinner.hide();      
      this.router.navigateByUrl('private/programs/add').then();
    });
    this.programService.setProgram(program.id);
  }

  createNewVersion(program : Program){
    Swal.fire({
      title: program.title,
      html: '<b>Criar uma nova versão de coleta de dados para o programa?</b>',
      showDenyButton: true,
      //showCancelButton: true,
      confirmButtonText: 'Criar',
      denyButtonText: 'Cancelar',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.dao.createProgramVersion(program).subscribe((volta : any) => {program.versions.push(volta)});
        
      } else if (result.isDenied) {
        Swal.fire('Cancelou!!!', '', 'warning')
      }
    })
  }

  duplicateProgram(program: Program) {
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
        this.dao.getObjects(ESPIM_REST_Programs + `${program.id.toString()}/duplicate/`).subscribe((data: any) => this.dao.getObject(ESPIM_REST_Programs, data.id.toString()).subscribe((dataIn : any) => {
          Swal.fire({ title: 'Duplicação realizada!',
            icon: 'success',
            text: 'Em caso de qualquer problema, reinicie a página'
          });
        }));
      }
    });
  }

}
