import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HTMLInterventionElement, InterventionService} from '../intervention.service';
import {NAVBAR_HEIGHT} from '../navbar/navbar.component';

@Component({
  selector: 'esm-canvas',
  templateUrl: './canvas.component.html'
})
export class CanvasComponent implements OnInit, AfterViewInit {

  canvas: HTMLCanvasElement;

  @ViewChild('canvas') canvasRef: ElementRef;

  constructor(private interventionService: InterventionService) { }

  ngOnInit(): void {
    // this.interventionService.newInterventions$.subscribe((interventionElement: HTMLInterventionElement) => this.drawArrow(this.interventionService.lastIntervention, interventionElement));
    this.interventionService.redrawGraph$.subscribe(_ => this.drawAllArrows());
  }

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.resizeCanvas();
  }

  resizeCanvas() {
    this.canvasRef.nativeElement.width = document.documentElement.scrollWidth;
    this.canvasRef.nativeElement.height = document.documentElement.scrollHeight - NAVBAR_HEIGHT - 20;
    // Canvas get cleared automatically when resized
    // this.clearCanvas();
  }

  clearCanvas() {
    const ctx = this.canvas.getContext('2d');
    ctx.beginPath(); ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); ctx.stroke();
  }

  drawAllArrows() {
    this.resizeCanvas();

    // An array to keep control of which interventions had its arrows drew
    const already_drew: boolean[] = new Array<boolean>(this.interventionService.graphElements.length);
    // Here we make a BFS
    const queue: { intervention: number, orderPosition: number}[] = [];
    queue.push({ intervention: this.interventionService.firstIntervention, orderPosition: 1 });
    while (queue.length > 0) {
      const { intervention, orderPosition } = queue[0];
      queue.splice(0, 1);
      if (intervention === undefined || intervention === 0 || intervention === -1) continue;

      // Cycle on the BFS
      if (already_drew[intervention]) {
        this.interventionService.warnCycle(intervention);
        continue;
      }

      this.interventionService.graphElement(intervention).orderPosition = orderPosition;
      already_drew[intervention] = true;

      for (const destination of this.interventionService.interventionElementsGraph[intervention]){
        queue.push({intervention: destination, orderPosition: orderPosition + 1});
        this.drawArrow(this.interventionService.graphElement(intervention), this.interventionService.graphElement(destination), true);
      }

      this.interventionService.lastInteractedIntervention = intervention;
    }

    this.interventionService.hasMultiplePaths = false;

    let ascii: number = 'a'.charCodeAt(0);
    // Draws the remaining interventions which are not linked with the first one (skips index 1 since it is invalid)
    for (let i = 1; i < already_drew.length; i++)
      if (!already_drew[i]) {
        this.interventionService.hasMultiplePaths = true;
        // Sets orderPosition to a ascii number (negative means it is a character)
        this.interventionService.graphElement(i).orderPosition = ascii * -1;
        for (const destination of this.interventionService.interventionElementsGraph[i])
          this.drawArrow(this.interventionService.graphElement(i), this.interventionService.graphElement(destination), false);
        ascii++;
      }
  }

  drawArrow(origin: HTMLInterventionElement, destination: HTMLInterventionElement, main: boolean = true) {
    if (!origin || !destination) return;

    const x_difference = destination.x - origin.x, y_difference = destination.y -   origin.y;

    let arrow_origin: {x: number, y: number}, arrow_destination: {x: number, y: number};
    if (Math.abs(x_difference) > Math.abs(y_difference)) {
      arrow_origin = x_difference >= 0 ? origin.right : origin.left;
      arrow_destination = x_difference >= 0 ? destination.left : destination.right;
    }
    else if (Math.abs(x_difference) < Math.abs(y_difference)) {
      arrow_origin = y_difference >= 0 ? origin.bottom : origin.top;
      arrow_destination = y_difference >= 0 ? destination.top : destination.bottom;
    } else return;

    const ctx = this.canvas.getContext('2d');

    const sizeHead = 10;
    const angle = Math.atan2(y_difference, x_difference);
    ctx.beginPath();
    if (main) {
      ctx.strokeStyle = '#0a467f';
      ctx.lineWidth = 2;
    } else {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
    }
    ctx.moveTo(arrow_origin.x, arrow_origin.y);
    ctx.lineTo(arrow_destination.x, arrow_destination.y);
    ctx.lineTo(arrow_destination.x - sizeHead * Math.cos(angle - Math.PI / 6), arrow_destination.y - sizeHead * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(arrow_destination.x, arrow_destination.y);
    ctx.lineTo(arrow_destination.x - sizeHead * Math.cos(angle + Math.PI / 6), arrow_destination.y - sizeHead * Math.sin(angle + Math.PI / 6));

    ctx.stroke();
  }
}
