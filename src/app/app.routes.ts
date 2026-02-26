import { RouterModule, Routes } from '@angular/router';
import { setLayout } from './components/layout/services/page-layout-resolve.service';
import { PageLayout } from './components/layout/enums/page-layout.enum';
import { NotfoundComponent } from './components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/layout/components/map-layout/map-layout.component')
        .then(m => m.MapLayoutComponent),
    resolve: {
      layout: setLayout(PageLayout.unAuthorized)
    },
    children: [
      {
        path: '', pathMatch: 'full', loadComponent: () =>
          import('./components/cities-list/cities-list.component')
            .then(m => m.CitiesListComponent)
      },
      {
        path: 'city/:id',
        loadComponent: () =>
          import('./components/cities-detail/cities-detail.component')
            .then(m => m.CitiesDetailComponent),
        canActivate: []
      }
    ]
  },
  { path: 'notfound', component: NotfoundComponent },
  { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(routes);


