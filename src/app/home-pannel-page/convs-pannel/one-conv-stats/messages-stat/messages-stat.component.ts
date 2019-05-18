import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input } from '@angular/core';
import { Chart } from 'chart.js';
import { StatsConvService } from '../.././stats-conv.service';

// Import les plugins

import 'chartjs-plugin-datalabels';
import 'chartjs-plugin-deferred';


@Component({
  selector: 'app-messages-stat',
  templateUrl: './messages-stat.component.html',
  styleUrls: ['./messages-stat.component.css']
})
export class MessagesStatComponent implements OnInit, AfterViewInit {

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

  @Input() nbMessagePerUser : any;
  @Input() averageLengthOfMessagesPerUser : any; 

  // Couleur de début et de fin du gradiant de nombre de message per user sur un doughnut

  beginColor = '#1A1837';
  beginColorRgb = 'rgb(26,24,55,0.9)';
  endColor = '#EEEEEE';
  redColor = 'rgb(250, 138, 47)';
  greenColor = 	'#32CD32';
  otherColor : '#1A1837';


  //ViewChild du message per user
  @ViewChild('nbMessagePerUserGraph') nbMessagePerUserGraph: ElementRef;
  nbMessagePerUserChart : any;
  backgroundColorNbMessage = [];
  nbMessagePerUserDisplay = false;


  //ViewChild de l'average message per user
  @ViewChild('averageMessagePerUserGraph') averageMessagePerUserGraph: ElementRef;
  averageMessagePerUserChart : any;
  averageMessagePerUserData :any;
  averageMessagePerUserHtml : any;
  
  constructor(private elementRef: ElementRef, private statsConvService : StatsConvService) { }

  ngOnInit() {
    //Création de la couleur OtherColor


    let userName=this.statsConvService.userName
    let listParticipantToDisplayForAverage = []
    let meanDataAverage = 0
    if (this.averageLengthOfMessagesPerUser["labels"].length>10){

      //CALCUL DE LA MOYENNE
      for( var i = 0; i < this.averageLengthOfMessagesPerUser["data"].length; i++ ){
         meanDataAverage += this.averageLengthOfMessagesPerUser["data"][i]
      }
      meanDataAverage=meanDataAverage/this.averageLengthOfMessagesPerUser["data"].length

      listParticipantToDisplayForAverage=this.averageLengthOfMessagesPerUser["labels"].slice(0,3)
      if (listParticipantToDisplayForAverage.indexOf(userName)>-1){
        listParticipantToDisplayForAverage.splice(listParticipantToDisplayForAverage.indexOf(userName), listParticipantToDisplayForAverage.indexOf(userName)-1)
        listParticipantToDisplayForAverage.push(this.averageLengthOfMessagesPerUser["labels"][4])
      }

      listParticipantToDisplayForAverage = listParticipantToDisplayForAverage.concat(this.averageLengthOfMessagesPerUser["labels"].slice(this.averageLengthOfMessagesPerUser["labels"].length-3,this.averageLengthOfMessagesPerUser["labels"].length))
      if (listParticipantToDisplayForAverage.indexOf(userName)>-1){
        listParticipantToDisplayForAverage.splice(listParticipantToDisplayForAverage.indexOf(userName), listParticipantToDisplayForAverage.indexOf(userName)-1)
        listParticipantToDisplayForAverage.push(this.averageLengthOfMessagesPerUser["labels"][this.averageLengthOfMessagesPerUser["labels"].length-4])
      }
      listParticipantToDisplayForAverage.push("Moyenne")
      listParticipantToDisplayForAverage.push(userName)
    } else{
      listParticipantToDisplayForAverage=this.averageLengthOfMessagesPerUser["labels"]
    }
    let tempoAverageLengthOfMessagesPerUser = this.averageLengthOfMessagesPerUser
    let listeCorrespondant =[]
    listParticipantToDisplayForAverage.forEach(function(nom){
      if (nom==="Moyenne"){
        listeCorrespondant.push([nom,meanDataAverage])
      } else {
      listeCorrespondant.push([nom,tempoAverageLengthOfMessagesPerUser["data"][tempoAverageLengthOfMessagesPerUser["labels"].indexOf(nom)]])
      }
    })

      listeCorrespondant.sort(function(first,second) {
        return second[1] - first[1];
      });
    let listLabel=[];
    let listData = [];
    let listColors= [];
    let constRedColor = this.redColor;
    let constGreenColor = this.greenColor;
    let constOtherColor = this.otherColor;

    listeCorrespondant.forEach(function(element){
      listLabel.push(element[0])
      listData.push(element[1])
      if (element[0]===userName){
        listColors.push(constRedColor)
      } else if (element[0]==="Moyenne"){
        listColors.push(constGreenColor)
      } else {
        listColors.push('#1A1837')
      }
    });



    
    this.averageMessagePerUserData = {"labels": listLabel, "data" :listData, "colors" :listColors}


    //Création backgroundcolor liste répartition message par user
    let constBackgroundColorNbMessage = this.generateColor(this.endColor,this.beginColor,this.nbMessagePerUser['labels'].length);
    let k=0;
    while(k<this.nbMessagePerUser['labels'].length && this.nbMessagePerUser['labels'][k]!= userName){
      k=k+1;
    }
    constBackgroundColorNbMessage[k] = constRedColor;
    this.backgroundColorNbMessage = constBackgroundColorNbMessage;
    
    //Fonction pour afficher ou non la légende 
  
    if(this.nbMessagePerUser['labels'].length<7){
      this.nbMessagePerUserDisplay = true
    }
    
    //Fonction pour arrondir valeur de average message pour l'HTML
    let constAverageMessagePerUserHtml = this.averageLengthOfMessagesPerUser;
    for(i=0;i<constAverageMessagePerUserHtml['data'].length;i++){
      constAverageMessagePerUserHtml['data'][i] = Math.round(constAverageMessagePerUserHtml['data'][i]*10)/10;
    }
    this.averageMessagePerUserHtml = constAverageMessagePerUserHtml;
    
    
   
    
  }

