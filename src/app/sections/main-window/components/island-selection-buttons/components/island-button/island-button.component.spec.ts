import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IslandButtonComponent } from './island-button.component';

describe('IslandButtonComponent', () => {
  let component: IslandButtonComponent;
  let fixture: ComponentFixture<IslandButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IslandButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IslandButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
