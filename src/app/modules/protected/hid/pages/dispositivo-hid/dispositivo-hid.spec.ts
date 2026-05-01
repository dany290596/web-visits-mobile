import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispositivoHid } from './dispositivo-hid';

describe('DispositivoHid', () => {
  let component: DispositivoHid;
  let fixture: ComponentFixture<DispositivoHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DispositivoHid],
    }).compileComponents();

    fixture = TestBed.createComponent(DispositivoHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
