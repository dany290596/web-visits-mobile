import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDynamicSimple } from './table-dynamic-simple';

describe('TableDynamicSimple', () => {
  let component: TableDynamicSimple;
  let fixture: ComponentFixture<TableDynamicSimple>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableDynamicSimple],
    }).compileComponents();

    fixture = TestBed.createComponent(TableDynamicSimple);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
