import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GenericAuthComponent} from './generic-auth.component';

describe('GenericAuthComponent', () => {
  let component: GenericAuthComponent;
  let fixture: ComponentFixture<GenericAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericAuthComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GenericAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
