import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input } from '@angular/core';
import { Chart } from 'chart.js';
import { StatsConvService } from '../.././stats-conv.service';

// Import les plugins 

import 'chartjs-plugin-datalabels';
import 'chartjs-plugin-deferred';


@Component({
  selector: 'app-reactions-stat',
  templateUrl: './reactions-stat.component.html',
  styleUrls: ['./reactions-stat.component.css']
})
export class ReactionsStatComponent implements OnInit, AfterViewInit {

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

  @Input() totalReactions : any;
  @Input() reactionDetail : any;


  // Couleur de début et de fin du gradiant de nombre de message per user sur un doughnut

  beginColor = '#1A1837';
  beginColorRgb = 'rgba(26,24,55,0.9)';
  endColor = '#EEEEEE';
  redColor = 'rgb(250, 138, 47)';
  greenColor = 	'#32CD32';
  otherColor : '#1A1837';
  otherColorGraphBot = 'rgba(26,24,55,0.9)';
  otherColorGraphTop = 'rgba(26,24,55,0.75)';
  redColorGraphBot = 'rgba(250, 138, 47,0.9)';
  redColorGraphTop = 'rgba(250, 138, 47,0.75)';
  greenColorGraphBot = 'rgba(50,205,50,0.9)';
  greenColorGraphTop = 'rgba(50,205,50,0.75)';
  maxDataRadar : any;

//ViewChild des graphs

  //ViewChild du graphe radar 

    @ViewChild('nbReactionGraph') nbReactionGraph: ElementRef;
    nbReactionChart = [];
  //Viewchild du graphe bâton

    @ViewChild('nbReactionPerUserGraph') nbReactionPerUserGraph: ElementRef;
    nbReactionPerUserChart =[];
    reactionDetailAdapt : any;
    backgroundColorReceive = [];
    backgroundColorSend = [];

  constructor(private elementRef: ElementRef, private statsConvService : StatsConvService) { }

