import { Component, OnInit, Input } from '@angular/core';
import {ProfilServiceService} from './profil-service.service';
import {DeterminationService} from './determination.service';
import {DomSanitizer} from '@angular/platform-browser'

@Component({
  selector: 'app-profil-pannel',
  templateUrl: './profil-pannel.component.html',
  styleUrls: ['./profil-pannel.component.scss']
})
export class ProfilPannelComponent implements OnInit {

  @Input()  listFilesDico : any;

  scoreResBav : any;
  scoreFidExt : any;
  scoreCoucheLeve : any;
  scoreSpoRef : any;
  scoreSolExp : any;
  scoreConCur : any;
  scoreEgoAlt : any;
  scorePro : any;
  scoreInf : any;
  scoreBla : any;
  scoreRie : any;
  scoreTauHum : any;
  scoreEntCon : any;
  scoreTch : any;
  scoreAtWork : any;

  styleBla:any;
  styleTch:any;
  styleRie:any;
  styleTauHum:any;

  listSlider:any;

  profilUser:any;
  dataForText:any;

  isProfilFirstRun=true;


  constructor(private profilServiceService : ProfilServiceService, private determinationService : DeterminationService,  private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.isProfilFirstRun=this.profilServiceService.firstRun
    this.profilServiceService.switchBooleanFirstRun()
    setTimeout(()=>{
      //this.closeTooltip();
    }, 10000)
    this.calculDataForSlider();
    this.determineProfil();
  }

  calculDataForSlider(){
    this.profilServiceService.findUserName(this.listFilesDico);
    this.profilServiceService.findUserSex(this.listFilesDico);
    this.scoreResBav = this.profilServiceService.calculScoreResBav(this.listFilesDico);
    this.scoreFidExt = this.profilServiceService.calculScoreFidExt(this.listFilesDico);
    this.scoreCoucheLeve = this.profilServiceService.calculScoreCoucheLeve(this.listFilesDico);
    this.scoreSpoRef = this.profilServiceService.calculScoreSpoRef(this.listFilesDico);
    this.scoreSolExp = this.profilServiceService.calculScoreSolExp(this.listFilesDico);
    this.scoreConCur = this.profilServiceService.calculScoreConCur(this.listFilesDico);
    this.scoreEgoAlt = this.profilServiceService.calculScoreEgoAlt(this.listFilesDico);
    this.scorePro = this.profilServiceService.calculScorePro(this.listFilesDico);
    this.scoreInf = this.profilServiceService.calculScoreInf(this.listFilesDico);
    this.scoreBla = Math.floor((this.profilServiceService.calculScoreBla(this.listFilesDico)*100+100)/2);
    this.styleBla = "conic-gradient( #E67E22 0 "+this.scoreBla+"%, #EEEEEE 0)"
    this.scoreRie = Math.floor((this.profilServiceService.calculScoreRie(this.listFilesDico)*100+100)/2);
    this.styleRie = "conic-gradient( #E67E22 0 "+this.scoreRie+"%, #EEEEEE 0)"
    this.scoreTauHum = Math.floor(((this.scoreBla + this.scoreRie)/2+100)/2)
    this.styleTauHum = "conic-gradient( #E67E22 0 "+this.scoreTauHum+"%, #EEEEEE 0)"
    this.scoreEntCon = this.profilServiceService.calculScoreEntCon(this.listFilesDico);
    this.scoreTch = Math.floor((this.profilServiceService.calculScoreTch(this.listFilesDico)*100+100)/2);
    this.styleTch = "conic-gradient( #E67E22 0 "+this.scoreTch+"%, #EEEEEE 0)"
    this.scoreAtWork = this.profilServiceService.calculScoreAtWork(this.listFilesDico);

    this.listSlider=[
      {"min":"Reservé","max":"Bavard","value":this.scoreResBav*100,"listInformations":["Votre nombre de caractères durant la dernière période de deux mois", "Le délai entre deux utilisations de Messenger", "Le nombre de conversations où vous parlez plus que votre correspondant"]},

      {"min":"Fidèle","max":"Extra-social","value":this.scoreFidExt*100,"listInformations":["La répartition de vos conversations récurrentes", "Votre nombre de conversation duo", "Votre nombre de conversation de groupe", "La proportion de nouveaux contacts d'une période à une autre", "La taille moyenne de vos groupes"]},

      {"min":"Lève tôt","max":"Lève tard","value":this.scoreCoucheLeve["Levé"]*100,"listInformations":["La répartition horaire de vos messages"]},

      {"min":"Couche tôt","max":"Couche tard","value":this.scoreCoucheLeve["Couché"]*100,"listInformations":["La répartition horaire de vos messages"]},

      {"min":"Spontané","max":"Réfléchi","value":this.scoreSpoRef*100,"listInformations":["La longueur moyenne de vos messages", "Le nombre de messages d'affilé moyen", "Votre temps de réponse"]},

      {"min":"Solennel","max":"Expressif","value":this.scoreSolExp*100,"listInformations":["Le nombre moyen de smileys par message", "La ponctuation utilisée", "Les réactions que vous envoyez"]},
      
      {"min":"Confiant","max":"Curieux","value":this.scoreConCur*100,"listInformations":["Le nombre de questions que vous posez"]},

      {"min":"Egoiste","max":"Altruiste","value":this.scoreEgoAlt*100,"listInformations":["Votre propension à parler de vous ou à écouter l'autre"]},

      {"min":"Looser","max":"Influenceur","value":this.scoreInf*100,"listInformations":["Votre nombre de messages", "La longueur de vos messages", "Les reactions reçues à vos messages", "Et bien sûr votre potentiel profond"]},

      {"min":"Rigolo","max":"Professionnel","value":this.scorePro*100,"listInformations":["La proportion de réactions sérieuses contre celles non sérieuses envoyées","La proportion de réactions sérieuses contre celles non sérieuses reçues"]},

      {"min":"Entreprenant","max":"Convoité","value":this.scoreEntCon*100,"listInformations":["Nombre de premiers pas effectués", "Nombre de conversations où vous parlez plus que l'autre", "Votre temps de réponse", "Les réactions que vous recevez par rapport à celles envoyées"]},

      {"min":"Lazy at work","max":"Serious at work","value":this.scoreAtWork*100,"listInformations":["Comparaison de votre activité le week end et celle sur vos heures de travail", "On a aussi bien sûr appelé votre boss"]},
    ]
  }

  determineProfil(){
    this.profilUser = this.determinationService.determinationProfil(this.listFilesDico);
    this.dataForText = this.determinationService.createDataForText(this.profilUser);
  }

  closeTooltip(){
    this.profilServiceService.switchBooleanFirstRun()
    this.isProfilFirstRun=false;
  }
}