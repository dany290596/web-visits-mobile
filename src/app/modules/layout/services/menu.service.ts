import { effect, Injectable, OnDestroy, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MenuItem, SubMenuItem } from '../../../core/models/menu.model';

@Injectable({
    providedIn: 'root',
})
export class MenuService implements OnDestroy {
    public _showSidebar = signal(true);
    public _showMobileMenu = signal(false);
    public _pagesMenu = signal<MenuItem[]>([]);
    public _subscription = new Subscription();

    constructor(
        private router: Router
    ) {
        /** Set dynamic menu */
        // this._pagesMenu.set(Menu.pages);

        let sub = this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                /** Expand menu base on active route */
                this.refreshActiveState();
            }
        });
        this._subscription.add(sub);
    }

    get showSideBar() {
        return this._showSidebar();
    }
    get showMobileMenu() {
        return this._showMobileMenu();
    }
    get pagesMenu() {
        return this._pagesMenu();
    }

    set showSideBar(value: boolean) {
        this._showSidebar.set(value);
    }
    set showMobileMenu(value: boolean) {
        this._showMobileMenu.set(value);
    }

    public toggleSidebar() {
        this._showSidebar.set(!this._showSidebar());
    }

    public setMenu(items: MenuItem[]): void {
        this._pagesMenu.set(items);
        this.refreshActiveState();
    }

    public toggleMenu(menu: SubMenuItem) {
        this.showSideBar = true;

        /** collapse all submenus except the selected one. */
        const updatedMenu = this._pagesMenu().map((menuGroup) => {
            return {
                ...menuGroup,
                items: menuGroup.items.map((item) => {
                    const hasActiveChild = !!item.children?.some((child) => this.isActive(child.route));
                    return {
                        ...item,
                        active: this.isActive(item.route) || hasActiveChild,
                        expanded: item === menu ? !item.expanded : false,
                    };
                }),
            };
        });

        this._pagesMenu.set(updatedMenu);

        /** El spread de arriba conserva el 'active' anterior, así que al pulsar
         *  otro módulo el anterior se quedaba marcado. Se recalcula desde la URL. */
        this.refreshActiveState(true);
    }

    public toggleSubMenu(submenu: SubMenuItem) {
        submenu.expanded = !submenu.expanded;
    }

    private expand(items: Array<any>) {
        items.forEach((item) => {
            item.expanded = this.isActive(item.route);
            if (item.children) this.expand(item.children);
        });
    }

    /**
     * paths: 'exact' a propósito.
     *
     * Con 'subset' una ruta corta se considera activa cuando es prefijo de la
     * URL actual: la de "Inicio" es prefijo de casi todas, así que se quedaba
     * marcada al navegar a cualquier otro módulo y aparecían dos resaltados.
     */
    public isActive(instruction: any): boolean {
        if (!instruction) return false;
        return this.router.isActive(this.router.createUrlTree([instruction]), {
            paths: 'exact',
            queryParams: 'subset',
            fragment: 'ignored',
            matrixParams: 'ignored',
        });
    }

    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }

    /**
     * Recalcula qué módulo está activo a partir de la URL.
     *
     * Reasigna la señal con objetos NUEVOS a propósito: sidebar-menu usa
     * ChangeDetectionStrategy.OnPush, así que mutar los objetos en su sitio no
     * repinta la vista y el módulo anterior se quedaba marcado junto al nuevo.
     *
     * @param keepExpanded conserva el submenú que el usuario acaba de abrir.
     */
    private refreshActiveState(keepExpanded = false): void {
        const updated = this._pagesMenu().map((menu) => {
            let activeGroup = false;
            const items = menu.items.map((subMenu) => {
                const hasActiveChild = !!subMenu.children?.some((child) => this.isActive(child.route));
                const active = this.isActive(subMenu.route) || hasActiveChild;
                if (active) activeGroup = true;
                if (subMenu.children) {
                    this.expand(subMenu.children);
                }
                return {
                    ...subMenu,
                    active,
                    expanded: keepExpanded ? subMenu.expanded : active,
                };
            });
            return { ...menu, items, active: activeGroup };
        });

        this._pagesMenu.set(updated);
    }
}