import {
  AfterViewInit,
  Component,
  ComponentRef, 
  EventEmitter, 
  OnInit, Output, Renderer2,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {InterventionComponent} from './intervention/intervention.component';
import {HTMLInterventionElement, InterventionService} from './intervention.service';
import {NAVBAR_HEIGHT} from './navbar/navbar.component';



@Component({
  selector: 'esm-interventions',
  templateUrl: './interventions.component.html',
  styleUrls: ['./interventions.component.css']
})
export class InterventionsComponent implements OnInit, AfterViewInit {
  @Output() closeInterventions = new EventEmitter();
  
  //Vetor com todas a janelas que são criadas no canvas..
  interventionComponents: ComponentRef<InterventionComponent>[] = [];
  
  //Posição inicial janela..Usada no método de move..
  previousPosition: {x?: number, y?: number} = {};
  
  //Posição onde fica a janela..
  offset: {x: number, y: number} = {x: 0, y: 0};

  //Este modelo vai permitir que o componente seja criado e destruído de forma dinâmica no canvas -- atualizado para o angular 13...
  @ViewChild('container', { read: ViewContainerRef }) interventionsContainer!: ViewContainerRef; //{ createComponent: (arg0: ComponentFactory<InterventionComponent>) => ComponentRef<InterventionComponent>; };
  
  //Referência ao div onde fica o canvas..
  @ViewChild('main_div') mainDiv!: { nativeElement: any; };

  constructor(private interventionService: InterventionService, private renderer: Renderer2) { }

  get navbar_height() { return NAVBAR_HEIGHT; }

  closeEditor(event : any){
    this.closeInterventions.emit(event);
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);


    //Se inscreve para ser informado quando as intervenções estão prontas...
 
  }

  // representam as subscrições no canal..

  ngAfterViewInit(): void { 
    // I don't know why but there has to be a timeout here
    for (let i=1; i < this.interventionService.graphElements.length; i++){
      setTimeout((_ : any) => {
        this.createIntervention(this.interventionService.graphElements[i],i);
      }, 250);
    }
    this.interventionService.redrawGraph$.next();
    //this.interventionService.initGraph$.subscribe(_ => this.createInterventionsComponents());
    //Se inscreve para ser informada de novas intervenções 
    this.interventionService.newInterventions$.subscribe((add : any) => this.createIntervention(add.intervention, add.graphIndex));
    //Se inscreve para ser informada quando intervenções foram apagadas
    this.interventionService.removeIntervention$.subscribe(index => {
      this.interventionComponents[index - 1].destroy();
      this.interventionComponents.splice(index - 1, 1);
    });   

  }



  //Método que determina o tamanho da janela do canvas..
  resizeScreen() {
    var myModalEl = document.querySelector('#editorCanva');
    this.renderer.setStyle(this.mainDiv.nativeElement, 'width', `${myModalEl!.scrollWidth}px`);
    this.renderer.setStyle(this.mainDiv.nativeElement, 'height', `${myModalEl!.scrollHeight - NAVBAR_HEIGHT - 20}px`);
  }

  createIntervention(intervention: HTMLInterventionElement, graphIndex: number) {
    //Declara o objeto de intervention
    const interventionComponent: ComponentRef<InterventionComponent> = this.interventionsContainer.createComponent(InterventionComponent);  
    // 340.5 is the size of an intervention + a gap between. 50 is a arbitrary padding
    //interventionComponent.instance.offset = { x: 340.5 * this.interventionComponents.length + 50, y: 50 };
    // a posição do componente é definida no interventionservice..
    interventionComponent.instance.offset = { x: intervention.intervention._x, y: intervention.intervention._y};

    // Determina o conteúdo desta instância
    interventionComponent.instance.interventionCoordinate = intervention;
   
    //Marca a posição no vetor de intervenções
    interventionComponent.instance.graphIndex = graphIndex;
   
    //Subscreve para ser avisado quando a janela for movida..
    interventionComponent.instance.interventionMoved.subscribe(_ => this.resizeScreen());
    

    //Adiciona a janela com a intervenção no vetor janela de intervenções.. 
    this.interventionComponents.push(interventionComponent);

    //Tem que ter um Timeout para atualizar a janela.. não sei pq..
    setTimeout((_ : any) => {
      this.resizeScreen();
      this.interventionService.redrawGraph$.next();
      window.scrollTo({top: 50, left: 340.5 * this.interventionComponents.length + 50, behavior: 'smooth'});
    }, 250);
  }

  onMiddleClickDown(event: any) {
    if (event.buttons === 4) this.previousPosition = {x: event.clientX, y: event.clientY};
  }

  onMiddleClickUp(event: any) {
    if (event.buttons === 4) this.previousPosition = {};
  }

  MiddleClickScroll(event: any) {
    if (this.previousPosition.x !== undefined && this.previousPosition.y !== undefined && event.buttons === 4) {
      const currentPosition: {x: number, y: number} = {x: event.clientX, y: event.clientY};
      const amountMoved: {x: number, y: number} = {x: currentPosition.x - this.previousPosition.x, y: currentPosition.y - this.previousPosition.y};

      this.offset.x += amountMoved.x;
      this.offset.y += amountMoved.y;

      window.scrollBy({left: amountMoved.x * -1, top: amountMoved.y * -1});

      this.previousPosition = currentPosition;
    }
  }

  ngOnDestroy(): void {
    //https://ichi.pro/pt/como-criar-um-vazamento-de-memoria-no-angular-83941828037515
  }
}
