import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { DAOService } from '../dao/dao.service';

@Injectable()
export class ObserversService extends DAOService {
    // TODO - Trazer as requests de observadores de programsadd.service.ts
    getObserverByEmail(urlObject: string, email: string) {
        const params = new HttpParams().set('search', email);
        return this.http.get(urlObject, {params });
    }

    authenticate(urlObject: string) {
        return this.http.post(urlObject, {});
    }

}
