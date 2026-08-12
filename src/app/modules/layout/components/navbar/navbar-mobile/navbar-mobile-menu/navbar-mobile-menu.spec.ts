import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarMobileMenu } from './navbar-mobile-menu';

describe('NavbarMobileMenu', () => {
  let component: NavbarMobileMenu;
  let fixture: ComponentFixture<NavbarMobileMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarMobileMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarMobileMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
