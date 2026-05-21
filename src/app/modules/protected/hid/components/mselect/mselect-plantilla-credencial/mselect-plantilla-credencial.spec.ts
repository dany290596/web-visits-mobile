import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MselectPlantillaCredencial } from './mselect-plantilla-credencial';

describe('MselectPlantillaCredencial', () => {
  let component: MselectPlantillaCredencial;
  let fixture: ComponentFixture<MselectPlantillaCredencial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MselectPlantillaCredencial],
    }).compileComponents();

    fixture = TestBed.createComponent(MselectPlantillaCredencial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
