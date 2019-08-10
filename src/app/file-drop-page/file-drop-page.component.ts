import { Component, OnInit} from '@angular/core';
import { StatsConvService } from '../home-pannel-page/convs-pannel/stats-conv.service';
import { GlobalService } from '../global.service';
import { HttpClient } from '@angular/common/http';
import * as $ from 'jquery';
import {RouterModule,Router} from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';


@Component({
  selector: 'app-file-drop-page',
  templateUrl: './file-drop-page.component.html',
  styleUrls: ['./file-drop-page.component.scss']
})
export class FileDropPageComponent implements OnInit{

  listFilesDico = [];
  isZipLoaded = false;
  isLoading=false;
  loadingPercent = 0
  loadingOk=false;
  nbrFichier : number;
  timer = 4000;
  nbrVisite : any;

  isRateMoment=false;
  isCguVisible=false;
  isFullLoaded=false;

  rating=0
  nbrVote=0;

  constructor(private httpClient: HttpClient, private statsConvService: StatsConvService, private globalService : GlobalService, private router: Router, private deviceService: DeviceDetectorService) { }

  ngOnInit(){
    
    this.httpClient.get<any[]>(this.globalService.defineDB()+'starRate.json').subscribe(
      (response) => {
        this.rating = response['mean']
        let rateTab = response['ratingTab'];
          
        this.nbrVote = 0
        for (var k=0; k<rateTab.length;k++){
          this.nbrVote+=rateTab[k]
        }
      },
      (error) => { 
    })
    

    
       
    this.httpClient
      .get<any[]>(this.globalService.defineDB()+'compteurVisites.json')
      .subscribe(
        (response) => {
          
          let idPage = "fileDrop"
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
          
          this.nbrVisite=compteurPage["nbrVisite"]
          compteurPage["nbrVisite"]+=1
          compteurPage["timeSpent"]+=0
          compteurVisites[keyModified]=compteurPage
          
          
          this.httpClient.put(this.globalService.defineDB()+'compteurVisites.json', compteurVisites).subscribe(
            () => {
              console.log("compteur "+idPage+" succes update")
            },
            (error) => {
            }
          );
        
        },
        (error) => {
        })
         
        this.isFullLoaded=true;
  }

  onSelectFile(event) {
  this.isLoading=true;
  let files = event.target.files;
  let newFiles = [];
  for (let i=0; i<files.length; i++) {
      if( files[i].name === "message_1.json"){ 
        newFiles.push(files[i])
      }
  };
    if (event.target.files && event.target.files[0]) {
        var filesAmount = newFiles.length;
        if (filesAmount===0){
          alert("Vous essayez d'importer un dossier sans conversation, merci de réessayer")
          this.isLoading=false;
          return
        }
        this.nbrFichier = filesAmount
        let amountTackled = 0
        let percentageTackled = 0
        let tempoListFilesDico=[]
        for (let i = 0; i < filesAmount; i++) {
                var reader = new FileReader();
                reader.onloadstart = (event) => {
                percentageTackled+=(1/filesAmount)*100
                this.loadingPercent=Math.floor(percentageTackled)
                amountTackled+=1;
                if (amountTackled===filesAmount){
                  setTimeout(()=>{
                    this.globalService.fillInfoInListFile(tempoListFilesDico)
                    this.globalService.doCalcul()
                    this.loadingOk=true;
                    this.globalService.updateLoading();
                    this.router.navigate(['../panels'])
                    },5000)
                }}
                reader.onload = (event) => {
                  let nameTitle=decodeURIComponent(escape(JSON.parse(String((<FileReader>event.target).result))["title"]))
                  if (nameTitle!="Utilisateur de Facebook" && nameTitle!="undefined"){
                    let fileDico = {}
                    let data = JSON.parse(String((<FileReader>event.target).result))
                    if (data["participants"]){
                      fileDico["content"]=data
                      tempoListFilesDico.push(fileDico)
                    }
                    
                  }
                }
                reader.readAsText(newFiles[i]);
        }
    }
  this.isZipLoaded=true;
  }

  showTutorial(){
    this.httpClient
      .get<any[]>(this.globalService.defineDB()+'compteurClics.json')
      .subscribe(
        (response) => {
          
          let compteurClics = response;
          let compteurButtonClick;
          let keyModified;
          for(var k=0;k<Object.keys(compteurClics).length ;k++){
            let key = Object.keys(compteurClics)[k]
            if (compteurClics[key]["idButton"]==="tutorialClic"){
              compteurButtonClick=compteurClics[key]
              keyModified=key
            }
            
          }
          
          this.nbrVisite=compteurButtonClick["nbrClic"]
          compteurButtonClick["nbrClic"]+=1
          compteurClics[keyModified]=compteurButtonClick
          
          
          this.httpClient.put(this.globalService.defineDB()+'compteurClics.json', compteurClics).subscribe(
            () => {
            },
            (error) => {
            }
          );
        
        },
        (error) => {
        })
    if(this.deviceService.isDesktop()){
      $('#modal-container').removeAttr('class').addClass('one');
      $('body').addClass('modal-active');
    }
    else{
      $('#modal-container-mobile').removeAttr('class').addClass('one');
      $('body').addClass('modal-active');
    }
  }

  hideTutorial(){
    if(this.deviceService.isDesktop()){
      $('#modal-container').addClass('out');
      $('body').removeClass('modal-active');
    }
    else{
      $('#modal-container-mobile').addClass('out');
      $('body').removeClass('modal-active');
    }
  }

  showHideCgu(){
    this.isCguVisible=!this.isCguVisible;
  }
}