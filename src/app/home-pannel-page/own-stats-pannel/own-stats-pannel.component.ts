import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input } from '@angular/core';
import {OwnStatsService} from './own-stats.service';
import { Chart, ChartOptions } from 'chart.js';
import {GlobalService} from '../../global.service';
import {RouterModule,Router} from '@angular/router';


// Import plugins

import 'chartjs-plugin-datalabels'; //plugin label
import 'chartjs-plugin-deferred'; //plugin delay


@Component({
  selector: 'app-own-stats-pannel',
  templateUrl: './own-stats-pannel.component.html',
  styleUrls: ['./own-stats-pannel.component.scss']
})
export class OwnStatsPannelComponent implements OnInit, AfterViewInit {

  listFilesDico : any;
  userName : any;
  bubbleConv : any;
  hoursISend : any;
  nbrMessagePerPeriod : any;
  statsGlobalesMessages : any;
  nbInterlocuteurs : any;
  nbReactionsUser : any;
  nbCaracParMessUser : any;
  nbConvFirstMessSent : any;
  podiumConvLesPlusActives :any;
  firstConvUser :any;
  indicateursFlammeFreezeStrike :any;
  dicoSortBubbleConv : any;
  nbrConvActivePerPeriod :any;
  nbrCorrespondantPerPeriod : any;
  bestCorrespondantPerPeriod : any;
  userAverageAnswerTime : any;
  nbrConversations : any;
  bestFriend : any;
  percentInterlocuteursGenre : any;
  repartionTypeDeConv : any;
  repartionTypeMessage : any;
  maxDataRadar : any;
  dataSetBubble : any;
  genreMostConvIsWoman : any;
  suggestBestContact:any;
  suggestRandomContact : any;
  longestMessage : any;
  bestReactionsMessage : any;
  randomMessage : any;
  nbMaxMessPer24 : any;
  timeOnMessenger:any;
  nbrSmileyEnvoye:any;

  isOwnStatFirstRun:any;
  
  pinkColor= 'rgb(241,77,156)' ;
  blueColor = 'rgb(77,89,241)';
  indeterminedColor = '#1A1837';

  isHide = {'send':true,'receive':true,'reaction':true,'randomContact':true,'randomMessage':true}
  

  // A REMPLACER
  maxStreak = decodeURIComponent(escape("\u00e2\u009a\u00a1\u00ef\u00b8\u008f"));
  freeze = decodeURIComponent(escape("\u00e2\u009d\u0084\u00ef\u00b8\u008f"));
  streak = decodeURIComponent(escape("\u00f0\u009f\u0094\u00a5"));

  selectedSort : any;
  fileSelected : any;
  isFileOpen : boolean;

  //ViewChild du graphe bubble des conversations les plus importantes
  @ViewChild('bubbleConvGraph') bubbleConvGraph: ElementRef;
  bubbleConvChart =[];
  radiusTop1 : number;
  bubbleConvFixed = {'labels':['top1 conv','top2 conv','top3 conv','top4 conv'],'data':[{x:0,y:0,r:this.radiusTop1},{x:0,y:0,r:1},{x:0,y:0,r:0.2},{x:0,y:0,r:0.2}]} //Mettre dans labels le nom des convs dans ce sens là 
  colorBubble=[]

  //ViewChild du graphe d'évolution du nombre de message reçus envoyés par periode
  @ViewChild('nbrMessagePerPeriodGraph') nbrMessagePerPeriodGraph: ElementRef;
  nbrMessagePerPeriodChart =[];
  nbrMessagePerPeriodData = {"sent":[], "receive":[]}

  //ViewChild du graphe d'évolution du nombre de conversations actives
  @ViewChild('nbrConvActivPerPeriodGraph') nbrConvActivPerPeriodGraph: ElementRef;
  nbrConvActivPerPeriodChart =[];

  //ViewChild du graphe d'évolution du nombre de genre des conversations actives
  @ViewChild('repartitionGenreActivePerPeriodGraph') repartitionGenreActivePerPeriodGraph: ElementRef;
  repartitionGenreActivePerPeriodChart =[];

  //ViewChild du graphe des best friends
  @ViewChild('bestFriendPerPeriodGraph') bestFriendPerPeriodGraph: ElementRef;
  bestFriendPerPeriodChart =[];
  
  //ViewChild du graphe radar
  @ViewChild('radarReacGraph') radarReacGraph: ElementRef;
  radarReacChart =[]; 
  
  //ViewChild du graph répartition messages par temps
  @ViewChild('hoursISendGraph') hoursISendGraph: ElementRef;
  hoursISendChart =[];
  hoursArray = ['0h','1h','2h','3h','4h','5h','6h','7h','8h','9h','10h','11h','12h','13h','14h','15h','16h','17h','18h','19h','20h','21h','22h','23h'];
  hoursISendModify = [];
  sumMessages = 0;


