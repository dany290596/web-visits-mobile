import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarUsuarioHid } from './editar-usuario-hid';

describe('EditarUsuarioHid', () => {
  let component: EditarUsuarioHid;
  let fixture: ComponentFixture<EditarUsuarioHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarUsuarioHid],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarUsuarioHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
