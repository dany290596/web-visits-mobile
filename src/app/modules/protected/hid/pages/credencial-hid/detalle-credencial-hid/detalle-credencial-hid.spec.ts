import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCredencialHid } from './detalle-credencial-hid';

describe('DetalleCredencialHid', () => {
  let component: DetalleCredencialHid;
  let fixture: ComponentFixture<DetalleCredencialHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCredencialHid],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleCredencialHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
