import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material-module'
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { 
	IgxInputGroupModule,
	IgxSliderModule
 } from "igniteui-angular";

import { AppComponent } from './app.component';
import { FileDropPageComponent } from './file-drop-page/file-drop-page.component';

import { StatsConvService } from  './home-pannel-page/convs-pannel/stats-conv.service';
import { HomePannelPageComponent } from './home-pannel-page/home-pannel-page.component';
import { LoadingCustomComponent } from './file-drop-page/loading-custom/loading-custom.component';

import { ProfilPannelComponent } from './home-pannel-page/profil-pannel/profil-pannel.component';
import { ConvsPannelComponent } from './home-pannel-page/convs-pannel/convs-pannel.component';
import { OwnStatsPannelComponent } from './home-pannel-page/own-stats-pannel/own-stats-pannel.component';
import { PrevisuConvComponent } from './home-pannel-page/convs-pannel/previsu-conv/previsu-conv.component';
import { OneConvStatsComponent } from './home-pannel-page/convs-pannel/one-conv-stats/one-conv-stats.component';
import { OverviewStatComponent } from './home-pannel-page/convs-pannel/one-conv-stats/overview-stat/overview-stat.component';
import { OwnStatsService } from './home-pannel-page/own-stats-pannel/own-stats.service';
import { MessagesStatComponent } from './home-pannel-page/convs-pannel/one-conv-stats/messages-stat/messages-stat.component';
import { TimeStatComponent } from './home-pannel-page/convs-pannel/one-conv-stats/time-stat/time-stat.component';
import { ReactionsStatComponent } from './home-pannel-page/convs-pannel/one-conv-stats/reactions-stat/reactions-stat.component';
import { AutresStatComponent } from './home-pannel-page/convs-pannel/one-conv-stats/autres-stat/autres-stat.component';
import { GlobalService } from './global.service';
import { SliderPersoComponent } from './home-pannel-page/profil-pannel/slider-perso/slider-perso.component';
import { ProfilServiceService } from './home-pannel-page/profil-pannel/profil-service.service';
import { DeterminationService } from './home-pannel-page/profil-pannel/determination.service';
import { CguComponent } from './cgu/cgu.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { LandingComponent } from './landing/landing.component';
import {Routes, RouterModule} from "@angular/router"



const appRoutes: Routes =[
  { path: '', component: LandingComponent},
  { path: 'home', component: FileDropPageComponent},
  { path:'home/own-stats', component: OwnStatsPannelComponent},
  { path: 'home/conv', component: ConvsPannelComponent},
  { path:'home/profil', component: ProfilPannelComponent},
  { path:'**', redirectTo:'home', pathMatch:'full'},
  { path:'panels', component: HomePannelPageComponent},
  { path:'loading', component: LoadingCustomComponent}

  
]


@NgModule({
  imports:[BrowserModule, FormsModule, ReactiveFormsModule,MaterialModule, HttpClientModule, NgbModule, IgxInputGroupModule,
		IgxSliderModule, AngularFontAwesomeModule, RouterModule.forRoot(appRoutes)],
  declarations: [ AppComponent, FileDropPageComponent, HomePannelPageComponent, LoadingCustomComponent, ProfilPannelComponent, ConvsPannelComponent, OwnStatsPannelComponent, PrevisuConvComponent, OneConvStatsComponent, OverviewStatComponent, MessagesStatComponent, TimeStatComponent, ReactionsStatComponent, AutresStatComponent, SliderPersoComponent, CguComponent, LandingComponent],
  bootstrap:    [ AppComponent ],
  providers: [StatsConvService, OwnStatsService, GlobalService, ProfilServiceService, DeterminationService]
})
export class AppModule {}

  
