import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarPlantillaNotificacion } from './agregar-plantilla-notificacion';

describe('AgregarPlantillaNotificacion', () => {
  let component: AgregarPlantillaNotificacion;
  let fixture: ComponentFixture<AgregarPlantillaNotificacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarPlantillaNotificacion],
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarPlantillaNotificacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
