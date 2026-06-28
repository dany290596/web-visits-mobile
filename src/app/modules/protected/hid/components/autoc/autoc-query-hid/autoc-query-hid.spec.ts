import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocQueryHid } from './autoc-query-hid';

describe('AutocQueryHid', () => {
  let component: AutocQueryHid;
  let fixture: ComponentFixture<AutocQueryHid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocQueryHid],
    }).compileComponents();

    fixture = TestBed.createComponent(AutocQueryHid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
