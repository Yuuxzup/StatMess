import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { ProfilServiceService } from './home-pannel-page/profil-pannel/profil-service.service';
import { DeterminationService } from './home-pannel-page/profil-pannel/determination.service';
import { OwnStatsService } from './home-pannel-page/own-stats-pannel/own-stats.service';
import { StatsConvService } from './home-pannel-page/convs-pannel/stats-conv.service';


@Injectable()
export class GlobalService {
  userName : any;
  lastMessageUploadTimestamp:any;

  loadingSubject = new Subject<boolean>();
  private isLoading=false;
  constructor(private httpClient: HttpClient, private profilServiceService : ProfilServiceService, private determinationService : DeterminationService, private ownStatsService : OwnStatsService, private statsConvService : StatsConvService) { }

  emitLoadingSubject() {
    console.log("On emit le loading à "+this.isLoading)
    this.loadingSubject.next(this.isLoading);
  }
  emitLoadCompleted(){
    console.log("On emit le load completeted")
    this.isLoading=false;
    this.emitLoadingSubject();
  }
  emitLoadBeginning(){
    this.isLoading=true;
    this.emitLoadingSubject();
  }

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
      i++
      let newLUser=[]
      listFileDico[i]["content"]["participants"].forEach(function(element) {
        if (lUser.indexOf(decodeURIComponent(escape(element["name"])))>-1){
          newLUser.push((decodeURIComponent(escape(element["name"]))))
        }})
      lUser=newLUser.slice()
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
    this.profilServiceService.findUserName(listFileDico);
    this.profilServiceService.findUserSex(listFileDico);
    this.profilServiceService.calculScoreResBav(listFileDico);
    this.profilServiceService.calculScoreFidExt(listFileDico);
    this.profilServiceService.calculScoreCoucheLeve(listFileDico);
    this.profilServiceService.calculScoreSpoRef(listFileDico);
    this.profilServiceService.calculScoreSolExp(listFileDico);
    this.profilServiceService.calculScoreConCur(listFileDico);
    this.profilServiceService.calculScoreEgoAlt(listFileDico);
    this.profilServiceService.calculScorePro(listFileDico);
    this.profilServiceService.calculScoreInf(listFileDico);
    this.profilServiceService.calculScoreBla(listFileDico);
    this.profilServiceService.calculScoreRie(listFileDico);
    this.profilServiceService.calculScoreEntCon(listFileDico);
    this.profilServiceService.calculScoreTch(listFileDico);
    this.profilServiceService.calculScoreAtWork(listFileDico);

    this.determinationService.determinationProfil(listFileDico);
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
    this.ownStatsService.findUserName(listFileDico)
    this.ownStatsService.calculBubbleConv(listFileDico); //USELESS
    this.ownStatsService.calculHoursISend(listFileDico)
    this.ownStatsService.calculNbrMessagePerPeriod(listFileDico)
    this.ownStatsService.calculStatsGlobalesMessages(listFileDico)
    this.ownStatsService.calculNbInterlocuteurs(listFileDico)
    this.ownStatsService.calculNbReactionsUser(listFileDico)
    this.ownStatsService.calculNbCaracParMessUser(listFileDico)
    this.ownStatsService.calculNbConvFirstMessSent(listFileDico)
    this.ownStatsService.calculPodiumConvLesPlusActives(listFileDico)
    this.ownStatsService.calculFirstConvUser(listFileDico)
    this.ownStatsService.calculIndicateursFlammeFreezeStrike(listFileDico)
    this.ownStatsService.calculDicoSortBubbleConv(listFileDico); //USELESS
    this.ownStatsService.calculNbrConvActivePerPeriod(listFileDico);
    this.ownStatsService.calculNbrCorrespondantPerPeriod(listFileDico);
    this.ownStatsService.calculBestCorrespondantPerPeriod(listFileDico);
    this.ownStatsService.calculUserAverageAnswerTime(listFileDico);
    this.ownStatsService.calculBestFriend(listFileDico);
    this.ownStatsService.calculPercentInterlocuteursGenre(listFileDico);
    this.ownStatsService.calculRepartionTypeDeConv(listFileDico);
    this.ownStatsService.calculRepartionTypeMessage(listFileDico);
    this.ownStatsService.calculSuggestBestContact(listFileDico);
    this.ownStatsService.calculRandomContact(listFileDico);
    this.ownStatsService.calculLongestMessage(listFileDico);
    this.ownStatsService.calculBestReactionMessage(listFileDico);
    this.ownStatsService.calculNbMaxMessPer24(listFileDico);
  }

  doCalculForConv(listFileDico : any){
    this.statsConvService.findUserName(listFileDico)
  }

  fillInfoInListFile(listFileDicoNotFilled : any){
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