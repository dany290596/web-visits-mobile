import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantillaCorreoHid } from './plantilla-correo-hid';

describe('PlantillaCorreoHid', () => {
  let component: PlantillaCorreoHid;
  let fixture: ComponentFixture<PlantillaCorreoHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantillaCorreoHid],
    }).compileComponents();

    fixture = TestBed.createComponent(PlantillaCorreoHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
