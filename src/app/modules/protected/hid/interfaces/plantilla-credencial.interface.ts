export class IPlantillaCredencialFilter {
    Nombre?: any;
    ImagenFondo?: any;
    ExtensionImagenFondo?: any;
    ImagenLogo?: any;
    ExtensionImagenLogo?: any;
    EmpresaClienteId?: string = "";

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

export class IPlantillaCredencialRequest {
    nombre?: any;
    imagenFondo?: any;
    extensionImagenFondo?: any;
    imagenLogo?: any;
    extensionImagenLogo?: any;
    usuarioCreadorId?: any;
}