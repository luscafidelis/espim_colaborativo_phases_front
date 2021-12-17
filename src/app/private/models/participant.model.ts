export class Participant {
    public id: number;
    public name: string;
    public email: string;
    public phoneNumber: string;
    public profilePhotoUrl: string;
    public alias: string;

    constructor(participant?: any) {
        if (participant) {
          this.id = participant.id ? participant.id : null;
          this.name = participant.name ? participant.name : '';
          this.email = participant.email ? participant.email : '';
          this.phoneNumber = participant.phoneNumber ? participant.phoneNumber : '';
          this.profilePhotoUrl = participant.profilePhotoUrl ? participant.profilePhotoUrl : '';
          this.alias = participant.alias ? participant.alias : '';
        } else {
          this.id = null;
          this.name = '';
          this.email = '';
          this.phoneNumber = '';
          this.profilePhotoUrl = '';
          this.alias = '';
        }
    }

    public getId() { return this.id; }
    public getName() { return this.name; }
    public getEmail() { return this.email; }
    public getPhoneNumber() { return this.phoneNumber; }
    public getProfilePhotoUrl() { return this.profilePhotoUrl; }
    public getAlias() { return this.alias; }


}