  @ViewChild('repartitionTypeConvGraph') repartitionTypeConvGraph: ElementRef;
  repartitionTypeConvChart =[];

  @ViewChild('repartitionTypeMessageGraph') repartitionTypeMessageGraph: ElementRef;
  repartitionTypeMessageChart =[];

  constructor(private elementRef: ElementRef, private ownStatsService : OwnStatsService, private globalService : GlobalService, private router : Router) {
  }

   ngOnInit() {

    if(this.globalService.loadingDone=== false){
      this.router.navigate(['../../home']);
      alert("Veuillez sélectionner votre dossier à analyser afin d'accéder à cette page");
    }

    this.isFileOpen=false;
    this.isOwnStatFirstRun=this.ownStatsService.firstRun 
    this.ownStatsService.switchBooleanFirstRun()
    setTimeout(()=>{
      //this.closeTooltip();
    }, 10000)
    
    this.selectedSort="nbrMessage"

    //CALCULS DES VARIABLES
    this.listFilesDico = this.globalService.listFileDicoFilled;
    this.ownStatsService.findUserName(this.listFilesDico)
    this.userName= this.ownStatsService.userName;
    this.nbrConversations=this.listFilesDico.length
    this.bubbleConv = this.ownStatsService.calculBubbleConv(this.listFilesDico); //USELESS
    this.hoursISend = this.ownStatsService.calculHoursISend(this.listFilesDico)
    this.nbrMessagePerPeriod = this.ownStatsService.calculNbrMessagePerPeriod(this.listFilesDico)
    this.statsGlobalesMessages = this.ownStatsService.calculStatsGlobalesMessages(this.listFilesDico)
    this.nbInterlocuteurs = this.ownStatsService.calculNbInterlocuteurs(this.listFilesDico)
    this.nbReactionsUser = this.ownStatsService.calculNbReactionsUser(this.listFilesDico)
    this.nbCaracParMessUser = this.ownStatsService.calculNbCaracParMessUser(this.listFilesDico)
    this.nbConvFirstMessSent = this.ownStatsService.calculNbConvFirstMessSent(this.listFilesDico)
    this.podiumConvLesPlusActives = this.ownStatsService.calculPodiumConvLesPlusActives(this.listFilesDico)
    this.firstConvUser = this.ownStatsService.calculFirstConvUser(this.listFilesDico)
    this.indicateursFlammeFreezeStrike = this.ownStatsService.calculIndicateursFlammeFreezeStrike(this.listFilesDico)
    this.dicoSortBubbleConv = this.ownStatsService.calculDicoSortBubbleConv(this.listFilesDico);  //USELESS
    this.nbrConvActivePerPeriod = this.ownStatsService.calculNbrConvActivePerPeriod(this.listFilesDico);
    this.nbrCorrespondantPerPeriod = this.ownStatsService.calculNbrCorrespondantPerPeriod(this.listFilesDico);
    this.bestCorrespondantPerPeriod = this.ownStatsService.calculBestCorrespondantPerPeriod(this.listFilesDico);
    this.userAverageAnswerTime = this.ownStatsService.calculUserAverageAnswerTime(this.listFilesDico);
    this.bestFriend = this.ownStatsService.calculBestFriend(this.listFilesDico);
    this.percentInterlocuteursGenre = this.ownStatsService.calculPercentInterlocuteursGenre(this.listFilesDico);
    this.genreMostConvIsWoman = this.percentInterlocuteursGenre["genre"]==="filles"
    this.repartionTypeDeConv = this.ownStatsService.calculRepartionTypeDeConv(this.listFilesDico);
    this.repartionTypeMessage = this.ownStatsService.calculRepartionTypeMessage(this.listFilesDico);
    this.suggestBestContact = this.ownStatsService.calculSuggestBestContact(this.listFilesDico);
    this.suggestRandomContact = this.ownStatsService.calculRandomContact(this.listFilesDico);
    this.longestMessage = this.ownStatsService.calculLongestMessage(this.listFilesDico);
    this.bestReactionsMessage = this.ownStatsService.calculBestReactionMessage(this.listFilesDico);
    this.randomMessage = this.ownStatsService.calculRandomMessage(this.listFilesDico);
    this.nbMaxMessPer24 = this.ownStatsService.calculNbMaxMessPer24(this.listFilesDico);
    this.timeOnMessenger = this.ownStatsService.calculTimeOnMessenger(this.listFilesDico);
    this.nbrSmileyEnvoye = this.ownStatsService.calculNbrSmileyEnvoye(this.listFilesDico);

    
    //Taille écran en px
    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    let PxPerVh = Math.round(y/100);
    

    //Reglage radius pour poddium bubble
    let heightDivInVh = 50; //Hauteur de la div 
    let indexTop1 = 1;
    let indexTop2 = 2;
    let indexTop3 = 0;
    let indexTop4 = 3;
    var c = <HTMLCanvasElement> document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    for (var i=0;i<4;i++){
      this.colorBubble.push(ctx.createRadialGradient(0,0,0,0,0,0))
    }
  
    //Pour la bubble top 1
    let radiusTop1Vh = 15; //On a un rayon à peu près à 0.12 en scale classique 
    let radiusTop1Px = radiusTop1Vh*PxPerVh ;
    this.bubbleConvFixed['data'][indexTop1]['r'] = radiusTop1Px;
    this.bubbleConvFixed['data'][indexTop1]['x'] = 0;
    this.bubbleConvFixed['data'][indexTop1]['y'] = 0;
    var grd1 = ctx.createRadialGradient(this.bubbleConvFixed['data'][indexTop1]['x'], this.bubbleConvFixed['data'][indexTop1]['y'], 0, this.bubbleConvFixed['data'][indexTop1]['x'], this.bubbleConvFixed['data'][indexTop1]['y'], this.bubbleConvFixed['data'][indexTop1]['r']);
    grd1.addColorStop(0, '#454364');
    grd1.addColorStop(1, 'rgba(26, 24, 55,0.99)');
    this.colorBubble[indexTop1]=grd1;

    //pour la bubble top2
    this.bubbleConvFixed['data'][indexTop2]['x']=0.031; 
    this.bubbleConvFixed['data'][indexTop2]['y']=0.9;
    this.bubbleConvFixed['data'][indexTop2]['r']=(radiusTop1Px)*0.65;
    var grd2 = ctx.createRadialGradient(this.bubbleConvFixed['data'][indexTop2]['x'], this.bubbleConvFixed['data'][indexTop2]['y'], 0, this.bubbleConvFixed['data'][indexTop2]['x'], this.bubbleConvFixed['data'][indexTop2]['y'], this.bubbleConvFixed['data'][indexTop2]['r']);
    grd2.addColorStop(0, '#454364');
    grd2.addColorStop(1, 'rgba(26, 24, 55,0.99)');
    this.colorBubble[indexTop2]=grd2;


    //pour la bubble top3
    this.bubbleConvFixed['data'][indexTop3]['x']=0.025; 
    this.bubbleConvFixed['data'][indexTop3]['y']=-0.9;
    this.bubbleConvFixed['data'][indexTop3]['r']=(radiusTop1Px)*0.50;
    var grd3 = ctx.createRadialGradient(this.bubbleConvFixed['data'][indexTop3]['x'], this.bubbleConvFixed['data'][indexTop3]['y'], 0, this.bubbleConvFixed['data'][indexTop3]['x'], this.bubbleConvFixed['data'][indexTop3]['y'], this.bubbleConvFixed['data'][indexTop3]['r']);
    grd3.addColorStop(0, '#454364');
    grd3.addColorStop(1, 'rgba(26, 24, 55,0.99)');
    this.colorBubble[indexTop3]=grd3;

    //pour la bubble top4
    this.bubbleConvFixed['data'][indexTop4]['x']=-0.025; 
    this.bubbleConvFixed['data'][indexTop4]['y']=-0.5;
    this.bubbleConvFixed['data'][indexTop4]['r']=(radiusTop1Px)*0.25;
    var grd4 = ctx.createRadialGradient(this.bubbleConvFixed['data'][indexTop4]['x'], this.bubbleConvFixed['data'][indexTop4]['y'], 0, this.bubbleConvFixed['data'][indexTop4]['x'], this.bubbleConvFixed['data'][indexTop4]['y'], this.bubbleConvFixed['data'][indexTop4]['r']);
    grd4.addColorStop(0, '#454364');
    grd4.addColorStop(1, 'rgba(26, 24, 55,0.99)');
    this.colorBubble[indexTop4]=grd4;

    //Réglage pour le dataset du graph bubble

    let constDataSetBubble = [,,,];
    let constBubbleConvFixed = this.bubbleConvFixed;
    let constColorBubble = this.colorBubble
    var m;
    for(m=0;m<constBubbleConvFixed['labels'].length;m++){
      let constOneBubble = {};
      constOneBubble['label']=constBubbleConvFixed['labels'][m];
      let dataOneBubble = {};
      dataOneBubble['x']=constBubbleConvFixed['data'][m]['x'];
      dataOneBubble['y']=constBubbleConvFixed['data'][m]['y'];
      dataOneBubble['r']=constBubbleConvFixed['data'][m]['r'];
      constOneBubble['data']=[dataOneBubble];
      constOneBubble['backgroundColor'] = constColorBubble[m];
      constOneBubble['hoverBackgroundColor'] = constColorBubble[m];
      constOneBubble['hoverBorderColor'] = '#FFFFFF';
      constOneBubble['hoverBorderWidth'] = 2;

      //Pour le placement des boules
      if(m==0){
        constDataSetBubble[1]=constOneBubble;
      }
      if(m==1){
        constDataSetBubble[2]=constOneBubble;
      }
      if(m==2){
        constDataSetBubble[3]=constOneBubble;
      }
      if(m==3){
        constDataSetBubble[0]=constOneBubble;
      }

    }
    this.dataSetBubble = constDataSetBubble;




    //Réglage scale graph radar
    let constMaxDataRadar = Math.max(...this.nbReactionsUser["dataSent"],...this.nbReactionsUser["dataReceived"]);
    this.maxDataRadar = constMaxDataRadar;
    




    


    //MISE EN FORME DES GRAPHES

    //Graphe réaction
    for(var k=0; k<this.nbrMessagePerPeriod[0].length;k++){
      this.nbrMessagePerPeriodData["sent"].push(this.nbrMessagePerPeriod[1][k]["sent"])
      this.nbrMessagePerPeriodData["receive"].push(this.nbrMessagePerPeriod[1][k]["receive"])
    }

    //Graphe répartition messages par tranche horaire
    let constSumMessages = 0;
    let constHoursISend = this.hoursISend
    let constHoursISendModify = [];
    for(var i=0;i<constHoursISend.length;i++){
      constSumMessages += constHoursISend[i];
    }
    this.sumMessages = constSumMessages;
    
    for(k=0;k<constHoursISend.length;k++){
      constHoursISendModify.push(constHoursISend[k]/constSumMessages);
    }
    this.hoursISendModify = constHoursISendModify




  }

