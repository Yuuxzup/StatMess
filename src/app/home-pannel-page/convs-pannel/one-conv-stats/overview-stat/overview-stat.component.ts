import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js';
import { StatsConvService } from '../.././stats-conv.service';


import 'chartjs-plugin-datalabels';
import 'chartjs-plugin-deferred';

@Component({
  selector: 'app-overview-stat',
  templateUrl: './overview-stat.component.html',
  styleUrls: ['./overview-stat.component.css']
})
export class OverviewStatComponent implements OnInit, AfterViewInit {
  
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
  @Input() influenceUser : any; //{'labels':['hugo','qoqoq','alama','dkdkd','dakodak','etienne','jeankevin','opop','mololo','momo'],'data':[1,20,12,34,20,49,2,12,41,9]}
  @Input() currentStreak
  @Input() maxStreak
  @Input() maxFreeze
  @Input() firstToSpeak
  @Input() nbMessages
  @Input() nbParticipants
  @Input() dateCreationConv

  currentStreakSmiley = decodeURIComponent(escape("\u00f0\u009f\u0094\u00a5"));
  maxStreakSmiley = decodeURIComponent(escape("\u00e2\u009a\u00a1\u00ef\u00b8\u008f"));
  freezeSmiley =decodeURIComponent(escape("\u00e2\u009d\u0084\u00ef\u00b8\u008f"));

  // Couleur de début et de fin du gradiant de nombre de message per user sur un doughnut
  beginColor = '#1A1837';
  beginColorRgb = 'rgb(26,24,55,0.9)'
  endColor = '#EEEEEE';
  redColor = 'rgb(250, 138, 47)';


  //ViewChild de l'influence des users
  @ViewChild('influenceUserGraph') influenceUserGraph: ElementRef;
  influenceUserChart : any;
  influenceUserAdapt : any;
  backgroundColorInfluence = [];
  sumScoreInfluence : any;

  constructor(private elementRef : ElementRef, private statsConvService : StatsConvService) { }

  ngOnInit() {
 
    //On paramètre listeInfluenceur pour afficher ceux que l'on veut 
    let userName=this.statsConvService.userName
    
    let k=0;
    let constBeginColor = this.beginColor;
    let constBackgroundColorInfluence = [];
    let constInfluenceUserAdapt = {};
    let constInfluenceUser = this.influenceUser;
    let constSumScoreInfluence = 0;
    let constRedColor = this.redColor;

    for(k=0;k<constInfluenceUser['labels'].length;k++){
      constSumScoreInfluence += constInfluenceUser['data'][k];
    }
    this.sumScoreInfluence = constSumScoreInfluence;


    if(constInfluenceUser['labels'].length>5){
      let isUserHere = false;
      constInfluenceUserAdapt['labels']= constInfluenceUser['labels'].slice(0,5);
      constInfluenceUserAdapt['data']= constInfluenceUser['data'].slice(0,5);
      for (var i=0;i<constInfluenceUserAdapt['labels'].length;i++){
        if(constInfluenceUserAdapt['labels'][i]=== userName){
          isUserHere = true;
          constBackgroundColorInfluence.push(constRedColor);
          constInfluenceUserAdapt['labels'][i]='Vous';
        }
        constBackgroundColorInfluence.push(constBeginColor);
      }
      if(isUserHere===false){
        let j=0;
        while(j<constInfluenceUser['labels'].length && constInfluenceUser['labels'][j]!=userName){
          j=j+1
        }
        constInfluenceUserAdapt['labels'][4]='Vous';
        constInfluenceUserAdapt['data'][4]= constInfluenceUser['data'][j];
        constBackgroundColorInfluence[4]=constRedColor;
      }
      

    }
    else {
      constInfluenceUserAdapt = constInfluenceUser;
      let k=0
         for (k=0;k<constInfluenceUserAdapt['labels'].length;k++){
          if(constInfluenceUserAdapt['labels'][k]=== userName || constInfluenceUserAdapt['labels'][k]=== 'Vous'){
            constBackgroundColorInfluence.push(constRedColor);
            constInfluenceUserAdapt['labels'][k] = 'Vous';
         }
          constBackgroundColorInfluence.push(constBeginColor);
        }
    }
    
    this.influenceUserAdapt = constInfluenceUserAdapt;
    this.backgroundColorInfluence = constBackgroundColorInfluence;
  }
  ngAfterViewInit() {
  
  // Parametrage général du délai sur l'affichage des graphs
  Chart.defaults.global.plugins.deferred.delay = 150;
  Chart.defaults.global.plugins.deferred.yOffset = 100;

  //Chart sur l'influence des users

        this.influenceUserChart = new Chart
        (this.influenceUserGraph.nativeElement.getContext('2d'), {  
            type: 'polarArea',
            
          data: {
            labels: this.influenceUserAdapt['labels'],
            datasets: [
              { 
                data: this.influenceUserAdapt['data'],
                //Les couleurs peuvent être modifiées sur les variables globales définient plus haut
                backgroundColor: this.backgroundColorInfluence,
                fill: true,
                borderWidth : 1,
                borderColor : 'rgb(255,255,255)' ,
              },
              
          
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins : {
              datalabels : {
                formatter: (value, ctx) => {
                let sum = this.sumScoreInfluence;
                let percentage = (value*100 / sum)
                return (value*100 / sum).toFixed(1)+"%"
                },
                color: '#FFFFFF',
              }
            },
            scales: {
                gridLines : {
                  color : 'rgb(255,255,255,1)',
                  lineWidth : 0.1,
                },
              ticks : {
                display : false,
              },
              xAxes: [{
                display : false,
              }],
              yAxes: [{
                display:false,
              }]
            },

            title: {
          display: false,
          text: 'Influence des users',
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
            
            
          }
            },
            tooltips:{
              enabled:true,
              backgroundColor : 'rgba(0,0,0,0.8)', // Le 0.8 correspond à la transparence de la légende qui s'affiche quand on passe la souris dessus 
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