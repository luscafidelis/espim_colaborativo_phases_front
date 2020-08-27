import {Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges} from '@angular/core';
import { Pagination } from './pagination.model';


@Component({
  selector: 'esm-pagination',
  templateUrl: './pagination.component.html'
})
export class PaginationComponent implements OnInit, OnChanges {

  @Input() pagination: Pagination;
  @Output() next = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.pagination = changes.pagination.currentValue;
  }

  getByPaginationURL(url?: any) {
    this.next.emit({ url });
  }

}