  ngAfterViewInit(){

    // Parametrage général du délai sur l'affichage des graphs
    Chart.defaults.global.plugins.deferred.delay = 150;
    Chart.defaults.global.plugins.deferred.yOffset = 150;
    
    //Graph répartition conversation groupe et une personne 
    this.repartitionTypeConvChart.push(new Chart
        (this.repartitionTypeConvGraph.nativeElement.getContext('2d'), {  
            type: 'doughnut',
            
          data: {
            labels: ["Conversations avec une personne","Conversations de groupe"],
            datasets: [
              { 
                data: [this.repartionTypeDeConv['solo'],this.repartionTypeDeConv['group']],
                //Les couleurs peuvent être modifiées sur les variables globales définient plus haut
                backgroundColor: ['rgb(250, 138, 47)','#1A1837'],
                fill: true,
                borderWidth : 1,
                hoverBackgroundColor: ['rgb(250, 138, 47)','#1A1837'],
                hoverBorderColor: 'rgb(255,255,255)',
                borderColor: 'rgb(255,255,255)',
                hoverBorderWidth: 10,
              },
            ]
          },
          options: {
            plugins:{
              datalabels : {
                color: '#FFFFFF',
              }
            },
            layout: {
              padding: {
                left: 20,
                right: 40,
                top: 40,
                bottom: 5
              }
            },
            responsive: true,
            maintainAspectRatio: false,
            title: {
          position: 'top',
          display: false,
          text: 'Nombre de messages par utilisateur',
          fontSize : 16,
          fontColor : '#EEEEEE',
          fontStyle : 'bold'
          },
          legend: {

            display : false,
            position: 'right',
            fullWidth: true,
            labels: {
              fontSize: 14,
              padding : 20,
              fontColor : '#EEEEEE',      
            }
          },
            tooltips:{
              enabled:true,
              backgroundColor : 'rgba(0,0,0,0.8)', // Le 0.8 correspond à la transparence de la légende qui s'affiche quand on passe la souris dessus
            },

          }
        }));
    // Graph répartition type de message (texte, vidéo, photo, liens)
    this.repartitionTypeMessageChart.push(new Chart
        (this.repartitionTypeMessageGraph.nativeElement.getContext('2d'), {  
            type: 'doughnut',
            
          data: {
            labels: ["Photos","Vidéos","Liens"],
            datasets: [
              { 
                data: [this.repartionTypeMessage['photo'], this.repartionTypeMessage['video'], this.repartionTypeMessage['link']],
                //Les couleurs peuvent être modifiées sur les variables globales définient plus haut
                backgroundColor: ['#1A1837','rgb(223, 132, 42)', 'rgb(250, 138, 47)'],
                fill: true,
                borderWidth : 1,
                hoverBackgroundColor: ['#1A1837','rgb(223, 132, 42)', 'rgb(250, 138, 47)'],
                hoverBorderColor: 'rgb(255,255,255)',
                borderColor: 'rgb(255,255,255)',
                hoverBorderWidth: 10,
              },
            ]
          },
          options: {
            plugins:{
              datalabels : {
                color: '#FFFFFF',
              }
            },
            layout: {
              padding: {
                left: 20,
                right: 40,
                top: 40,
                bottom: 5
              }
            },
            responsive: true,
            maintainAspectRatio: false,
            title: {
          position: 'top',
          display: false,
          text: 'Nombre de messages par utilisateur',
          fontSize : 16,
          fontColor : '#EEEEEE',
          fontStyle : 'bold'
          },
          legend: {

            display : false,
            position: 'right',
            fullWidth: true,
            labels: {
              fontSize: 14,
              padding : 20,
              fontColor : '#EEEEEE',      
            }
          },
            tooltips:{
              enabled:true,
              backgroundColor : 'rgba(0,0,0,0.8)', // Le 0.8 correspond à la transparence de la légende qui s'affiche quand on passe la souris dessus
            },

          }
        }));

    // Chart bubble sur les conversations les plus importantes
    // NON AFFICHE POUR LE MOMENT
    this.bubbleConvChart.push(new Chart(this.bubbleConvGraph.nativeElement.getContext('2d'),{ 
      type: 'bubble',
      data: {
        labels: this.dicoSortBubbleConv[this.selectedSort]['labels'],
        datasets: this.dataSetBubble,
        
      },
      options: {
        plugins: {
            
            datalabels: { 
            display : 'auto',
            anchor: function(context) {
							var value = context.dataset.data[context.dataIndex];
							return 0 < value["y"] ? 'center' : 'center';
						},
						align: function(context) {
							var value = context.dataset.data[context.dataIndex];
							return 0 < value["y"] ? 'center' : 'center';
						},
						color: function(context) {
							var value = context.dataset.data[context.dataIndex];
							if(value["x"]==0){
                return('#E5EC00');
              }
              if(value["x"]==0.031){
                return('#BEBEBE');
              }
              if(value["x"]==0.025){
                return('#EC9838');
              }
              if(value["x"]==-0.025){
                return('#A46600');
              }
						},
						font: function(context){
              var value = context.dataset.data[context.dataIndex];
							if(value["x"]==0){
                return{size:80};
              }
              if(value["x"]==0.031){
                return{size:65};
              }
              if(value["x"]==0.025){
                return{size:50};
              }
              if(value["x"]==-0.025){
                return{size:30};
              }
            },
						
						formatter: function(value) {
							if(value["x"]==0){
                return(1);
              }
              if(value["x"]==0.031){
                return(2);
              }
              if(value["x"]==0.025){
                return(3);
              }
              if(value["x"]==-0.025){
                return(4);
              }
						},
						offset: 2,
						padding: 0
					}
          },
        scales : {
          display : false,
          xAxes : [{
                ticks : {
                    min: -0.2,
                    max : 0.2,
                    display: false                 
                    },
                    
                gridLines: {
                  display:false,
                  drawBorder: false,
                }
              }],
          yAxes : [{
                ticks : {
                    max: 2,
                    min: -2,
                    display: false

                    },
                gridLines: {
                  display:false,
                  drawBorder: false,
                }
              }],
        },
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: false,
          text: "Bubble conv graph"
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
          callbacks: {
            label: function(t, d) {
              if(t.xLabel==0){
                return('Première position : '+d['labels'][0]);
              }
              if(t.xLabel==0.031){
                return('Deuxième position : '+d['labels'][1]);
              }
              if(t.xLabel==0.025){
                return('Troisième position : '+d['labels'][2]);
              }
              if(t.xLabel==-0.025){
                return('Quatrième position : '+d['labels'][3]);
              }
            },
            labelColor: function(t, chart) {
              if(t.xLabel==0){
                //return(chart.data.datasets[1]['backgroundColor']);
                return {
                  backgroundColor :'#fff',
                  borderColor : '#fff'
                }
              }
              if(t.xLabel==0.031){
                //return(chart.data.datasets[2]['backgroundColor']);
                return {
                  backgroundColor : '#fff',
                  borderColor : '#fff'
                }
              }
              if(t.xLabel==0.025){
                //return(chart.data.datasets[3]['backgroundColor']);
                return {
                  backgroundColor : '#fff',
                  borderColor : '#fff'
                }
              }
              if(t.xLabel==-0.025){
                //return(chart.data.datasets[0]['backgroundColor']);
                return {
                  backgroundColor : '#fff',
                  borderColor : '#fff'
                }
              }
            },
          },          
          enabled: true, 
        },
        onClick: (e) => {
          var element = this.bubbleConvChart[0].getElementAtEvent(e);
          if (element.length > 0) {
            var datasetLabel = this.bubbleConvChart[0].config.data.datasets[element[0]._datasetIndex].label;
            var data = this.bubbleConvChart[0].config.data.datasets[element[0]._datasetIndex].data[element[0]._index];
            let radiusTop1Vh = 15; //On a un rayon à peu près à 0.12 en scale classique 
            var w = window,
            d = document,
            el = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            x = w.innerWidth || el.clientWidth || g.clientWidth,
            y = w.innerHeight|| el.clientHeight|| g.clientHeight;
            let PxPerVh = Math.round(y/100);
            let radiusTop1Px = radiusTop1Vh*PxPerVh ;
            let listeR = [radiusTop1Px, (radiusTop1Px)*0.65, (radiusTop1Px)*0.50, (radiusTop1Px)*0.25]
            let indiceClick = listeR.indexOf(data["r"])
            this.redirectBubble(indiceClick)
          }
        }
      }
    }));

