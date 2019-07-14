import { Injectable} from '@angular/core';
import * as baseGenre from '../../../data/baseGenre.json';
import * as baseGenre2 from '../../../data/baseGenre2.json';

@Injectable()
export class OwnStatsService {
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
  bestFriend : any;
  percentInterlocuteursGenre : any;
  repartitionTypeConv : any;
  repartitionTypeMessage : any;
  suggestBestContact : any;
  suggestRandomContact : any;
  longestMessage:any;
  bestReactionsMessage:any;
  nbMaxMessPer24:any;
  timeOnMessenger:any;
  nbrSmileyEnvoye:any;

  listDate:any;
  indicateur:any;

  pinkColor= 'rgb(241,77,156)' ;
  blueColor = 'rgb(77,89,241)';
  indeterminedColor = '#1A1837';

  firstRun = true;

  constructor() { }

  switchBooleanFirstRun(){
    this.firstRun=false;
  }
  //***************************************************************//
  //POUR EVITER DE DEVOIR TOUJOURS PASSER LE USER EN PARAM
  //ON PEUT IMAGINER VIRER CA DANS UN AUTRE SERVICE GLOBAL PLUS TARD
  findUserName(listFileDico : any){
    if (this.userName){
      return this.userName;
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
    return this.userName
  }

  determineListDateAndIndic(listFileDico : any){
    //On determine en quelle unité on veut notre graphe
    let indicateur=""
    //On va fixer la date de début au premier message envoyé ou reçu
    let timeStampDebut = (new Date()).getTime();
    listFileDico.forEach(function(file){
      timeStampDebut=Math.min(timeStampDebut,file["content"]["messages"][file["content"]["messages"].length-1]["timestamp_ms"])
    })

    let dateDebut = new Date(timeStampDebut)
    let lastMessageTs = 0
    for(var k=0;k<listFileDico.length;k++){
      lastMessageTs=Math.max(lastMessageTs,listFileDico[k]["content"]["messages"][0]["timestamp_ms"])
    }
    let dateFin = new Date(lastMessageTs)


    if (
      (dateFin.getMonth() - dateDebut.getMonth() >=3) && (dateFin.getFullYear() - dateDebut.getFullYear() ===0) //Même année 3 mois d'écart
      ||
      (dateFin.getMonth()+11 - dateDebut.getMonth() >=3) && (dateFin.getFullYear() - dateDebut.getFullYear() ===1) //Année différente 3 mois d'écart
      ||
      (dateFin.getFullYear() - dateDebut.getFullYear() >1)){ //Plus d'une année de différence
      indicateur="month"
    } else{
      indicateur="day"
    }
    this.indicateur=indicateur

    //On initialise nos liste de données en fonction de l'indicateur
    let listDate = []
    let currentDate = dateDebut
    listDate.push(this.transformDate(currentDate, indicateur))
    while (!this.estDatesEgales(currentDate, dateFin, indicateur)){
      if (indicateur==="day"){
        currentDate = new Date(currentDate.getFullYear(),currentDate.getMonth(),currentDate.getDate()+1)
      }
      if (indicateur==="month"){
        currentDate = new Date(currentDate.getFullYear(),currentDate.getMonth()+1,1)
      }
      if (indicateur==="year"){
        currentDate = new Date(currentDate.getFullYear()+1,currentDate.getMonth(),currentDate.getDate())
      }
      listDate.push(this.transformDate(currentDate, indicateur))
    }
    console.log(listDate)
    this.listDate=listDate
  }

  transformDate( myDate : Date, indicateur : any){
    if (indicateur === "day"){
      let correspondanceMonth=["Janv", "Fev", "Mars", "Avril", "Mai", "Juin", "Juil", "Aout", "Sept", "Oct", "Nov", "Dec"]
      return myDate.getDate()+" "+correspondanceMonth[myDate.getMonth()]+" "+String(myDate.getFullYear()).substring(2)
    } 
    if (indicateur === "week"){
      return
    }
    if (indicateur === "month"){
      let correspondanceMonth=["Janv", "Fev", "Mars", "Avril", "Mai", "Juin", "Juil", "Aout", "Sept", "Oct", "Nov", "Dec"]
      return correspondanceMonth[myDate.getMonth()]+" "+String(myDate.getFullYear()).substring(2)
    }
  }

  estDatesEgales(date1 : Date, date2 : Date, indicateur){
    if (indicateur === "day"){
      return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear()
    } 
    if (indicateur === "week"){
      return
    }
    if (indicateur === "month"){
      return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear()
    }
  }

  //***************************************************************//

  calculBubbleConv(listFileDico : any){
    if (this.bubbleConv){
      return this.bubbleConv;
    }
    let maxMessagesInOneConv = 0
    listFileDico.forEach(function(file){
      maxMessagesInOneConv=Math.max(file["content"]["messages"].length, maxMessagesInOneConv)
    })
    let bubbleConv={}
    let listNames=[]
    let listData=[]

    listFileDico.forEach(function(file){
      listNames.push(file["name"])
      let maBulle = {}
      maBulle["r"]=file["content"]["messages"].length/maxMessagesInOneConv*50
      maBulle["x"]=Math.floor(Math.random() * 101);
      maBulle["y"]=Math.floor(Math.random() * 101);
      listData.push(maBulle)
    })
    this.bubbleConv = {"labels":listNames, "data":listData}
    return {"labels":listNames, "data":listData} 
  }

  calculRepartionTypeDeConv(listFileDico : any){
    if (this.repartitionTypeConv){
      return this.repartitionTypeConv;
    }

    let repartition={"solo":0, "group":0}
    listFileDico.forEach(function(file){
      repartition[file["isConvGroup"] ? "group" : "solo"]+=1
    })

    this.repartitionTypeConv=repartition
    return repartition
  }

  calculRepartionTypeMessage(listFileDico : any){
    if (this.repartitionTypeMessage){
      return this.repartitionTypeMessage;
    }

    let repartition={"text":0, "photo":0, "video":0, "link":0}
    listFileDico.forEach(function(file){
      let listMessages = file["content"]["messages"]
      for (var k=0;k<listMessages.length;k++){
        if (Object.keys(listMessages[k]).indexOf("videos")>-1){
          repartition["video"]+=1
        } else if (Object.keys(listMessages[k]).indexOf("photos")>-1){
          repartition["photo"]+=1
        } else if (Object.keys(listMessages[k]).indexOf("share")>-1){
          repartition["link"]+=1
        } else {
          repartition["text"]+=1
        }
      }
    })

    this.repartitionTypeMessage=repartition
    return repartition
  }

  calculHoursISend(listFileDico : any){
    if (this.hoursISend){
      return this.hoursISend;
    }
    let myHoursArrayUser = new Array(24).fill(0);
    let user= this.userName
    listFileDico.forEach(function(file){
      let jsonContent=file["content"]
      let tempoHours=new Array(24).fill(0);
      jsonContent["messages"].forEach(
      function(message){
        if (decodeURIComponent(escape(message["sender_name"]))===user){
          tempoHours[(new Date(message["timestamp_ms"])).getHours()]+=1
        }
      });
      for (var k=0;k<tempoHours.length;k++){
        myHoursArrayUser[k]+=tempoHours[k]
      }
    });
    this.hoursISend = myHoursArrayUser
    return myHoursArrayUser
  }

  calculUserAverageAnswerTime(listFileDico :any){

    var sommeAvTimeUser = 0;
    var sommeAvTimeOther = 0;

    var sommeNbConvCompte = 0;

    var username = this.userName;

    listFileDico.forEach(function(file){

      if (file["content"]["participants"].length == 2 && file["content"]["messages"].length >= 6){

    var jsonContent = file["content"]

    var tabMess = jsonContent["messages"].slice().reverse() // On ordonne
    const numberMillisecondsInOneDay=1000*60*60*24;
    var tabIndexNewConv = [0]
    var tabIndexNewConvCausedByNight = []

// Partie 1

    let i;
    for(i=1; i < tabMess.length; i++){
        if(tabMess[i]["timestamp_ms"] - tabMess[i-1]["timestamp_ms"] >= numberMillisecondsInOneDay){
          tabIndexNewConv.push(i)
        }
    }

    tabIndexNewConv.push(tabMess.length); //Ajout artificiel pour aller jusqu'au bout dans la boucle suivante

// Partie 2

    let k;
    for(k=1; k < tabIndexNewConv.length; k++){

       var dureeTotalBatch = tabMess[tabIndexNewConv[k] -1]["timestamp_ms"] - tabMess[tabIndexNewConv[k-1]]["timestamp_ms"]
       var nombreCreuxAEnlever = Math.floor(dureeTotalBatch / numberMillisecondsInOneDay)
       var tabDeTabDureeIndex = []

       let j;
       for(j= tabIndexNewConv[k-1]; j < tabIndexNewConv[k]-1; j++){ //Sur un batch Attention en terme d'index
         
         var deltaTemps = tabMess[j+1]["timestamp_ms"] - tabMess[j]["timestamp_ms"]
         var indexRepriseAssocie = j+1;
         tabDeTabDureeIndex.push([deltaTemps, indexRepriseAssocie]);
         

       }

       tabDeTabDureeIndex.sort(function(first, second) {
       return second[0] - first[0];})
       tabDeTabDureeIndex.slice(0, nombreCreuxAEnlever).forEach(function(tab){
          tabIndexNewConvCausedByNight.push(tab[1]) //On add les index de reprise post nuit
       })

    }

    var tabIndexTotal = tabIndexNewConv.concat(tabIndexNewConvCausedByNight).sort(function(a, b) {
    return a - b; //On concatène et ordonne
    });

// Partie 3

    var dicoTotalTimePerParticipant = {}
    var dicoTotalAnswersPerParticipant = {}
    jsonContent["participants"].forEach(function(participant){
      dicoTotalTimePerParticipant[decodeURIComponent(escape(participant["name"]))] = 0
      dicoTotalAnswersPerParticipant[decodeURIComponent(escape(participant["name"]))] = 0
    })

    let p;
    for(p=1; p < tabIndexTotal.length; p++){
      
       let c;
       for(c= tabIndexTotal[p-1]; c < tabIndexTotal[p]-1; c++){

        if(tabMess[c+1]["sender_name"] != tabMess[c]["sender_name"]){ // On ne compte pas quand la personne envoie deux mess d'affilé

        dicoTotalTimePerParticipant[decodeURIComponent(escape(tabMess[c+1]["sender_name"]))] += tabMess[c+1]["timestamp_ms"] - tabMess[c]["timestamp_ms"]
        dicoTotalAnswersPerParticipant[decodeURIComponent(escape(tabMess[c+1]["sender_name"]))] += 1

        }

       }
    }

    var dicoData = {}
    jsonContent["participants"].forEach(function(participant){
      if(dicoTotalAnswersPerParticipant[decodeURIComponent(escape(participant["name"]))] === 0){
      dicoData[decodeURIComponent(escape(participant["name"]))] = 0
      }
      else{
        dicoData[decodeURIComponent(escape(participant["name"]))] = Math.round(dicoTotalTimePerParticipant[decodeURIComponent(escape(participant["name"]))] / (dicoTotalAnswersPerParticipant[decodeURIComponent(escape(participant["name"]))]*1000*60)) 
      }
    })

      var OnPeutCompterCetteConv = true

      Object.keys(dicoData).forEach(function(element){
        if (dicoData[element] == 0){
            OnPeutCompterCetteConv = false
        }
      })

      if (OnPeutCompterCetteConv){

        sommeNbConvCompte += 1;

        Object.keys(dicoData).forEach(function(element){
          if(element == username){
            sommeAvTimeUser += dicoData[element]
          }
          else{
            sommeAvTimeOther += dicoData[element] 
          }
        })
      }

      }
    })

    this.userAverageAnswerTime = {"label" : ["Votre temps moyen de réponse", "Celui de vos contacts"], "data" : [Math.floor(sommeAvTimeUser/sommeNbConvCompte),Math.floor(sommeAvTimeOther/sommeNbConvCompte)]}
    return {"label" : ["Votre temps moyen de réponse", "Celui de vos contacts"], "data" : [Math.floor(sommeAvTimeUser/sommeNbConvCompte),Math.floor(sommeAvTimeOther/sommeNbConvCompte)]}
  }


  calculPercentInterlocuteursGenre(listFileDico : any){
    if (this.percentInterlocuteursGenre){
      return this.percentInterlocuteursGenre
    }
    let setInterlocuteurs = new Set();
    listFileDico.forEach(function(file){
      for (var k = 0; k<file["content"]["participants"].length;k++){
        setInterlocuteurs.add(decodeURIComponent(escape(file["content"]["participants"][k]["name"])));
      }
    })
    
    let dicoCompt={"f":0,"m":0}
    let setKeyInBaseGenre = new Set(Object.keys(baseGenre))
    let setKeyGenreF= new Set(baseGenre2["f"])
    let setKeyGenreM= new Set(baseGenre2["m"])
    setInterlocuteurs.forEach(function(participant){
      let prenom1 = participant.split(" ")[0].toLowerCase()
      let prenom2 = participant.split(" ")[0].replace("é","e").replace("è","e").replace("ê","e").replace("ë","e").replace("ï","i").replace("î","i").replace("É","E")
        if(setKeyInBaseGenre.has(prenom1)){
          dicoCompt[baseGenre[prenom1]["02_genre"][0]]+=1
        } else if (setKeyGenreF.has(prenom2)){
          dicoCompt["f"]+=1
        } else if (setKeyGenreM.has(prenom2)){
          dicoCompt["m"]+=1
        }
    })
    let result = {"genre":"", "percent":0}
    if (dicoCompt["f"]>dicoCompt["m"]){
      result["genre"]="filles"
      result["percent"]=Math.floor(dicoCompt["f"]/(dicoCompt["f"]+dicoCompt["m"])*100)
    } else {
      result["genre"]="garçons"
      result["percent"]=Math.floor(dicoCompt["m"]/(dicoCompt["f"]+dicoCompt["m"])*100)
    }

    this.percentInterlocuteursGenre = result
    return result
  }


  /*Nombre de message par jour : Séparer en deux courbes, une messages reçus et une messages envoyés. L’utilisateur pourrait choisir la période à séparer par jour. Possibilité de dire “par mois”, “par année”,...*/
  calculNbrMessagePerPeriod(listFileDico : any){
    if (this.nbrMessagePerPeriod){
      return this.nbrMessagePerPeriod;
    }

    let listeNbrMessage = []
    this.listDate.forEach(function(elt){
      listeNbrMessage.push({"sent":0, "receive":0})
    })

    let userName=this.userName
    for (var f=0; f<listFileDico.length;f++){
      let file=listFileDico[f]
      let jsonContent=file["content"]

      jsonContent["messages"].reverse()
      let lMessages=jsonContent["messages"].slice() //Liste des messages du premier au dernier
      jsonContent["messages"].reverse()
      for (var k=0; k<jsonContent["messages"].length;k++){
        if (decodeURIComponent(escape(jsonContent["messages"][k]["sender_name"]))===userName){
          listeNbrMessage[this.listDate.indexOf(this.transformDate(new Date(jsonContent["messages"][k]["timestamp_ms"]),this.indicateur))]["sent"]+=1
        } else {
          listeNbrMessage[this.listDate.indexOf(this.transformDate(new Date(jsonContent["messages"][k]["timestamp_ms"]),this.indicateur))]["receive"]+=1
        }
      }
    };
    this.nbrMessagePerPeriod = [this.listDate, listeNbrMessage]
    return [this.listDate, listeNbrMessage]
  }

    calculStatsGlobalesMessages(listFileDico : any){
    if (this.statsGlobalesMessages){
      return this.statsGlobalesMessages;
    }

    let nbMessageTotalUserSent = 0;
    let nbMessageTotalUserReceived = 0;
    let nbCaracParMessage = 0

    let username = this.userName

    listFileDico.forEach(function(file){
        file["content"]["messages"].forEach(function(message){

          if (decodeURIComponent(escape(message["sender_name"])) == username && message["content"]){
              nbMessageTotalUserSent += 1;
              nbCaracParMessage+=decodeURIComponent(escape(message["content"])).length
          }
          else if (message["content"]) {
            nbMessageTotalUserReceived +=1;
          }

        })
    })

    let nbrPage = Math.floor(nbCaracParMessage/1375)
    let nbrKm = Math.floor(3*nbCaracParMessage/(1000*1000))
    //3mm pour 1 carac

    nbCaracParMessage=Math.floor(nbCaracParMessage/nbMessageTotalUserSent)
    this.statsGlobalesMessages = {"messagesSend": nbMessageTotalUserSent,"messagesReceived": nbMessageTotalUserReceived, "caracParMessage": nbCaracParMessage, "nbrKm": nbrKm, "nbrPage": nbrPage}
    return {"messagesSend": nbMessageTotalUserSent,"messagesReceived": nbMessageTotalUserReceived, "caracParMessage": nbCaracParMessage, "nbrKm": nbrKm, "nbrPage": nbrPage}
  }

  calculNbInterlocuteurs(listFileDico : any){
    if (this.nbInterlocuteurs){
      return this.nbInterlocuteurs;
    }

    let listInterloc = []

    listFileDico.forEach(function(file){
          file["content"]["participants"].forEach(function(participant){
              if(listInterloc.indexOf(decodeURIComponent(escape(participant["name"]))) === -1){
                  listInterloc.push(decodeURIComponent(escape(participant["name"])))
              }

          })
    })
    this.nbInterlocuteurs = listInterloc.length
        return listInterloc.length
  }

  calculNbReactionsUser(listFileDico : any){
    if (this.nbReactionsUser){
      return this.nbReactionsUser;
    }

      let listeReaction = [decodeURIComponent(escape('\u00f0\u009f\u0091\u008e')),decodeURIComponent(escape('\u00f0\u009f\u0091\u008d')),decodeURIComponent(escape('\u00f0\u009f\u0098\u00a0')),decodeURIComponent(escape('\u00f0\u009f\u0098\u00a2')),decodeURIComponent(escape('\u00f0\u009f\u0098\u00ae')),decodeURIComponent(escape('\u00f0\u009f\u0098\u0086')),decodeURIComponent(escape('\u00f0\u009f\u0098\u008d'))]// Ordre des réactions : No / Yes / Grr / Pleure / Ouah / Ahah / Coeur

      let ReceivedReactionsDico={}
      let SentReactionsDico={}
      let username = this.userName

      for(let k=0;k<listeReaction.length;k++){
        ReceivedReactionsDico[listeReaction[k]]=0;
        SentReactionsDico[listeReaction[k]]=0;
      }

    listFileDico.forEach(function(file){
        file["content"]["messages"].forEach(function(message){
           if (Object.keys(message).indexOf("reactions")>-1){

              if (decodeURIComponent(escape(message["sender_name"])) === username){
                   message["reactions"].forEach(function(reaction){
                   ReceivedReactionsDico[decodeURIComponent(escape(reaction["reaction"]))]+=1
                   })
              }

               message["reactions"].forEach(function(reaction){
                   if (decodeURIComponent(escape(reaction["actor"])) === username){
                      SentReactionsDico[decodeURIComponent(escape(reaction["reaction"]))]+=1
                   }
               })              
           }
        })})

    let listeSentDataReaction = []
    let listeReceivedDataReaction = []
    listeReaction.forEach(function(reac){
        listeSentDataReaction.push(SentReactionsDico[reac])
        listeReceivedDataReaction.push(ReceivedReactionsDico[reac])
      })

    let totalReactions = {"labels" : listeReaction, "dataSent" : listeSentDataReaction, "dataReceived" : listeReceivedDataReaction}
    this.nbReactionsUser = totalReactions
    return totalReactions

  }

  calculBestFriend(listFileDico : any){
    if (this.bestFriend){
      return this.bestFriend
    }
    let bestFriend = {"nbrText":0, "name":0}
    listFileDico.forEach(function(file){
      if (!file["isConvGroup"]){
        if (file["content"]["messages"].length>bestFriend["nbrText"]){
          bestFriend["nbrText"]=file["content"]["messages"].length
          bestFriend["name"]=file["name"]
        }
      }
    });
    this.bestFriend = bestFriend
    return bestFriend
  }

  calculNbCaracParMessUser(listFileDico : any){
    if (this.nbCaracParMessUser){
      return this.nbCaracParMessUser;
    }

      let sommeCarac = 0;
      let sommeMess = 0;
      let username = this.userName;

    listFileDico.forEach(function(file){
        file["content"]["messages"].forEach(function(message){
            if(decodeURIComponent(escape(message["sender_name"])) === username){
              sommeMess += 1;
              sommeCarac += decodeURIComponent(escape(message["content"])).length
            }
        })})
      
      this.nbCaracParMessUser = Math.round(sommeCarac / sommeMess)
      return Math.round(sommeCarac / sommeMess)
  }

  calculNbConvFirstMessSent(listFileDico : any){
    if (this.nbConvFirstMessSent){
      return this.nbConvFirstMessSent;
    }

    let nbConv = 0;
    let nbFirst = 0;
    let username = this.userName

    listFileDico.forEach(function(file){
       if(decodeURIComponent(escape(file["content"]["messages"][0]["sender_name"])) === username){
         nbFirst += 1;
    }
        nbConv += 1;
    })
      this.nbConvFirstMessSent = Math.round((nbFirst / nbConv)*100) 
      return Math.round((nbFirst / nbConv)*100) 
      //en pourcentage
  };

  calculPodiumConvLesPlusActives(listFileDico : any){
    if (this.podiumConvLesPlusActives){
      return this.podiumConvLesPlusActives;
    }

    let listFileDicoSimple = []
    let listFileDicoGroup = []

    listFileDico.forEach(function(file){
            if(file["content"]["participants"].length === 2){
                listFileDicoSimple.push(file)
            }
            else{
              listFileDicoGroup.push(file)
            }
    })

    if (listFileDicoSimple.length < 4 || listFileDicoGroup.length < 2){
      return "erreur de taille l'ami"
    }

    let indexMaxMess = [0,1,2];
    let minIndexMaxMess = 0;
    let minIndexMaxMessGroup = 0;
    var j;
    var p;

    for(j=3;j<listFileDicoSimple.length;j++){

        //Pour l'index des maximum de somme de réactions
        let k =0;
        for(k=0;k<3;k++){
          if(listFileDicoSimple[indexMaxMess[k]]["content"]["messages"].length<listFileDicoSimple[indexMaxMess[minIndexMaxMess]]["content"]["messages"].length){
            minIndexMaxMess = k;
          }
        }
          if(listFileDicoSimple[j]["content"]["messages"].length>listFileDicoSimple[indexMaxMess[minIndexMaxMess]]["content"]["messages"].length){
            indexMaxMess[minIndexMaxMess]=j;
        }

      }
    
    for(p=1;p<listFileDicoGroup.length;p++){

          if(listFileDicoGroup[p]["content"]["messages"].length>listFileDicoGroup[minIndexMaxMessGroup]["content"]["messages"].length){
            minIndexMaxMessGroup=p;
        }

      }
    
    var nomsConvDuo = []
    var dataDuo = {}
    var username = this.userName

    indexMaxMess.forEach(function(index){
        listFileDicoSimple[index]["content"]["participants"].forEach(function(participant){
            if(participant["name"] != username){
                nomsConvDuo.push(participant["name"])
                dataDuo[participant["name"]] = listFileDicoSimple[index]["content"]["messages"].length
            }
        })

    })

    var dicoRetour = {"labelConvDuo" : nomsConvDuo, "dicoDataDuo" : dataDuo, "labelConvGroup": listFileDicoGroup[minIndexMaxMessGroup]["content"]["title"], "dataGroup" : listFileDicoGroup[minIndexMaxMessGroup]["content"]["messages"].length}

    this.podiumConvLesPlusActives = dicoRetour
    return dicoRetour
  }

  calculFirstConvUser(listFileDico :any){
    if (this.firstConvUser){
      return this.firstConvUser;
    }

    var username = this.userName
    var p;
    var timestampDuPlusVieux =  listFileDico[0]["content"]["messages"][listFileDico[0]["content"]["messages"].length-1]["timestamp_ms"]
    var indexDuPlusVieux = 0

    for(p=1;p<listFileDico.length;p++){

          if(listFileDico[p]["content"]["messages"][listFileDico[p]["content"]["messages"].length-1]["timestamp_ms"]<listFileDico[indexDuPlusVieux]["content"]["messages"][listFileDico[indexDuPlusVieux]["content"]["messages"].length-1]["timestamp_ms"]){
            indexDuPlusVieux=p;
        }
    }

    var listParticipant = []
    listFileDico[indexDuPlusVieux]["content"]["participants"].forEach(function(participant){
      if(decodeURIComponent(escape(participant["name"])) != username){
      listParticipant.push(decodeURIComponent(escape(participant["name"])))
    }})

    var dateMess = new Date(listFileDico[indexDuPlusVieux]["content"]["messages"][listFileDico[indexDuPlusVieux]["content"]["messages"].length-1]["timestamp_ms"])
    this.firstConvUser = {"participants": listParticipant, "date" : dateMess.toLocaleDateString()}
    return {"participants": listParticipant, "date" : dateMess.toLocaleDateString()}
  }

  calculIndicateursFlammeFreezeStrike(listFileDico :any){ // Aie aie la complexité
    if (this.indicateursFlammeFreezeStrike){
      return this.indicateursFlammeFreezeStrike;
    }

    var username = this.userName;
    var indexMaxFlamme = 0;
    var indexMaxFreez = 0;
    var indexMaxStreak = 0;
    var k;

    for(k=1;k<listFileDico.length;k++){

          let contentCurrent = listFileDico[k]["currentStreak"]

          if(listFileDico[k]["maxStreak"]>listFileDico[indexMaxStreak]["maxStreak"]){
            indexMaxStreak=k;
        }
          if(contentCurrent>listFileDico[indexMaxFlamme]["currentStreak"]){
            indexMaxFlamme=k;
        }
          if(listFileDico[k]["maxFreeze"]>listFileDico[indexMaxFreez]["maxFreeze"]){
            indexMaxFreez=k;
        }
        
        }

    var maxFlamme = listFileDico[indexMaxFlamme]["currentStreak"]
    var nomConvFlamme = decodeURIComponent(escape(listFileDico[indexMaxFlamme]["content"]["title"]))

    var maxStrike = listFileDico[indexMaxStreak]["maxStreak"]
    var nomConvStrike = decodeURIComponent(escape(listFileDico[indexMaxStreak]["content"]["title"]))

    var maxFreeze = listFileDico[indexMaxFreez]["maxFreeze"]
    var nomConvFreeze = decodeURIComponent(escape(listFileDico[indexMaxFreez]["content"]["title"]))
    this.indicateursFlammeFreezeStrike = {"nomConvFlamme" : nomConvFlamme, "nomConvFreeze" : nomConvFreeze, "nomConvStrike" : nomConvStrike, "dicoData" : {"maxFlamme" : maxFlamme, "maxFreeze" : maxFreeze, "maxStrike" : maxStrike}}
    return {"nomConvFlamme" : nomConvFlamme, "nomConvFreeze" : nomConvFreeze, "nomConvStrike" : nomConvStrike, "dicoData" : {"maxFlamme" : maxFlamme, "maxFreeze" : maxFreeze, "maxStrike" : maxStrike}}
  }

  calculDicoSortBubbleConv(listFileDico : any){
    if (this.dicoSortBubbleConv){
      return this.dicoSortBubbleConv;
    }
    //Retour sous format dico[tri]={labels : [...], data : [...], files: [...]}
    //On peut trier par : nbrMessage, nbrPersonnes, maxStreak
    var dicoSortBubbleConv = {}
    var copieListFileDico = listFileDico.slice()

    //nbrMessage
    copieListFileDico.sort(function(first,second) {
      return second["nbrMessage"] - first["nbrMessage"];
    });
    var maxOfCriteria = copieListFileDico[0]["nbrMessage"]
    var listName = []
    var listData = []
    var listFiles = []
    for (var k=0;k<4;k++){
      listName.push(copieListFileDico[k]["name"])
      listData.push(copieListFileDico[k]["nbrMessage"])
      /*var newData={}
      newData["r"]=copieListFileDico[k]["nbrMessage"]/maxOfCriteria*50
      newData["x"]=k*2+2
      newData["y"]=0
      listData.push(newData)*/
      listFiles.push(copieListFileDico[k])
    }
    dicoSortBubbleConv["nbrMessage"]={"labels": listName, "data": listData, "files": listFiles}

    //nbrParticipant
    copieListFileDico.sort(function(first,second) {
      return second["nbrParticipant"] - first["nbrParticipant"];
    });
    var maxOfCriteria = copieListFileDico[0]["nbrParticipant"]
    var listName = []
    var listData = []
    var listFiles = []
    for (var k=0;k<4;k++){
      listName.push(copieListFileDico[k]["name"])
      listData.push(copieListFileDico[k]["nbrParticipant"])
      /*var newData={}
      newData["r"]=copieListFileDico[k]["nbrParticipant"]/maxOfCriteria*50
      newData["x"]=k*2+2
      newData["y"]=0
      listData.push(newData)*/
      listFiles.push(copieListFileDico[k])
    }
    dicoSortBubbleConv["nbrParticipant"]={"labels": listName, "data": listData, "files": listFiles}

    //maxStreak
    copieListFileDico.sort(function(first,second) {
      return second["maxStreak"] - first["maxStreak"];
    });
    var maxOfCriteria = copieListFileDico[0]["maxStreak"]
    var listName = []
    var listData = []
    var listFiles = []
    for (var k=0;k<4;k++){
      listName.push(copieListFileDico[k]["name"])
      listData.push(copieListFileDico[k]["maxStreak"])
      /*var newData={}
      newData["r"]=copieListFileDico[k]["maxStreak"]/maxOfCriteria*50
      newData["x"]=k*2+2
      newData["y"]=0
      listData.push(newData)*/
      listFiles.push(copieListFileDico[k])
    }
    dicoSortBubbleConv["maxStreak"]={"labels": listName, "data": listData, "files": listFiles}

    this.dicoSortBubbleConv = dicoSortBubbleConv
    return dicoSortBubbleConv
  }

  calculNbrConvActivePerPeriod(listFileDico : any){
    if (this.nbrConvActivePerPeriod){
      return this.nbrConvActivePerPeriod;
    }
    //Partie propre à la fonction en elle même

    let listeNbrConvActive = []
    this.listDate.forEach(function(elt){
      listeNbrConvActive.push(0)
    })

    for (var f=0; f<listFileDico.length; f++){
      let file=listFileDico[f]
      let oneConvDicoActivite=[]
      this.listDate.forEach(function(elt){
        oneConvDicoActivite.push(0)
      })

      let jsonContent=file["content"]

      jsonContent["messages"].reverse()
      let lMessages=jsonContent["messages"].slice() //Liste des messages du premier au dernier
      jsonContent["messages"].reverse()
      for (var k=0; k<jsonContent["messages"].length;k++){
        oneConvDicoActivite[this.listDate.indexOf(this.transformDate(new Date(jsonContent["messages"][k]["timestamp_ms"]),this.indicateur))]+=1
      }
      for(var k=0; k<this.listDate.length;k++){
        listeNbrConvActive[k]+=Math.min(1,oneConvDicoActivite[k])
      }
    };
    this.nbrConvActivePerPeriod = [this.listDate, listeNbrConvActive]
    return [this.listDate, listeNbrConvActive]
  }

  calculNbrCorrespondantPerPeriod(listFileDico : any){
    if (this.nbrCorrespondantPerPeriod){
      return this.nbrCorrespondantPerPeriod;
    }

    let listeCorrespondant = []
    this.listDate.forEach(function(elt){
      listeCorrespondant.push(new Set())
    })

    for (var f=0; f<listFileDico.length; f++){
      let file=listFileDico[f]
      if (!file["isConvGroup"]){
        let jsonContent=file["content"]
        let lUser=[]
        jsonContent["participants"].forEach(function(participant){
          lUser.push(decodeURIComponent(escape(participant["name"])))
        })

        jsonContent["messages"].reverse()
        let lMessages=jsonContent["messages"].slice() //Liste des messages du premier au dernier
        jsonContent["messages"].reverse()
        for (var k=0; k<jsonContent["messages"].length;k++){
          for (var i=0; i<lUser.length;i++){
            let nameUser = lUser[i]
            listeCorrespondant[this.listDate.indexOf(this.transformDate(new Date(jsonContent["messages"][k]["timestamp_ms"]),this.indicateur))].add(nameUser)
          }
        }
      }
    };
    let listeNbrMPerPeriod=[]
    let listeNbrFPerPeriod=[]
    let listeNbrIPerPeriod=[]
    //let setNonTrouves= new Set()
    //let setTrouves=new Set()

    let setKeyInBaseGenre = new Set(Object.keys(baseGenre))
    let setKeyGenreF= new Set(baseGenre2["f"])
    let setKeyGenreM= new Set(baseGenre2["m"])
    for (var k=0; k<listeCorrespondant.length;k++){
      let setUser=listeCorrespondant[k]
      let dicoCompt={"f":0,"m":0, "i":0}
      setUser.forEach(function(oneUser){
        let prenom1 = oneUser.split(" ")[0].toLowerCase()
        let prenom2 = oneUser.split(" ")[0].replace("é","e").replace("è","e").replace("ê","e").replace("ë","e").replace("ï","i").replace("î","i").replace("É","E")
        if(setKeyInBaseGenre.has(prenom1)){
          dicoCompt[baseGenre[prenom1]["02_genre"][0]]+=1
        } else if (setKeyGenreF.has(prenom2)){
          dicoCompt["f"]+=1
        } else if (setKeyGenreM.has(prenom2)){
          dicoCompt["m"]+=1
        } else {
          dicoCompt["i"]+=1
        }
      })
      listeNbrMPerPeriod.push(dicoCompt["m"])
      listeNbrFPerPeriod.push(dicoCompt["f"])
      listeNbrIPerPeriod.push(dicoCompt["i"])
    }
    ////console.log(setTrouves.size/(setNonTrouves.size+setTrouves.size)+"% trouvé")
    ////console.log(setNonTrouves)
    ////console.log({"label":[listDate],"data":{"m":listeNbrMPerPeriod,"f":listeNbrFPerPeriod,"i":listeNbrIPerPeriod}})
    this.nbrCorrespondantPerPeriod = {"label":this.listDate,"data":{"m":listeNbrMPerPeriod,"f":listeNbrFPerPeriod,"i":listeNbrIPerPeriod}}
    return {"label":this.listDate,"data":{"m":listeNbrMPerPeriod,"f":listeNbrFPerPeriod,"i":listeNbrIPerPeriod}}
  }

  calculBestCorrespondantPerPeriod(listFileDico : any){
    if (this.bestCorrespondantPerPeriod){
      return this.bestCorrespondantPerPeriod;
    }

    let bestCorrespondant = []
    this.listDate.forEach(function(elt){
      bestCorrespondant.push({"name":"", "nbrMessages":0})
    })

    for (var f=0; f<listFileDico.length; f++){
      let file=listFileDico[f]
      if (!file["isConvGroup"]){
        let jsonContent=file["content"]
        let nbrMessagesThisPeriod=[]
        for (var k =0;k<this.listDate.length;k++){
          nbrMessagesThisPeriod.push(0)
        }
        jsonContent["messages"].reverse()
        let lMessages=jsonContent["messages"].slice() //Liste des messages du premier au dernier
        jsonContent["messages"].reverse()
        for (var k=0; k<jsonContent["messages"].length;k++){
          if(jsonContent["messages"][k]["content"]){
          nbrMessagesThisPeriod[this.listDate.indexOf(this.transformDate(new Date(jsonContent["messages"][k]["timestamp_ms"]),this.indicateur))]+= jsonContent["messages"][k]["content"].length // Modif wolf
          }
        }

        let name = file["name"]
        for (var k=0; k<bestCorrespondant.length;k++){
          if (nbrMessagesThisPeriod[k]>bestCorrespondant[k]["nbrMessages"]){
            bestCorrespondant[k]={"name":name, "nbrMessages":nbrMessagesThisPeriod[k]}
          }
        }
      }
    };


    let listeNamesPerPeriod=[]
    let listeNbrMessagesPerPeriod=[]
    let listeGenderColorPerPeriod=[]

    for (var k=0; k<bestCorrespondant.length;k++){
      let genderColor
        let prenom1 = bestCorrespondant[k]["name"].split(" ")[0].toLowerCase()
        let prenom2 = bestCorrespondant[k]["name"].split(" ")[0].replace("é","e").replace("è","e").replace("ê","e").replace("ë","e").replace("ï","i").replace("î","i").replace("É","E")
        if(Object.keys(baseGenre).indexOf(prenom1)!=-1){
          let gender = baseGenre[prenom1]["02_genre"]
          if (gender==="f"){
            genderColor = this.pinkColor;
          } else if (gender==="m"){
            genderColor = this.blueColor;
          } else {
            genderColor = this.indeterminedColor;
          }
        } else if (baseGenre2["f"].indexOf(prenom2)!=-1){
          genderColor = this.pinkColor;
        } else if (baseGenre2["m"].indexOf(prenom2)!=-1){
          genderColor = this.blueColor;
        } else {
          genderColor = this.indeterminedColor;
        }
      listeNamesPerPeriod.push(bestCorrespondant[k]["name"])
      listeNbrMessagesPerPeriod.push(bestCorrespondant[k]["nbrMessages"])
      listeGenderColorPerPeriod.push(genderColor)
      }

    ////console.log(setTrouves.size/(setNonTrouves.size+setTrouves.size)+"% trouvé")
    ////console.log(setNonTrouves)
    ////console.log({"label":[listDate],"data":{"m":listeNbrMPerPeriod,"f":listeNbrFPerPeriod,"i":listeNbrIPerPeriod}})
    this.bestCorrespondantPerPeriod = {"labels":this.listDate,"data":{"names":listeNamesPerPeriod,"nbrMessages":listeNbrMessagesPerPeriod,"gendersColor":listeGenderColorPerPeriod}}
    return {"labels":this.listDate,"data":{"names":listeNamesPerPeriod,"nbrMessages":listeNbrMessagesPerPeriod,"gendersColor":listeGenderColorPerPeriod}}
  };


  calculSuggestBestContact(listFileDico : any){
    if (this.suggestBestContact){
      return this.suggestBestContact
    }
    
    let maxNbrMessages = 0;
    let maxLastTime = 0;
    listFileDico.forEach(function(file){
      maxNbrMessages=Math.max(maxNbrMessages, file["nbrMessage"])
      maxLastTime=Math.min(maxLastTime, file["content"]["messages"][0]["timestamp_ms"])
    })

    let maxWeight=0
    let lastMessageTs = 0
    for(var k=0;k<listFileDico.length;k++){
      lastMessageTs=Math.max(lastMessageTs,listFileDico[k]["content"]["messages"][0]["timestamp_ms"])
    }
    let fileMaxWeight
    listFileDico.forEach(function(file){
      if (!file["isConvGroup"]){
        let weightFile = ((file["nbrMessage"]/maxNbrMessages)**2)*(lastMessageTs-file["content"]["messages"][0]["timestamp_ms"])/(lastMessageTs-maxLastTime)
        if (weightFile>maxWeight){
          maxWeight=weightFile
          fileMaxWeight=file;
        }
      }
    });
    
    this.suggestBestContact = [fileMaxWeight, new Date(fileMaxWeight["content"]["messages"][0]["timestamp_ms"])];
    return [fileMaxWeight, new Date(fileMaxWeight["content"]["messages"][0]["timestamp_ms"])]
  }
  

  calculRandomContact(listFileDico : any){ 
    let numberConv = Math.floor(Math.random() * Math.floor(listFileDico.length));
    //On random jusqu'à trouver un conv 1by1
    while(listFileDico[numberConv]['isGroup']){
      numberConv = Math.floor(Math.random() * Math.floor(listFileDico.length));
    }
    this.suggestRandomContact = listFileDico[numberConv]['name'];
    return(listFileDico[numberConv]['name'])
  }

  calculRandomMessage(listFileDico:any){
    let numberConv = Math.floor(Math.random() * Math.floor(listFileDico.length)-1);
    let message='';
    let user = this.userName
    let messageListe = [];
    var k;
    k=0;
    while(message==='' && k<10){
      k=k+1;
      while(listFileDico[numberConv]["content"]["participants"].length>2){
      numberConv = Math.floor(Math.random() * Math.floor(listFileDico.length)-1);
      }
      let numberMessage = Math.floor(Math.random() * Math.floor(listFileDico[numberConv]["content"]["messages"].length-1));
      let messageListe = [];
      var i;
      for(i=numberMessage;i<listFileDico[numberConv]["content"]["messages"].length;i++){
        if(listFileDico[numberConv]["content"]["messages"][i]['content']!=undefined){
          let constMessage = decodeURIComponent(escape(listFileDico[numberConv]["content"]["messages"][i]['content']));
          if(listFileDico[numberConv]["content"]["messages"][i]["sender_name"]==user && numberMessage !=0 && constMessage.length>5 && constMessage.slice(0, 5)!='Dites' && Math.abs(listFileDico[numberConv]["content"]["messages"][i]["timestamp_ms"]-listFileDico[numberConv]["content"]["messages"][i-1]["timestamp_ms"])>3600000){
            return([decodeURIComponent(escape(listFileDico[numberConv]["content"]["messages"][i]["content"])),'Message que vous avez envoyé à '+decodeURIComponent(escape(listFileDico[numberConv]["content"]["title"]))]);
          }
        }
      }
    }
    var w;
    for(w=0;w<listFileDico[numberConv]["content"]["messages"].length;w++){
      if(listFileDico[numberConv]["content"]["messages"][w]["content"]!=undefined && decodeURIComponent(escape(listFileDico[numberConv]["content"]["messages"][w]["sender_name"]))==user  && decodeURIComponent(escape(listFileDico[numberConv]["content"]["messages"][w]["content"])).slice(0, 5)!='Dites'  ){
        return([decodeURIComponent(escape(listFileDico[numberConv]["content"]["messages"][w]["content"])),'Message que vous avez envoyé à '+decodeURIComponent(escape(listFileDico[numberConv]["content"]["title"]))])
      }
    }
    return(['Hey tu vas bien ?','Message généré aléatoirement'])
  }


//Faire le message de l'user qui a reçu le plus de réactions sur les conv de groupe
  calculLongestMessage(listFileDico : any){
    if (this.longestMessage){
      return this.longestMessage
    }
    let longestMessageSendPerConv = [];
    let longestMessageReceivePerConv = [];
    let user = this.userName
    listFileDico.forEach(function(file){
      if(!file["isConvGroup"]){
        let longestMessageSend = ["Vous n'avez pas envoyé de message",-1,'date',file["name"]]; //On mettre en premier élement le message, en second sa longueur, troisième la date , 4ème le nom
        let longestMessageReceive = ["Vous n'avez pas reçu de message",-1,'date',file["name"]]; //On mettre en premier élement le message, en second sa longueur, troisième la date , 4ème le nom
        file["content"]["messages"].forEach(function(message){
          if(decodeURIComponent(escape(message["sender_name"])) == user && decodeURIComponent(escape(message["content"])).length > longestMessageSend[1]){
            longestMessageSend[0] = decodeURIComponent(escape(message["content"]));
            longestMessageSend[1] = decodeURIComponent(escape(message["content"])).length;
            longestMessageSend[2] = new Date(message["timestamp_ms"]);
          }
          else if(decodeURIComponent(escape(message["content"])).length > longestMessageReceive[1]){
            longestMessageReceive[0] = decodeURIComponent(escape(message["content"]));
            longestMessageReceive[1] = decodeURIComponent(escape(message["content"])).length;
            longestMessageReceive[2] = new Date(message["timestamp_ms"]);
          }
        });
        longestMessageSendPerConv.push(longestMessageSend);
        longestMessageReceivePerConv.push(longestMessageReceive);
      }   
    });

    let indexMaxSend = 0;
    let indexMaxReceive = 0;
    var k;
    for(k=1;k<longestMessageSendPerConv.length;k++){
      if(longestMessageSendPerConv[k][1]>longestMessageSendPerConv[indexMaxSend][1]){
        indexMaxSend = k;
      }
      if(longestMessageReceivePerConv[k][1]>longestMessageReceivePerConv[indexMaxReceive][1]){
        indexMaxReceive = k;
      }
    };
    this.longestMessage = [longestMessageSendPerConv[indexMaxSend],longestMessageReceivePerConv[indexMaxReceive]];
    return([longestMessageSendPerConv[indexMaxSend],longestMessageReceivePerConv[indexMaxReceive]])
  }

  calculBestReactionMessage(listFileDico : any){
    if (this.bestReactionsMessage){
      return this.bestReactionsMessage
    }
    let bestReactionMessagePerConv = [];
    let user = this.userName
    //On va uniquement chercher dans les conversations de groupe
    listFileDico.forEach(function(file){
      if(file["isConvGroup"]){
        let bestReactionMessage = {'message':"Vous n'avez pas reçu de réaction sur vos messages",'numberReactions':-1 ,'name':file['name'],'typeReaction':[ [decodeURIComponent(escape('\u00f0\u009f\u0091\u008e')),0],[decodeURIComponent(escape('\u00f0\u009f\u0091\u008d')),0],[decodeURIComponent(escape('\u00f0\u009f\u0098\u00a0')),0],[decodeURIComponent(escape('\u00f0\u009f\u0098\u00a2')),0],[decodeURIComponent(escape('\u00f0\u009f\u0098\u00ae')),0],[decodeURIComponent(escape('\u00f0\u009f\u0098\u0086')),0],[decodeURIComponent(escape('\u00f0\u009f\u0098\u008d')),0] ]}; 
        let typeReac = [0,0,0,0,0,0,0]
        file["content"]["messages"].forEach(function(message){
          
          if(decodeURIComponent(escape(message["sender_name"]))==user && message['reactions']!=undefined && message['reactions'].length>bestReactionMessage['numberReactions'] && message['content']!=undefined){
            var w;
            for(w=0;w<7;w++){
              bestReactionMessage['typeReaction'][w][1]=0;
              typeReac[w]=0;
            };
            bestReactionMessage['message']=message['content'];
            bestReactionMessage['numberReactions']=message['reactions'].length;
            bestReactionMessage['date']= new Date(message["timestamp_ms"]);

            // Ordre des réactions : No / Yes / Grr / Pleure / Ouah / Ahah / Coeur
            let positionReaction = {'\u00f0\u009f\u0091\u008e':0,'\u00f0\u009f\u0091\u008d':1,'\u00f0\u009f\u0098\u00a0':2,'\u00f0\u009f\u0098\u00a2':3,'\u00f0\u009f\u0098\u00ae':4,'\u00f0\u009f\u0098\u0086':5,'\u00f0\u009f\u0098\u008d':6};// Ordre des réactions : No / Yes / Grr / Pleure / Ouah / Ahah / Coeur
             //Permet de savoir où se situe la réaction dans 'typeReaction'
            message['reactions'].forEach(function(reaction){
              let index = positionReaction[reaction['reaction']];
              typeReac[index]+=1
            });
            let fullType=[];
            Object.keys(positionReaction).forEach(function(reac){
              fullType.push([decodeURIComponent(escape(reac)),typeReac[positionReaction[reac]]]);
            })
            bestReactionMessage['typeReaction']=fullType 
          }
        }); 
        bestReactionMessagePerConv.push(bestReactionMessage);
    }
  });
  
  
  
  if (bestReactionMessagePerConv ===[]){
    this.bestReactionsMessage = ({'name':'Aucune conversation de groupe','numberReactions':'Aucune','date':'Aucune','message':'Ceci est un message vide, bien tenté'})
    return({'name':'Aucune conversation de groupe','numberReactions':'Aucune','date':'Aucune','message':'Ceci est un message vide, bien tenté'});
  }
  else {
    let indexMaxReaction = 0;
    var k;
    for(k=1;k<bestReactionMessagePerConv.length;k++){
      if(bestReactionMessagePerConv[k]['numberReactions']>bestReactionMessagePerConv[indexMaxReaction]['numberReactions']){
        indexMaxReaction = k;
      }
    }
    console.log(bestReactionMessagePerConv[indexMaxReaction])
    if (bestReactionMessagePerConv[indexMaxReaction]['message']!="Vous n'avez pas reçu de réaction sur vos messages"){
      bestReactionMessagePerConv[indexMaxReaction]['message']= decodeURIComponent(escape(bestReactionMessagePerConv[indexMaxReaction]['message']));
    }
    this.bestReactionsMessage = bestReactionMessagePerConv[indexMaxReaction];
    return bestReactionMessagePerConv[indexMaxReaction]

  }
}

  calculNbMaxMessPer24(listFileDico : any){
    if (this.nbMaxMessPer24){
      return this.nbMaxMessPer24
    }

    let dicoDays = {}
    let username = this.userName
    let maxSent = 0
    let maxReceived = 0
    let sentDate = ""
    let receivedDate = ""

    listFileDico.forEach(function(file){
      file["content"]["messages"].forEach(function(message){
        let date = new Date(message["timestamp_ms"])
        if(decodeURIComponent(escape(message["sender_name"])) == username){
          if(dicoDays[date.toDateString()+" sent"] != undefined){
            dicoDays[date.toDateString()+" sent"] += 1
          }
          else{
            dicoDays[date.toDateString()+" sent"] = 0
          }
        }
        else{
          if(dicoDays[date.toDateString()+" received"] != undefined){
            dicoDays[date.toDateString()+" received"] += 1
          }
          else{
            dicoDays[date.toDateString()+" received"] = 0
          }
        }
      })
    })

    Object.keys(dicoDays).forEach(function(date){
      if(date.split(' ')[4] == "sent"){
        if(dicoDays[date] > maxSent){
          maxSent = dicoDays[date]
          sentDate = date
        }
      }
      else if(date.split(' ')[4] == "received"){
        if(dicoDays[date] > maxReceived){
          maxReceived = dicoDays[date]
          receivedDate = date
        }
      }
    })

    sentDate = sentDate.slice(0,15)
    receivedDate = receivedDate.slice(0,15)

    this.nbMaxMessPer24={"nbSent" : maxSent, "dateSent" : sentDate, "nbReceived" : maxReceived, "dateReceived" : receivedDate}
    return {"nbSent" : maxSent, "dateSent" : sentDate, "nbReceived" : maxReceived, "dateReceived" : receivedDate}
  }

  calculTimeOnMessenger(listFileDico : any){
    if (this.timeOnMessenger){
      return this.timeOnMessenger
    }

    let nbrCaracRead = 0
    let nbrCaracWrite = 0
    let user = this.userName
    listFileDico.forEach(function(file){
      let lMessage = file["content"]["messages"]
      for (var k=0; k<lMessage.length;k++){
        let message=lMessage[k]
        if (message["content"]){
          if (decodeURIComponent(escape(message["sender_name"]))===user){
            nbrCaracWrite+=message["content"].length
          } else {
            nbrCaracRead+=message["content"].length
          }
        }  
      }
    })

    let timeRead = (nbrCaracRead/(175*5))*60
    let timeWrite = (nbrCaracRead/(60*5))*60
    let timeTotal = (timeRead+timeWrite)*1.3


    var j = Math.floor(timeTotal / 86400);
    var h = Math.floor(timeTotal % 86400 / 3600);
    var m = Math.floor(timeTotal % 86400 % 3600 / 60);
    var s = Math.floor(timeTotal % 86400 % 3600 % 60);
        
    var jDisplay = j > 0 ? j + (j == 1 ? " jour, " : " jours, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " heure" : " heures") : "";

    this.timeOnMessenger=jDisplay + hDisplay
    return jDisplay + hDisplay
  }
  
  calculNbrSmileyEnvoye(listFileDico : any){
    if (this.nbrSmileyEnvoye){
      return this.nbrSmileyEnvoye
    }

    let nbrSmiley = {'tous':0, 'coeur':0}
    let username = this.userName
    listFileDico.forEach(function(file){
      let lMessage=file["content"]["messages"]
      for(var k=0;k<lMessage.length;k++){
        let message=lMessage[k]
        if(decodeURIComponent(escape(message["sender_name"])) == username && message["content"]){
  
          let txt = decodeURIComponent(escape(message["content"]))
          let regexTotal = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g // Peut être amélioré
          let regexCoeur = /💚|💛|🧡|💜|🖤|💝|💞|💟|❣|💙|💗|💖|💕|💓|❤|<3/g
          let foundTotal = txt.match(regexTotal)
          let foundCoeur = txt.match(regexCoeur)
          if(foundTotal){
            nbrSmiley['tous'] += foundTotal.length
          }
          if(foundCoeur){
            nbrSmiley['coeur'] += foundCoeur.length
          }
        }
      }
    })
    this.nbrSmileyEnvoye = nbrSmiley
    return nbrSmiley
  }
}