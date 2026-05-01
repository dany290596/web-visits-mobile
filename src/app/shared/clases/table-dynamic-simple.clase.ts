import { ISimpleTable, ISimpleTableTitulo, ISimpleTableRegistro, ISimpleTableRegistroCampo } from '../interfaces/table-dynamic-simple.interface';

export class SimpleTable implements ISimpleTable {
    titulosEnTitulos: ISimpleTableTitulo[] = [];
    titulosEnDetalle: ISimpleTableTitulo[] = [];
    registros: ISimpleTableRegistro[] = [];

    ColumnaAcciones: boolean = false;
    TieneDetalle: boolean = false;
    AccionVer: boolean = false;
    AccionEliminar: boolean = false;
    AccionDetalle: boolean = false;

    setTieneAcciones(booAccionVer = false, booAccionEliminar = false, booAccionDetalle = false) {
        if (booAccionVer || booAccionDetalle || booAccionEliminar) {
            this.ColumnaAcciones = true;
        }

        this.AccionVer = booAccionVer;
        this.AccionDetalle = booAccionDetalle;
        this.AccionEliminar = booAccionEliminar;
    }

    addTitulo(strTexto: string, booEnTitulos: boolean, booEnDetalle: boolean, booVisibleMD: boolean,
        booVisibleLG: boolean, booVisibleXL: boolean, numColMD: number, numColLG: number,
        numColXL: number): void {
        let oTitulo = new SimpleTableTitulo();
        oTitulo.texto = strTexto;
        oTitulo.enTitulo
        oTitulo.visibleMD = booVisibleMD;
        oTitulo.visibleLG = booVisibleLG;
        oTitulo.visibleXL = booVisibleXL;
        oTitulo.colMD = numColMD;
        oTitulo.colLG = numColLG;
        oTitulo.colXL = numColXL;

        if (booEnTitulos) { this.titulosEnTitulos.push(oTitulo); }

        if (booEnDetalle) { this.titulosEnDetalle.push(oTitulo); }
    }

    addRegistro(strRegistroId: string, arrCampos: ISimpleTableRegistroCampo[]): void {
        let oRegistro = new SimpleTableRegistro();
        oRegistro.registroId = strRegistroId;
        oRegistro.addCampos(arrCampos);

        this.registros.push(oRegistro);
    }
}

export class SimpleTableTitulo implements ISimpleTableTitulo {
    texto: string = '';
    enTitulo: boolean = false;
    enDetalle: boolean = false;
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

export class SimpleTableRegistro implements ISimpleTableRegistro {
    registroId: string = '';
    expandirRegistro: boolean = false;
    camposEnLinea: ISimpleTableRegistroCampo[] = [];
    camposEnDetalle: ISimpleTableRegistroCampo[] = [];

    addCampo(campo: ISimpleTableRegistroCampo): void {
        if (campo.enLinea) { this.camposEnLinea.push(campo); }

        if (campo.enDetalle) { this.camposEnDetalle.push(campo); }
    }

    addCampos(campos: ISimpleTableRegistroCampo[]) {
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

export class SimpleTableRegistroCampo implements ISimpleTableRegistroCampo {
    texto: string = '';
    enLinea: boolean = false;
    enDetalle: boolean = false;
    visibleMD: boolean = false;
    visibleLG: boolean = false;
    visibleXL: boolean = false;
    colMD: number = 0;
    colLG: number = 0;
    colXL: number = 0;

    setValores(strTexto: string, booEnLinea: boolean, booEnDetalle: boolean,
        booVisibleMD: boolean, booVisibleLG: boolean, booVisibleXL: boolean,
        numColMD: number, numColLG: number, numColXL: number): void {
        this.texto = strTexto;
        this.enLinea = booEnLinea;
        this.enDetalle = booEnDetalle;
        this.visibleMD = booVisibleMD;
        this.visibleLG = booVisibleLG;
        this.visibleXL = booVisibleXL;
        this.colMD = numColMD;
        this.colLG = numColLG;
        this.colXL = numColXL;
    }

    getClass(): string {
        let strClase = 'campo d-block ';
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
}