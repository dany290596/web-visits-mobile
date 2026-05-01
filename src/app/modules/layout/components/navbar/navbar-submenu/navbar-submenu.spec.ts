import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarSubmenu } from './navbar-submenu';

describe('NavbarSubmenu', () => {
  let component: NavbarSubmenu;
  let fixture: ComponentFixture<NavbarSubmenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarSubmenu],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarSubmenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
