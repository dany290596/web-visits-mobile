import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarMenu } from './navbar-menu';

describe('NavbarMenu', () => {
  let component: NavbarMenu;
  let fixture: ComponentFixture<NavbarMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
