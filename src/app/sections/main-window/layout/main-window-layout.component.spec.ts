import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainWindowLayoutComponent } from './main-window-layout.component';

describe('MainWindowLayoutComponent', () => {
  let component: MainWindowLayoutComponent;
  let fixture: ComponentFixture<MainWindowLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainWindowLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainWindowLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
