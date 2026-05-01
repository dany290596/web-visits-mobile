import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CredencialHid } from './credencial-hid';

describe('CredencialHid', () => {
  let component: CredencialHid;
  let fixture: ComponentFixture<CredencialHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CredencialHid],
    }).compileComponents();

    fixture = TestBed.createComponent(CredencialHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
