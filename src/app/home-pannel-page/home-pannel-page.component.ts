import { Component, OnInit, Input} from '@angular/core';
import { GlobalService } from '../global.service'
import { HttpClient } from '@angular/common/http';
import {RouterModule,Router} from '@angular/router';

@Component({
  selector: 'app-home-pannel-page',
  templateUrl: './home-pannel-page.component.html',
  styleUrls: ['./home-pannel-page.component.scss']
})
export class HomePannelPageComponent implements OnInit {
  @Input() listFilesDico:any;

  isHome = true;
  isMyStats = false;
  isMyConvs = false;
  isMyProfil = false;

  timeLastSwitch:any;

  constructor(private httpClient: HttpClient, private globalService:GlobalService, private router:Router) { }

  ngOnInit() {
    //Scroll to the top
    document.body.scrollTop = 0;
    
    if(this.globalService.loadingDone=== false){
      this.router.navigate(['../home']);
      alert("Veuillez sélectionner votre dossier à analyser afin d'accéder à cette page");
    }
    this.timeLastSwitch=(new Date()).getTime()

    this.globalService.switchPannel("home")
  }
}