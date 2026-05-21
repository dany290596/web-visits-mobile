import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocPlantillaCredencial } from './autoc-plantilla-credencial';

describe('AutocPlantillaCredencial', () => {
  let component: AutocPlantillaCredencial;
  let fixture: ComponentFixture<AutocPlantillaCredencial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocPlantillaCredencial],
    }).compileComponents();

    fixture = TestBed.createComponent(AutocPlantillaCredencial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
