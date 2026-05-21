import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleUsuarioHid } from './detalle-usuario-hid';

describe('DetalleUsuarioHid', () => {
  let component: DetalleUsuarioHid;
  let fixture: ComponentFixture<DetalleUsuarioHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleUsuarioHid],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleUsuarioHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
