import { Component, inject, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';
import { Navbar } from './components/navbar/navbar';
import { Sidebar } from './components/sidebar/sidebar';

import { MenuService } from '../layout/services/menu.service';
import { MenuAppService } from '../../shared/services/menu-app.service';
import { StorageService } from '../../modules/auth/services/storage.service';

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
  private mainContent: HTMLElement | null = null;

  private srvMenu = inject(MenuService);
  private srvMenuApp = inject(MenuAppService);
  private srvStorage = inject(StorageService);

  private readonly iconMapping: Record<string, string> = {
    'fas fa-cog': 'assets/icons/heroicons/outline/cog.svg',
    'fas fa-users-cog': 'assets/icons/heroicons/outline/users.svg', // o 'cog-6-tooth.svg'
    'fas fa-qrcode': 'assets/icons/heroicons/outline/view-grid.svg', // o 'cube.svg'
    // Puedes agregar más mapeos si la API devuelve otros iconos
  };

  constructor(private router: Router) {
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
    /*
    if (this.srvStorage.getUserData() !== undefined && this.srvStorage.getUserData() !== null) {
      if (this.srvStorage.getUserData()?.perfilId !== undefined && this.srvStorage.getUserData()?.perfilId !== null && this.srvStorage.getUserData()?.perfilId !== "") {
        const filter = new IMenuFilter();
        filter.PerfilId = this.srvStorage.getUserData()?.perfilId;
        this.srvMenuApp.getSectionsGroupedByModule(filter).subscribe((menu: any) => {
          if (menu.respuesta === true) {
            // console.log("DATA ::: ", JSON.stringify(menu.data));
            const menuItems = this.buildMenuFromApi(menu.data);
            // console.log("MENU ITEMS ::: ", JSON.stringify(menuItems));
            this.srvMenu._pagesMenu.set(menuItems);
          }
        });
      }
    }
    */
    this.srvStorage.userData$.pipe(
      filter(data => !!data?.perfilId),
      switchMap(data => {
        const filter = new IMenuFilter();
        filter.PerfilId = data!.perfilId;
        return this.srvMenuApp.getSectionsGroupedByModule(filter);
      })
    ).subscribe(menu => {
      if (menu.respuesta) {
        const menuItems = this.buildMenuFromApi(menu.data);
        this.srvMenu._pagesMenu.set(menuItems);
      }
    });
  }

  /*
  private buildMenuFromApi(modules: IMenu[]): MenuItem[] {
    const groupMap = new Map<string, MenuItem>();

    for (const modulo of modules) {
      // 1. Determinar el grupo según el nombre del módulo
      let groupName: string;
      if (modulo.moduloNombre === 'Parametrización' || modulo.moduloNombre === 'Autenticación') {
        groupName = 'Menú';
      } else if (modulo.moduloNombre === 'HID') {
        groupName = 'Aplicacion';
      } else {
        groupName = 'Otros'; // Puedes omitir módulos no deseados con 'continue'
      }

      // 2. Crear el grupo si no existe en el Map
      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, {
          group: groupName,
          separator: false,
          items: []
        });
      }

      const grupo = groupMap.get(groupName)!;

      // 3. Construir el SubMenuItem del módulo
      const moduloItem: SubMenuItem = {
        icon: this.mapIcon(modulo.moduloImagen),   // Convertir clase FontAwesome a SVG o mantener clase
        label: modulo.moduloNombre,
        route: null,                                // Sin ruta propia
        children: []
      };

      // 4. Mapear las secciones a children del módulo
      moduloItem.children = modulo.secciones
        .sort((a, b) => a.orden - b.orden)
        .map(seccion => {
          // Generar ruta: /modulo/seccion (todo en kebab-case)
          const moduloRuta = modulo.moduloNombre.toLowerCase().replace(/\s+/g, '-');
          const seccionRuta = seccion.path
            .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
            .toLowerCase();
          const rutaCompleta = `/${moduloRuta}/${seccionRuta}`;

          return {
            label: seccion.nombre,
            route: rutaCompleta
          } as SubMenuItem;
        });

      // 5. Agregar el módulo al grupo
      grupo.items.push(moduloItem);
    }

    // Convertir el Map a array y ordenar los grupos (opcional)
    return Array.from(groupMap.values());
  }
  */

  private buildMenuFromApi(modules: IMenu[]): MenuItem[] {
    const groupMap = new Map<string, MenuItem>();

    for (const modulo of modules) {
      let groupName: string;
      if (modulo.moduloNombre === 'Parametrización' || modulo.moduloNombre === 'Autenticación') {
        groupName = 'Seguridad';
      } else if (modulo.moduloNombre === 'HID') {
        groupName = 'Integraciones';
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

    // Insertar Dashboard al principio del array
    return [dashboardGroup, ...menuGroups];
  }

  private mapIcon(faClass: string): string {
    // Si la clase existe en el mapeo, devuelve la ruta del SVG
    // Si no, devuelve un ícono por defecto (ej. cube.svg)
    return this.iconMapping[faClass] || 'assets/icons/heroicons/outline/cube.svg';
  }
}