  ngOnInit() {
    // Création data adaptée pour graphe réaction par user

    // reactionDetail = { 'labels':['Hugo','Quentin','Paul'], 'data':{'receive':[20,10,30],'send':[30,20,10]} }
    let userName=this.statsConvService.userName
    let constReactionDetail = this.reactionDetail;
    let numbParticipants = this.reactionDetail['labels'].length;
    let constReactionDetailAdapt = {};
    let constRedColorGraphTop =this.redColorGraphTop;
    let constRedColorGraphBot =this.redColorGraphBot;
    let constGreenColorGraphTop = this.greenColorGraphTop;
    let constGreenColorGraphBot = this.greenColorGraphBot;
    let constOtherColorGraphBot = this.otherColorGraphBot;
    let constOtherColorGraphTop = this.otherColorGraphTop;
  
    

    if(numbParticipants>6){
      let sumReaction = [];
      let indexMaxSum = [0,1,2]; //On prend le top 3 de la somme
      let indexMaxReceive = 0;
      let indexMaxSend = 0 ;
      let averageSend = 0;
      let averageReceive = 0;
      let indexUser = 0;
      var i;
  

      //On va reférence l'index des 3 personnes qui ont une somme de réaction envoyées et reçues la + importante
      for(i=0;i<numbParticipants;i++){
        sumReaction[i]= constReactionDetail['data']['send'][i]+constReactionDetail['data']['receive'][i];
        averageSend += constReactionDetail['data']['send'][i];
        averageReceive += constReactionDetail['data']['receive'][i];
        if(constReactionDetail['labels'][i] === userName){
          indexUser = i;
        }
      }
      
      averageSend = Math.round((averageSend/numbParticipants)*10)/10;
      averageReceive = Math.round((averageReceive/numbParticipants)*10)/10;

      var j;
      let minIndexMaxSum = 0;

      for(j=3;j<numbParticipants;j++){

        //Pour l'index des maximum de somme de réactions
        let k =0;
        for(k=0;k<3;k++){
          if(sumReaction[indexMaxSum[k]]<sumReaction[indexMaxSum[minIndexMaxSum]]){
            minIndexMaxSum = k;
          }
        }
          if(sumReaction[j]>sumReaction[indexMaxSum[minIndexMaxSum]]){
            indexMaxSum[minIndexMaxSum]=j;
        }
      }

      //Ces deux boucles while sont nécessaire pour régler le cas où on ne veut pas deuxfois la même personne dans le graphe
      while(indexMaxReceive in indexMaxSum){
        indexMaxReceive += 1
      }
      while(indexMaxSend in indexMaxSum || indexMaxSend === indexMaxReceive){
        indexMaxSend += 1
      }

      // Pour l'index max réaction envoyées et max reçues
      var w
      for(w=0;w<numbParticipants;w++){
        if(constReactionDetail['data']['send'][w]>constReactionDetail['data']['send'][indexMaxSend]){
          if( w!=indexMaxSum[0] && w!=indexMaxSum[1] && w!=indexMaxSum[2]){
            indexMaxSend = w;
          }
         }
        else if(constReactionDetail['data']['receive'][w]>constReactionDetail['data']['receive'][indexMaxReceive] && !(w in indexMaxSum)){
          if( w!=indexMaxSum[0] && w!=indexMaxSum[1] && w!=indexMaxSum[2]){
            indexMaxReceive = w;
          }
        } 
      }

      constReactionDetailAdapt['labels'] = [constReactionDetail['labels'][indexMaxSum[0]],constReactionDetail['labels'][indexMaxSum[1]],constReactionDetail['labels'][indexMaxSum[2]],constReactionDetail['labels'][indexMaxReceive],constReactionDetail['labels'][indexMaxSend],'Vous','Moyenne'];

      constReactionDetailAdapt['data']= {}
      constReactionDetailAdapt['data']['receive'] = [constReactionDetail['data']['receive'][indexMaxSum[0]],constReactionDetail['data']['receive'][indexMaxSum[1]],constReactionDetail['data']['receive'][indexMaxSum[2]],constReactionDetail['data']['receive'][indexMaxReceive],constReactionDetail['data']['receive'][indexMaxSend],constReactionDetail['data']['receive'][indexUser],averageReceive];

      constReactionDetailAdapt['data']['send'] = [constReactionDetail['data']['send'][indexMaxSum[0]],constReactionDetail['data']['send'][indexMaxSum[1]],constReactionDetail['data']['send'][indexMaxSum[2]],constReactionDetail['data']['send'][indexMaxReceive],constReactionDetail['data']['send'][indexMaxSend],constReactionDetail['data']['send'][indexUser],averageSend];

      //création des couleurs 
      let constBackgroundColorReceive = []; // Tableau de couleur
      let constBackgroundColorSend = [];

      for(i=0;i<5;i++){
        constBackgroundColorReceive.push(constOtherColorGraphBot);
        constBackgroundColorSend.push(constOtherColorGraphTop);
      }
      //'Vous' Est tjrs en 6ème position
      constBackgroundColorReceive.push(constRedColorGraphBot);
      constBackgroundColorSend.push(constRedColorGraphTop);

      //La moyenne est tjrs à la fin 
      constBackgroundColorReceive.push(constGreenColorGraphBot);
      constBackgroundColorSend.push(constGreenColorGraphTop);
      this.backgroundColorReceive = constBackgroundColorReceive;
      this.backgroundColorSend = constBackgroundColorSend;

      
    }
    else if(numbParticipants<7){
      

      let constBackgroundColorReceive = []; // Tableau de couleur
      let constBackgroundColorSend = [];
      var i 
      for(i=0;i<numbParticipants;i++){
        constBackgroundColorReceive.push(constOtherColorGraphBot);
        constBackgroundColorSend.push(constOtherColorGraphTop)
      }

      let averageSend = 0;
      let averageReceive = 0;
      let indexUser = 0;

      for(i=0;i<numbParticipants;i++){
        averageSend += constReactionDetail['data']['send'][i];
        averageReceive += constReactionDetail['data']['receive'][i];
        if(constReactionDetail['labels'][i] === userName){
          indexUser = i;
        }
      }
      
    
      averageSend = Math.round((averageSend/numbParticipants)*10)/10;
      averageReceive = Math.round((averageReceive/numbParticipants)*10)/10;
      constReactionDetailAdapt = constReactionDetail;
      if(constReactionDetailAdapt['labels'][constReactionDetailAdapt['labels'].length-1]!='Moyenne'){
        constReactionDetailAdapt['labels'].push('Moyenne');
        constReactionDetailAdapt['data']['receive'].push(averageReceive);
        constReactionDetailAdapt['data']['send'].push(averageSend);
        constBackgroundColorSend.push(constRedColorGraphTop);
        constBackgroundColorReceive.push(constRedColorGraphBot);
      }//ça évite d'avoir des doublons de 'moyenne' quand on revient sur la page
      constBackgroundColorSend[constReactionDetailAdapt['labels'].length-1]=constGreenColorGraphTop;
      constBackgroundColorReceive[constReactionDetailAdapt['labels'].length-1]=constGreenColorGraphBot;
      constReactionDetailAdapt['labels'][indexUser]='Vous';
      constBackgroundColorReceive[indexUser]=constRedColorGraphBot;
      constBackgroundColorSend[indexUser]=constRedColorGraphTop;
      this.backgroundColorReceive = constBackgroundColorReceive;
      this.backgroundColorSend = constBackgroundColorSend;
    }

    this.reactionDetailAdapt = constReactionDetailAdapt;

    //Réglage scale graph radar
    let constMaxDataRadar = Math.max(...this.totalReactions["data"]);
    this.maxDataRadar = constMaxDataRadar;
    

}



