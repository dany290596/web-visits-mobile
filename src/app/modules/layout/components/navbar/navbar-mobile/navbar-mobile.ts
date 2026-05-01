import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../../services/menu.service';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-navbar-mobile',
  imports: [NgClass, AngularSvgIconModule],
  templateUrl: './navbar-mobile.html',
  styleUrl: './navbar-mobile.css',
})
export class NavbarMobile implements OnInit {
  constructor(public menuService: MenuService) { }

  ngOnInit(): void { }

  public toggleMobileMenu(): void {
    this.menuService.showMobileMenu = false;
  }
}