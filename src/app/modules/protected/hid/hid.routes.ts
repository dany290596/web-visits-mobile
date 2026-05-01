import { Routes } from '@angular/router';

import { UsuarioHid } from './pages/usuario-hid/usuario-hid';
import { CredencialHid } from './pages/credencial-hid/credencial-hid';
import { LicenciaHid } from './pages/licencia-hid/licencia-hid';
import { DispositivoHid } from './pages/dispositivo-hid/dispositivo-hid';

export default [
    {
        path: 'licencia',
        component: LicenciaHid
    },
    {
        path: 'usuario',
        component: UsuarioHid
    },
    {
        path: 'credencial',
        component: CredencialHid
    },
    {
        path: 'dispositivo',
        component: DispositivoHid
    },
    {
        path: '**',
        redirectTo: 'usuario'
    }
] as Routes;