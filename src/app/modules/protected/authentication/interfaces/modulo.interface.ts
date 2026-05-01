import { ISeccionResponse } from '../interfaces/seccion.interface';

export class IModuloResponse {
    aplicacionId?: string;
    empresaId?: string;
    estado?: number;
    fechaCreacion?: string;
    id?: string;
    nombre?: string;
    orden?: number;
    usuarioCreadorId?: string;
}

export class IModuloSeccionResponse {
    id?: string;
    nombre?: string;
    secciones: ISeccionResponse[] = [];
}