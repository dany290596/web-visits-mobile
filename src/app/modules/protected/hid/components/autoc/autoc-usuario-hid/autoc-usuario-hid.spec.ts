import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocUsuarioHid } from './autoc-usuario-hid';

describe('AutocUsuarioHid', () => {
  let component: AutocUsuarioHid;
  let fixture: ComponentFixture<AutocUsuarioHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocUsuarioHid],
    }).compileComponents();

    fixture = TestBed.createComponent(AutocUsuarioHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
