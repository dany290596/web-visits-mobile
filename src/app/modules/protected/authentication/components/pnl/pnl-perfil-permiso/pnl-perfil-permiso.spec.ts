import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PnlPerfilPermiso } from './pnl-perfil-permiso';

describe('PnlPerfilPermiso', () => {
  let component: PnlPerfilPermiso;
  let fixture: ComponentFixture<PnlPerfilPermiso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PnlPerfilPermiso],
    }).compileComponents();

    fixture = TestBed.createComponent(PnlPerfilPermiso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
