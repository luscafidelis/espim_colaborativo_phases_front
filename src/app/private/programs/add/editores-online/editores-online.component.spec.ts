import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditoresOnlineComponent } from './editores-online.component';

describe('EditoresOnlineComponent', () => {
  let component: EditoresOnlineComponent;
  let fixture: ComponentFixture<EditoresOnlineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditoresOnlineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditoresOnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
