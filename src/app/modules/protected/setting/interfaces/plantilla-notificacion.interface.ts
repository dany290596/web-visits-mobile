export class IPlantillaNotificacionFilter {
    Nombre?: string;
    CuerpoPlantilla?: string;
    NotificarEmail?: any;
    NotificarTeams?: any;
    Identificador?: string;
    TipoPlantillaNotificacionId?: string;
    EmpresaClienteId?: string;
    DatosCompletos?: any;
    Estado?: any;
    PageSize?: number;
    PageNumber?: number;
}

export class IPlantillaNotificacionRequest {
    nombre?: string;
    cuerpoPlantilla?: string;
    notificarEmail?: any;
    notificarTeams?: any;
    identificador?: any;
    tipoPlantillaNotificacionId?: string;
    empresaClienteId?: string;
}

export class IPlantillaNotificacionResponse {
    id?: string;
    nombre?: string;
    cuerpoPlantilla?: string;
    notificarEmail?: any;
    notificarTeams?: any;
    identificador?: string;
    tipoPlantillaNotificacionId?: string;
    empresaClienteId?: string;
    estado?: any;
    estadoDescripcion?: string;
}