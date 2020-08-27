
import { Address } from './address.model';

export class Observer {
    private id: number;
    private name: string;
    private email: string;
    private phoneNumber: string;
    private profilePhotoUrl: string;
    private role: string;
    private about: string;
    private birthDate: Date;
    private schooling: string;
    private institution: string;
    private address: Address;

    constructor(observer: any) {
      this.id = observer.id;
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
