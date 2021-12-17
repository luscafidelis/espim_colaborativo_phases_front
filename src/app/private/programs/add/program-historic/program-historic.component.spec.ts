import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramHistoricComponent } from './program-historic.component';

describe('ProgramHistoricComponent', () => {
  let component: ProgramHistoricComponent;
  let fixture: ComponentFixture<ProgramHistoricComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramHistoricComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramHistoricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
