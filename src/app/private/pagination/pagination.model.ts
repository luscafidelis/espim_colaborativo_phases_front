import { PAGE_SIZE } from 'src/app/app.api'
import { Parser } from 'src/app/util/util.model.parser';
export class Pagination {
    pageSize: number = PAGE_SIZE;

    count: number;
    next: string;
    actualPage: string;
    previous: string;

    constructor(pagination: any) {
        this.count = pagination['count'] ? pagination['count'] : 0;
        this.next = pagination['next'];
        this.previous = pagination['previous'];
        this.actualPage = this.next ? String((Number(new Parser().getUrlParams(this.next)['page'])) - 1) : this.previous ? new Parser().getUrlParams(this.previous)['page']? String(Number(new Parser().getUrlParams(this.previous)['page']) + 1): "2" : "1";
    }
}