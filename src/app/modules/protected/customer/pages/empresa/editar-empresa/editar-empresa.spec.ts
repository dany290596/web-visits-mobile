import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEmpresa } from './editar-empresa';

describe('EditarEmpresa', () => {
  let component: EditarEmpresa;
  let fixture: ComponentFixture<EditarEmpresa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarEmpresa],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarEmpresa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
