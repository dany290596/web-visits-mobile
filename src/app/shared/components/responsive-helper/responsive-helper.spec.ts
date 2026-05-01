import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsiveHelper } from './responsive-helper';

describe('ResponsiveHelper', () => {
  let component: ResponsiveHelper;
  let fixture: ComponentFixture<ResponsiveHelper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponsiveHelper],
    }).compileComponents();

    fixture = TestBed.createComponent(ResponsiveHelper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
