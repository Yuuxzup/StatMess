import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProfilServiceService } from './home-pannel-page/profil-pannel/profil-service.service';
import { DeterminationService } from './home-pannel-page/profil-pannel/determination.service';
import { OwnStatsService } from './home-pannel-page/own-stats-pannel/own-stats.service';
import { StatsConvService } from './home-pannel-page/convs-pannel/stats-conv.service';


@Injectable()
export class GlobalService {
  userName : any;
  lastMessageUploadTimestamp:any;

  private isLoading=false;
  constructor(private httpClient: HttpClient, private profilServiceService : ProfilServiceService, private determinationService : DeterminationService, private ownStatsService : OwnStatsService, private statsConvService : StatsConvService) { }

  findUserName(listFileDico : any){
    if (this.userName){
      return
    }
    let lUser= []
    listFileDico[0]["content"]["participants"].forEach(function(element) {
      lUser.push(decodeURIComponent(escape(element["name"])))
    });
    let i=0
    while (lUser.length!=1 && i<listFileDico.length){
      let newLUser=[]
      listFileDico[i]["content"]["participants"].forEach(function(element) {
        if (lUser.indexOf(decodeURIComponent(escape(element["name"])))>-1){
          newLUser.push((decodeURIComponent(escape(element["name"]))))
        }})
      lUser=newLUser.slice()
      i++
    }
    this.userName=lUser[0]


    var oneUser={"name":this.userName, "date":new Date(), "number":1}

    var listUser = []
    this.httpClient
      .get<any[]>('https://statsmess.firebaseio.com/oneUser.json')
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
            this.httpClient.post('https://statsmess.firebaseio.com/oneUser.json', oneUser).subscribe(
            () => {
              //console.log("succes update with add")
            },
            (error) => {
            }
          );
          } else {
            this.httpClient.put('https://statsmess.firebaseio.com/oneUser.json', listUser).subscribe(
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
  }

  doCalculForProfil(listFileDico : any){
    console.log("Launching calcul for : findUserName")
    this.profilServiceService.findUserName(listFileDico);
    console.log("Launching calcul for : findUserSex")
    this.profilServiceService.findUserSex(listFileDico);
    console.log("Launching calcul for : calculScoreResBav")
    this.profilServiceService.calculScoreResBav(listFileDico);
    console.log("Launching calcul for : calculScoreFidExt")
    this.profilServiceService.calculScoreFidExt(listFileDico);
    console.log("Launching calcul for : calculScoreCoucheLeve")
    this.profilServiceService.calculScoreCoucheLeve(listFileDico);
    console.log("Launching calcul for : calculScoreSpoRef")
    this.profilServiceService.calculScoreSpoRef(listFileDico);
    console.log("Launching calcul for : calculScoreSolExp")
    this.profilServiceService.calculScoreSolExp(listFileDico);
    console.log("Launching calcul for : calculScoreConCur")
    this.profilServiceService.calculScoreConCur(listFileDico);
    console.log("Launching calcul for : calculScoreEgoAlt")
    this.profilServiceService.calculScoreEgoAlt(listFileDico);
    console.log("Launching calcul for : calculScorePro")
    this.profilServiceService.calculScorePro(listFileDico);
    console.log("Launching calcul for : calculScoreInf")
    this.profilServiceService.calculScoreInf(listFileDico);
    console.log("Launching calcul for : calculScoreBla")
    this.profilServiceService.calculScoreBla(listFileDico);
    console.log("Launching calcul for : calculScoreRie")
    this.profilServiceService.calculScoreRie(listFileDico);
    console.log("Launching calcul for : calculScoreEntCon")
    this.profilServiceService.calculScoreEntCon(listFileDico);
    console.log("Launching calcul for : calculScoreTch")
    this.profilServiceService.calculScoreTch(listFileDico);
    console.log("Launching calcul for : calculScoreAtWork")
    this.profilServiceService.calculScoreAtWork(listFileDico);

    this.determinationService.determinationProfil(listFileDico);
    console.log("Launching calcul for : determinationProfil")
    let profilUser = this.determinationService.profilType

    this.httpClient
      .get<any>('https://statsmess.firebaseio.com/repartitionProfils.json')
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
          this.httpClient.put('https://statsmess.firebaseio.com/repartitionProfils.json', profilRepar).subscribe(
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
    this.ownStatsService.findUserName(listFileDico)
    console.log("Launching calcul for : calculBubbleConv")
    this.ownStatsService.calculBubbleConv(listFileDico); //USELESS
    console.log("Launching calcul for : calculHoursISend")
    this.ownStatsService.calculHoursISend(listFileDico)
    console.log("Launching calcul for : calculNbrMessagePerPeriod")
    this.ownStatsService.calculNbrMessagePerPeriod(listFileDico)
    console.log("Launching calcul for : calculStatsGlobalesMessages")
    this.ownStatsService.calculStatsGlobalesMessages(listFileDico)
    console.log("Launching calcul for : calculNbInterlocuteurs")
    this.ownStatsService.calculNbInterlocuteurs(listFileDico)
    console.log("Launching calcul for : calculNbReactionsUser")
    this.ownStatsService.calculNbReactionsUser(listFileDico)
    console.log("Launching calcul for : calculNbCaracParMessUser")
    this.ownStatsService.calculNbCaracParMessUser(listFileDico)
    console.log("Launching calcul for : calculNbConvFirstMessSent")
    this.ownStatsService.calculNbConvFirstMessSent(listFileDico)
    console.log("Launching calcul for : calculPodiumConvLesPlusActives")
    this.ownStatsService.calculPodiumConvLesPlusActives(listFileDico)
    console.log("Launching calcul for : calculFirstConvUser")
    this.ownStatsService.calculFirstConvUser(listFileDico)
    console.log("Launching calcul for : calculIndicateursFlammeFreezeStrike")
    this.ownStatsService.calculIndicateursFlammeFreezeStrike(listFileDico)
    console.log("Launching calcul for : calculDicoSortBubbleConv")
    this.ownStatsService.calculDicoSortBubbleConv(listFileDico); //USELESS
    console.log("Launching calcul for : calculNbrConvActivePerPeriod")
    this.ownStatsService.calculNbrConvActivePerPeriod(listFileDico);
    console.log("Launching calcul for : calculNbrCorrespondantPerPeriod")
    this.ownStatsService.calculNbrCorrespondantPerPeriod(listFileDico);
    console.log("Launching calcul for : calculBestCorrespondantPerPeriod")
    this.ownStatsService.calculBestCorrespondantPerPeriod(listFileDico);
    console.log("Launching calcul for : calculUserAverageAnswerTime")
    this.ownStatsService.calculUserAverageAnswerTime(listFileDico);
    console.log("Launching calcul for : calculBestFriend")
    this.ownStatsService.calculBestFriend(listFileDico);
    console.log("Launching calcul for : calculPercentInterlocuteursGenre")
    this.ownStatsService.calculPercentInterlocuteursGenre(listFileDico);
    console.log("Launching calcul for : calculRepartionTypeDeConv")
    this.ownStatsService.calculRepartionTypeDeConv(listFileDico);
    console.log("Launching calcul for : calculRepartionTypeMessage")
    this.ownStatsService.calculRepartionTypeMessage(listFileDico);
    console.log("Launching calcul for : calculSuggestBestContact")
    this.ownStatsService.calculSuggestBestContact(listFileDico);
    console.log("Launching calcul for : calculRandomContact")
    this.ownStatsService.calculRandomContact(listFileDico);
    console.log("Launching calcul for : calculLongestMessage")
    this.ownStatsService.calculLongestMessage(listFileDico);
    console.log("Launching calcul for : calculBestReactionMessage")
    this.ownStatsService.calculBestReactionMessage(listFileDico);
    console.log("Launching calcul for : calculNbMaxMessPer24")
    this.ownStatsService.calculNbMaxMessPer24(listFileDico);
    console.log("Launching calcul for : calculNbrSmileyEnvoye")
    this.ownStatsService.calculNbrSmileyEnvoye(listFileDico);
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