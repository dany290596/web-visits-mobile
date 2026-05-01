import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentaCorreo } from './cuenta-correo';

describe('CuentaCorreo', () => {
  let component: CuentaCorreo;
  let fixture: ComponentFixture<CuentaCorreo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuentaCorreo],
    }).compileComponents();

    fixture = TestBed.createComponent(CuentaCorreo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
