import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProfilServiceService } from './home-pannel-page/profil-pannel/profil-service.service';
import { DeterminationService } from './home-pannel-page/profil-pannel/determination.service';
import { OwnStatsService } from './home-pannel-page/own-stats-pannel/own-stats.service';
import { StatsConvService } from './home-pannel-page/convs-pannel/stats-conv.service';


@Injectable()
export class GlobalService {
  userName : any;
  nameDB:any;

  private isLoading=false;
  constructor(private httpClient: HttpClient, private profilServiceService : ProfilServiceService, private determinationService : DeterminationService, private ownStatsService : OwnStatsService, private statsConvService : StatsConvService) { }

  defineDB(){
    let loc = document.location.href;
    this.nameDB = loc.includes("localhost") ? 'https://statsmess.firebaseio.com/' : 'https://statmess-trunk.firebaseio.com/';

    /*
    //Création de la table profil
    let listProfil=["INTJ", "INTP","ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP", "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"]
    for (var k=0; k<listProfil.length; k++){
      let profil={"profil":listProfil[k], "occurence":0}
      this.httpClient.post('https://statmess-trunk.firebaseio.com/repartitionProfils.json', profil).subscribe(
        () => {
          console.log("compteur "+"fileDrop"+" succes update")
        },
        (error) => {
          console.log("can't log")
        }
      );
    }

    //Création de la table visites
    let listePage=["fileDrop", "home", "ownStat", "convStat", "profil", "cgu"]

    for (var k=0; k<listePage.length; k++){
      let oneCompteur={"idPage":listePage[k], "nbrVisite":0, "timeSpent":0}

      this.httpClient.post('https://statmess-trunk.firebaseio.com/compteurVisites.json', oneCompteur).subscribe(
              () => {
                console.log("compteur "+"fileDrop"+" succes update")
              },
              (error) => {
              }
            );
    }

    //Création de la table visiteur
    let oneUser ={"date": new Date(), "name": "Paul Tondereau", "number":1}
    this.httpClient.post('https://statmess-trunk.firebaseio.com/oneUser.json', oneUser).subscribe(
      () => {
        console.log("Rating maj success")
      },
      (error) => {
      }
    );


    //Création de la table starRate
    let rateDico={}
    rateDico['ratingTab']=[0,0,0,0,0]
    rateDico['mean']=0

    this.httpClient.post('https://statmess-trunk.firebaseio.com/starRate.json', rateDico).subscribe(
      () => {
        console.log("Rating maj success")
      },
      (error) => {
      }
    );*/
  }

  findUserName(listFileDico : any){
    if (this.userName){
      return this.userName
    }
    let lUser= []
    let currentInd=0;
    while (currentInd<listFileDico.length && lUser.length===0){
      if (listFileDico[currentInd]["content"]["is_still_participant"]===true){
        listFileDico[currentInd]["content"]["participants"].forEach(function(element) {
          lUser.push(decodeURIComponent(escape(element["name"])))
        });
      } else {
        currentInd+=1
      }
    }
    let i=0
    while (lUser.length!=1 && i<listFileDico.length){
      if (listFileDico[i]["content"]["is_still_participant"]===true){
        let newLUser=[]
        listFileDico[i]["content"]["participants"].forEach(function(element) {
          if (lUser.indexOf(decodeURIComponent(escape(element["name"])))>-1){
            newLUser.push((decodeURIComponent(escape(element["name"]))))
          }})
        lUser=newLUser.slice()
      }
      i++
    }
    this.userName=lUser[0]


    var oneUser={"name":this.userName, "date":new Date(), "number":1}

    var listUser = []
    this.httpClient
      .get<any[]>(this.nameDB+'oneUser.json')
      .subscribe(
        (response) => {
          listUser = response;
          var alreadyIn = false;
          var listeCle = Object.keys(listUser)
          for(var k=0; k<listeCle.length;k++){
            if (!alreadyIn && listUser[listeCle[k]]["name"]===this.userName){
              listUser[listeCle[k]]["date"]=new Date();
              listUser[listeCle[k]]["number"]+=1;
              alreadyIn = true
            }
          }
          if (!alreadyIn){
            this.httpClient.post(this.nameDB+'oneUser.json', oneUser).subscribe(
            () => {
              //console.log("succes update with add")
            },
            (error) => {
            }
          );
          } else {
            this.httpClient.put(this.nameDB+'oneUser.json', listUser).subscribe(
              () => {
                //console.log("succes update")
              },
              (error) => {
              }
            );
          }
        },
        (error) => {
        }) 
    return this.userName
  }

