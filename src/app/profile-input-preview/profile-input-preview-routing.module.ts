import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfileInputPreviewPage } from './profile-input-preview.page';

const routes: Routes = [
  {
    path: '',
    component: ProfileInputPreviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileInputPreviewPageRoutingModule {}
