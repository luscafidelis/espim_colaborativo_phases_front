import { Component, OnInit, Injectable, Input, ViewChild } from '@angular/core';
import { Program } from '../../models/program.model';
import { Pagination } from 'src/app/private/pagination/pagination.model';
import { ESPIM_REST_Programs } from 'src/app/app.api';
import { DAOService } from '../../dao/dao.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import {Router} from '@angular/router';

@Component({
  selector: 'esm-particpants-list',
  templateUrl: './programlist.component.html'
})
@Injectable()
export class ProgramsListComponent implements OnInit {

  urlPrograms: string = ESPIM_REST_Programs;
  programs: Program[];
  totalPrograms: string;
  pagination: Pagination;

  loading = false;

  // sweet alert elements
  @ViewChild('swalDeleteProgram') private swalDeleteProgram: SwalComponent;
  @ViewChild('swalAfterDelete') private swalAfterDelete: SwalComponent;

  // temp program stored for deleting program
  tempProgram: Program;

  constructor(private dao: DAOService, private router: Router) { }

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

  onNext(event) {
    this.getPrograms(event.url);
  }

  onNextSearch(event) {
    this.setPrograms(event.response);
  }

  setPrograms(response) {
    this.totalPrograms = response.count;
    this.programs = response.results.map(responseIn => {
      const program = new Program(responseIn);
      if (program.beingDuplicated) this.checkDuplication(program);
      return program;
    });
    this.pagination = new Pagination(response);
  }

  // deleting a program from list
  deleteProgram(program: Program) {
    if (program.getBeingDuplicated()) return;
    this.tempProgram = program;
    this.swalDeleteProgram.show();
  }

  onConfirmDeleteProgram(event) {
    this.dao.deleteObject(this.urlPrograms, this.tempProgram.getId().toString()).subscribe(response => {
      this.swalAfterDelete.show();
      this.getPrograms();
    });
  }

  checkDuplication(program: Program) {
    if (!program.getBeingDuplicated()) return;
    console.log('Requesting program');
    this.dao.getObject(ESPIM_REST_Programs, program.getId().toString()).subscribe((dataIn2: any) => {
      console.log(`Response received\nBeingDuplicated: ${dataIn2.beingDuplicated}`);
      if (!dataIn2.beingDuplicated) this.getPrograms(`http://localhost:8000/programs/?page=${this.pagination.actualPage}`);
    });
    setTimeout(() => this.checkDuplication(program), 30000);
  }

  goToProgram(program: Program) {
    if (program.getBeingDuplicated()) return;
    this.router.navigate(['/private/programs/add', program.getId(), 'first']);
  }

  duplicateProgram(program: Program) {
    if (program.getBeingDuplicated()) return;

    new SwalComponent({
      title: 'Duplicar um programa',
      type: 'question',
      text: `Essa ação pode demorar muito tempo, deseja continuar? Você ainda poderá mexer em outros programas, entretanto a cópia somente será editável após o fim do processo.`,
      showCancelButton: true
    }).show().then(response => {
      if (response.value === true) {
        this.dao.getObjects(ESPIM_REST_Programs + `${program.getId().toString()}/duplicate/`).subscribe((data: any) => this.dao.getObject(ESPIM_REST_Programs, data.id.toString()).subscribe(dataIn => {
          this.getPrograms(`http://localhost:8000/programs/?page=${this.pagination.actualPage}`);

          new SwalComponent({
            title: 'Duplicação iniciada!',
            type: 'success',
            text: 'Em caso de qualquer problema, reinicie a página'
          }).show().then();
        }));
      }
    });
  }

}