  doCalculForProfil(listFileDico : any){
    console.log("Launching calcul for : findUserName")
    console.log("findUserName = " + this.profilServiceService.findUserName(listFileDico))
    console.log("Launching calcul for : findUserSex")
    console.log("findUserSex = " + this.profilServiceService.findUserSex(listFileDico))
    console.log("Launching calcul for : findLastMessageUploadTimestamp")
    console.log("findLastMessageUploadTimestamp = " + this.profilServiceService.findLastMessageUploadTimestamp(listFileDico))
    console.log("Launching calcul for : calculScoreResBav")
    console.log("calculScoreResBav = " +    this.profilServiceService.calculScoreResBav(listFileDico))
    console.log("Launching calcul for : calculScoreFidExt")
    console.log("calculScoreFidExt = " +    this.profilServiceService.calculScoreFidExt(listFileDico))
    console.log("Launching calcul for : calculScoreCoucheLeve")
    console.log("calculScoreCoucheLeve = " +    this.profilServiceService.calculScoreCoucheLeve(listFileDico))
    console.log("Launching calcul for : calculScoreSpoRef")
    console.log("calculScoreSpoRef = " +    this.profilServiceService.calculScoreSpoRef(listFileDico))
    console.log("Launching calcul for : calculScoreSolExp")
    console.log("calculScoreSolExp = " +    this.profilServiceService.calculScoreSolExp(listFileDico))
    console.log("Launching calcul for : calculScoreConCur")
    console.log("calculScoreConCur = " +    this.profilServiceService.calculScoreConCur(listFileDico))
    console.log("Launching calcul for : calculScoreEgoAlt")
    console.log("calculScoreEgoAlt = " +    this.profilServiceService.calculScoreEgoAlt(listFileDico))
    console.log("Launching calcul for : calculScorePro")
    console.log("calculScorePro = " +    this.profilServiceService.calculScorePro(listFileDico))
    console.log("Launching calcul for : calculScoreInf")
    console.log("calculScoreInf = " +    this.profilServiceService.calculScoreInf(listFileDico))
    console.log("Launching calcul for : calculScoreBla")
    console.log("calculScoreBla = " +    this.profilServiceService.calculScoreBla(listFileDico))
    console.log("Launching calcul for : calculScoreRie")
    console.log("calculScoreRie = " +    this.profilServiceService.calculScoreRie(listFileDico))
    console.log("Launching calcul for : calculScoreEntCon")
    console.log("calculScoreEntCon = " +   this.profilServiceService.calculScoreEntCon(listFileDico))
    console.log("Launching calcul for : calculScoreTch")
    console.log("calculScoreTch = " +    this.profilServiceService.calculScoreTch(listFileDico))
    console.log("Launching calcul for : calculScoreAtWork")
    console.log("calculScoreAtWork = " +    this.profilServiceService.calculScoreAtWork(listFileDico))

    this.determinationService.determinationProfil(listFileDico);
    console.log("Launching calcul for : determinationProfil")
    let profilUser = this.determinationService.profilType

    this.httpClient
      .get<any>(this.nameDB+'repartitionProfils.json')
      .subscribe(
        (response) => {
          let profilRepar = response;
          let profilToEdit;
          let keyModified;
          for(var k=0;k<Object.keys(profilRepar).length ;k++){
            let key = Object.keys(profilRepar)[k]
            if (profilRepar[key]["profil"]===profilUser){
              profilToEdit=profilRepar[key]
              keyModified=key
            }
          }
          profilToEdit["occurence"]+=1
          profilRepar[keyModified]=profilToEdit
          this.httpClient.put(this.nameDB+'repartitionProfils.json', profilRepar).subscribe(
            () => {
              console.log("compteur profil succes update")
            },
            (error) => {
            }
          );
        },
        (error) => {
  })
    
  }

