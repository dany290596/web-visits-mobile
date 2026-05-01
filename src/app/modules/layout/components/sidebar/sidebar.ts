import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import packageJson from '../../../../../../package.json';
import { MenuService } from '../../../layout/services/menu.service';
import { SidebarMenu } from './sidebar-menu/sidebar-menu';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, AngularSvgIconModule, SidebarMenu],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  public appJson: any = packageJson;

  constructor(public menuService: MenuService) { }

  ngOnInit(): void {
  }

  public toggleSidebar() {
    this.menuService.toggleSidebar();
  }
}