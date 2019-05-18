import { Injectable } from '@angular/core';
import {ProfilServiceService} from './profil-service.service';

@Injectable()
export class DeterminationService {

  profilType:any;
  dataForText:any;

  constructor(private profilServiceService : ProfilServiceService) { }

  determinationProfil(listFileDico : any){
    if (this.profilType){
      return this.profilType
    }

    let firstLetter = this.determineFirstLetter(listFileDico)
    let secondLetter = this.determineSecondLetter(listFileDico)
    let thirdLetter = this.determineThirdLetter(listFileDico)
    let fourthLetter = this.determineFourthLetter(listFileDico)

    this.profilType = firstLetter.concat(secondLetter.concat(thirdLetter.concat(fourthLetter)))
    console.log("You are profil "+this.profilType)
    return this.profilType
  }

  createDataForText(profilUser : any){
    if (this.dataForText){
      return this.dataForText
    }

    switch (profilUser) {
      case 'A':
        this.dataForText={"name":"A", "time":32, "test":43}
      break;

      case 'B':
        this.dataForText={"name":"B", "time":32, "test":43}
      break;

      case 'C':
        this.dataForText={"name":"C", "time":32, "test":43}
      break;

      default:
        this.dataForText={"name":"Default", "time":32, "test":43}
        console.log('Sacré Roublaw, you know what I mean');
    }

    return this.dataForText
  }

  // Ici : Introverti = -1, Extraverti = +1
  determineFirstLetter(listFileDico : any){

    let scoreLocal = 0

    let scoreResBav = this.profilServiceService.calculScoreResBav(listFileDico)
    let scoreFidExt = this.profilServiceService.calculScoreFidExt(listFileDico)
    let scoreSpoRef = -this.profilServiceService.calculScoreSpoRef(listFileDico)
    let scoreEgoAlt = -this.profilServiceService.calculScoreEgoAlt(listFileDico)

    scoreLocal = 0.35*scoreResBav + 0.35*scoreFidExt + 0.2*scoreSpoRef + 0.1*scoreEgoAlt
    console.log("score loc E/I " + scoreLocal)

    if(scoreLocal >= 0){
      return "E"
    }
    else if(scoreLocal < 0){
      return "I"
    }
    else{
      console.log("Erreur : impossible de déterminer first letter")
    }
  }

  // Ici : Sensitif = -1, Intuitif = +1
  determineSecondLetter(listFileDico : any){

    let scoreLocal = 0

    let scoreConCur = -this.profilServiceService.calculScoreConCur(listFileDico)
    let scoreSpoRef = -this.profilServiceService.calculScoreSpoRef(listFileDico)
    let scoreFidExt = this.profilServiceService.calculScoreFidExt(listFileDico)

    scoreLocal = 0.25*scoreConCur + 0.5*scoreSpoRef + 0.25*scoreFidExt
    console.log("score loc S/N " + scoreLocal)

    if(scoreLocal > 0){
      return "N"
    }
    else if(scoreLocal <= 0){
      return "S"
    }
    else{
      console.log("Erreur : impossible de déterminer second letter")
    }
  }

  // Ici : Penseur T = -1, Sentimental F = +1
  determineThirdLetter(listFileDico : any){

    let scoreLocal = 0

    let scoreSpoRef = -this.profilServiceService.calculScoreSpoRef(listFileDico)
    let scoreSolExp = this.profilServiceService.calculScoreSolExp(listFileDico)
    let scoreEgoAlt = this.profilServiceService.calculScoreEgoAlt(listFileDico)
    let scoreConCur = this.profilServiceService.calculScoreConCur(listFileDico)
    let scoreResBav = this.profilServiceService.calculScoreResBav(listFileDico)

    scoreLocal = 0.26*scoreSpoRef + 0.26*scoreSolExp + 0.16*scoreEgoAlt + 0.16*scoreConCur + 0.16*scoreResBav
    console.log("score loc T/F " + scoreLocal)

    if(scoreLocal > 0){
      return "F"
    }
    else if(scoreLocal <= 0){
      return "T"
    }
    else{
      console.log("Erreur : impossible de déterminer third letter")
    }
  }

  // Ici : Juge J = -1, Perceptif P = +1
  determineFourthLetter(listFileDico : any){

    let scoreLocal = 0

    let scorePro = -this.profilServiceService.calculScorePro(listFileDico)
    let scoreAtWork = -this.profilServiceService.calculScoreAtWork(listFileDico)
    let scoreTauHum = (this.profilServiceService.calculScoreRie(listFileDico) + this.profilServiceService.calculScoreBla(listFileDico))/2
    let scoreSolExp = this.profilServiceService.calculScoreSolExp(listFileDico)
    let scoreSpoRef = -this.profilServiceService.calculScoreSpoRef(listFileDico)

    scoreLocal = 0.275*scorePro + 0.275*scoreAtWork + 0.15*scoreTauHum + 0.15*scoreSolExp + 0.15*scoreSpoRef
    console.log("score loc J/P " + scoreLocal)

    if(scoreLocal > 0){
      return "P"
    }
    else if(scoreLocal <= 0){
      return "J"
    }
    else{
      console.log("Erreur : impossible de déterminer fourth letter")
    }
  }

}