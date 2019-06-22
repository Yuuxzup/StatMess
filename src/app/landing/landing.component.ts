import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../global.service';
import {RouterModule,Router} from '@angular/router';


@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  isReady=false;
  timer = 8000;

  avisA=true;
  avisB=false;
  
  

  constructor(private globalService:GlobalService, private router: Router) { }

ngOnInit(){
    //setTimeout(()=>{this.changeAvis()}, 7500)
    //this.globalService.defineDB()
    //console.log("BD on process : "+this.globalService.nameDB)

}


  launch(){
    this.isReady=true;
  }

  changeAvis(){
    this.avisA=!this.avisA
    this.avisB=!this.avisB
    setTimeout(()=>{this.changeAvis()}, 7500)
  }
}