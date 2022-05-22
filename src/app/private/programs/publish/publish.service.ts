import { Injectable } from '@angular/core';
import { AdditionalResource } from '../../models/program.model';
import { Observer } from '../../models/observer.model';
import { DAOService } from '../../dao/dao.service';
import {
  ESPIM_REST_AdditionalResource,
  ESPIM_REST_ExpertsProgramPublicade,
  ESPIM_REST_Observers,
  ESPIM_REST_Participants, ESPIM_REST_ProgramPublicade, ESPIM_REST_Programs 
} from '../../../app.api';
import { Subject } from 'rxjs';
import { LoginService } from '../../../security/login/login.service';
import { Participant } from '../../models/participant.model';
import { ChannelService } from '../../channel_socket/socket.service';
import { ProgramPublicade } from '../../models/program.publicade.model';
import { ExpertsProgramPublicade } from '../../models/experts.program.publicade.model';

@Injectable({
  providedIn: 'root'
})
export class PublishService {
  //Programa
  public program: ProgramPublicade = new ProgramPublicade();

  //Additional Resource
  public additionalResource : AdditionalResource[] = []

  //Verificar se foi iniciado ou não a lista de participantes e de observadores
  started : boolean = false;

  //Definir a sala que irá escutar no chat...
  sala : string = 'espim';

  //Criador do programa
  private owner! : Observer;

  //Observer usado para informar alterações no programa
  private programObservable$: Subject<ProgramPublicade> = new Subject<ProgramPublicade>();
  getProgramObservable(): Subject<ProgramPublicade> { return this.programObservable$; }

  constructor(private daoService: DAOService, private loginService: LoginService, private canal : ChannelService) { 
    this.daoService.getNewObject(ESPIM_REST_AdditionalResource, {id : 0}).subscribe((data : any ) => {this.additionalResource = data });
   }

  //--- Inicialização do programa na classe do service....
  setProgram(programId: number) {

    //Nesta linha o service irá escutar o websocket..
    this.canal.getData$.subscribe( data => this.updateProgram(data));
    //Conecta na sala que irá escutar...
    this.canal.init(this.sala);
    
    // If it null, sets the program to empty. Else, does a get request to get the program and then set it.
    if (programId !== -1){
      this.daoService.getObject(ESPIM_REST_Programs, programId.toString()).subscribe((data: any) => 
        { 
          console.log(data);
          this.program = new ProgramPublicade(data);
          this.programObservable$.next(this.program);
        }
      );
    } else {
      // Adds the current user as observer
      this.program = new ProgramPublicade({id: -1, title: 'Sem nome', description:  'Sem nome', starts: '',  ends: '', updateDate: '', 
                      is_active: false, is_finished: false, owner : undefined,
                      expertsPublicade:  [], participants: [], phasesPublicade: []});
      const userId = Number.parseInt(this.loginService.getUser().id);
      //Busca os dados do observador que está criando o programa no banco de dados
      this.daoService.getObject(ESPIM_REST_Observers,userId.toString()).subscribe(dataObs => {
        this.owner = new Observer(dataObs);
        //Cria um ExpertProgramPublicade para o owner
        this.daoService.postObject(ESPIM_REST_ExpertsProgramPublicade,{observer : this.owner.id, isObserver : true, isEvaluator: false, isMonitor : false}).subscribe( (dataExp: any) => {
          let loc_exp : ExpertsProgramPublicade = dataExp;
          console.log(dataExp);
          loc_exp.observer = new Observer(loc_exp.observer);
          this.program.expertsPublicade.push(loc_exp);
          this.program.owner = this.owner;
          //Cria um novo programa
          this.daoService.postObject(ESPIM_REST_ProgramPublicade, this.program).subscribe((program : any) => {
            this.program.id = program.id;
            this.programObservable$.next(this.program); 
          });
        });
      })
    }
  }    

  /**
   * Saves an step patching "programs". Patching results in updating the attributes specified in programs
   */
  codigoMensagem = 0;
  saveStep(dados:any = {}) {
    dados.id = this.program.id;
    this.listaObserver("antes de salvar no banco de dados");

    this.daoService.patchObject(ESPIM_REST_ProgramPublicade, dados).subscribe((data : any) => {
      //this.program = data;
      console.log(data);
      dados.model = 'programPublicade';
      this.codigoMensagem = Math.random();
      dados.codigoMensagem = this.codigoMensagem;
      this.canal.sendMessage(dados);
      //this.programObservable$.next(this.program); 
    });
  }

  listaObserver(metodo : string){
    console.log(metodo);
    for (let k=0; k < this.program.expertsPublicade.length; k++){
      console.log(this.program.expertsPublicade[k].observer.id);
    }
  }

  /**
   * Este método recebe as atualizações que são enviadas pelo canal e atualiza o programa 
   * que está em edição... Todas as atualizações são enviadas pelo canal..
   * 
   */
  //Serve para não deixar mensagens repetidas
  ultima : number = 0;
  updateProgram(data:any){
    let locdata = data.payload.message;
    if (locdata.codigoMensagem != this.ultima){
      this.ultima = locdata.codigoMensagem;
    } else {
      return;
    }
    if (locdata.model == 'programPublicade' && locdata.id == this.program.id ){
      for (let prop in locdata){
        if (prop != 'model' && prop != 'id'){
          switch (prop) {
            case 'addExpertPublicade': {
              let locExpert : ExpertsProgramPublicade =  locdata['addExpertPublicade'];
              locExpert.observer = new Observer (locExpert.observer);
              this.program.expertsPublicade.push(locExpert);
              break;
            }
            case 'delExpertPublicade':{
              let expertId = locdata['delExpertPublicade'];
              this.program.expertsPublicade.splice(this.program.expertsPublicade.findIndex((value: ExpertsProgramPublicade) => value.id === expertId), 1);
              this.listaObserver("depois de apagar o observador do vetor")
              break;
            }
            case 'addParticipant': {
              let locParticipant = new Participant(locdata['addParticipant']);
              this.program.participants.push(locParticipant);
              break;
            }              
            case 'delParticipant':{
              let participantId = locdata['delParticipant'];
              this.program.participants.splice(this.program.participants.findIndex((value: Participant) => value.id === participantId), 1);
              break;
            }              
            case 'updateExpertPublicade':{
              const expertInstancesIndex = this.program.expertsPublicade.findIndex(value => value.id === locdata[prop].id);
              this.program.expertsPublicade[expertInstancesIndex] = locdata[prop];
              this.program.expertsPublicade[expertInstancesIndex].observer = new Observer(this.program.expertsPublicade[expertInstancesIndex].observer);
              break;
            }              
            case 'title':{
              this.program.title = locdata[prop];
              break;              
            }
            case 'description':{
              this.program.description = locdata[prop];
              break;
            }              
            case 'starts':{
              this.program.starts = locdata[prop];
              break;
            }              
            case 'ends':{
              this.program.starts = locdata[prop];
              break;
            }              
          }
        }
      }
      this.programObservable$.next(this.program); 
      console.log(this.program);
    }
  }
}
