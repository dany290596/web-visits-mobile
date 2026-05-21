import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarEmpresa } from './agregar-empresa';

describe('AgregarEmpresa', () => {
  let component: AgregarEmpresa;
  let fixture: ComponentFixture<AgregarEmpresa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarEmpresa],
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarEmpresa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
