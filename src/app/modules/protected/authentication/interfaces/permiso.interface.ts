export interface ISeccion {
    perfilPermisoSeccionId: string;
    seccionId: string;
    nombre: string;
    orden: number;
    path: string;
    permiso: number;
    vence: number;
}

export interface IModulo {
    moduloId: string;
    moduloNombre: string;
    moduloImagen: string;
    secciones: ISeccion[];
}

export interface IPermisoDetalle {
    nivel: number;
    nombre: string;
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
}