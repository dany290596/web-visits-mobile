import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarPerfil } from './agregar-perfil';

describe('AgregarPerfil', () => {
  let component: AgregarPerfil;
  let fixture: ComponentFixture<AgregarPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarPerfil],
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarPerfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
