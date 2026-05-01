import { IModuloResponse } from './modulo.interface';

export class ISeccionFilter {
    Nombre?: string;
    ModuloId?: string;
    Orden?: number;
    PageSize?: number;
    PageNumber?: number;
    UsuarioCreadorId?: string;
    UsuarioModificadorId?: string;
    UsuarioBajaId?: string;
    UsuarioReactivadorId?: string;
    FechaCreacionDesde?: string;
    FechaCreacionHasta?: string;
    FechaModificacionDesde?: string;
    FechaModificacionHasta?: string;
    FechaBajaDesde?: string;
    FechaBajaHasta?: string;
    FechaReactivacionDesde?: string;
    FechaReactivacionHasta?: string;
    Estado?: number;
    EmpresaId?: string;
    DatosCompletos?: number;
}

export class ISeccionResponse {
    empresaId?: string;
    estado?: number;
    fechaCreacion?: string;
    id?: string;
    moduloId?: string;
    nombre?: string;
    orden?: number;
    path?: string;
    usuarioCreadorId?: string;
    modulo?: IModuloResponse;
    permisoId?: number;
}

export interface ISeccion {
    perfilPermisoSeccionId: string;
    seccionId: string;
    nombre: string;
    orden: number;
    path: string;
    permiso?: number;
    vence?: number;
}