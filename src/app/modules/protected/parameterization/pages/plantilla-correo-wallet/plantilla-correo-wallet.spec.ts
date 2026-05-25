import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantillaCorreoWallet } from './plantilla-correo-wallet';

describe('PlantillaCorreoWallet', () => {
  let component: PlantillaCorreoWallet;
  let fixture: ComponentFixture<PlantillaCorreoWallet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantillaCorreoWallet],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantillaCorreoWallet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
