import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenciaHid } from './licencia-hid';

describe('LicenciaHid', () => {
  let component: LicenciaHid;
  let fixture: ComponentFixture<LicenciaHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenciaHid],
    }).compileComponents();

    fixture = TestBed.createComponent(LicenciaHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
