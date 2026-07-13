import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocTipoPlantillaNotificacion } from './autoc-tipo-plantilla-notificacion';

describe('AutocTipoPlantillaNotificacion', () => {
  let component: AutocTipoPlantillaNotificacion;
  let fixture: ComponentFixture<AutocTipoPlantillaNotificacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocTipoPlantillaNotificacion],
    }).compileComponents();

    fixture = TestBed.createComponent(AutocTipoPlantillaNotificacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
