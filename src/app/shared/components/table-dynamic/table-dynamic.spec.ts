import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDynamic } from './table-dynamic';

describe('TableDynamic', () => {
  let component: TableDynamic;
  let fixture: ComponentFixture<TableDynamic>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableDynamic],
    }).compileComponents();

    fixture = TestBed.createComponent(TableDynamic);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
