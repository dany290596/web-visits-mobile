import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarPlantillaCredencial } from './agregar-plantilla-credencial';

describe('AgregarPlantillaCredencial', () => {
  let component: AgregarPlantillaCredencial;
  let fixture: ComponentFixture<AgregarPlantillaCredencial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarPlantillaCredencial],
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarPlantillaCredencial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
