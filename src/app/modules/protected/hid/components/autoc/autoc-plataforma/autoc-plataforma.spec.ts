import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocPlataforma } from './autoc-plataforma';

describe('AutocPlataforma', () => {
  let component: AutocPlataforma;
  let fixture: ComponentFixture<AutocPlataforma>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocPlataforma],
    }).compileComponents();

    fixture = TestBed.createComponent(AutocPlataforma);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
