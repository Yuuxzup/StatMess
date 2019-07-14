import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FileDropPageComponent } from './file-drop-page/file-drop-page.component';
import { HomePannelPageComponent } from './home-pannel-page/home-pannel-page.component';
import { LoadingCustomComponent } from './file-drop-page/loading-custom/loading-custom.component';
import { ProfilPannelComponent } from './home-pannel-page/profil-pannel/profil-pannel.component';
import { ConvsPannelComponent } from './home-pannel-page/convs-pannel/convs-pannel.component';
import { OwnStatsPannelComponent } from './home-pannel-page/own-stats-pannel/own-stats-pannel.component';
import { CguComponent } from './cgu/cgu.component';
import { LandingComponent } from './landing/landing.component';

const routes: Routes = [
  { path: '', component: LandingComponent},
  { path: 'home', component: FileDropPageComponent},
  { path:'panels/own-stats', component: OwnStatsPannelComponent},
  { path: 'panels/conv', component: ConvsPannelComponent},
  { path:'panels/profil', component: ProfilPannelComponent},
  { path:'panels', component: HomePannelPageComponent},
  { path:'**', redirectTo:'home', pathMatch:'full'} 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule { }