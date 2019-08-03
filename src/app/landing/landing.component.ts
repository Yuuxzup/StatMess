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

  constructor(private globalService:GlobalService, private router: Router) { }

ngOnInit(){
  
}
  launch(){
    this.isReady=true;
  }
}