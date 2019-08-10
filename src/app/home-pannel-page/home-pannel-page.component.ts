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

  isRateMoment = false;
  isRated= false;

  constructor(private httpClient: HttpClient, private globalService:GlobalService, private router:Router) { }

  ngOnInit() {
    //Scroll to the top
    document.body.scrollTop = 0;
    
    if(this.globalService.loadingDone=== false){
      this.router.navigate(['../home']);
      alert("Veuillez sélectionner votre dossier à analyser afin d'accéder à cette page");
    }

    this.globalService.switchPannel("home")

    if (this.globalService.isRateMoment){
        this.isRateMoment=true
        setTimeout(function(){this.closeTooltip(); }, 15000)
    }
  }

  closeTooltip(){
    this.isRateMoment=false;
  }

  rateSightMess(number : any){
    
    this.httpClient
      .get<any[]>(this.globalService.defineDB()+'starRate.json')
      .subscribe(
        (response) => {
          let rateDico = response;
          let rateTab = rateDico['ratingTab'];
          
          let nbrVote = 1
          let sum=number
          for (var k=0; k<rateTab.length;k++){
            nbrVote+=rateTab[k]
            sum+=rateTab[k]*(k+1)
          }

          rateTab[number-1]+=1
          let mean=sum/nbrVote
          rateDico['ratingTab']=rateTab
          rateDico['mean']=mean

          this.httpClient.put(this.globalService.defineDB()+'starRate.json', rateDico).subscribe(
            () => {
              console.log("Rating maj success")
            },
            (error) => {
            }
          );
        },
        (error) => {
        })

    this.isRated = true;
    setTimeout(()=>{
      this.closeTooltip();
    }, 1500)
    
  }
}