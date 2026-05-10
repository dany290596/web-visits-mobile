import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePerfil } from './detalle-perfil';

describe('DetallePerfil', () => {
  let component: DetallePerfil;
  let fixture: ComponentFixture<DetallePerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePerfil],
    }).compileComponents();

    fixture = TestBed.createComponent(DetallePerfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
