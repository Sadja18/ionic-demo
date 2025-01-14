import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'export-profile',
    pathMatch: 'full'
  },
  {
    path: 'profile-input',
    loadChildren: () => import('./profile-input/profile-input.module').then( m => m.ProfileInputPageModule)
  },
  {
    path: 'profile-list',
    loadChildren: () => import('./profile-list/profile-list.module').then( m => m.ProfileListPageModule)
  },
  {
    path: 'profile-input-preview',
    loadChildren: () => import('./profile-input-preview/profile-input-preview.module').then( m => m.ProfileInputPreviewPageModule)
  },
  {
    path: 'profile-detail/:number',
    loadChildren: () => import('./profile-detail/profile-detail.module').then( m => m.ProfileDetailPageModule)
  },
  {
    path: 'export-profile',
    loadChildren: () => import('./export-profile/export-profile.module').then( m => m.ExportProfilePageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
