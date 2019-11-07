import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondScreenPageComponent } from './second-screen-page.component';

describe('SecondScreenPageComponent', () => {
  let component: SecondScreenPageComponent;
  let fixture: ComponentFixture<SecondScreenPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecondScreenPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondScreenPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
