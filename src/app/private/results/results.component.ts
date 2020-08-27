import { Component, OnInit } from '@angular/core';
import {Program} from '../models/program.model';
import {Pagination} from '../pagination/pagination.model';
import {DAOService} from '../dao/dao.service';
import {ESPIM_REST_Programs} from '../../app.api';

@Component({
  selector: 'esm-results',
  templateUrl: './results.component.html'
})
export class ResultsComponent implements OnInit {

  programs: Program[];
  pagination: Pagination;

  constructor(private dao: DAOService) { }

  ngOnInit() {
    this.getPrograms();
  }

  getPrograms(url: string = ESPIM_REST_Programs) {
    this.dao.getObjects(url).subscribe(data => {
      this.setPrograms(data);
    });
  }

  setPrograms(response) {
    this.programs = response.results.map(reponse => new Program(reponse));
    this.pagination = new Pagination(response);
  }

  onNext(event) {
    this.getPrograms(event.url);
  }

}