  ngAfterViewInit() {

// Parametrage général du délai sur l'affichage des graphs

Chart.defaults.global.plugins.deferred.delay = 150;
Chart.defaults.global.plugins.deferred.yOffset = 100;


//Chart sur les réaction totales

        this.nbReactionChart.push(new Chart
        (this.nbReactionGraph.nativeElement.getContext('2d'), {  
            type: 'radar',
            
          data: {
            labels: this.totalReactions["labels"],
            
            
            datasets: [
              { 
                
                data: this.totalReactions["data"],
                //Les couleurs peuvent être modifiées sur les variables globales définient plus haut
                backgroundColor: this.beginColorRgb,
                fill: true,
                borderWidth : 1.3,
                borderColor : this.redColor ,
                pointRadius : 4.2,
                pointBorderColor : this.redColor,
                lineTension : 0.1,
                pointBackgroundColor : this.beginColor,
                
              },
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins : {
              datalabels : {
                display : false
              }
            },
            scales: {
              /*angleLines : {
                color : '#1A1837',
                lineWidth : 0.1,
              },
              pointLabels: {
                fontSize: 25 //Augmente la taille des smileys
              }, */
              gridLines : {
                  color : '#1A1837',
                  lineWidth : 0.1,
                },
              ticks : {
                display : false,
                maxTicksLimit : 3,
                max : this.maxDataRadar,
              },
              
            },
            
            title: {

          display: false,
          text: 'Réactions totales',
          fontSize : 14,
          fontColor : '#1A1837',
          fontStyle : 'bold'
          },
          legend: {
            
            position: 'right',
            display: false,
            fullWidth: true,
            
          
          
          labels: {
            fontSize: 11,
            
            
          }
            },
            tooltips:{
              
              enabled:true,
              backgroundColor : 'rgba(0,0,0,0.8)', // Le 0.8 correspond à la transparence de la légende qui s'affiche quand on passe la souris dessus 
            },

          }
        }));



//Chart sur les réaction par User

        this.nbReactionPerUserChart.push(new Chart
        (this.nbReactionPerUserGraph.nativeElement.getContext('2d'), {  
            type: 'bar',
            
            
          data: {
            labels: this.reactionDetailAdapt["labels"],
            datasets: [
              {                
                data: this.reactionDetailAdapt["data"]["receive"],
                //Les couleurs peuvent être modifiées sur les variables globales définient plus haut
                backgroundColor: this.backgroundColorReceive,
                label : 'Réactions Reçues',
                borderWidth : 2,
                borderColor : '#1A1837' ,
              },
              {
                data : this.reactionDetailAdapt["data"]["send"],
                backgroundColor: this.backgroundColorSend,
                label : 'Réaction Envoyées',
                borderWidth : 2,
                borderColor : '#1A1837' ,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins : {
              datalabels : {
                display : false,
              }
            },
            scales: {
            xAxes: [{
                stacked: true,
                display : true,
                gridLines : {
                color : '#1A1837',
                lineWidth : 0.1,
                },
                ticks :{
                  fontColor :'#1A1837'
                }
            }],
            yAxes: [{
              ticks :{
                  fontColor :'#1A1837'
                },
                stacked: true,
                gridLines : {
                color : '#1A1837',
                lineWidth : 0.1,
                },
            }]
            },

            title: {

          display: false,
          text: 'Réactions totales par User',
          fontSize : 14,
          fontColor : '#1A1837',
          fontStyle : 'bold'
          },
          legend: {
            
            position: 'right',
            display: false,
            fullWidth: true,
            
            },
            tooltips:{
              
              enabled:true,
              backgroundColor : 'rgba(0,0,0,0.8)', // Le 0.8 correspond à la transparence de la légende qui s'affiche quand on passe la souris dessus 
            },

          }
        }));


}
}