  doCalculForOwnStats(listFileDico : any){
    console.log("Launching calcul for : findUserName")
    console.log("findUserName = " + this.ownStatsService.findUserName(listFileDico))
    console.log("Launching calcul for : determineListDateAndIndic")
    this.ownStatsService.determineListDateAndIndic(listFileDico);
    console.log("Launching calcul for : calculBubbleConv")
    console.log("calculBubbleConv = " + this.ownStatsService.calculBubbleConv(listFileDico)); //USELESS
    console.log("Launching calcul for : calculHoursISend")
    console.log("calculHoursISend = " + this.ownStatsService.calculHoursISend(listFileDico))
    console.log("Launching calcul for : calculNbrMessagePerPeriod")
    console.log("calculNbrMessagePerPeriod = " + this.ownStatsService.calculNbrMessagePerPeriod(listFileDico))
    console.log("Launching calcul for : calculStatsGlobalesMessages")
    console.log("calculStatsGlobalesMessages = " + this.ownStatsService.calculStatsGlobalesMessages(listFileDico))
    console.log("Launching calcul for : calculNbInterlocuteurs")
    console.log("calculNbInterlocuteurs = " + this.ownStatsService.calculNbInterlocuteurs(listFileDico))
    console.log("Launching calcul for : calculNbReactionsUser")
    console.log("calculNbReactionsUser = " + this.ownStatsService.calculNbReactionsUser(listFileDico))
    console.log("Launching calcul for : calculNbCaracParMessUser")
    console.log("calculNbCaracParMessUser = " + this.ownStatsService.calculNbCaracParMessUser(listFileDico))
    console.log("Launching calcul for : calculNbConvFirstMessSent")
    console.log("calculNbConvFirstMessSent = " + this.ownStatsService.calculNbConvFirstMessSent(listFileDico))
    console.log("Launching calcul for : calculPodiumConvLesPlusActives")
    console.log("calculPodiumConvLesPlusActives = " + this.ownStatsService.calculPodiumConvLesPlusActives(listFileDico))
    console.log("Launching calcul for : calculFirstConvUser")
    console.log("calculFirstConvUser = " + this.ownStatsService.calculFirstConvUser(listFileDico))
    console.log("Launching calcul for : calculIndicateursFlammeFreezeStrike")
    console.log("calculIndicateursFlammeFreezeStrike = " + this.ownStatsService.calculIndicateursFlammeFreezeStrike(listFileDico))
    console.log("Launching calcul for : calculDicoSortBubbleConv")
    console.log("calculDicoSortBubbleConv = " + this.ownStatsService.calculDicoSortBubbleConv(listFileDico)); //USELESS
    console.log("Launching calcul for : calculNbrConvActivePerPeriod")
    console.log("calculNbrConvActivePerPeriod = " + this.ownStatsService.calculNbrConvActivePerPeriod(listFileDico));
    console.log("Launching calcul for : calculNbrCorrespondantPerPeriod")
    console.log("calculNbrCorrespondantPerPeriod = " + this.ownStatsService.calculNbrCorrespondantPerPeriod(listFileDico));
    console.log("Launching calcul for : calculBestCorrespondantPerPeriod")
    console.log("calculBestCorrespondantPerPeriod = " + this.ownStatsService.calculBestCorrespondantPerPeriod(listFileDico));
    console.log("Launching calcul for : calculUserAverageAnswerTime")
    console.log("calculUserAverageAnswerTime = " + this.ownStatsService.calculUserAverageAnswerTime(listFileDico));
    console.log("Launching calcul for : calculBestFriend")
    console.log("calculBestFriend = " + this.ownStatsService.calculBestFriend(listFileDico));
    console.log("Launching calcul for : calculPercentInterlocuteursGenre")
    console.log("calculPercentInterlocuteursGenre = " + this.ownStatsService.calculPercentInterlocuteursGenre(listFileDico));
    console.log("Launching calcul for : calculRepartionTypeDeConv")
    console.log("calculRepartionTypeDeConv = " + this.ownStatsService.calculRepartionTypeDeConv(listFileDico));
    console.log("Launching calcul for : calculRepartionTypeMessage")
    console.log("calculRepartionTypeMessage = " + this.ownStatsService.calculRepartionTypeMessage(listFileDico));
    console.log("Launching calcul for : calculSuggestBestContact")
    console.log("calculSuggestBestContact = " + this.ownStatsService.calculSuggestBestContact(listFileDico));
    console.log("Launching calcul for : calculRandomContact")
    console.log("calculRandomContact = " + this.ownStatsService.calculRandomContact(listFileDico));
    console.log("Launching calcul for : calculLongestMessage")
    console.log("calculLongestMessage = " + this.ownStatsService.calculLongestMessage(listFileDico));
    console.log("Launching calcul for : calculBestReactionMessage")
    console.log("calculBestReactionMessage = " + this.ownStatsService.calculBestReactionMessage(listFileDico));
    console.log("Launching calcul for : calculNbMaxMessPer24")
    console.log("calculNbMaxMessPer24 = " + this.ownStatsService.calculNbMaxMessPer24(listFileDico));
    console.log("Launching calcul for : calculNbrSmileyEnvoye")
    console.log("calculNbrSmileyEnvoye = " + this.ownStatsService.calculNbrSmileyEnvoye(listFileDico));
  }

  doCalculForConv(listFileDico : any){
    this.statsConvService.findUserName(listFileDico)
  }

  fillInfoInListFile(listFileDicoNotFilled : any){
    console.log("Launching fillInfoInListFile")
    this.statsConvService.findLastMessageUploadTimestamp(listFileDicoNotFilled);
    let newListFileDicoFilled = []
    for (var k=0; k<listFileDicoNotFilled.length; k++){
      let data = listFileDicoNotFilled[k]["content"]
      let fileDico={}
      fileDico["content"]=data
      fileDico["name"]=this.statsConvService.findName(data)
      if (fileDico["name"]!==""){
        fileDico["nbrMessage"]=this.statsConvService.calculNbrMessage(data)
      fileDico["currentStreak"]=this.statsConvService.calculCurrentStreak(data)
      fileDico["maxStreak"]=this.statsConvService.calculMaxStreak(data, fileDico["currentStreak"]) // DOIT IMPERATIVEMENT ETRE FAIT APRES CURRENTSTREAK
      fileDico["maxFreeze"]=this.statsConvService.calculMaxFreeze(data)
      fileDico["isConvGroup"]=this.statsConvService.defineGroupBoolean(data);
      fileDico["nbrParticipant"]=data["participants"].length
      fileDico["lastMessage"]=data["messages"][0]["timestamp_ms"]
      newListFileDicoFilled.push(fileDico)
      } 
    }
    return newListFileDicoFilled
  }
}