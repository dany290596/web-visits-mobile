import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantillaCredencial } from './plantilla-credencial';

describe('PlantillaCredencial', () => {
  let component: PlantillaCredencial;
  let fixture: ComponentFixture<PlantillaCredencial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantillaCredencial],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantillaCredencial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