    //Chart sur l'évolution du nombre de message reçus envoyés par periode
    this.nbrMessagePerPeriodChart.push(new Chart(this.nbrMessagePerPeriodGraph.nativeElement.getContext('2d'),{  
      type: 'line',
      data: {
        labels: this.nbrMessagePerPeriod[0],
        datasets: [
          {
            label:"Sent",
            data: this.nbrMessagePerPeriodData["sent"],
            borderColor : '#1A1837',
            backgroundColor : '#1A1837',
            fill : false
          },
          {
            label:"Receive",
            data: this.nbrMessagePerPeriodData["receive"],
            borderColor : 'rgb(250, 138, 47)',
            backgroundColor : 'rgb(250, 138, 47)',
            fill : false
          },
          ]
        },
      options: {
        layout: {
            padding: {
                left: 20,
                right: 40,
                top: 40,
                bottom: 5
            }
        },
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
          text: 'Evolution du nombre de messages envoyés et reçus',
          fontSize : 16,
          fontColor : 'rgba(40, 37, 88, 0.815)',
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
        scales: { 
          xAxes: [{ 
            gridLines: { 
            color : 'rgba(40, 37, 88, 0.815)',
            lineWidth : 0.2,

            }, 
            ticks: { 
              padding: 1,
              fontColor : 'rgba(40, 37, 88, 0.815)'
              },
            scaleLabel : {
              labelString : 'Temps',
              display : true,
            }
              }],
          yAxes : [{
            gridLines :{
              color : 'rgba(40, 37, 88, 0.815))',
              lineWidth : 0.2,

            },
            ticks : {
            fontColor : 'rgba(40, 37, 88, 0.815)'
            },
            scaleLabel : {
              labelString : 'Nombre de messages',
              display : true,
            }
          }]
        },
      }
    }));


