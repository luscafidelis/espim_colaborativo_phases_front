export class Address {
    private id: string;
    private address: string;
    private addressNumber: string;
    private addressComplement: string;
    private cep: string;
    private state: string;
    private city: string;
    private country: string;
    
    constructor(address?: any) {
        this.id = address.id ? address.id : "";
        this.address = address.address ? address.address : "";
        this.addressNumber = address.addressNumber ? address.addressNumber : "";
        this.addressComplement = address.addressComplement ? address.addressComplement : "";
        this.cep = address.cep ? address.cep : "";
        this.state = address.state ? address.state : "";
        this.city = address.city ? address.city : "";
        this.country = address.country ? address.country : "";
    }

    public getId() { return this.id }
    public getAddress() { return this.address }
    public getAddressNumber() { return this.addressNumber }
    public getAddressComplement() { return this.addressComplement }
    public getCEP() { return this.cep }
    public getState() { return this.state }
    public getCity() { return this.city }
    public getCountry() { return this.country }

}