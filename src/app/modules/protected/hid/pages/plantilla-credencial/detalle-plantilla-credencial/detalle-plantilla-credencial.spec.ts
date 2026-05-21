import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePlantillaCredencial } from './detalle-plantilla-credencial';

describe('DetallePlantillaCredencial', () => {
  let component: DetallePlantillaCredencial;
  let fixture: ComponentFixture<DetallePlantillaCredencial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePlantillaCredencial],
    }).compileComponents();

    fixture = TestBed.createComponent(DetallePlantillaCredencial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
