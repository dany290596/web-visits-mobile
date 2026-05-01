import { IDataTableRegistroCampo, IDataTableRegistro, IDataTableTitulo, IDataTable, IDTRCampoPropiedad } from '../interfaces/table-dynamic.interface';

export class DataTable implements IDataTable {
    titulosEnTitulos: IDataTableTitulo[] = [];
    titulosEnDetalle: IDataTableTitulo[] = [];
    registros: IDataTableRegistro[] = [];
    ColumnaAcciones: boolean = false;
    AccionVer: boolean = false;
    AccionEditar: boolean = false;
    AccionEliminar: boolean = false;
    AccionDetalle: boolean = false;

    setTieneAcciones(booAccionVer = false, booAccionEliminar = false, booAccionDetalle = false, booAccionEditar = false) {
        if (booAccionVer || booAccionDetalle || booAccionEliminar || booAccionEditar) {
            this.ColumnaAcciones = true;
        }

        this.AccionVer = booAccionVer;
        this.AccionDetalle = booAccionDetalle;
        this.AccionEliminar = booAccionEliminar;
        this.AccionEditar = booAccionEditar;
    }

    addTitulo(strTexto: string, booEnTitulo: boolean, booEnDetalle: boolean, booVisibleMD: boolean,
        booVisibleLG: boolean, booVisibleXL: boolean, numColMD: number, numColLG: number,
        numColXL: number): void {

        let oTitulo = new DataTableTitulo();
        oTitulo.texto = strTexto;
        oTitulo.enTitulos = booEnTitulo;
        oTitulo.enDetalle = booEnDetalle;
        oTitulo.visibleMD = booVisibleMD;
        oTitulo.visibleLG = booVisibleLG;
        oTitulo.visibleXL = booVisibleXL;
        oTitulo.colMD = numColMD;
        oTitulo.colLG = numColLG;
        oTitulo.colXL = numColXL;

        if (booEnTitulo) { this.titulosEnTitulos.push(oTitulo); }
        if (booEnDetalle) { this.titulosEnDetalle.push(oTitulo); }
    }

    // addRegistro(strRegistroId: string, estado: number, arrCampos: IDataTableRegistroCampo[]): void {
    //     let oRegistro = new DataTableRegistro();
    //     oRegistro.registroId = strRegistroId;
    //     oRegistro.addCampos(arrCampos);
    //     oRegistro.estado = estado;

    //     this.registros.push(oRegistro);
    // }

    addRegistro(strRegistroId: string, estado: number, arrCampos: IDataTableRegistroCampo[],
        opcionesControl?: {
            mostrarInactivar?: boolean,
            mostrarReactivar?: boolean,
            mostrarDetalle?: boolean,
            mostrarEditar?: boolean
        }): void {
        let oRegistro = new DataTableRegistro();
        oRegistro.registroId = strRegistroId;
        oRegistro.addCampos(arrCampos);
        oRegistro.estado = estado;

        // Si hay opciones de control, aplicarlas
        if (opcionesControl) {
            if (opcionesControl.mostrarInactivar !== undefined) {
                oRegistro.mostrarInactivar = opcionesControl.mostrarInactivar;
            }
            if (opcionesControl.mostrarReactivar !== undefined) {
                oRegistro.mostrarReactivar = opcionesControl.mostrarReactivar;
            }
            if (opcionesControl.mostrarDetalle !== undefined) {
                oRegistro.mostrarDetalle = opcionesControl.mostrarDetalle;
            }
            if (opcionesControl.mostrarEditar !== undefined) {
                oRegistro.mostrarEditar = opcionesControl.mostrarEditar;
            }
        }

        this.registros.push(oRegistro);
    }

    refreshRegistro(strRegistroId: string, arrCampos: IDataTableRegistroCampo[]): boolean {
        const registro = this.registros.find(r => r.registroId === strRegistroId);
        if (!registro) return false;

        // Limpiar campos actuales
        registro.camposEnLinea = [];
        registro.camposEnDetalle = [];

        // Agregar los campos nuevos
        registro.addCampos(arrCampos);

        return true;
    }
}

export class DataTableTitulo implements IDataTableTitulo {
    texto: string = '';
    enDetalle: boolean = false;
    enTitulos: boolean = false;
    visibleMD: boolean = false;
    visibleLG: boolean = false;
    visibleXL: boolean = false;
    colMD: number = 0;
    colLG: number = 0;
    colXL: number = 0;

    getClass(): string {

        let strClase = 'd-none ';

        if (this.visibleMD && this.colMD > 0) {
            strClase += ' d-md-block col-md-' + this.colMD.toString();
        }

        if (this.visibleLG && this.colLG > 0) {
            strClase += ' d-lg-block col-lg-' + this.colLG.toString();
        }

        if (this.visibleXL && this.colXL > 0) {
            strClase += ' d-xl-block col-xl-' + this.colXL.toString();
        }

        return strClase;
    }

}

