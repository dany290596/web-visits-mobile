import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPlantillaCredencial } from './editar-plantilla-credencial';

describe('EditarPlantillaCredencial', () => {
  let component: EditarPlantillaCredencial;
  let fixture: ComponentFixture<EditarPlantillaCredencial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPlantillaCredencial],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarPlantillaCredencial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
