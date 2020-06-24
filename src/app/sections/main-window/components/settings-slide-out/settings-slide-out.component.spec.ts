import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsSlideOutComponent } from './settings-slide-out.component';

describe('SettingsSlideOutComponent', () => {
  let component: SettingsSlideOutComponent;
  let fixture: ComponentFixture<SettingsSlideOutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsSlideOutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsSlideOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
