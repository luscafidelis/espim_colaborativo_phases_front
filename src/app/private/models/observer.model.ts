
import { Address } from './address.model';

export class Observer {
    public id: number;
    public name: string;
    public email: string;
    public phoneNumber: string;
    public profilePhotoUrl: string;
    public role: string;
    public about: string;
    public birthDate: Date;
    public schooling: string;
    public institution: string;
    public address: Address;

    constructor(observer: any = {}) {
      this.id = observer.id || -1;
      this.name = observer.name;
      this.email = observer.email;
      this.phoneNumber = observer.phoneNumber;
      this.profilePhotoUrl = observer.profilePhotoUrl;
      this.role = observer.role;
      this.about = observer.about;
      this.birthDate = observer.birthDate;
      this.schooling = observer.schooling;
      this.institution = observer.institution;
      this.address = observer.address;
    }

    public getId() { return this.id; }
    public getName() { return this.name; }
    public getEmail() { return this.email; }
    public getPhoneNumber() { return this.phoneNumber; }
    public getProfilePhotoUrl() { return this.profilePhotoUrl; }
    public getRole() { return this.role; }
    public getAbout() { return this.about; }
    public getBirthDate(): Date { return this.birthDate; }
    public getSchooling() { return this.schooling; }
    public getInstitution() { return this.institution; }
    public getAddress() { return this.address; }

}