  ngAfterViewInit() {

  // Parametrage général du délai sur l'affichage des graphs

  Chart.defaults.global.plugins.deferred.delay = 150;
  Chart.defaults.global.plugins.deferred.yOffset = 100;

  //Chart sur les nombres de message par user

        this.nbMessagePerUserChart = new Chart
        (this.nbMessagePerUserGraph.nativeElement.getContext('2d'), {  
            type: 'doughnut',
            
          data: {
            labels: this.nbMessagePerUser['labels'],
            datasets: [
              { 
                data: this.nbMessagePerUser['data'],
                //Les couleurs peuvent être modifiées sur les variables globales définient plus haut
                backgroundColor: this.backgroundColorNbMessage,
                fill: true,
                borderWidth : 1,
                hoverBackgroundColor: this.backgroundColorNbMessage,
                hoverBorderColor: this.backgroundColorNbMessage,
                borderColor: 'rgb(255,255,255)',
                hoverBorderWidth: 10,
              },
              
          
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins : {
              datalabels : {
                formatter: (value, ctx) => {
                let sum = 0;
                let dataArr = ctx.chart.data.datasets[0].data;
                dataArr.map(data => {
                    sum += data;
                });
                let percentage = (value*100 / sum);
                if(percentage>1.5){ //Ici on stop d'afficher les % lorsqu'on passe en dessous de 1.5
                  return (value*100 / sum).toFixed(1)+"%"
                }
                else{
                  return ''
                }
              
                },
                color: '#FFFFFF',
                textShadowColor:'#1A1837',            
              }
              },

            title: {
          position: 'top',
          display: false,
          text: 'Nombre de messages par utilisateur',
          fontSize : 16,
          fontColor : '#FFFFFF',
          fontStyle : 'bold'
          },
          legend: {

            display : this.nbMessagePerUserDisplay,
            position: 'right',
            fullWidth: true,
            labels: {
              fontSize: 14,
              padding : 20,
              fontColor : '#1A1837',      
            }
          },
            tooltips:{
              enabled:true,
              backgroundColor : 'rgba(0,0,0,0.8)', // Le 0.8 correspond à la transparence de la légende qui s'affiche quand on passe la souris dessus
            },

          }
        });


  //Chart sur le nombre de caractère moyen par message

        this.averageMessagePerUserChart = new Chart
        (this.averageMessagePerUserGraph.nativeElement.getContext('2d'), {  
            type: 'horizontalBar',
          data: {
            labels: this.averageMessagePerUserData['labels'],
            datasets: [
              { 
                data: this.averageMessagePerUserData['data'],
                borderWidth : 1,
                label : 'Caractères',
                fill : true,
                backgroundColor : this.averageMessagePerUserData['colors'],
                hoverBackgroundColor: this.averageMessagePerUserData['colors'],
                hoverBorderColor: this.averageMessagePerUserData['colors'],
                borderColor: '#EEEEEE',
                hoverBorderWidth: 10,
              },
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins :{
              datalabels : {
                formatter: function(value, context) {
                return Math.round(value*10)/10 ;
                },
                display : true,
                anchor : 'end',
                align : 'right',
                color : 'rgb(0,0,0)',
              }
            },
            
            title: {
          display: false,
          text: 'Moyenne de caractères par message',
          fontSize : 16,
          fontColor : '#FFFFFF',
          fontStyle : 'bold'
          },
          legend: {
            
            position: 'right',
            display: false,
            fullWidth: true,
            
          
          
          labels: {
            fontSize: 11,
            fontColor : '#1A1837',
            
            
          }
            },
            tooltips:{
              callbacks: {
                label: function(tooltipItem :any, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label || ''
                    label += ': '+ Math.round(tooltipItem.xLabel * 10) / 10 ;
                    return label;
                }
              },
              enabled:true,
              backgroundColor : 'rgba(0,0,0,0.8)', // Le 0.8 correspond à la transparence de la légende qui s'affiche quand on passe la souris dessus 
            },
            scales: {
        xAxes: [{

            scaleLabel : {
              labelString : 'Nombre de caractères par message',
              display : true,
            },

            gridLines : {
              color : '#1A1837',
              lineWidth : 0.1,
            },
            display: true,
            ticks: {
                fontColor: 'rgb(0,0,0)',
                suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
                // OR //
                beginAtZero: true   // minimum value will be 0.
            }
        }],
        yAxes: [{
            gridLines : {
              color : '#1A1837',
              lineWidth : 0.1,
              },
              ticks : {
                fontColor : '#1A1837',
            },
            maxBarThickness : 60,  
            barPercentage : 1,
            categoryPercentage : 0.7,
            scaleLabel : {
              labelString : 'Participants',
              display : true,
            }
            
        }]
    },

          }
        });      
  }


// Tout le code qui suit jusqu'à return saida, est un code pour coder le gradient de couleur

  hex (c) {
    var s = "0123456789abcdef";
    var i = parseInt (c);
    if (i == 0 || isNaN (c))
      return "00";
    i = Math.round (Math.min (Math.max (0, i), 255));
    return s.charAt ((i - i % 16) / 16) + s.charAt (i % 16);
  }

  /* Convert an RGB triplet to a hex string */
  convertToHex (rgb) {
    return this.hex(rgb[0]) + this.hex(rgb[1]) + this.hex(rgb[2]);
  }

  /* Remove '#' in color hex string */
  trim (s) { return (s.charAt(0) == '#') ? s.substring(1, 7) : s }

  /* Convert a hex string to an RGB triplet */
  convertToRGB (hex) {
    var color = [];
    color[0] = parseInt ((this.trim(hex)).substring (0, 2), 16);
    color[1] = parseInt ((this.trim(hex)).substring (2, 4), 16);
    color[2] = parseInt ((this.trim(hex)).substring (4, 6), 16);
    return color;
  }

  generateColor(colorStart,colorEnd,colorCount){

    // The beginning of your gradient
    var start = this.convertToRGB(colorStart);    

    // The end of your gradient
    var end   = this.convertToRGB(colorEnd);    

    // The number of colors to compute
    var len = colorCount;

    //Alpha blending amount
    var alpha = 0.0;

    var saida = [];
    let i=0
    while (i < len) {
      var c = [];
      alpha += (1.0/len);
      
      c[0] = start[0] * alpha + (1 - alpha) * end[0];
      c[1] = start[1] * alpha + (1 - alpha) * end[1];
      c[2] = start[2] * alpha + (1 - alpha) * end[2];
      saida.push('#'+this.convertToHex(c))
      //saida.push('rgb('+c[0]+','+c[1]+','+c[2]+')');
      i=i+1
      
    }
    
    return saida;
    
  }
}