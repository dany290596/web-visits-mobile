import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full'
    },
    {
        path: '',
        children: [
            { path: 'sign-in', loadChildren: () => import('./modules/auth/pages/sign-in/sign-in.routes') }
        ]
    },
    {
        path: 'layout',
        loadChildren: () => import('./modules/layout/layout.module').then((m) => m.LayoutModule),
    }
];