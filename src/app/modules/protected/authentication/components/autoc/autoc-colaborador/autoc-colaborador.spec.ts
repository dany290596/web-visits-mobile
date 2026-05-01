import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocColaborador } from './autoc-colaborador';

describe('AutocColaborador', () => {
  let component: AutocColaborador;
  let fixture: ComponentFixture<AutocColaborador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocColaborador],
    }).compileComponents();

    fixture = TestBed.createComponent(AutocColaborador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
