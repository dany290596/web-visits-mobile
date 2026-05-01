import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ResponsiveHelper } from '../app/shared/components/responsive-helper/responsive-helper';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ResponsiveHelper, NgxSonnerToaster],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('web-visits-mobile');

  private srvThemeService = inject(ThemeService);

  readonly toastTheme = computed(() =>
    this.srvThemeService.isDark ? 'dark' : 'light'
  );
}