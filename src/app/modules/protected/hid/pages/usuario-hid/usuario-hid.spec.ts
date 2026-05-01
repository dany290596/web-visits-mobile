import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioHid } from './usuario-hid';

describe('UsuarioHid', () => {
  let component: UsuarioHid;
  let fixture: ComponentFixture<UsuarioHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioHid],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