    // Chart Evolution du nombre de conversations actives
    
    this.nbrConvActivPerPeriodChart.push(new Chart(this.nbrConvActivPerPeriodGraph.nativeElement.getContext('2d'),{ 
      /*plugins : {
        datalabels : {
          display : true,
        }
      },*/
      type: 'bar',
      data: {
        labels: this.nbrConvActivePerPeriod[0],
        datasets: [
          { 
            data: this.nbrConvActivePerPeriod[1],
            //Les couleurs peuvent être modifiées sur les variables globales définient plus haut
            backgroundColor : 'rgb(250, 138, 47)' ,
            fill: false,
            borderWidth : 0.5,
            borderColor : '#1A1837',
          },
        ]
      },
      options: {
        layout: {
            padding: {
                left: 20,
                right: 40,
                top: 40,
                bottom: 5
            }
        },
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
              color : 'rgba(40, 37, 88, 0.815)',
              lineWidth : 0.2,
            },
            ticks :{
              fontColor :'rgba(40, 37, 88, 0.815)'
            },
            scaleLabel : {
              labelString : 'Temps',
              display : true,
            }
          }],
          yAxes: [{
            gridLines : {
              color : 'rgba(40, 37, 88, 0.815)',
              lineWidth : 0.2,
            },
            ticks : {
              fontColor :'rgba(40, 37, 88, 0.815)'
            },
            scaleLabel : {
              labelString : 'Nombre de conversations actives',
              display : true,
            }
          }]
        },
        title: {
          display: false,
          text: "Evolution du nombre de conversations actives",
          fontSize : 16,
          fontColor : 'rgba(40, 37, 88, 0.815)',
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
          callbacks: {
            label: function(tooltipItem :any, data) {
                var label = data.datasets[tooltipItem.datasetIndex].label || ''
                label += Math.round(tooltipItem.yLabel * 10) / 10 +' conversations';
                return label;
            }
          },
        enabled: true, 
        },
      }
    }));

    // Chart Répartition genre par periode 

    this.repartitionGenreActivePerPeriodChart.push(new Chart(this.repartitionGenreActivePerPeriodGraph.nativeElement.getContext('2d'), {  
      type: 'bar',
      data: {
        labels: this.nbrCorrespondantPerPeriod["label"],
        datasets: [
          { 
            label:"Garçon",
            data: this.nbrCorrespondantPerPeriod["data"]["m"],
            backgroundColor : this.blueColor,
            fill: false,
            borderWidth : 1,
            borderColor : this.blueColor ,
          },
          { 
            label:"Fille",
            data: this.nbrCorrespondantPerPeriod["data"]["f"],
            backgroundColor : this.pinkColor,
            fill: false,
            borderWidth : 1,
            borderColor : this.pinkColor ,
          },
          { 
            label:"Indéterminé",
            data: this.nbrCorrespondantPerPeriod["data"]["i"],
            backgroundColor : this.indeterminedColor,
            fill: false,
            borderWidth : 1,
            borderColor : this.indeterminedColor ,
          }
        ]
      },
      options: {
        layout: {
            padding: {
                left: 20,
                right: 40,
                top: 40,
                bottom: 5
            }
        },
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
              color : 'rgba(40, 37, 88, 0.815)',
              lineWidth : 0.2,
              },
              ticks :{
                fontColor :'rgba(40, 37, 88, 0.815)'
              },
              scaleLabel : {
              labelString : 'Temps',
              display : true,
            }
          }],
          yAxes: [{
            ticks :{
                fontColor :'rgba(40, 37, 88, 0.815)'
              },
              stacked: true,
              gridLines : {
              color : 'rgba(40, 37, 88, 0.815)',
              lineWidth : 0.2,
              },
              scaleLabel : {
              labelString : 'Nombre de personnes à qui vous parlez',
              display : true,
            }
          }]
        },
        title: {
          display: false,
          text: 'Evolution du genre des personnes à qui vous parlez',
          fontSize : 14,
          fontColor : 'rgba(40, 37, 88, 0.815)',
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


    // Chart best friend par période
    let constNameBestFriend = this.bestCorrespondantPerPeriod["data"]['names'];

    this.bestFriendPerPeriodChart.push(new Chart
        (this.bestFriendPerPeriodGraph.nativeElement.getContext('2d'), {  
          /*plugins : {
            datalabels : {
              display : false,
            }
          },*/  
          type: 'bar',
          data: {
            labels: this.bestCorrespondantPerPeriod['labels'],
            datasets: [
              { 
                data: this.bestCorrespondantPerPeriod["data"]['nbrMessages'],
                backgroundColor : this.bestCorrespondantPerPeriod["data"]['gendersColor'],
                fill: true,
              },
            ]
          },
          options: {
            layout: {
              padding: {
                left: 20,
                right: 40,
                top: 40,
                bottom: 5
              }
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins : {
              datalabels : {
                display : false,
              }
            },
            title: {
          display: false,
          text: "Best Friend par période",
          fontSize : 14,
          fontColor : '#EEEEEE',
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
                        return 'Meilleur(e) ami(e) du moment : '+ constNameBestFriend[tooltipItems.index];
                    }
              }
            },
            scales : {
              xAxes : [{
                gridLines : {
                  color : 'rgba(40, 37, 88, 0.815)',
                  lineWidth : 0.1,
                },
                ticks : {
                    autoSkip : true,
                    min: 0,
                    fontColor : 'rgba(40, 37, 88, 0.815)',                       
                    },
                scaleLabel : {
                  labelString : 'Temps',
                  display : true,
                }
              }],
              yAxes: [{
              gridLines : {
                color : 'rgba(40, 37, 88, 0.815)',
                lineWidth : 0.1,
              },
              display: true,
              ticks: {
                  fontColor :'rgba(40, 37, 88, 0.815)',
                  suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
                  // OR //
                  beginAtZero: true,  // minimum value will be 0.
                },
              scaleLabel : {
                labelString : 'Nombre de caractères échangés',
                display : true,
              }
              }],
            }
            }
          }
        ));

