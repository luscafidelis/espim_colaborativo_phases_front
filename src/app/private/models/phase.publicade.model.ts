import { ProgramVersion } from "./program.version.model";

//No primeiro sprint o inicio e fim serão datas...

export interface PhasePublicade {
    id : number;
    title : string;
    description : string;
    starts : string;
    ends : string;
    //participantCondition : string;
    //scheduleIntervalRule : string;
    programVersion : ProgramVersion;
}
