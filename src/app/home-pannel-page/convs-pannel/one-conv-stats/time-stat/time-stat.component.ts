import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { StatsConvService } from '../.././stats-conv.service';
import { Chart } from 'chart.js';

import 'chartjs-plugin-datalabels';
import 'chartjs-plugin-deferred';

@Component({
  selector: 'app-time-stat',
  templateUrl: './time-stat.component.html',
  styleUrls: ['./time-stat.component.css']
})
export class TimeStatComponent implements OnInit, AfterViewInit {

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

  @Input() hoursToSend: any; //{'everyone':[listede%desmessagesdetoutlemonde],'user':[listede%desmessagesdel'user]}
  @Input() sumMessagesPerUserByTime : any; //[listedate, dico{'participant':[somme message par listedate]}]
  @Input() averageTimeToAnswer : any; // {labels : [listedesparticipants], data : [listeAverageTimePerUser]}

  hoursArray = ['0h-1h','1h-2h','2h-3h','3h-4h','4h-5h','5h-6h','6h-7h','7h-8h','8h-9h','9h-10h','10h-11h','11h-12h','12h-13h','13h-14h','14h-15h','15h-16h','16h-17h','17h-18h','18h-19h','19h-20h','20h-21h','21h-22h','22h-23h','23h-00h'];
  //Je fais une copie de hoursArray pour ensuite la fill et mettre les couleurs des bars pour le diagramme des messages en fonction de l'heure

  copyHoursArray = this.hoursArray.slice();
  beginColor = '#1A1837';
  beginColorRgb = 'rgb(26,24,55,0.9)';
  endColor = '#EEEEEE';
  redColor = 'rgb(250, 138, 47)';
  greenColor = 	'#32CD32';
  otherColor : '#1A1837';
  
  
  //ViewChild du graphe message par tranche horaire
  @ViewChild('hoursToSendGraph') hoursToSendGraph: ElementRef;
  hoursToSendChart = [];

  //ViewChild du graphe somme message en fonction du temps
  @ViewChild('sumMessageGraph') sumMessageGraph: ElementRef;
  sumMessageChart = [];
  sumMessageData = [] //Je l'implémente pour gérer l'affichage de mes datas
  
  //ViewChild du graphe temps de réponse moyen
  @ViewChild('averageTimeToAnswerGraph') averageTimeToAnswerGraph: ElementRef;
  averageTimeToAnswerChart = [];
  averageTimeToAnswerDisplay : any;
  
 

  constructor(private elementRef : ElementRef, private statsConvService : StatsConvService) { }

