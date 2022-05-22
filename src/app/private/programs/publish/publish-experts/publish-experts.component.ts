import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { ESPIM_REST_ExpertsProgramPublicade, ESPIM_REST_Observers } from 'src/app/app.api';
import { DAOService } from 'src/app/private/dao/dao.service';
import { ExpertsProgramPublicade } from 'src/app/private/models/experts.program.publicade.model';
import { Observer } from 'src/app/private/models/observer.model';
import { ProgramPublicade } from 'src/app/private/models/program.publicade.model';
import { LoginService } from 'src/app/security/login/login.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { PublishService } from '../publish.service';

@Component({
  selector: 'app-publish-experts',
  templateUrl: './publish-experts.component.html'
})
export class PublishExpertsComponent implements OnInit, OnDestroy {

  subSynk = new SubSink();
  fa_search = faSearch;
  observers!: Observer[]; // These are the general observers
  setObservers! : Observer[];
  programObservers!: ExpertsProgramPublicade[]; // These are the observers of this program

  hasChanged = false; // True if some change was applied

  addObserverForm: FormGroup = this.formBuilder.group({
    email: ['', Validators.required],
    name: ['', Validators.required],
    role: ['']
  });

  @ViewChild('alphabet1') alphabet1!: ElementRef;
  @ViewChild('alphabet2') alphabet2!: ElementRef;
  @ViewChild('alphabetAll') alphabetAll!: ElementRef;


  constructor(private dao: DAOService, private programService: PublishService, private formBuilder: FormBuilder, private loginService: LoginService) {}
  
  
  ngOnDestroy(): void {
    this.subSynk.unsubscribe()
  }

  /**
   * Checks if @observer is also in programObservers
   * @param observer_id
   */
  isChecked(observer_id: number): boolean { 
    console.log(observer_id);
    for (let i =0; i < this.programObservers.length; i++){
      if (this.programObservers[i].observer.id == observer_id) {
        console.log(true);
        return true;
      }
    }
    console.log(false);
    return false;
  }  
  /**
   * Checks if @observer is the current user. If so, he shall not be able to deselect himself
   * @param observer_id
   */
  isDisabled(observer_id: number) { return observer_id === Number.parseInt(this.loginService.getUser().id); }

  ngOnInit() {
    this.getObservers ();
    this.programObservers = this.programService.program.expertsPublicade;
    /**
     * Subscribes to changes in the program (whenever the program in programsadd.service.ts is changed, it reflects here too)
     */
    this.subSynk.sink = this.programService.getProgramObservable().subscribe((programInstance: ProgramPublicade) => {
      //this.getObservers();
      this.programObservers = this.programService.program.expertsPublicade;
    });
  }

  getObservers (){
    this.dao.getNewObject(ESPIM_REST_Observers,{}).subscribe((data:any) => {this.observers = data; this.setObservers = data; });
  }

  getSetObservers(): Observer[] {
    return this.setObservers;
  }


  /**
   * Adds an observer
   */
  addObserver(): void {
    let observer = new Observer(this.addObserverForm.getRawValue());

    this.subSynk.sink = this.dao.postObject(ESPIM_REST_Observers, observer).subscribe(data => {
      observer = new Observer(data);
      console.log(observer);
      //this.observers.push(observer);
      //this.observers.sort((a: Observer, b: Observer) => a.name.localeCompare(b.name));
      this.addProgramObserver(observer);
      // Sends a success message
      Swal.fire ({title: 'Observador adicionado',text: 'Obsevador adicionado com sucesso!!', icon: 'success'});
      this.addObserverForm.reset();
    });
  }

  /**
   * Adds an observer to the programObservers
   */
  addProgramObserver(observer: Observer | number) {
    let locObserver = new Observer();
    if (!(observer instanceof Observer)) {
      for (let i=0; i < this.setObservers.length; i++){
        if (this.setObservers[i].id == observer){
          locObserver = this.setObservers[i];
        }
      }
    } else {
      locObserver = observer;
    }
    //Cria o ExpertsProgramPublicade
    this.dao.postObject(ESPIM_REST_ExpertsProgramPublicade,{observer: locObserver.id}).subscribe((data : any) => {
      let loc_exp : ExpertsProgramPublicade = data;
      loc_exp.observer = new Observer(loc_exp.observer);
      this.programService.saveStep({addExpertPublicade : data})
    })
  }

  /**
   * Removes an observer from the programObservers
   */
  removeProgramObserver(observerId: number) {
    //this.programObservers.splice(this.programObservers.findIndex((value: Observer) => value.id === observerId), 1);
    //this.hasChanged = true;
    this.programService.listaObserver("Antes de remover");
    let id_expert : number | undefined = -1;
    for (let i=0; i < this.programObservers.length; i++){
      if (this.programObservers[i].observer.id == observerId) {
          id_expert =  this.programObservers[i].id;
      }
    }
    if (id_expert != -1) {
      this.programService.saveStep({delExpertPublicade : id_expert})
    } else {
      Swal.fire("Problema na remoção do Especialista","Especialista não encontrado","error");
    }
  }

  /**
   * Handles filtering observers by the alphabet
   * @param letter
   * @param event
   */
  
  filter_by(letter: string, event: any) {
    if (letter === '*') {
      this.observers = this.getSetObservers();
      event.target.classList.add('btn-default-active');
      for (const button of this.alphabet1.nativeElement.children)
        button.classList.remove('btn-default-active');
      for (const button of this.alphabet2.nativeElement.children)
        button.classList.remove('btn-default-active');
      return;
    } else if (this.alphabetAll.nativeElement.classList.contains('btn-default-active')) {
      this.alphabetAll.nativeElement.classList.remove('btn-default-active');
      this.observers = new Array<Observer>();
    }
    if (event.target.classList.contains('btn-default-active')) {
        event.target.classList.remove('btn-default-active');
        this.observers = this.observers.filter((value: Observer) => !value.name.startsWith(letter.toLowerCase()) && !value.name.startsWith(letter.toUpperCase()));
      } else {
        event.target.classList.add('btn-default-active');
        this.observers = this.observers.concat(this.getSetObservers().filter((value: Observer) => value.name.startsWith(letter.toLowerCase()) || value.name.startsWith(letter.toUpperCase())));
        this.observers.sort((first: Observer, second: Observer) => first.name.localeCompare(second.name));
      }
  }
  
  /**
   * Handles searching observers by the alphabet
   * @param event
   */
  search_by(event: any) {
    this.observers = this.getSetObservers().filter((value: Observer) => value.name.includes(event.target.value));
  }

  submit(): void {
    if (this.hasChanged){ 
      let observers_loc = {observers : this.programObservers };
      this.programService.saveStep(observers_loc);
    }
  }
}
