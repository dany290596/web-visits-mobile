import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PnlEditorPlantilla } from './pnl-editor-plantilla';

describe('PnlEditorPlantilla', () => {
  let component: PnlEditorPlantilla;
  let fixture: ComponentFixture<PnlEditorPlantilla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PnlEditorPlantilla],
    }).compileComponents();

    fixture = TestBed.createComponent(PnlEditorPlantilla);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
