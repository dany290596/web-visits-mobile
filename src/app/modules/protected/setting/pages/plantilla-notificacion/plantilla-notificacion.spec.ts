import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantillaNotificacion } from './plantilla-notificacion';

describe('PlantillaNotificacion', () => {
  let component: PlantillaNotificacion;
  let fixture: ComponentFixture<PlantillaNotificacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantillaNotificacion],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantillaNotificacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
