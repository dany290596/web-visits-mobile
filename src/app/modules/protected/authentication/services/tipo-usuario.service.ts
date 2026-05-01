import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ITipoUsuarioFilter } from '../interfaces/tipo-usuario.interface';

const url: string = `${environment.api}`;

@Injectable({
    providedIn: 'root'
})

export class TipoUsuarioService {
    constructor(
        private http: HttpClient
    ) { }

    getAll(filter: ITipoUsuarioFilter): Observable<any> {
        let params = new HttpParams();
        if (filter.Nombre !== null && filter.Nombre !== undefined && filter.Nombre !== "") {
            params = params.set('Nombre', filter.Nombre);
        }
        if (filter.TieneSesion !== null && filter.TieneSesion !== undefined && filter.TieneSesion !== 0) {
            params = params.set('TieneSesion', filter.TieneSesion);
        }
        if (filter.DatosCompletos !== null && filter.DatosCompletos !== undefined && filter.DatosCompletos !== 0) {
            params = params.set('DatosCompletos', filter.DatosCompletos);
        }
        if (filter.PageSize !== null && filter.PageSize !== undefined) {
            params = params.set('PageSize', filter.PageSize);
        }
        if (filter.PageNumber !== null && filter.PageNumber !== undefined) {
            params = params.set('PageNumber', filter.PageNumber);
        }
        if (filter.UsuarioCreadorId !== null && filter.UsuarioCreadorId !== undefined && filter.UsuarioCreadorId !== "") {
            params = params.set('UsuarioCreadorId', filter.UsuarioCreadorId);
        }
        if (filter.UsuarioModificadorId !== null && filter.UsuarioModificadorId !== undefined && filter.UsuarioModificadorId !== "") {
            params = params.set('UsuarioModificadorId', filter.UsuarioModificadorId);
        }
        if (filter.UsuarioBajaId !== null && filter.UsuarioBajaId !== undefined && filter.UsuarioBajaId !== "") {
            params = params.set('UsuarioBajaId', filter.UsuarioBajaId);
        }
        if (filter.UsuarioReactivadorId !== null && filter.UsuarioReactivadorId !== undefined && filter.UsuarioReactivadorId !== "") {
            params = params.set('UsuarioReactivadorId', filter.UsuarioReactivadorId);
        }
        if (filter.FechaCreacionDesde !== null && filter.FechaCreacionDesde !== undefined && filter.FechaCreacionDesde !== "") {
            params = params.set('FechaCreacionDesde', filter.FechaCreacionDesde);
        }
        if (filter.FechaCreacionHasta !== null && filter.FechaCreacionHasta !== undefined && filter.FechaCreacionHasta !== "") {
            params = params.set('FechaCreacionHasta', filter.FechaCreacionHasta);
        }
        if (filter.FechaModificacionDesde !== null && filter.FechaModificacionDesde !== undefined && filter.FechaModificacionDesde !== "") {
            params = params.set('FechaModificacionDesde', filter.FechaModificacionDesde);
        }
        if (filter.FechaModificacionHasta !== null && filter.FechaModificacionHasta !== undefined && filter.FechaModificacionHasta !== "") {
            params = params.set('FechaModificacionHasta', filter.FechaModificacionHasta);
        }
        if (filter.FechaBajaDesde !== null && filter.FechaBajaDesde !== undefined && filter.FechaBajaDesde !== "") {
            params = params.set('FechaBajaDesde', filter.FechaBajaDesde);
        }
        if (filter.FechaBajaHasta !== null && filter.FechaBajaHasta !== undefined && filter.FechaBajaHasta !== "") {
            params = params.set('FechaBajaHasta', filter.FechaBajaHasta);
        }
        if (filter.FechaReactivacionDesde !== null && filter.FechaReactivacionDesde !== undefined && filter.FechaReactivacionDesde !== "") {
            params = params.set('FechaReactivacionDesde', filter.FechaReactivacionDesde);
        }
        if (filter.FechaReactivacionHasta !== null && filter.FechaReactivacionHasta !== undefined && filter.FechaReactivacionHasta !== "") {
            params = params.set('FechaReactivacionHasta', filter.FechaReactivacionHasta);
        }
        if (filter.Estado !== null && filter.Estado !== undefined && filter.Estado !== 0) {
            params = params.set('Estado', filter.Estado);
        }
        if (filter.EmpresaId !== null && filter.EmpresaId !== undefined && filter.EmpresaId !== "") {
            params = params.set('EmpresaId', filter.EmpresaId);
        }

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Empresa': `${localStorage.getItem('empresa')}`
            }),
            params: params
        };

        return this.http.get(`${url}TipoUsuario/GetAll`, opciones).pipe();
    }

    getById(id: string) {
        return this.http.get(`${url}TipoUsuario/GetById/${id}`, {
            headers: new HttpHeaders(
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Empresa': `${localStorage.getItem('empresa')}`
                })
        }).pipe(
            catchError((e: any) =>
                of(e)
            ),
            switchMap((response: any) => {
                return of(response);
            })
        );
    }
}