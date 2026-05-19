import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MselectTipoCredencialHid } from './mselect-tipo-credencial-hid';

describe('MselectTipoCredencialHid', () => {
  let component: MselectTipoCredencialHid;
  let fixture: ComponentFixture<MselectTipoCredencialHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MselectTipoCredencialHid],
    }).compileComponents();

    fixture = TestBed.createComponent(MselectTipoCredencialHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
