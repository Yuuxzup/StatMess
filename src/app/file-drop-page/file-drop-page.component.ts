import { Component, OnInit } from '@angular/core';
import { StatsConvService } from '../home-pannel-page/convs-pannel/stats-conv.service';
import { GlobalService } from '../global.service';
import { HttpClient } from '@angular/common/http';
import $ from 'jquery';

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

  constructor(private httpClient: HttpClient, private statsConvService: StatsConvService, private globalService : GlobalService) { }

  ngOnInit(){

    //Création de la table profil
    /*let listProfil=["INTJ", "INTP","ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP", "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"]
    for (var k=0; k<listProfil.length; k++){
      let profil={"profil":listProfil[k], "occurence":0}
      this.httpClient.post('https://statsmess.firebaseio.com/repartitionProfils.json', profil).subscribe(
        () => {
          console.log("compteur "+"fileDrop"+" succes update")
        },
        (error) => {
          console.log("can't log")
        }
      );
    }*/

    //Création de la table visites
    /*let listePage=["fileDrop", "home", "ownStat", "convStat", "profil", "cgu"]

    for (var k=0; k<listePage.length; k++){
      let oneCompteur={"idPage":listePage[k], "nbrVisite":0, "timeSpent":0}

      this.httpClient.post('https://statsmess.firebaseio.com/compteurVisites.json', oneCompteur).subscribe(
              () => {
                console.log("compteur "+"fileDrop"+" succes update")
              },
              (error) => {
              }
            );
    }*/
          

    this.httpClient
      .get<any[]>('https://statsmess.firebaseio.com/compteurVisites.json')
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
                    this.listFilesDico = this.globalService.fillInfoInListFile(tempoListFilesDico)
                    this.globalService.findUserName(this.listFilesDico);
                    this.globalService.doCalculForOwnStats(this.listFilesDico)
                    this.globalService.doCalculForConv(this.listFilesDico)
                    this.globalService.doCalculForProfil(this.listFilesDico)
                    this.loadingOk=true;
                    },3000)
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
    $('#modal-container').removeAttr('class').addClass('one');
    $('body').addClass('modal-active');
  }

  hideTutorial(){
    $('#modal-container').addClass('out');
    $('body').removeClass('modal-active');
  }

}