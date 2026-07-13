import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPlantillaNotificacion } from './editar-plantilla-notificacion';

describe('EditarPlantillaNotificacion', () => {
  let component: EditarPlantillaNotificacion;
  let fixture: ComponentFixture<EditarPlantillaNotificacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPlantillaNotificacion],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarPlantillaNotificacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
