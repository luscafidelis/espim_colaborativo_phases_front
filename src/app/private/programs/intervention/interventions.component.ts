import {
  AfterViewInit,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef, ElementRef, HostListener,
  OnInit, Renderer2,
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

  //Vetor com todas a janelas que são criadas no canvas..
  interventionComponents: ComponentRef<InterventionComponent>[] = [];
  
  //Posição inicial janela..Usada no método de move..
  previousPosition: {x?: number, y?: number} = {};
  
  //Posição onde fica a janela..
  offset: {x: number, y: number} = {x: 0, y: 0};

  //Esta linha cria uma variável chamada interventionsContainer que faz referência ao container do código HTML
  //Na criação de um componente no container será utilizado um ComponentFactory https://netbasal.com/dynamically-creating-components-with-angular-a7346f4a982d
  //Quando o componente for criado será retornando um componentRef https://angular.io/api/core/ComponentRef
  //Este modelo vai permitir que o componente seja criado e destruído de forma dinâmica no canvas
  @ViewChild('container', { read: ViewContainerRef }) interventionsContainer: { createComponent: (arg0: ComponentFactory<InterventionComponent>) => ComponentRef<InterventionComponent>; };
  
  //Referência ao div onde fica o canvas..
  @ViewChild('main_div') mainDiv: { nativeElement: any; };

  constructor(private interventionService: InterventionService, private renderer: Renderer2, private componentFactoryResolver: ComponentFactoryResolver) { }

  get navbar_height() { return NAVBAR_HEIGHT; }

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  ngAfterViewInit(): void {
    // I don't know why but there has to be a timeout here
    setTimeout(_ => {
      for (let i = 1; i < this.interventionService.graphElements.length; i++)
        this.createIntervention(this.interventionService.graphElements[i], i);
      this.interventionService.redrawGraph$.next();
    }, 0);
    //Se inscreve para ser informada de novas intervenções 
    this.interventionService.newInterventions$.subscribe((add) => this.createIntervention(add.intervention, add.graphIndex));
    //Se inscreve para ser informada quando intervenções foram apagadas
    this.interventionService.removeIntervention$.subscribe(index => {
      this.interventionComponents[index - 1].destroy();
      this.interventionComponents.splice(index - 1, 1);
    });
  }

  //Método que determina o tamanho da janela do canvas..
  resizeScreen() {
    this.renderer.setStyle(this.mainDiv.nativeElement, 'width', `${document.documentElement.scrollWidth}px`);
    this.renderer.setStyle(this.mainDiv.nativeElement, 'height', `${document.documentElement.scrollHeight - NAVBAR_HEIGHT - 20}px`);
  }

  createIntervention(intervention: HTMLInterventionElement, graphIndex: number) {
    //Declara o objeto de intervention
    const interventionComponent: ComponentRef<InterventionComponent> = this.interventionsContainer.createComponent(this.componentFactoryResolver.resolveComponentFactory(InterventionComponent));
    // 340.5 is the size of an intervention + a gap between. 50 is a arbitrary padding
    interventionComponent.instance.offset = { x: 340.5 * this.interventionComponents.length + 50, y: 50 };
   
    // Determina o conteúdo desta instância
    interventionComponent.instance.interventionCoordinate = intervention;
   
    //Marca a posição no vetor de intervenções
    interventionComponent.instance.graphIndex = graphIndex;
   
    //Subscreve para ser avisado quando a janela for movida..
    interventionComponent.instance.interventionMoved.subscribe(_ => this.resizeScreen());
   
    //Adiciona a janela com a intervenção no vetor janela de intervenções.. 
    this.interventionComponents.push(interventionComponent);

    //Tem que ter um Timeout para atualizar a janela.. não sei pq..
    setTimeout(_ => {
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
}
