import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocPerfil } from './autoc-perfil';

describe('AutocPerfil', () => {
  let component: AutocPerfil;
  let fixture: ComponentFixture<AutocPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocPerfil],
    }).compileComponents();

    fixture = TestBed.createComponent(AutocPerfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
