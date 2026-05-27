import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearCredencialHid } from './crear-credencial-hid';

describe('CrearCredencialHid', () => {
  let component: CrearCredencialHid;
  let fixture: ComponentFixture<CrearCredencialHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearCredencialHid],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearCredencialHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
