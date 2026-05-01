import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IDipositivoHIDFilter } from '../../../protected/hid/interfaces/dispositivo-hid.interface';

const url: string = `${environment.api}`;

@Injectable({
    providedIn: 'root'
})

export class DispositivoHIDService {
    constructor(
        private http: HttpClient
    ) { }

    getAll(filter: IDipositivoHIDFilter): Observable<any> {
        let params = new HttpParams();
        if (filter.UsuarioId !== null && filter.UsuarioId !== undefined && filter.UsuarioId !== "") {
            params = params.set('UsuarioId', filter.UsuarioId);
        }
        if (filter.SistemaOperativo !== null && filter.SistemaOperativo !== undefined && filter.SistemaOperativo !== "") {
            params = params.set('SistemaOperativo', filter.SistemaOperativo);
        }
        if (filter.NombreDispositivo !== null && filter.NombreDispositivo !== undefined && filter.NombreDispositivo !== "") {
            params = params.set('NombreDispositivo', filter.NombreDispositivo);
        }
        if (filter.CodigoInvitacion !== null && filter.CodigoInvitacion !== undefined && filter.CodigoInvitacion !== "") {
            params = params.set('CodigoInvitacion', filter.CodigoInvitacion);
        }
        if (filter.EndpointId !== null && filter.EndpointId !== undefined && filter.EndpointId !== "") {
            params = params.set('EndpointId', filter.EndpointId);
        }
        if (filter.SdkVersion !== null && filter.SdkVersion !== undefined && filter.SdkVersion !== '') {
            params = params.set('SdkVersion', filter.SdkVersion);
        }
        if (filter.DeviceInfoLastUpdated !== null && filter.DeviceInfoLastUpdated !== undefined && filter.DeviceInfoLastUpdated !== '') {
            params = params.set('DeviceInfoLastUpdated', filter.DeviceInfoLastUpdated);
        }
        if (filter.DeviceDefault !== null && filter.DeviceDefault !== undefined && filter.DeviceDefault !== '') {
            params = params.set('DeviceDefault', filter.DeviceDefault);
        }
        if (filter.Status !== null && filter.Status !== undefined && filter.Status !== '') {
            params = params.set('Status', filter.Status);
        }
        if (filter.EmpresaClienteId !== null && filter.EmpresaClienteId !== undefined && filter.EmpresaClienteId !== '') {
            params = params.set('EmpresaClienteId', filter.EmpresaClienteId);
        }
        if (filter.PageSize !== null && filter.PageSize !== undefined && filter.PageSize !== "") {
            params = params.set('PageSize', filter.PageSize);
        }
        if (filter.PageNumber !== null && filter.PageNumber !== undefined && filter.PageNumber !== "") {
            params = params.set('PageNumber', filter.PageNumber);
        }
        if (filter.DatosCompletos !== null && filter.DatosCompletos !== undefined && filter.DatosCompletos !== 0 && filter.DatosCompletos !== '') {
            params = params.set('DatosCompletos', filter.DatosCompletos);
        }
        if (filter.Estado !== null && filter.Estado !== undefined && filter.Estado !== 0 && filter.Estado !== '') {
            params = params.set('Estado', filter.Estado);
        }

        const opciones = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Empresa': `${localStorage.getItem('empresa')}`
            }),
            params: params
        };

        return this.http.get(`${url}DipositivosHID`, opciones).pipe(
            catchError((e: any) =>
                of(e)
            ),
            switchMap((response: any) => {
                return of(response);
            })
        );
    }

    getById(id: string) {
        return this.http.get(`${url}DipositivosHID/${id}`, {
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