  ngOnInit() {

    // Initialisation sumMessage affichage

    let constMainUser = this.statsConvService.userName //Nom de la personne qui met ses données 

    let listeParticipantToDisplay = []
    let averageData = new Array(this.sumMessagesPerUserByTime[1][constMainUser].length).fill(0)

  

    //Si on a trop de données (ie >5 participants) alors on display la moyenne en +, et 5 courbes dont l'user est forcément dedans (les 4 plus hautes sommes hors user)
    if (Object.keys(this.sumMessagesPerUserByTime[1]).length>5){
      let tempoSumMessagesPerUserByTime =this.sumMessagesPerUserByTime[1]

      //On trouve les 4 plus gros hors le user
      let tempoSum = this.sumMessagesPerUserByTime[1]
      var items = Object.keys(tempoSum).map(function(key) {
        return [key, tempoSum[key]];
      });

      items.sort(function(first,second) {
        return second[1][second[1].length-1] - first[1][first[1].length-1];
      });
      let listeUser = items.slice(0,5)
      if (listeUser.indexOf(constMainUser)===-1){
        listeUser.slice(0,4)
      }
      else{
        listeUser.splice(listeUser.indexOf(constMainUser), listeUser.indexOf(constMainUser)-1)
      }
      
      listeUser.forEach(function(participant){
        listeParticipantToDisplay.push(participant[0])
      })
      listeParticipantToDisplay.push(constMainUser)
      listeParticipantToDisplay.push("Moyenne")
      let numberParticipant = Object.keys(tempoSumMessagesPerUserByTime).length
      Object.keys(tempoSumMessagesPerUserByTime).forEach(function(participant){
        for (var k=0; k<tempoSumMessagesPerUserByTime[participant].length; k++){
          averageData[k]+=tempoSumMessagesPerUserByTime[participant][k]/numberParticipant
        }
      })
      
    } else{
      listeParticipantToDisplay=Object.keys(this.sumMessagesPerUserByTime[1])
    }


    //Init de constsumMessage

    //Création du backgroundcolor
    let userName=this.statsConvService.userName
    let constBackgroundColorSumMessage = this.generateColor(this.endColor,this.beginColor,listeParticipantToDisplay.length-1);
    let k=0;

    //Implantation des datas 
    let constSumMessageData= [];
    let dataPerParticipant = this.sumMessagesPerUserByTime[1]
    let constRedColor = this.redColor;
    let constGreenColor = this.greenColor;
    let constOtherColor = this.otherColor;

    listeParticipantToDisplay.forEach(
      function(participant){
        let constMessage = {};
        if(participant===constMainUser){
          constMessage['data']=  dataPerParticipant[participant];
          constMessage['borderColor']= 	constRedColor;
          constMessage['label']= 'Vous';
          constMessage['fill'] = false;
          constMessage['backgroundColor'] = constRedColor;
          
        } else if (participant==="Moyenne"){
          constMessage['data']=  averageData;
          constMessage['borderColor']= 	constGreenColor;
          constMessage['label']= 'Moyenne';
          constMessage['fill'] = false;
          constMessage['backgroundColor']= 	constGreenColor;
        }
        else{
          constMessage['data']=  dataPerParticipant[participant];
          constMessage['borderColor']= constBackgroundColorSumMessage[k];
          constMessage['label']= participant;
          constMessage['fill'] = false;
          constMessage['backgroundColor']= constBackgroundColorSumMessage[k];
          k=k+1
        }
        constSumMessageData.push(constMessage)
      }
    )
    this.sumMessageData = constSumMessageData.slice();


    //Initialisation des données pour temps de réponse moyen

    let constAverageTimeToAnswer = this.averageTimeToAnswer;
    
    //Transformation de constAverageTimeToAnswer en un dictionnaire du type { 'Hugo':20 , 'Paul' : 10};
    let constAverageTimeToAnswerDico = {};

    var z;
    for(z=0;z<constAverageTimeToAnswer['labels'].length;z++){
      constAverageTimeToAnswerDico[constAverageTimeToAnswer['labels'][z]]=constAverageTimeToAnswer['data'][z];
    }

    //Trie du dictionnaire
    let constAverageTimeToAnswerToDisplay = {'labels':[],'data':[],'backgroundColor':[]};
    let indexUserAverageTimeToAnswer = 0;
    let constBackgroundColorAverageTimeToAnswer = [];
    

    // Create items array
    var items = Object.keys(constAverageTimeToAnswerDico).map(function(key) {
      return [key, constAverageTimeToAnswerDico[key]];
    });

    // Sort the array based on the second element
    items.sort(function(first, second) {
      return second[1] - first[1];
    });

    if(items.length>6){
      let isUserHereAverageTime = false;
      var w;
      for(w=0;w<3;w++){
        if(items[w][0]===constMainUser){
          isUserHereAverageTime = true;
          constAverageTimeToAnswerToDisplay['labels'].push('Vous');
          constAverageTimeToAnswerToDisplay['data'].push(items[items.length-1-w][1]);
          constAverageTimeToAnswerToDisplay['backgroundColor'].push(constRedColor);
        }
        else{
          constAverageTimeToAnswerToDisplay['labels'].push(items[items.length-1-w][0]);
          constAverageTimeToAnswerToDisplay['data'].push(items[items.length-1-w][1]);
          constAverageTimeToAnswerToDisplay['backgroundColor'].push('#1A1837');
        }
      }


      //On ajoute en 4eme position celui qui a un temps de réponse le plus long et on regarde si c'est pas l'user
      
      constAverageTimeToAnswerToDisplay['labels'].push(items[0][0]);
      constAverageTimeToAnswerToDisplay['data'].push(items[0][1]);
      constAverageTimeToAnswerToDisplay['backgroundColor'].push('#1A1837');

      if(items[0][0]===constMainUser){
        isUserHereAverageTime = true;
      }
      //Si l'user n'a pas été repéré dans le top 3 et dans celui qui a le temps de réponse le plus long
      if(isUserHereAverageTime===false){
        let it=1;
        while(items[it][0]!=constMainUser && it<items.length-3){
          it += 1;
        }
        indexUserAverageTimeToAnswer = 4;
        constAverageTimeToAnswerToDisplay['labels'].push('Vous');
        constAverageTimeToAnswerToDisplay['data'].push(items[it][1]);
        constAverageTimeToAnswerToDisplay['backgroundColor'].push(constRedColor);
      }

      //Calcul de la moyenne
      let sumAverageTimeToAnswer = 0;
      var n;
      for(n=0;n<items.length;n++){
        sumAverageTimeToAnswer += items[n][1];
      }
      constAverageTimeToAnswerToDisplay['labels'].push('Moyenne');
      constAverageTimeToAnswerToDisplay['data'].push(Math.round((sumAverageTimeToAnswer/items.length)));
      constAverageTimeToAnswerToDisplay['backgroundColor'].push(constGreenColor);

      this.averageTimeToAnswerDisplay = constAverageTimeToAnswerToDisplay;
    }
    else if(items.length<=6){
      let w=0;
      for(w=0;w<items.length;w++){
        if(items[w][0]===constMainUser){
          constAverageTimeToAnswerToDisplay['labels'].push('Vous');
          constAverageTimeToAnswerToDisplay['data'].push(items[w][1]);
          constAverageTimeToAnswerToDisplay['backgroundColor'].push(constRedColor);
        }
        else{
          constAverageTimeToAnswerToDisplay['labels'].push(items[w][0]);
          constAverageTimeToAnswerToDisplay['data'].push(items[w][1]);
          constAverageTimeToAnswerToDisplay['backgroundColor'].push('#1A1837');
        }
      }
      //Calcul de la moyenne
      let sumAverageTimeToAnswer = 0;
      let n;
      for(n=0;n<items.length;n++){
        sumAverageTimeToAnswer += items[n][1];
      }
      constAverageTimeToAnswerToDisplay['labels'].push('Moyenne');
      constAverageTimeToAnswerToDisplay['data'].push(Math.round((sumAverageTimeToAnswer/items.length)));
      constAverageTimeToAnswerToDisplay['backgroundColor'].push(constGreenColor);

      this.averageTimeToAnswerDisplay = constAverageTimeToAnswerToDisplay;
      }


    }


  

