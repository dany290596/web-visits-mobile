import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarUsuarioHid } from './agregar-usuario-hid';

describe('AgregarUsuarioHid', () => {
  let component: AgregarUsuarioHid;
  let fixture: ComponentFixture<AgregarUsuarioHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarUsuarioHid],
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarUsuarioHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
