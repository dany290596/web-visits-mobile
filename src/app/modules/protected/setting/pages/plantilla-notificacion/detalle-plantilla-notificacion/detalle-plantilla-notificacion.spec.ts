import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePlantillaNotificacion } from './detalle-plantilla-notificacion';

describe('DetallePlantillaNotificacion', () => {
  let component: DetallePlantillaNotificacion;
  let fixture: ComponentFixture<DetallePlantillaNotificacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePlantillaNotificacion],
    }).compileComponents();

    fixture = TestBed.createComponent(DetallePlantillaNotificacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
