import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmbTipoUsuario } from './cmb-tipo-usuario';

describe('CmbTipoUsuario', () => {
  let component: CmbTipoUsuario;
  let fixture: ComponentFixture<CmbTipoUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CmbTipoUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(CmbTipoUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
