import { animate, state, style, transition, trigger } from '@angular/animations';
import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ThemeService } from '../../../../../core/services/theme.service';
import { ClickOutsideDirective } from '../../../../../shared/directives/click-outside.directive';

import { StorageService } from '../../../../auth/services/storage.service';

@Component({
  selector: 'app-profile-menu',
  imports: [ClickOutsideDirective, NgClass, AngularSvgIconModule],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          opacity: 1,
          transform: 'translateY(0)',
          visibility: 'visible',
        }),
      ),
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'translateY(-20px)',
          visibility: 'hidden',
        }),
      ),
      transition('open => closed', [animate('0.2s')]),
      transition('closed => open', [animate('0.2s')]),
    ]),
  ],
  templateUrl: './profile-menu.html',
  styleUrl: './profile-menu.css',
})
export class ProfileMenu implements OnInit {
  private srvStorage = inject(StorageService);

  public isOpen = false;
  public profileMenu = [
    {
      id: '1519333a-8316-4f4e-96f7-3853edc3767e',
      title: 'Tu perfil',
      icon: './assets/icons/heroicons/outline/user-circle.svg',
      // link: '/profile',
    },
    {
      id: 'ff0bc3ae-84e8-4d64-89dc-65fbf703ffe5',
      title: 'Ajustes',
      icon: './assets/icons/heroicons/outline/cog-6-tooth.svg',
      // link: '/settings',
    },
    {
      id: 'f4f8b0d6-b3a5-4cd9-b61d-e1306db5cd03',
      title: 'Cerrar sesión',
      icon: './assets/icons/heroicons/outline/logout.svg',
      // link: '/auth',
    },
  ];

  public themeColors = [
    {
      name: 'base',
      code: '#e11d48',
    },
    {
      name: 'yellow',
      code: '#f59e0b',
    },
    {
      name: 'green',
      code: '#22c55e',
    },
    {
      name: 'blue',
      code: '#3b82f6',
    },
    {
      name: 'orange',
      code: '#ea580c',
    },
    {
      name: 'red',
      code: '#cc0022',
    },
    {
      name: 'violet',
      code: '#6d28d9',
    },
  ];

  public themeMode = ['light', 'dark'];
  public themeDirection = ['ltr', 'rtl'];

  constructor(public themeService: ThemeService) { }

  ngOnInit(): void { }

  public toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  toggleThemeMode() {
    this.themeService.theme.update((theme) => {
      const mode = !this.themeService.isDark ? 'dark' : 'light';
      return { ...theme, mode: mode };
    });
  }

  toggleThemeColor(color: string) {
    this.themeService.theme.update((theme) => {
      return { ...theme, color: color };
    });
  }

  setDirection(value: string) {
    this.themeService.theme.update((theme) => {
      return { ...theme, direction: value };
    });
  }

  optionProfileMenu(item: any) {
    if (item.id === 'f4f8b0d6-b3a5-4cd9-b61d-e1306db5cd03') {
      this.srvStorage.closeSession();
    }
  }
}