export class DataTableRegistro implements IDataTableRegistro {
    registroId: string = '';
    expandirRegistro: boolean = false;
    estado: number = 0;
    visualizar: boolean = true;
    camposEnLinea: IDataTableRegistroCampo[] = [];
    camposEnDetalle: IDataTableRegistroCampo[] = [];

    mostrarInactivar?: boolean;
    mostrarReactivar?: boolean;
    mostrarDetalle?: boolean;
    mostrarEditar?: boolean;

    addCampo(campo: IDataTableRegistroCampo): void {
        if (campo.enLinea) { this.camposEnLinea.push(campo); }
        if (campo.enDetalle) { this.camposEnDetalle.push(campo); }
    }

    addCampos(campos: IDataTableRegistroCampo[]) {
        if (campos.length > 0) {
            campos.forEach(campo => {
                if (campo.enLinea === true) {
                    this.camposEnLinea.push(campo);
                }

                if (campo.enDetalle === true) {
                    this.camposEnDetalle.push(campo);
                }
            });
        }
    }
}

export class DataTableRegistroCampo implements IDataTableRegistroCampo {
    texto: string = '';
    arrTexto: string[] = [];
    tipoCampo: number = 1;
    propiedadesCampo: IDTRCampoPropiedad[] = [];
    enDetalle: boolean = false;
    enLinea: boolean = false;
    visibleMD: boolean = false;
    visibleLG: boolean = false;
    visibleXL: boolean = false;
    colMD: number = 0;
    colLG: number = 0;
    colXL: number = 0;

    public static CAMPO_TEXTO: number = 1;
    public static CAMPO_IMAGEN: number = 2;
    public static CAMPO_BADGE: number = 3;
    public static CAMPO_ARR_TEXTO: number = 4;

    public static COLOR_BADGE_PRIMARY: number = 1;
    public static COLOR_BADGE_SECONDARY: number = 2;
    public static COLOR_BADGE_SUCCESS: number = 3;
    public static COLOR_BADGE_DANGER: number = 4;
    public static COLOR_BADGE_WARNING: number = 5;
    public static COLOR_BADGE_INFO: number = 6;
    public static COLOR_BADGE_DARK: number = 7;

    setValores(strTexto: string, numTipoCampo: number, booEnTitulo: boolean, booEnDetalle: boolean,
        booVisibleMD: boolean, booVisibleLG: boolean, booVisibleXL: boolean, numColMD: number,
        numColLG: number, numColXL: number, arrPropiedadesCampo?: IDTRCampoPropiedad[],
        strArrTexto?: string[]): void {
        this.texto = strTexto;
        this.enLinea = booEnTitulo;
        this.enDetalle = booEnDetalle;
        this.tipoCampo = numTipoCampo;
        this.visibleMD = booVisibleMD;
        this.visibleLG = booVisibleLG;
        this.visibleXL = booVisibleXL;
        this.colMD = numColMD;
        this.colLG = numColLG;
        this.colXL = numColXL;

        if (strArrTexto && strArrTexto.length > 0) { this.arrTexto = strArrTexto; }
        if (arrPropiedadesCampo && arrPropiedadesCampo.length > 0) { this.propiedadesCampo = arrPropiedadesCampo; }
    }

    getClass(): string {

        let strClase = ' d-block ';

        if (this.visibleMD && this.colMD > 0) {
            strClase += ' d-md-block col-md-' + this.colMD.toString();
        } else {
            strClase += ' d-md-none ';
        }

        if (this.visibleLG && this.colLG > 0) {
            strClase += ' d-lg-block col-lg-' + this.colLG.toString();
        } else {
            strClase += ' d-lg-none ';
        }

        if (this.visibleXL && this.colXL > 0) {
            strClase += ' d-xl-block col-xl-' + this.colXL.toString();
        } else {
            strClase += ' d-xl-none ';
        }

        return strClase;
    }

    getBadgeColor(): string {
        let strColor: string = '';
        let valor: number = 0;

        if (this.propiedadesCampo == null || this.propiedadesCampo.length == 0) { return ''; }
        this.propiedadesCampo.forEach(prop => {
            if (prop.condicion == this.texto) {
                valor = prop.aplicar;
            }
        });

        switch (valor) {
            case 1:
                return 'info';       // o 'primary' si tienes tema custom
            case 2:
                return 'secondary';       // No hay 'secondary' en PrimeNG
            case 3:
                return 'success';
            case 4:
                return 'danger';
            case 5:
                return 'warning';
            case 6:
                return 'info';
            case 7:
                return 'contrast';     // o el que quieras, PrimeNG no tiene 'dark'
            default:
                return '';           // estilo por defecto
        }
    }
}