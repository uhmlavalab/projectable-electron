import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapWindowLayoutComponent } from './map-window-layout.component';

describe('MapWindowLayoutComponent', () => {
  let component: MapWindowLayoutComponent;
  let fixture: ComponentFixture<MapWindowLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapWindowLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapWindowLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
