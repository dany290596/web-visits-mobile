import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionHid } from './configuracion-hid';

describe('ConfiguracionHid', () => {
  let component: ConfiguracionHid;
  let fixture: ComponentFixture<ConfiguracionHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionHid],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracionHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
