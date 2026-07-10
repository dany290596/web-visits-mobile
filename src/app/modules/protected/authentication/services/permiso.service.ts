import { Injectable, signal, computed } from '@angular/core';
import { IModulo, ISeccion, IPermisoDetalle } from '../../authentication/interfaces/permiso.interface';

/**
 * Servicio de permisos usando Angular Signals.
 * Devuelve objetos con detalle de permisos según el nivel asignado.
 */
@Injectable({
    providedIn: 'root'
})
export class PermisoService {

    // ────────────────────────────────────────────────
    // 🔹 Estado reactivo
    // ────────────────────────────────────────────────

    private readonly _modulos = signal<IModulo[]>([]);

    readonly secciones = computed<ISeccion[]>(() =>
        this._modulos().flatMap(m => m.secciones)
    );

    constructor() { }

    // ────────────────────────────────────────────────
    // 🔹 Mutadores
    // ────────────────────────────────────────────────

    setModulos(data: IModulo[]): void {
        this._modulos.set(data ?? []);
    }

    limpiar(): void {
        this._modulos.set([]);
    }

    // ────────────────────────────────────────────────
    // 🔹 Accesores
    // ────────────────────────────────────────────────

    getModulos(): IModulo[] {
        return this._modulos();
    }

    getSecciones(): ISeccion[] {
        return this.secciones();
    }

    getSeccionesPorModulo(nombreModulo: string): ISeccion[] {
        const modulo = this._modulos().find(
            m => m.moduloNombre.toLowerCase() === nombreModulo.toLowerCase()
        );
        return modulo ? modulo.secciones : [];
    }

    /**
     * Busca una sección por su ID único.
     */
    private getPermisosPorSeccionId(seccionId: string): ISeccion | undefined {
        for (const modulo of this._modulos()) {
            // console.log("MODULOS ::: ", modulo);
            const seccion = modulo.secciones.find(s => s.seccionId.toUpperCase() === seccionId.toUpperCase());
            if (seccion) return seccion;
        }
        return undefined;
    }

    // ────────────────────────────────────────────────
    // 🔹 Helpers de permisos
    // ────────────────────────────────────────────────

    /**
     * Devuelve un objeto con el detalle completo del permiso usando el ID de la sección.
     */
    getDetallePermiso(seccionId: string): IPermisoDetalle {
        const seccion = this.getPermisosPorSeccionId(seccionId);

        if (!seccion) {
            return {
                nivel: 0,
                nombre: 'Sin permisos',
                ver: false,
                crear: false,
                editar: false,
                eliminar: false
            };
        }

        const nivel = seccion.permiso;
        const nombre = this.getNombrePermiso(nivel);

        // Mapeo claro según el nivel de permiso
        const permisos: Record<number, IPermisoDetalle> = {
            1: { nivel, nombre, ver: true, crear: false, editar: false, eliminar: false },
            2: { nivel, nombre, ver: true, crear: true, editar: true, eliminar: false },
            3: { nivel, nombre, ver: true, crear: true, editar: true, eliminar: true }
        };

        return permisos[nivel] ?? {
            nivel: 0,
            nombre: 'Sin permisos',
            ver: false,
            crear: false,
            editar: false,
            eliminar: false
        };
    }

    /**
     * Devuelve el nombre legible del permiso según su nivel numérico.
     */
    private getNombrePermiso(nivel: number): string {
        switch (nivel) {
            case 1: return 'Lectura';
            case 2: return 'Lectura y Escritura';
            case 3: return 'Lectura y Escritura y Eliminación';
            default: return 'Sin permisos';
        }
    }
}