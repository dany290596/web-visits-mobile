export class IPerfilFilter {
    Nombre?: string;
    Estado?: any;
    EmpresaId?: string;
    PageSize?: number;
    PageNumber?: number;
}

export class IPerfilRequest {
    nombre?: string;
    perfilPermisoSecciones: IPerfilPermisoSeccion[] = [];
}

export class IPerfilResponse {
    nombre?: string;
    perfilPermisoSecciones: IPerfilPermisoSeccion[] = [];
    estado?: number;
}


export class IPerfilPermisoSeccion {
    seccionId?: string;
    perfilId?: string;
    permiso?: number;
    vence?: number;
    fechaVencimiento?: any;
    estado?: number;
}