import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarUsuario } from './agregar-usuario';

describe('AgregarUsuario', () => {
  let component: AgregarUsuario;
  let fixture: ComponentFixture<AgregarUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
