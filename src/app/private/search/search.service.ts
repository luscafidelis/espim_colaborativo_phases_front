import { Injectable} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class SearchService {

    constructor(private http: HttpClient) { }

    objectsSearch(urlObject: string, search?: string, page: string = '1') {
        if (search) {
            return this.http.get(urlObject, { params: (new HttpParams()).append('search', search).append('page', page) });
        } else {
            return this.http.get(urlObject);
        }
    }
}
