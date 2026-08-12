import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarMobileSubmenu } from './navbar-mobile-submenu';

describe('NavbarMobileSubmenu', () => {
  let component: NavbarMobileSubmenu;
  let fixture: ComponentFixture<NavbarMobileSubmenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarMobileSubmenu],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarMobileSubmenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
