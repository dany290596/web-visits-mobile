import { ISeccion } from '../../modules/protected/authentication/interfaces/seccion.interface';

export class IMenuFilter {
    PerfilId?: string;
    TipoUsuarioId?: string;
}

export class IValidateAccessFilter {
    seccionId?: string;
    perfilId?: string;
}

export interface IMenuItem {
    texto: string,
    path: string
}

export interface IMenuSeccion {
    id: string,
    texto: string,
    activo: boolean,
    expandido: boolean,
    icono: string,
    items: IMenuItem[]
}

export interface IMenuModulo {
    texto: string,
    secciones: IMenuSeccion[]
}

export interface IMenu {
    expandido: boolean,
    moduloId: string;
    moduloNombre: string;
    moduloImagen: string;
    secciones: ISeccion[];
}