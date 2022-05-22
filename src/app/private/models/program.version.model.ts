import { Program } from "./program.model";

export class ProgramVersion extends Program {
    public version : number;
    public program : number;
    createDateTime : string;
    constructor (program: any = {}){
        super(program);
        this.version = program.version || -1;
        this.program = program.program || -1;
        this.createDateTime = program.createDateTime || '';
    }
}