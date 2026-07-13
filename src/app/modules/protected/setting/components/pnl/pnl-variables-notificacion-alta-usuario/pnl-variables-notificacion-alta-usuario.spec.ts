import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PnlVariablesNotificacionAltaUsuario } from './pnl-variables-notificacion-alta-usuario';

describe('PnlVariablesNotificacionAltaUsuario', () => {
  let component: PnlVariablesNotificacionAltaUsuario;
  let fixture: ComponentFixture<PnlVariablesNotificacionAltaUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PnlVariablesNotificacionAltaUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(PnlVariablesNotificacionAltaUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
