import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocEstado } from './autoc-estado';

describe('AutocEstado', () => {
  let component: AutocEstado;
  let fixture: ComponentFixture<AutocEstado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocEstado],
    }).compileComponents();

    fixture = TestBed.createComponent(AutocEstado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
