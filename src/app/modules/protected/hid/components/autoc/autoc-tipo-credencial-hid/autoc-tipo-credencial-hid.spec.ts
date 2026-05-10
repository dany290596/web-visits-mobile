import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocTipoCredencialHid } from './autoc-tipo-credencial-hid';

describe('AutocTipoCredencialHid', () => {
  let component: AutocTipoCredencialHid;
  let fixture: ComponentFixture<AutocTipoCredencialHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocTipoCredencialHid],
    }).compileComponents();

    fixture = TestBed.createComponent(AutocTipoCredencialHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