  ngAfterViewInit() {

     // Chart sur les heures des messages

        this.hoursToSendChart = new Chart
        (this.hoursToSendGraph.nativeElement.getContext('2d'), {  
            plugins : {
              datalabels : {
                display : true,
              }
            },
          type: 'bar',
          data: {
            labels: this.hoursArray,
            datasets: [
              { 
                
                data: this.hoursToSend['everyone'],
                //Les couleurs peuvent être modifiées sur les variables globales définient plus haut
                backgroundColor : this.copyHoursArray.fill(this.beginColorRgb),
                fill: false,
                borderWidth : 1,
                borderColor : 'rgb(0,0,0)' ,
                label: 'Tous les participants',
                
              },
              {
                type : 'line',
                data : this.hoursToSend['user'],
                backgroundColor : this.redColor,
                label : 'Vous',
                fill : false,
                borderColor : this.redColor,
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
                gridLines : {
                  color : '#1A1837',
                  lineWidth : 0.1,
                },
                ticks :{
                  fontColor :'#1A1837',
                },
                scaleLabel : {
                  labelString : 'Tranches horaires',
                  display : false,
                }
              }],
              yAxes: [{
                gridLines : {
                  color : '#1A1837',
                  lineWidth : 0.1,
                },
                ticks : {
                  fontColor :'#1A1837',
                },
                scaleLabel : {
                  labelString : '% des messages',
                  display : true,
                }
              }]
            },
            title: {
          display: false,
          text: "Répartition en % des messages par tranche horaire",
          fontSize : 16,
          fontColor : '#1A1837',
          fontStyle : 'bold'

          },
          legend: {
            position: 'bottom',
            display: true,
            fullWidth: true,
          labels: {
            fontSize: 11

          }
            },
            tooltips: {
              callbacks: {
                label: function(tooltipItem, data) {
                    return Math.round(tooltipItem.yLabel * 10) / 10+'%';
                    
                }
              },
            enabled: true, 
            }
            }
          }
        );


