import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleLicenciaHid } from './detalle-licencia-hid';

describe('DetalleLicenciaHid', () => {
  let component: DetalleLicenciaHid;
  let fixture: ComponentFixture<DetalleLicenciaHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleLicenciaHid],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleLicenciaHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
