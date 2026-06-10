import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleDispositivoHid } from './detalle-dispositivo-hid';

describe('DetalleDispositivoHid', () => {
  let component: DetalleDispositivoHid;
  let fixture: ComponentFixture<DetalleDispositivoHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleDispositivoHid],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleDispositivoHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