// chart sur les réactions radar

    this.radarReacChart.push(new Chart
    (this.radarReacGraph.nativeElement.getContext('2d'), {  
        type: 'radar',
      
      
      data: {
        labels: this.nbReactionsUser["labels"],
        
        
        datasets: [
          { 
            label :"Réaction envoyées",
            data: this.nbReactionsUser["dataSent"],
            //Les couleurs peuvent être modifiées sur les variables globales définient plus haut
            backgroundColor: 'rgba(26,24,55,0.8)',
            fill: true,
            borderWidth : 1,
            borderColor : 'rgb(0,0,0)' ,
            pointRadius : 4.2,
            pointBorderColor : 'rgb(0,0,0,0.8)',
            lineTension : 0.1,
            pointBackgroundColor : '#1A1837',
          },
          { 
            data: this.nbReactionsUser["dataReceived"],
            label : "Réactions reçues",
            //Les couleurs peuvent être modifiées sur les variables globales définient plus haut
            backgroundColor: 'rgba(250, 138, 47,0.8)' ,
            fill: true,
            borderWidth : 1,
            borderColor : 'rgb(0,0,0)' ,
            pointRadius : 4.2,
            pointBorderColor : 'rgb(0,0,0,0.8)',
            lineTension : 0.1,
            pointBackgroundColor : 'rgb(250, 138, 47)',
            
          },
        ]
      },
      options: {
        layout: {
              padding: {
                left: 20,
                right: 40,
                top: 40,
                bottom: 5
              }
            },
        responsive: true,
        maintainAspectRatio: false,
        plugins : {
          datalabels : {
            display : false
          }
        },
        scales: {
          /*angleLines : {
            color : 'rgb(0,0,0,1)',
            lineWidth : 0.2,
          }, */
          gridLines : {
              color : 'rgb(0,0,0,1)',
              lineWidth : 0.2,
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
      fontColor : '#FFFFFF',
      fontStyle : 'bold'
      },
      legend: {
        
        position: 'bottom',
        display: true,
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

    //Repartition messages par tranche horaire
    let constSumMessages = this.sumMessages;
    this.hoursISendChart.push(new Chart
        (this.hoursISendGraph.nativeElement.getContext('2d'), {   
          /*plugins : {
            datalabels : {
              display : true,
            }
          },*/
          type: 'bar',
          data: {
            labels: this.hoursArray,
            datasets: [
              { 
                data: this.hoursISendModify,
                //Les couleurs peuvent être modifiées sur les variables globales définient plus haut
                backgroundColor : 'rgb(250, 138, 47)' ,
                fill: false,
                borderWidth : 1,
                borderColor : '#1A1837' ,
                
              },
            ]
          },
          options: {
            layout: {
              padding: {
                left: 20,
                right: 40,
                top: 40,
                bottom: 5
              }
            },
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
                  color : 'rgb(0,0,0,1)',
                  lineWidth : 0.2,
                },
                ticks :{
                  fontColor :'rgba(40, 37, 88, 0.815)'
                },
                scaleLabel : {
                  labelString : 'Tranche horaire',
                  display : true,
                }
              }],
              yAxes: [{
                gridLines : {
                  color : 'rgb(0,0,0,1)',
                  lineWidth : 0.2,
                },
                ticks : {
                  fontColor :'rgba(40, 37, 88, 0.815)'
                },
                scaleLabel : {
                  labelString : '% de messages envoyés',
                  display : true,
                }
              }]
            },
            title: {
          display: false,
          text: "Répartition en % des messages par tranche horaire",
          fontSize : 16,
          fontColor : '#EEEEEE',
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
              callbacks: {
                label: function(tooltipItem :any, data) {
                    return (Math.round(tooltipItem.yLabel*100)/100)*100+'%';
                    
                }
              },
            enabled: true, 
            }
            }
          }
        ));
  }

  randomInt(monint : number){
      return Math.floor(Math.random() * (monint+1))
  }

  generateRandomColor(size : number){
    var bubbleColor = []
    for (var k=0; k<size;k++){
      bubbleColor.push('rgba(' + this.randomInt(255) + ',' + this.randomInt(255) + ',' + this.randomInt(255)+')')
    }
    return bubbleColor
  }

  redirectConv(){
    this.fileSelected = this.suggestBestContact[0]
    this.isFileOpen = true;
    console.log("fileOpen")
  }

  redirectBubble(indice){
    this.fileSelected = this.dicoSortBubbleConv[this.selectedSort]['files'][indice]
    this.isFileOpen = true;
  }

  invertStat(){
    this.isFileOpen = false;
  }

  invertHide(id : string){
    this.isHide[id] = !this.isHide[id];
  }

  goToMessenger() {
  window.open("https://www.messenger.com/");
  }

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

  displayReaction(numberReaction : number){
    if(numberReaction>0){
      return true
    }
    else{
      return false
    }
  }

  closeTooltip(){
    this.ownStatsService.switchBooleanFirstRun()
    this.isOwnStatFirstRun=false;
  }

}