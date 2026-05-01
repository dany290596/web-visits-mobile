import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Layout } from './layout';

const routes: Routes = [
    {
        path: 'dashboard',
        component: Layout,
        loadChildren: () => import('../dashboard/dashboard.module').then((m) => m.DashboardModule),
    },
    {
        path: 'authentication',
        component: Layout,
        loadChildren: () => import('../protected/authentication/authentication.routes').then(m => m),
    },
    {
        path: 'hid',
        component: Layout,
        loadChildren: () => import('../protected/hid/hid.routes').then(m => m),
    },
    {
        path: 'parameterization',
        component: Layout,
        loadChildren: () => import('../protected/parameterization/parameterization.routes').then(m => m),
    },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: 'error/404' },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LayoutRoutingModule { }