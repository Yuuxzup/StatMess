import { Component, OnInit } from '@angular/core';
import { GlobalService } from './global.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit {
  isReady=false;
  isCguVisible=false;

  constructor(private globalService:GlobalService) { }

  ngOnInit(){
    this.globalService.defineDB()
    console.log("BD on process : "+this.globalService.nameDB)
  }

  launch(){
    this.isReady=true;
  }

  showHideCgu(){
    this.isCguVisible=!this.isCguVisible
  }
}
