import { Component, inject, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';
import { Navbar } from './components/navbar/navbar';
import { Sidebar } from './components/sidebar/sidebar';

import { MenuService } from '../layout/services/menu.service';
import { MenuAppService } from '../../shared/services/menu-app.service';
import { StorageService } from '../../modules/auth/services/storage.service';
import { PermisoService } from '../protected/authentication/services/permiso.service';

import { IMenuFilter } from '../../shared/interfaces/menu-app.interface';
import { MenuItem, SubMenuItem } from '../../core/models/menu.model';
import { IMenu } from '../../shared/interfaces/menu-app.interface';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Sidebar, Navbar, RouterOutlet, Footer],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {
  private readonly SECTIONS_TO_REMOVE = [
    '98ba1bd1-47c3-4533-88a0-b52992cc16fd',
    // '88e9733e-1d92-4b7a-8368-2380b3ec463c'
    // 'otro-id-1',
    // 'otro-id-2',
  ];

  private mainContent: HTMLElement | null = null;

  private srvMenu = inject(MenuService);
  private srvMenuApp = inject(MenuAppService);
  private srvStorage = inject(StorageService);
  private srvPermiso = inject(PermisoService);

  private readonly iconMapping: Record<string, string> = {
    'fas fa-cog': 'assets/icons/heroicons/outline/shield-check.svg',
    'fas fa-users-cog': 'assets/icons/heroicons/outline/users.svg',
    'fas fa-qrcode': 'assets/icons/heroicons/outline/view-grid.svg',
    'fas fa-building': 'assets/icons/heroicons/outline/bookmark.svg',
    'fas fa-user': 'assets/icons/heroicons/outline/user-circle.svg',
    'assets/icons/heroicons/outline/cog.svg': 'assets/icons/heroicons/outline/cog-6-tooth.svg',
  };

  constructor(
    private router: Router
  ) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (this.mainContent) {
          this.mainContent!.scrollTop = 0;
        }
      }
    });
  }

  ngOnInit(): void {
    this.mainContent = document.getElementById('main-content');
    this.srvStorage.userData$.pipe(
      filter(data => !!data?.perfilId),
      switchMap(data => {
        const filter = new IMenuFilter();
        filter.PerfilId = data!.perfilId;
        return this.srvMenuApp.getSectionsGroupedByModule(filter);
      })
    ).subscribe(menu => {
      if (menu.respuesta) {
        const dataLimpia = this.removeSections(menu.data, this.SECTIONS_TO_REMOVE) as unknown as any[];
        this.srvPermiso.setModulos(dataLimpia);
        const menuItems = this.buildMenuFromApi(dataLimpia);

        // console.log("MENU ITEMS ::: ", JSON.stringify(dataLimpia));
        // console.log("MENU ITEMS ::: ", dataLimpia);
        this.srvMenu._pagesMenu.set(menuItems);
      }
    });
  }

  private buildMenuFromApi(modules: IMenu[]): MenuItem[] {
    const groupMap = new Map<string, MenuItem>();

    for (const modulo of modules) {
      let groupName: string;
      if (modulo.moduloNombre === 'Parametrización' || modulo.moduloNombre === 'Autenticación') {
        groupName = 'Seguridad';
      } else if (modulo.moduloNombre === 'HID') {
        groupName = 'Integraciones';
      } else if (modulo.moduloNombre === 'Cliente') {
        groupName = 'Organizaciones';
      } else if (modulo.moduloNombre === 'Configuraciones') {
        groupName = 'Configuraciones'
      } else {
        groupName = 'Otros';
      }

      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, {
          group: groupName,
          separator: false,
          items: []
        });
      }

      const grupo = groupMap.get(groupName)!;

      const moduloItem: SubMenuItem = {
        icon: this.mapIcon(modulo.moduloImagen),
        label: modulo.moduloNombre,
        route: null,
        children: []
      };

      moduloItem.children = modulo.secciones
        .sort((a, b) => a.orden - b.orden)
        .map(seccion => {
          const seccionRuta = seccion.path
            .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
            .toLowerCase();
          const rutaCompleta = `/${seccionRuta}`;

          return {
            label: seccion.nombre,
            route: rutaCompleta
          } as SubMenuItem;
        });

      grupo.items.push(moduloItem);
    }

    // Convertir el Map a array
    const menuGroups = Array.from(groupMap.values());

    // Crear el grupo Dashboard estático (no viene de la API)
    const dashboardGroup: MenuItem = {
      group: 'Dashboard',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Inicio',
          route: '/layout/dashboard/inicio'
        }
      ]
    };

    const miCuentaGroup: MenuItem = {
      group: 'Mi cuenta',
      separator: false,           // true si quieres una línea separadora antes
      items: [
        {
          icon: 'assets/icons/heroicons/outline/user-circle.svg',  // ajusta la ruta a tu icono
          label: 'Mi cuenta',
          route: '/layout/account'  // ruta que deberás definir en el routing
        }
      ]
    };

    // Insertar Dashboard al principio del array
    return [dashboardGroup, ...menuGroups, miCuentaGroup];
  }

  private mapIcon(faClass: string): string {
    // Si la clase existe en el mapeo, devuelve la ruta del SVG
    // Si no, devuelve un ícono por defecto (ej. cube.svg)
    return this.iconMapping[faClass] || 'assets/icons/heroicons/outline/cube.svg';
  }

  /**
 * Elimina del array de módulos todas las secciones cuyos IDs estén en el arreglo idsToRemove.
 */
  private removeSections(modulos: IMenu[], idsToRemove: string[]): IMenu[] {
    // Usamos un Set para búsqueda rápida
    const idsSet = new Set(idsToRemove);
    return modulos.map(modulo => ({
      ...modulo,
      secciones: modulo.secciones.filter(sec => !idsSet.has(sec.seccionId))
    }));
  }
}