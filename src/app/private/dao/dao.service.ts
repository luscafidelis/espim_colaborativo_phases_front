import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Program } from '../models/program.model';
import { ESPIM_REST_Programs } from 'src/app/app.api';

@Injectable()
export class DAOService {
    constructor(protected http: HttpClient) {
    }

    getObjects(urlObject: string, parameters?: any) {
        if (parameters){
            let parameters_ = new HttpParams().set('params', parameters)
            return this.http.get(urlObject, {params: parameters_});
        } else {
            return this.http.get(urlObject);
        }
    }

    getObject(urlObject: string, id: string) {
        return this.http.get(urlObject + `${id}/`);
    }

    postObject(urlObject: string, object: any) {
        //console.log('posted', object);
        //console.log('url', urlObject);
        return this.http.post(urlObject, object);
    }

    putObject(urlObject: string, object: any) {
        return this.http.put(urlObject + `${object.id}/`,  object);
    }

    patchObject(urlObject: string, object: any) {
        const objectId = object.id;
        //delete object.id;
        console.log(object);
        return this.http.patch(urlObject + `${objectId}/`,  object);
    }

    deleteObject(urlObject: string, id: string) {
        return this.http.delete(`${urlObject}${id}/`);
    }

    //O objeto no getNew deve estar de acordo com o objeto no backend referente ao model que está sendo acessado..
    getNewObject(urlObject: string, object: any) {
        return this.http.post(urlObject + '1/get_new/', object);
    }

    //
    createProgramVersion(program: Program){
        console.log(program)
        return this.http.post(ESPIM_REST_Programs + program.id.toString()  + '/create_version/', {program : program.id});
    }

}
