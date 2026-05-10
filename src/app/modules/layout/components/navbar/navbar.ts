import { Component, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MenuService } from '../../services/menu.service';
// import { NavbarMenu } from './navbar-menu/navbar-menu';
import { NavbarMobile } from './navbar-mobile/navbar-mobile';
import { ProfileMenu } from './profile-menu/profile-menu';

@Component({
  selector: 'app-navbar',
  imports: [AngularSvgIconModule, ProfileMenu, NavbarMobile],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  constructor(
    private menuService: MenuService
  ) { }

  ngOnInit(): void { }

  public toggleMobileMenu(): void {
    this.menuService.showMobileMenu = true;
  }
}