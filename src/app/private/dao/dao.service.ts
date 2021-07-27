import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DAOService {
    constructor(protected http: HttpClient) {
    }

    getObjects(urlObject: string, parameters?: any) {
        return this.http.get(urlObject, {params: parameters});
    }

    getObject(urlObject: string, id: string) {
        return this.http.get(urlObject + `${id}/`);
    }

    postObject(urlObject: string, object: any) {
        console.log('posted', object);
        console.log('url', urlObject);
        return this.http.post(urlObject, object);
    }

    putObject(urlObject: string, object: any) {
        return this.http.put(urlObject + `${object.id}/`,  object);
    }

    patchObject(urlObject: string, object: any) {
        const objectId = object.id;
        delete object.id;
        return this.http.patch(urlObject + `${objectId}/`,  object);
    }

    deleteObject(urlObject: string, id: string) {
        return this.http.delete(`${urlObject}${id}/`);
    }

}
