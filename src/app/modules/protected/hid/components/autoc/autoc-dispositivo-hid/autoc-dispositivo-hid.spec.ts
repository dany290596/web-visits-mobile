import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocDispositivoHid } from './autoc-dispositivo-hid';

describe('AutocDispositivoHid', () => {
  let component: AutocDispositivoHid;
  let fixture: ComponentFixture<AutocDispositivoHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocDispositivoHid],
    }).compileComponents();

    fixture = TestBed.createComponent(AutocDispositivoHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
