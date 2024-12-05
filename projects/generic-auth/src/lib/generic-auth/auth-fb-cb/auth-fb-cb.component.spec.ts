import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthFbCbComponent } from './auth-fb-cb.component';

describe('AuthFbCbComponent', () => {
  let component: AuthFbCbComponent;
  let fixture: ComponentFixture<AuthFbCbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthFbCbComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthFbCbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
