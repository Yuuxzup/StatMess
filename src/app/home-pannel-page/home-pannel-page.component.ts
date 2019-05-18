import { Component, OnInit, Input} from '@angular/core';
import { GlobalService } from '../global.service'
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home-pannel-page',
  templateUrl: './home-pannel-page.component.html',
  styleUrls: ['./home-pannel-page.component.css']
})
export class HomePannelPageComponent implements OnInit {
  @Input() listFilesDico:any;

  isHome = true;
  isMyStats = false;
  isMyConvs = false;
  isMyProfil = false;

  timeLastSwitch:any;

  constructor(private httpClient: HttpClient, private globalService:GlobalService) { }

  ngOnInit() {
    this.timeLastSwitch=(new Date()).getTime()
    this.httpClient
      .get<any[]>('https://statsmess.firebaseio.com/compteurVisites.json')
      .subscribe(
        (response) => {
          let idPage = "home"
          let compteurVisites = response;
          let compteurPage;
          let keyModified;
          for(var k=0;k<Object.keys(compteurVisites).length ;k++){
            let key = Object.keys(compteurVisites)[k]
            if (compteurVisites[key]["idPage"]===idPage){
              compteurPage=compteurVisites[key]
              keyModified=key
            }
          }
          compteurPage["nbrVisite"]+=1
          compteurPage["timeSpent"]+=0
          compteurVisites[keyModified]=compteurPage
          this.httpClient.put('https://statsmess.firebaseio.com/compteurVisites.json', compteurVisites).subscribe(
            () => {
              console.log("compteur "+idPage+" succes update")
            },
            (error) => {
            }
          );
        },
        (error) => {
        })
  }

  switchPannel(aimedPannel : string){
    if(this.isHome){
      this.timeLastSwitch=new Date().getTime()
    }
    if(this.isMyStats){
      this.httpClient
        .get<any[]>('https://statsmess.firebaseio.com/compteurVisites.json')
        .subscribe(
          (response) => {
            let idPage="ownStat"
            let compteurVisites = response;
            let compteurPage;
            let keyModified;
            for(var k=0;k<Object.keys(compteurVisites).length ;k++){
              let key = Object.keys(compteurVisites)[k]
              if (compteurVisites[key]["idPage"]===idPage){
                compteurPage=compteurVisites[key]
                keyModified=key
              }
            }
            compteurPage["nbrVisite"]+=1
            compteurPage["timeSpent"]+=Math.floor(((new Date()).getTime()-this.timeLastSwitch)/1000)
            compteurVisites[keyModified]=compteurPage
            this.httpClient.put('https://statsmess.firebaseio.com/compteurVisites.json', compteurVisites).subscribe(
              () => {
                console.log("compteur "+idPage+" succes update")
                this.timeLastSwitch=new Date().getTime()
              },
              (error) => {
              }
            );
          },
          (error) => {
          })
    }
    if(this.isMyConvs){
      this.httpClient
        .get<any[]>('https://statsmess.firebaseio.com/compteurVisites.json')
        .subscribe(
          (response) => {
            let idPage="convStat"
            let compteurVisites = response;
            let compteurPage;
            let keyModified;
            for(var k=0;k<Object.keys(compteurVisites).length ;k++){
              let key = Object.keys(compteurVisites)[k]
              if (compteurVisites[key]["idPage"]===idPage){
                compteurPage=compteurVisites[key]
                keyModified=key
              }
            }
            compteurPage["nbrVisite"]+=1
            compteurPage["timeSpent"]+=Math.floor(((new Date()).getTime()-this.timeLastSwitch)/1000)
            compteurVisites[keyModified]=compteurPage
            this.httpClient.put('https://statsmess.firebaseio.com/compteurVisites.json', compteurVisites).subscribe(
              () => {
                console.log("compteur "+idPage+" succes update")
                this.timeLastSwitch=new Date().getTime()
              },
              (error) => {
              }
            );
          },
          (error) => {
          })
    }
    if(this.isMyProfil){
      this.httpClient
        .get<any[]>('https://statsmess.firebaseio.com/compteurVisites.json')
        .subscribe(
          (response) => {
            let idPage="profil"
            let compteurVisites = response;
            let compteurPage;
            let keyModified;
            for(var k=0;k<Object.keys(compteurVisites).length ;k++){
              let key = Object.keys(compteurVisites)[k]
              if (compteurVisites[key]["idPage"]===idPage){
                compteurPage=compteurVisites[key]
                keyModified=key
              }
            }
            compteurPage["nbrVisite"]+=1
            compteurPage["timeSpent"]+=Math.floor(((new Date()).getTime()-this.timeLastSwitch)/1000)
            compteurVisites[keyModified]=compteurPage
            this.httpClient.put('https://statsmess.firebaseio.com/compteurVisites.json', compteurVisites).subscribe(
              () => {
                console.log("compteur "+idPage+" succes update")
                this.timeLastSwitch=new Date().getTime()
              },
              (error) => {
              }
            );
          },
          (error) => {
          })
    }

    this.isMyStats = false;
    this.isMyConvs = false;
    this.isMyProfil = false;
    this.isHome = false;

    if (aimedPannel === "ownStats"){
      this.isMyStats = true;
    }
    if (aimedPannel === "statsConv"){
      this.isMyConvs = true;
    }
    if (aimedPannel === "profil"){
      this.isMyProfil = true;
    }
    if (aimedPannel === "home"){
      this.isHome = true;
    }
  }
}