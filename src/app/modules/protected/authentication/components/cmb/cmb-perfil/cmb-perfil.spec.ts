import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmbPerfil } from './cmb-perfil';

describe('CmbPerfil', () => {
  let component: CmbPerfil;
  let fixture: ComponentFixture<CmbPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CmbPerfil],
    }).compileComponents();

    fixture = TestBed.createComponent(CmbPerfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
