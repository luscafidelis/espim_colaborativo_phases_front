import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable()
export class DAOService2 {
    constructor(protected httpClient: HttpClient) {
    }

    getObjects(urlObject: string, parameters?: any): Observable<any> {
        //return this.httpClient.get(urlObject, {params: parameters});
        return this.httpClient.get<any>(urlObject,{params: parameters})
        .pipe(
          retry(1),
          catchError(this.httpError)
        )
    }

    getObject(urlObject: string, id: string): Observable<any> {
        //return this.httpClient.get(urlObject + `${id}/`);
        return this.httpClient.get<any>(urlObject + id + '/')
            .pipe(
                retry(2),
                catchError(this.httpError)
            );        
    }

    postObject(urlObject: string, object: any): Observable<any> {
        //return this.httpClient.post(urlObject, object);
        return this.httpClient.post<any>(urlObject, object)
        .pipe(
          retry(1),
          catchError(this.httpError)
        )
    }

    putObject(urlObject: string, object: any): Observable<any> {
        //return this.httpClient.put(urlObject + `${object.id}/`,  object);
        return this.httpClient.put<any>(urlObject + object.id + '/', object)
            .pipe(
                retry(1),
                catchError(this.httpError)
            );        
    }

    patchObject(urlObject: string, object: any): Observable<any> {
        //return this.httpClient.patch(urlObject + `${objectId}/`,  object);
        return this.httpClient.patch<any>(urlObject + object.id + '/', object)
        .pipe(
            retry(1),
            catchError(this.httpError)
        );      
    }

    deleteObject(urlObject: string, id: string) {
        //return this.httpClient.delete(`${urlObject}${id}/`);
        return this.httpClient.delete<any>(urlObject + id + '/')
        .pipe(
          retry(1),
          catchError(this.httpError)
        )
    }

    httpError(error) {
        let msg = '';
        if(error.error instanceof ErrorEvent) {
          // client side error
          msg = error.error.message;
        } else {
          // server side error
          msg = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        console.log(msg);
        return throwError(msg);
      }

}
