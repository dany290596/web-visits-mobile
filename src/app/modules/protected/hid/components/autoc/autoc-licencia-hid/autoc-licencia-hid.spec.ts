import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocLicenciaHid } from './autoc-licencia-hid';

describe('AutocLicenciaHid', () => {
  let component: AutocLicenciaHid;
  let fixture: ComponentFixture<AutocLicenciaHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocLicenciaHid],
    }).compileComponents();

    fixture = TestBed.createComponent(AutocLicenciaHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
