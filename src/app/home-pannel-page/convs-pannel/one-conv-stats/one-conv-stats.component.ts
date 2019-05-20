import { Component, OnInit, Input } from '@angular/core';
import { StatsConvService } from '.././stats-conv.service';

// Import pour mettre label 

import 'chartjs-plugin-datalabels';
import 'chartjs-plugin-deferred';




@Component({
  selector: 'app-one-conv-stats',
  templateUrl: './one-conv-stats.component.html',
  styleUrls: ['./one-conv-stats.component.scss']
})
export class OneConvStatsComponent implements OnInit {

  @Input() fileConvToDisplay : any;

  nbrMessageTotal : number; //OK VIA SERVICE
  nbMessagePerUser : any; //OK VIA SERVICE
  averageLengthOfMessagesPerUser : any; //OK VIA SERVICE
  reactionDetail : any; //OK VIA SERVICE , ATTENTION NON TRIE
  currentStreak : number; //OK VIA SERVICE
  hoursToSend : any;
  theMaxStreak : number; //OK VIA SERVICE
  maxFreeze : number; //OK VIA SERVICE
  nbrCaracteresTotalPerUser : any; //OK VIA SERVICE , ATTENTION SOUS FORME DE DICO NON TRIE
  sumMessagesPerUserByTime : any; //OK VIA SERVICE
  totalReactions :any; //OK VIA SERVICE
  influenceUser :any; //OK VIA SERVICE
  averageTimeToAnswer : any; //OK VIA SERVICE
  nbreQuestionsPerUser : any; //OK VIA SERVICE
  bookStat : any; //OK VIA SERVICE
  timeSpentTotal : any //OK VIA SERVICE
  distanceStat:any //OK VIA SERVICE
  firstToSpeak : any //OK VIA SERVICE
  nbParticipants : any //OK VIA SERVICE
  nbMessages : any; //OK VIA SERVICE
  dateCreationConv : any; //OK VIA SERVICE

  isOverViewOneConv :any;
  isMessages :any;
  isTemps :any;
  isReactions :any;
  isAutres : any;

  isOneConvStatFirstRun=true;

  constructor(private statsConvService : StatsConvService) { }

  ngOnInit() {
    this.isOneConvStatFirstRun=this.statsConvService.isOneConvStatFirstRun
    this.statsConvService.switchBooleanFirstRunOne()
    setTimeout(()=>{
      //this.closeTooltip();
    }, 10000)

    this.calculStats(this.fileConvToDisplay["content"])

    //ON COMMENCE SUR L'OVERVIEW
    this.isOverViewOneConv = true;
    this.isMessages = false;
    this.isTemps = false;
    this.isReactions = false;
    this.isAutres = false;
  }

  switchStat(aimedStat : string){
      this.isOverViewOneConv = false;
      this.isMessages = false;
      this.isTemps = false;
      this.isReactions = false;
      this.isAutres = false;

      if (aimedStat === "overViewOneConv"){
        this.isOverViewOneConv = true;
      }
      if (aimedStat === "messages"){
        this.isMessages = true;
      }
      if (aimedStat === "temps"){
        this.isTemps = true;
      }
      if (aimedStat === "reactions"){
        this.isReactions = true;
      }
      if (aimedStat === "autres"){
        this.isAutres = true;
      }
  }

    calculStats(jsonContent : any){

      this.nbrMessageTotal = this.statsConvService.calculNbrMessage(jsonContent);
      this.nbMessagePerUser = this.statsConvService.calculNbMessagePerUser(jsonContent);
      this.averageLengthOfMessagesPerUser = this.statsConvService.calculAverageLengthOfMessagesPerUser
      (jsonContent, this.nbMessagePerUser)
      this.currentStreak = this.statsConvService.calculCurrentStreak(jsonContent)
      this.theMaxStreak = this.statsConvService.calculMaxStreak(jsonContent, this.currentStreak)
      this.maxFreeze = this.statsConvService.calculMaxFreeze(jsonContent)
      this.totalReactions = this.statsConvService.calculTotalReactions(jsonContent)
      this.reactionDetail = this.statsConvService.calculReactionDetail(jsonContent)
      this.hoursToSend = this.statsConvService.calculHourToSend(jsonContent)
      this.nbrCaracteresTotalPerUser = this.statsConvService.calculNbrCaracteresTotalPerUser(jsonContent)
      this.sumMessagesPerUserByTime = this.statsConvService.calculSumMessagesPerUserByTime(jsonContent)
      this.influenceUser = this.statsConvService.calculInfluenceUser(this.nbMessagePerUser, this.averageLengthOfMessagesPerUser, this.reactionDetail)
      this.averageTimeToAnswer = this.statsConvService.calculAverageTimeToAnswer(jsonContent)
      this.nbreQuestionsPerUser = this.statsConvService.calculNbrQuestionsPerUser(jsonContent)
      this.bookStat = this.statsConvService.calculBookStat(jsonContent)
      this.timeSpentTotal = this.statsConvService.timeSpent(jsonContent)
      this.distanceStat = this.statsConvService.distanceCaracteres(jsonContent)
      this.firstToSpeak = this.statsConvService.firstToSpeak(jsonContent)
      this.nbParticipants = this.statsConvService.nbParticipants(jsonContent)
      this.nbMessages = this.statsConvService.nbMessages(jsonContent)
      this.dateCreationConv = this.statsConvService.dateCreationConv(jsonContent)
  }

  closeTooltip(){
    this.statsConvService.switchBooleanFirstRunOne()
    this.isOneConvStatFirstRun=false;
  }
}

