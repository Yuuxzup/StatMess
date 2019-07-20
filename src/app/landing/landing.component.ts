import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../global.service';
<<<<<<< HEAD
import {RouterModule,Router} from '@angular/router';
=======
>>>>>>> ecb0bbf3b5d0cd9e55dbc1d9ea17cce5489e52c6

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
<<<<<<< HEAD

=======
>>>>>>> ecb0bbf3b5d0cd9e55dbc1d9ea17cce5489e52c6


  constructor(private globalService:GlobalService) { }

  ngOnInit(){
    setTimeout(()=>{this.changeAvis()}, 7500)
    this.globalService.defineDB()
    console.log("BD on process : "+this.globalService.nameDB)
  }

  ngAfterViewInit(){

  var timer = this.timer;
  var i = 0;
  var max = document.getElementById('c').getElementsByTagName("li").length;
 
	document.getElementById('c').getElementsByTagName("li")[i].style.opacity="1";
  document.getElementById('c').getElementsByTagName("li")[i].style.left="0%";

  document.getElementById('c').getElementsByTagName("li")[i+1].style.opacity="1";
  document.getElementById('c').getElementsByTagName("li")[i+1].style.left="25%";
  
  setInterval(function(){ 
    

		document.getElementById('c').getElementsByTagName("li")[0].style.opacity="0";
    document.getElementById('c').getElementsByTagName("li")[1].style.opacity="0";
    document.getElementById('c').getElementsByTagName("li")[2].style.opacity="0";
    document.getElementById('c').getElementsByTagName("li")[3].style.opacity="0";
    document.getElementById('c').getElementsByTagName("li")[4].style.opacity="0";
    document.getElementById('c').getElementsByTagName("li")[5].style.opacity="0";
    document.getElementById('c').getElementsByTagName("li")[6].style.opacity="0";
    document.getElementById('c').getElementsByTagName("li")[7].style.opacity="0";
    document.getElementById('c').getElementsByTagName("li")[8].style.opacity="0";
    document.getElementById('c').getElementsByTagName("li")[9].style.opacity="0";


    document.getElementById('c').getElementsByTagName("li")[i].style.transitionDelay='0.25s';
    document.getElementById('c').getElementsByTagName("li")[i+1].style.transitionDelay='0.5s'; //0.50

		if (i < max-2) {
			i = i+2; 
		}

		else { 
			i = 0; 
		}  

    document.getElementById('c').getElementsByTagName("li")[i].style.opacity="1";
    document.getElementById('c').getElementsByTagName("li")[i].style.left="0";
    document.getElementById('c').getElementsByTagName("li")[i].style.transitionDelay='1.25s';

    document.getElementById('c').getElementsByTagName("li")[i+1].style.opacity="1";
    document.getElementById('c').getElementsByTagName("li")[i+1].style.left="25%";
    document.getElementById('c').getElementsByTagName("li")[i+1].style.transitionDelay='1.5s';
    
	
	}, timer);
    
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




