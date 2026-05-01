import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDynamicSkeleton } from './table-dynamic-skeleton';

describe('TableDynamicSkeleton', () => {
  let component: TableDynamicSkeleton;
  let fixture: ComponentFixture<TableDynamicSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableDynamicSkeleton],
    }).compileComponents();

    fixture = TestBed.createComponent(TableDynamicSkeleton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
