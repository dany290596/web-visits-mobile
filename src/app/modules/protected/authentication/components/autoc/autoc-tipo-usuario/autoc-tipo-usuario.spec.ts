import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocTipoUsuario } from './autoc-tipo-usuario';

describe('AutocTipoUsuario', () => {
  let component: AutocTipoUsuario;
  let fixture: ComponentFixture<AutocTipoUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocTipoUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(AutocTipoUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
