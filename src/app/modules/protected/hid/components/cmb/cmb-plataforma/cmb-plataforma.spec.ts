import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmbPlataforma } from './cmb-plataforma';

describe('CmbPlataforma', () => {
  let component: CmbPlataforma;
  let fixture: ComponentFixture<CmbPlataforma>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CmbPlataforma],
    }).compileComponents();

    fixture = TestBed.createComponent(CmbPlataforma);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
