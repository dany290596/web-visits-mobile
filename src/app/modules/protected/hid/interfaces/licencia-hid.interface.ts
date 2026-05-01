export class ILicenciaHIDFilter {
    NumeroParte?: string = "";
    Nombre?: string = "";
    EmpresaClienteId?: string = "";
    CantidadDisponible?: any;
    CantidadConsumida?: any;
    FechaInicio?: string = "";
    FechaFin?: string = "";
    EstadoLicencia?: string = "";
    EstadoPeriodo?: string = "";
    MensajeEstado?: string = "";

    PageSize?: any;
    PageNumber?: any;
    DatosCompletos?: any;
    TipoQuery?: string = "";
    Id?: string = "";
    UsuarioCreadorId?: string = "";
    UsuarioModificadorId?: string = "";
    UsuarioBajaId?: string = "";
    UsuarioReactivadorId?: string = "";
    FechaCreacionDesde?: string = "";
    FechaCreacionHasta?: string = "";
    FechaModificacionDesde?: string = "";
    FechaModificacionHasta?: string = "";
    FechaBajaDesde?: string = "";
    FechaBajaHasta?: string = "";
    FechaReactivacionDesde?: string = "";
    FechaReactivacionHasta?: string = "";
    Estado?: any;
}