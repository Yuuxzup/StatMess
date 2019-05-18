import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input } from '@angular/core';
import { Chart } from 'chart.js';
import { StatsConvService } from '../.././stats-conv.service';

// Import les plugins

import 'chartjs-plugin-datalabels';
import 'chartjs-plugin-deferred';

@Component({
  selector: 'app-autres-stat',
  templateUrl: './autres-stat.component.html',
  styleUrls: ['./autres-stat.component.css']
})
export class AutresStatComponent implements OnInit {

help(id : string){
    
    if(document.getElementById('help'+id).style.zIndex == '1'){
      document.getElementById('help'+id).style.zIndex = '-1';
      document.getElementById('graph'+id).style.zIndex = '1';
    }
    else{
    document.getElementById('help'+id).style.zIndex = '1';
    document.getElementById('graph'+id).style.zIndex = '0';
    }
  }
  
@Input() nbreQuestionsPerUser :any;
@Input() bookStat : any;
@Input() timeSpentTotal : any;
@Input() distanceStat: any;

nbreQuestionsToPrintUser : any;
nbreQuestionsToPrintMax : any;
nbreQuestionToPrintSum : any;
nbreQuestionToPrintAverage : any;
wordPerTimeToPrint : any;
distancePerTimetoPrint : any

  constructor(private elementRef: ElementRef, private statsConvService : StatsConvService) { }

  ngOnInit() {
    //Pour affichage du nombre de questions posées par User
    let userName=this.statsConvService.userName
    let constNbreQuestionsPerUser = this.nbreQuestionsPerUser
    let constNbreQuestionsToPrintUser = '';
    let constNbreQuestionsToPrintMax = '';
    let constNbreQuestionToPrintSum ='';
    let constNbreQuestionToPrintAverage ='';

    let isQuestion = false; //Si il n'y a pas de questions
    let constSumQuestions = 0;

    //Calcul de la somme :

     Object.keys(constNbreQuestionsPerUser).forEach(
      function(participant){
        constSumQuestions = constSumQuestions + constNbreQuestionsPerUser[participant];
      }
    )

    if(constSumQuestions!=0){
      isQuestion = true;
    }
    
    if(isQuestion===false){
      //constNbreQuestionsToPrintUser = "Vous n'avez pas posé de question";
      constNbreQuestionsToPrintMax = "Aucune question n'a été posée";
    }
    if(Object.keys(constNbreQuestionsPerUser).length>2){
        var j;
        let minIndexMaxSum = 0;
        let labelMaxQuestion = Object.keys(constNbreQuestionsPerUser)[0]

        Object.keys(constNbreQuestionsPerUser).forEach(
          function(participant){
            if(constNbreQuestionsPerUser[participant]>constNbreQuestionsPerUser[labelMaxQuestion]){
              labelMaxQuestion = participant
            }
          }  
        )
        if(labelMaxQuestion === userName){
          constNbreQuestionsToPrintUser = 'Vous êtes la personne qui a posée le plus de questions avec un total de '+constNbreQuestionsPerUser[labelMaxQuestion]+' question(s)'
        }

        else{constNbreQuestionsToPrintMax = 'La personne ayant posée le plus de questions est '+labelMaxQuestion+' avec un total de '+constNbreQuestionsPerUser[labelMaxQuestion]+' question(s)';
        constNbreQuestionsToPrintUser = "Vous avez envoyé "+constNbreQuestionsPerUser[userName]+' question(s)'}
        constNbreQuestionToPrintSum = 'Total de question(s) posée(s) : '+constSumQuestions;
        constNbreQuestionToPrintAverage = 'La moyenne est de '+ Math.round(constSumQuestions/Object.keys(constNbreQuestionsPerUser).length)+' question(s) par participant';
    }

    if(Object.keys(constNbreQuestionsPerUser).length===2){
      Object.keys(constNbreQuestionsPerUser).forEach(
        function(participant){
          if(participant===userName){
            constNbreQuestionsToPrintUser = 'Vous avez envoyé '+constNbreQuestionsPerUser[participant]+' question(s)'
          }
          else{
            constNbreQuestionsToPrintMax = participant + ' a envoyé '+ constNbreQuestionsPerUser[participant]+' question(s)'
          }
        }
      )
      constNbreQuestionToPrintSum = 'Total de question(s) posée(s) : '+constSumQuestions
      constNbreQuestionToPrintAverage = 'La moyenne est de '+ Math.round(constSumQuestions/Object.keys(constNbreQuestionsPerUser).length)+' question(s) par participant'
    }

    this.nbreQuestionToPrintSum = constNbreQuestionToPrintSum;
    this.nbreQuestionsToPrintMax= constNbreQuestionsToPrintMax;
    this.nbreQuestionsToPrintUser = constNbreQuestionsToPrintUser;
    this.nbreQuestionToPrintAverage = constNbreQuestionToPrintAverage;


    //Réglage de l'affichage de la vitesse en page

    let constWordPerTimeToPrint = '';
    let constBookStat = this.bookStat;

    if(constBookStat['vitesse']!==0){
      constWordPerTimeToPrint = constBookStat['vitesse']+' mots'+'/'+constBookStat['vitesseUnit'];
    }
    this.wordPerTimeToPrint = constWordPerTimeToPrint;
    
    //Réglage de l'affichage de la vitesse en distance

    let constDistancePerTimetoPrint = '';
    let constDistanceStat = this.distanceStat;

    if(constDistanceStat['vitesse'] !==''){
      constDistancePerTimetoPrint = constDistanceStat['vitesse']+'/'+constDistanceStat['vitesseUnit'];
    }
    this.distancePerTimetoPrint = constDistancePerTimetoPrint;
  }

}