    //Chart sur la somme des messages par utilisateur

        this.sumMessageChart = new Chart
        (this.sumMessageGraph.nativeElement.getContext('2d'), {  
            type: 'line',
          data: {
    labels: this.sumMessagesPerUserByTime[0],
    datasets:this.sumMessageData,
      },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins :{
              datalabels : {
                display : false,
                anchor : 'end',
                align : 'right',
              }
            },

            title: {
          display: false,
          text: 'Somme des messages par utilisateur',
          fontSize : 16,
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
              callbacks: {
                label: function(tooltipItem, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label || ''
                    label += ': '+ Math.round(tooltipItem.yLabel * 10) / 1 ;
                    return label;
                }
              },
              enabled:true,
              backgroundColor : 'rgba(0,0,0,0.8)', // Le 0.8 correspond à la transparence de la légende qui s'affiche quand on passe la souris dessus 
            },
            scales: { 
              xAxes: [{ 
                gridLines: { 
                color : '#1A1837',
                lineWidth : 0.1,

                }, 
                ticks: { 
                  padding: 1,
                  fontColor : '#1A1837',
                },
                scaleLabel : {
                  labelString : 'Temps',
                  display : false,
                }

                  }],
              yAxes : [{
                gridLines :{
                  color : '#1A1837',
                  lineWidth : 0.1,

                },
                ticks : {
                fontColor : '#1A1837',
                },
                scaleLabel : {
                  labelString : 'Somme du nombre de messages',
                  display : true,
                }
              }]
                  },
          }
        });

    // Chart sur le temps de réponse moyen

        this.averageTimeToAnswerChart = new Chart
        (this.averageTimeToAnswerGraph.nativeElement.getContext('2d'), {  
            plugins : {
              datalabels : {
                display : false,
              }
            },
            type: 'bar',
          data: {
            labels: this.averageTimeToAnswerDisplay['labels'],
            datasets: [
              { 
                data: this.averageTimeToAnswerDisplay['data'],
                //Les couleurs peuvent être modifiées sur les variables globales définient plus haut
                backgroundColor : this.averageTimeToAnswerDisplay['backgroundColor'],
                fill: true,
                borderWidth : 1,
                borderColor : 'rgb(0,0,0)' ,
              },
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
            title: {
          display: false,
          text: "Temps de réponse moyen",
          fontSize : 14,
          fontColor : '#1A1837',
          fontStyle : 'bold'
          },
          legend: {
            position: 'bottom',
            display: false,
            fullWidth: true,
          labels: {
            fontSize: 11

          }
            },
            tooltips: {
            enabled: true,
            callbacks: {
                    label: function(tooltipItems, data) { 
                        return 'Temps de réponse moyen : '+tooltipItems.yLabel + ' minutes';
                    }
              }
            },
            scales : {
              xAxes : [{
                gridLines : {
                  color : '#1A1837',
                  lineWidth : 0.1,
                },
                ticks : {
                    autoSkip : false,
                    stepSize: 1,
                    min: 0,
                    fontColor : '#1A1837',
                    callback: function(value, index, values) {
                        let i=0;
                        let constvalue = value;
                        let indexFirstSpace = 100000; //Je l'implémente à une valeur hallucinante et inatteignable
                        let shortName = '';
                        if(constvalue.length>20){
                          for(i=0;i<constvalue.length;i++){
                            shortName += constvalue[i];
                            if(constvalue[i]===' ' && indexFirstSpace===100000 && i+1<value.length){
                              indexFirstSpace=i;
                            }
                          }
                        
                        if(indexFirstSpace!=100000){
                          return(value.substring(0,indexFirstSpace+2))
                        }
                          
                        else{
                          return value
                        }
                      }
                      else{
                        return value
                      }
                        
                    }
                  },
                scaleLabel : {
                  labelString : 'Participants',
                  display : false,
                }
              }],
              yAxes: [{
              gridLines : {
                color : '#1A1837',
                lineWidth : 0.1,
              },
              display: true,
              ticks: {
                  fontColor :'#1A1837',
                  suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
                  // OR //
                  beginAtZero: true,  // minimum value will be 0.
                },

              scaleLabel : {
                labelString : 'Temps de réponse (mn)',
                display : true,
              }
              }],
            }
            }
          }
        );
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