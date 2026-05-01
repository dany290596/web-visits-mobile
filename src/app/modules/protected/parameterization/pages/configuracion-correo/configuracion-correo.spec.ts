import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionCorreo } from './configuracion-correo';

describe('ConfiguracionCorreo', () => {
  let component: ConfiguracionCorreo;
  let fixture: ComponentFixture<ConfiguracionCorreo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionCorreo],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracionCorreo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
