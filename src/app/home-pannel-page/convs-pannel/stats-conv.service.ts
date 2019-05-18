import { Injectable } from '@angular/core';


@Injectable()
export class StatsConvService {
  userName:any;
  lastMessageUploadTimestamp:any;
  constructor() { }

  //********************************************************************//
  //*********************//STATS POUR PREVISU//*************************//
  //********************************************************************//

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
  }

  findLastMessageUploadTimestamp(listFileDico : any){
    if (this.lastMessageUploadTimestamp){
      return this.lastMessageUploadTimestamp;
    }
    let lastMessageTs = 0
    for(var k=0;k<listFileDico.length;k++){
      lastMessageTs=Math.max(lastMessageTs,listFileDico[k]["content"]["messages"][0]["timestamp_ms"])
    }
    this.lastMessageUploadTimestamp=lastMessageTs
    return lastMessageTs
  }

  findName(jsonContent : any){
    let name = decodeURIComponent(escape(jsonContent["title"]))
    return name
  }
  calculNbrMessage(jsonContent : any){
    let nbrMessage=jsonContent["messages"].length
    return nbrMessage
  }

  calculCurrentStreak(jsonContent : any){
    let currentDateTimeStamp = this.lastMessageUploadTimestamp

    //console.log(currentDateTimeStamp);
    const numberMillisecondsInOneDay=1000*60*60*24;
    //console.log(numberMillisecondsInOneDay)
    //On prend le tableau des messages
    let reverseMessagesTab = jsonContent["messages"]
    let timeStampBreakMessage = NaN;
    let nombreDeJour = 0;
    //On test le cas du dernier message
    if (currentDateTimeStamp-reverseMessagesTab[0]["timestamp_ms"]<=numberMillisecondsInOneDay){
      for(var i= 0; i < reverseMessagesTab.length-1; i++)
          {
              // Si il s'est passé 24h sans messages
              if (reverseMessagesTab[i]["timestamp_ms"]-reverseMessagesTab[i+1]["timestamp_ms"]>numberMillisecondsInOneDay){
                //console.log("Break au "+i+"e message")
                timeStampBreakMessage=reverseMessagesTab[i]["timestamp_ms"] //On prend le temps du dernier message de la série
                i=reverseMessagesTab.length //Dans ce cas on sort de la boucle
              }
          }
          //Si on est au bout de la conv et qu'on a eu aucun trou de 24h
          if (i===reverseMessagesTab.length-1){
            //console.log("Full streak !")
            timeStampBreakMessage=reverseMessagesTab[reverseMessagesTab.length-1]["timestamp_ms"]
          }
      nombreDeJour = (currentDateTimeStamp-timeStampBreakMessage)/numberMillisecondsInOneDay;
    } else{
      //console.log("Le dernier message date d'il y a plus de 24h")
    }
    return Math.trunc(nombreDeJour)
  }
  
  // CALCUL LE NBR DE J MAX PENDANT LESQUELS IL Y A EU AU MOINS UN MESSAGE D'ENVOYE
  calculMaxStreak(jsonContent : any, actualStreak : any, tsLastMessage){
    let currentDateTimeStamp = tsLastMessage

    const numberMillisecondsInOneDay=1000*60*60*24;

    //On prend le tableau des messages revert
    jsonContent["messages"].reverse()
    let messagesTab = Object.assign([], jsonContent["messages"]);
    jsonContent["messages"].reverse()
    let timeStampBreakMessage = NaN;
    let nombreDeJour = 0;

    //On part du début et on cherche quand on trouve un trou de 24h
    //timeStampStart est le début de la periode entre deux trous
    //timeStampEnd est la fin de la periode entre deux trous
    let timeStampStart = messagesTab[0]["timestamp_ms"]
    let maxTimeStampStart
    let timeStampEnd = NaN
    let maxTimeStampEnd
    let maxStreak= actualStreak
    for(var i= 0; i < messagesTab.length-1; i++)
          {
              //console.log(messagesTab[i+1]["timestamp_ms"]-messagesTab[i]["timestamp_ms"])
              if (messagesTab[i+1]["timestamp_ms"]-messagesTab[i]["timestamp_ms"]>numberMillisecondsInOneDay){
                //console.log("Break")
                timeStampEnd=messagesTab[i]["timestamp_ms"]
                if ((timeStampEnd-timeStampStart)/numberMillisecondsInOneDay>maxStreak){
                    maxStreak = (timeStampEnd-timeStampStart)/numberMillisecondsInOneDay
                    maxTimeStampStart = new Date(timeStampStart)
                    maxTimeStampEnd = new Date(timeStampEnd)
                }
                timeStampStart = messagesTab[i+1]["timestamp_ms"]
                if (i!=messagesTab.length-2){
                    timeStampEnd = NaN
                }              
              }
          }
    if (timeStampEnd === NaN){
      timeStampEnd = messagesTab[messagesTab.length-1]["timestamp_ms"]
      maxStreak = Math.max(maxStreak,(timeStampEnd-timeStampStart)/numberMillisecondsInOneDay )
    }
   
    return Math.trunc(maxStreak)
  }

  calculMaxFreeze(jsonContent : any){
    let currentDateTimeStamp = (new Date()).getTime()-1000*60*60*3; //On prend 3 heures de marge entre la date de DL et la date de test
    //console.log(currentDateTimeStamp);
    const numberMillisecondsInOneDay=1000*60*60*24;
    let reverseMessagesTab = jsonContent["messages"]
    let maxFreezeTimeTimeStamp = 0;
    let maxTimeStampStart
    let maxTimeStampEnd

    for(var i= 0; i < reverseMessagesTab.length-1; i++)
    {
      if (reverseMessagesTab[i]["timestamp_ms"]-reverseMessagesTab[i+1]["timestamp_ms"]>maxFreezeTimeTimeStamp){
        maxFreezeTimeTimeStamp=reverseMessagesTab[i]["timestamp_ms"]-reverseMessagesTab[i+1]["timestamp_ms"]
        maxTimeStampStart= new Date(reverseMessagesTab[i+1]["timestamp_ms"])
        maxTimeStampEnd= new Date(reverseMessagesTab[i]["timestamp_ms"])
      }
    }

    if (currentDateTimeStamp-reverseMessagesTab[0]["timestamp_ms"]>maxFreezeTimeTimeStamp){
        maxFreezeTimeTimeStamp=currentDateTimeStamp-reverseMessagesTab[0]["timestamp_ms"]
        maxTimeStampStart= new Date(reverseMessagesTab[0]["timestamp_ms"])
        maxTimeStampEnd= new Date(currentDateTimeStamp)
      }
    let maxFreezeTime=maxFreezeTimeTimeStamp/numberMillisecondsInOneDay
    return Math.trunc(maxFreezeTime)
  }

  defineGroupBoolean(jsonContent : any){
    return jsonContent["participants"].length>2;
  }

  findFirstMessage(listFileDico : any){
    let firstTimeStamp = [(new Date).getTime(),"None"];
    listFileDico.forEach( function(element) {
        if  (element["content"]["messages"][element["content"]["messages"].length-1]["timestamp_ms"]<firstTimeStamp[0]){
          firstTimeStamp=[element["content"]["messages"][element["content"]["messages"].length-1]["timestamp_ms"], element.name]
        }
    })
    return [new Date(firstTimeStamp[0]), firstTimeStamp[1]]
  }

  //********************************************************************//
  //*********************//STATS POUR CONV//****************************//
  //********************************************************************//


  //ONGLET OVERVIEW

    //Répartition de messages par User
    calculNbMessagePerUser(jsonContent : any){
    let constNbMessagePerUser = {};
    jsonContent["messages"].forEach(
      function(element) {
        if(Object.keys(constNbMessagePerUser).indexOf(decodeURIComponent(escape(element["sender_name"])))!= -1){
          constNbMessagePerUser[decodeURIComponent(escape(element["sender_name"]))]+=1;
        } else {constNbMessagePerUser[decodeURIComponent(escape(element["sender_name"]))]=1}
        });
    
    var items = Object.keys(constNbMessagePerUser).map(function(key) {
    return [key, constNbMessagePerUser[key]];
    });

    items.sort(function(first,second) {
      return second[1] - first[1];
    });

    let listParticipants = []
    let listData = []
    items.forEach(function(element){
      listParticipants.push(element[0])
      listData.push(element[1])
    })
    let nbMessagePerUser = {"labels": listParticipants, "data":listData}
    return nbMessagePerUser
    }

    //Influence des participants
    calculInfluenceUser(nbMessagePerUser : any, averageLengthOfMessagesPerUser : any, reactionDetail : any){
      let ratiosParticipant ={}
      nbMessagePerUser["labels"].forEach(function(participant){
        ratiosParticipant[participant]={
          "ratioReac":0,
          "reacPerMessage":0,
          "nbrMessage":nbMessagePerUser["data"][nbMessagePerUser["labels"].indexOf(participant)],
          "nbrCarac":averageLengthOfMessagesPerUser["data"][averageLengthOfMessagesPerUser["labels"].indexOf(participant)]}
      })
        reactionDetail["labels"].forEach(function(participant){
        if (Object.keys(ratiosParticipant).indexOf(participant)>-1){
          ratiosParticipant[participant]["ratioReac"]=reactionDetail["data"]["receive"][reactionDetail["labels"].indexOf(participant)]/(Math.max(reactionDetail["data"]["send"][reactionDetail["labels"].indexOf(participant)],1))
          ratiosParticipant[participant]["reacPerMessage"]=reactionDetail["data"]["receive"][reactionDetail["labels"].indexOf(participant)]/(Math.max(ratiosParticipant[participant]["nbrMessage"]))
        }
      })
      
      //COMPARAISON A LA MOYENNE DU RATIO REACTION RECUE / REACTION ENVOYEE
      let meanRatioReac = 0
      let poidsMRC = 1
      //COMPARAISON A LA MOYENNE DU NOMBRE MOYEN DE REACTION RECUE PAR MESSAGE
      let meanReacPerMessage = 0
      let poidsMRPM = 1
      //COMPARAISON A LA MOYENNE DU NOMBRE DE MESSAGE ENVOYE
      let meanNbrMessage = 0
      let poidsNM = 1
      //COMPARAISON A LA MOYENNE DU NOMBRE DE CARACTERE PAR MESSAGE ENVOYE
      let meanNbrCarac = 0
      let poidsNC = 1

      //COMPARAISON REACTION RECUES SUR NOMBRE DE MESSAGES ENVOYES EN COMPARAISON A LA MOYENNE DES REACTIONS QU'IL RECOIT SUR SES MESSAGES

      let nbrParticipant = Object.keys(ratiosParticipant).length
      Object.keys(ratiosParticipant).forEach(function(participant){
        meanRatioReac+=ratiosParticipant[participant]["ratioReac"]/nbrParticipant
        meanReacPerMessage+=ratiosParticipant[participant]["reacPerMessage"]/nbrParticipant
        meanNbrMessage+=ratiosParticipant[participant]["nbrMessage"]/nbrParticipant
        meanNbrCarac+=ratiosParticipant[participant]["nbrCarac"]/nbrParticipant
      })
      let influenceParticipants = {}
      Object.keys(ratiosParticipant).forEach(function(participant){
        let influenceMRC = poidsMRC * ratiosParticipant[participant]["ratioReac"]/(Math.max(meanRatioReac,1))
        let influenceMRPM = poidsMRPM * ratiosParticipant[participant]["reacPerMessage"]/(Math.max(meanReacPerMessage,1))
        let influenceNM = poidsNM * ratiosParticipant[participant]["nbrMessage"]/(Math.max(meanNbrMessage,1))
        let influenceNC = poidsNC * ratiosParticipant[participant]["nbrCarac"]/(Math.max(meanNbrCarac,1))
        influenceParticipants[participant]=Math.round((influenceMRC+influenceMRPM)+(influenceNM+influenceNC)*100)/100
      })
      var items = Object.keys(influenceParticipants).map(function(key) {
        return [key, influenceParticipants[key]];
      });

      items.sort(function(first,second) {
        return second[1] - first[1];
      });

      let listeInfluenceurs = []
      let listeScore = []

      items.forEach(function(element){
        listeInfluenceurs.push(element[0])
        listeScore.push(element[1])
      })

      let influenceUser= {"labels": listeInfluenceurs, "data":listeScore}
      return influenceUser
    }
    
    //Streak / Éclair / Flocon déjà calculés pour la prévisu

    //Nombre de messages envoyés déjà fait dans la prévisu

    //Nombre de caractères envoyés
    calculNbCaracteresTotal(jsonContent : any){
      let nbrCaracteresTotal = 0
      jsonContent["messages"].forEach(function(message){
        nbrCaracteresTotal+=message["content"].length
      });
      return nbrCaracteresTotal
    }
    

  //ONGLET MESSAGES

    //Répartition de messages par User déjà fait dans l'overview

    //Moyenne de caractère par message par user
    calculAverageLengthOfMessagesPerUser(jsonContent : any, nbMessagePerUser : any){
      let nbrCaracteresPerUser = {}
      jsonContent["messages"].forEach(function(message){
        //Si le user est pas encore dans notre dico
        if (Object.keys(nbrCaracteresPerUser).indexOf(decodeURIComponent(escape(message["sender_name"])))===-1){
          nbrCaracteresPerUser[decodeURIComponent(escape(message["sender_name"]))]=0;
        }
        nbrCaracteresPerUser[decodeURIComponent(escape(message["sender_name"]))]+=decodeURIComponent(escape(message["content"])).length
      });
      Object.keys(nbrCaracteresPerUser).forEach(function(nameParticipant){
        let nbrMessage=nbMessagePerUser["data"][nbMessagePerUser["labels"].indexOf(nameParticipant)]
        nbrCaracteresPerUser[nameParticipant]=nbrCaracteresPerUser[nameParticipant]/nbrMessage
      });
    var items = Object.keys(nbrCaracteresPerUser).map(function(key) {
    return [key, nbrCaracteresPerUser[key]];
    });

    items.sort(function(first,second) {
      return second[1] - first[1];
    });

    let listParticipants = []
    let listData = []
    items.forEach(function(element){
      listParticipants.push(element[0])
      listData.push(element[1])
    })
    let averageLengthOfMessagesPerUser = {"labels": listParticipants, "data":listData}
    return averageLengthOfMessagesPerUser
    }

  //ONGLET TEMPS

    //Répartition des messages par tranche horaire
    calculHourToSend(jsonContent : any){
      let myHoursArray = new Array(24).fill(0);
      let myHoursArrayUser = new Array(24).fill(0);
      let ownMessageNbr= 0 

      let user= this.userName
      jsonContent["messages"].forEach(
      function(message){
        if (decodeURIComponent(escape(message["sender_name"]))===user){
          ownMessageNbr+=1
          myHoursArrayUser[(new Date(message["timestamp_ms"])).getHours()]+=1
        }
        myHoursArray[(new Date(message["timestamp_ms"])).getHours()]+=1
      });

      let nbrMessages = jsonContent["messages"].length
      for (let k =0; k<myHoursArray.length; k++){
        myHoursArray[k]=(myHoursArray[k]/nbrMessages)*100
        myHoursArrayUser[k]=(myHoursArrayUser[k]/ownMessageNbr)*100
      }
      return {"everyone" : myHoursArray, "user" : myHoursArrayUser}
    }

    //Somme message en fonction du temps
    calculSumMessagesPerUserByTime(jsonContent : any){
      let dicoSumPerParticipant = {}
      
      jsonContent["participants"].forEach(function(participant){
        dicoSumPerParticipant[decodeURIComponent(escape(participant["name"]))]=[0]
      })
      let listDate=[]
      jsonContent["messages"].reverse()
      let lMessages=jsonContent["messages"].slice() //Liste des messages du premier au dernier
      jsonContent["messages"].reverse()


      function transformDate( myDate : Date, indicateur : any){
        if (indicateur === "day"){
          let correspondanceMonth=["Janv", "Feb", "Mars", "Avril", "Mai", "Juin", "Juil", "Aout", "Sept", "Oct", "Nov", "Dec"]
          return myDate.getDate()+" "+correspondanceMonth[myDate.getMonth()]+" "+String(myDate.getFullYear()).substring(2)
        } 
        if (indicateur === "week"){
          return
        }
        if (indicateur === "month"){
          let correspondanceMonth=["Janv", "Feb", "Mars", "Avril", "Mai", "Juin", "Juil", "Aout", "Sept", "Oct", "Nov", "Dec"]
          return correspondanceMonth[myDate.getMonth()]+" "+String(myDate.getFullYear()).substring(2)
        }
      }

      function estDatesEgales(date1 : Date, date2 : Date, indicateur){
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

      //On determine en quelle unité on veut notre graphe
      let indicateur=""
      let dateDebut = new Date(lMessages[0]["timestamp_ms"])
      let dateFin = new Date(lMessages[lMessages.length-1]["timestamp_ms"])
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

      let currentDate=new Date(lMessages[0]["timestamp_ms"])
      listDate.push(transformDate(currentDate, indicateur))
      dicoSumPerParticipant[decodeURIComponent(escape(lMessages[0]["sender_name"]))][0]+=1;
      let i=1
      while (i<lMessages.length-1){
        let sender = decodeURIComponent(escape(lMessages[i]["sender_name"]))
        // Si la personne a quitté le groupe
        if (Object.keys(dicoSumPerParticipant).indexOf(sender)===-1){
          let newParticipantList = new Array(dicoSumPerParticipant[Object.keys(dicoSumPerParticipant)[0]].length).fill(0);
          dicoSumPerParticipant[sender]=newParticipantList.slice()
        }
        
        //Si on est toujours dans le même jour
        if (estDatesEgales(currentDate, new Date(lMessages[i]["timestamp_ms"]), indicateur)){
          dicoSumPerParticipant[sender][dicoSumPerParticipant[sender].length-1]+=1;
        }
        //Si on est dans un jour différent
        else{
          //On complète avec tous les jours qu'on a manqué
          /*while (!estDatesEgales(currentDate, new Date(lMessages[i]["timestamp_ms"]), indicateur)){
            if (indicateur==="day"){
              currentDate = new Date(currentDate.getTime()+1000*60*60*24);
            }
            if (indicateur==="month"){
              currentDate = new Date(currentDate.getTime()+1000*60*60*24*28);
            }
            listDate.push(transformDate(currentDate, indicateur))
            Object.keys(dicoSumPerParticipant).forEach(function(participant){
              dicoSumPerParticipant[participant].push(dicoSumPerParticipant[participant][dicoSumPerParticipant[participant].length-1])
            })
          }*/
          currentDate = new Date(lMessages[i]["timestamp_ms"])
          listDate.push(transformDate(new Date(lMessages[i]["timestamp_ms"]), indicateur))
            Object.keys(dicoSumPerParticipant).forEach(function(participant){
              dicoSumPerParticipant[participant].push(dicoSumPerParticipant[participant][dicoSumPerParticipant[participant].length-1])
            })
          dicoSumPerParticipant[sender][dicoSumPerParticipant[sender].length-1]+=1;
        }
      i++
      }

      let sumMessagesPerUserByTime=[listDate,dicoSumPerParticipant]
      return sumMessagesPerUserByTime
    }

    //Temps de réponse moyen
    calculAverageTimeToAnswer(jsonContent : any){
      // On découpe la fonction en trois parties :
    // 1: Séparer les mess en batch avec chacun au moins 24h de séparation - renvoyer un tableau d'indice de début de conversation
    // 2: Enlever autant de creux de réponse qu'il y a de nuits traversées durant l'échange du batch - renvoyer un sous tableau d'indice de début de conversation plus précis 
    // 3: Sur chaque période de discussion, pour chaque participant et à chaque réponse incrémenter une variable compteurParticipant et ajouter son temps de réponse à une variable tempsRepTotalParticipant

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
      let labels=Object.keys(dicoData)
      let data =[]
      Object.keys(dicoData).forEach(function(element){
        data.push(dicoData[element])
      })

      //On retire les temps de réponse nuls
      let labelsWithoutZero = [];
      let dataWithoutZero = [];

      let z=0;
      for(z=0;z<labels.length;z++){
        if(data[z]!=0){
          labelsWithoutZero.push(labels[z]);
          dataWithoutZero.push(data[z]);
        }
      }
      return {"labels":labelsWithoutZero, "data":dataWithoutZero}
    }

  //ONGLET REACTIONS

    //Total des réactions de la conv
    calculTotalReactions(jsonContent : any){
      let listeReaction = [decodeURIComponent(escape('\u00f0\u009f\u0091\u008e')),decodeURIComponent(escape('\u00f0\u009f\u0091\u008d')),decodeURIComponent(escape('\u00f0\u009f\u0098\u00a0')),decodeURIComponent(escape('\u00f0\u009f\u0098\u00a2')),decodeURIComponent(escape('\u00f0\u009f\u0098\u00ae')),decodeURIComponent(escape('\u00f0\u009f\u0098\u0086')),decodeURIComponent(escape('\u00f0\u009f\u0098\u008d'))]// Ordre des réactions : No / Yes / Grr / Pleure / Ouah / Ahah / Coeur
      let totalReactionsDico={}
      for(let k=0;k<listeReaction.length;k++){
        totalReactionsDico[listeReaction[k]]=0;
      }
      jsonContent["messages"].forEach(function(message){
        //Si le message comporte des réactions
        if (Object.keys(message).indexOf("reactions")>-1){
          message["reactions"].forEach(function(reaction){
            totalReactionsDico[decodeURIComponent(escape(reaction["reaction"]))]+=1
          })
        }
      });
      let listeDataReaction = []
      listeReaction.forEach(function(reac){
        listeDataReaction.push(totalReactionsDico[reac])
      })
      let totalReactions = {"labels" : listeReaction, "data" : listeDataReaction}
      return totalReactions
    }

    //Total des réactions par user
    calculReactionDetail(jsonContent : any){
      let reactionDetail={}
      jsonContent["messages"].forEach(function(message){
        //Si le message comporte des réactions
        if (Object.keys(message).indexOf("reactions")>-1){
          //On check si la personne qui a reçu une réaction est déjà dans le dico, si non on l'ajoute
          if (Object.keys(reactionDetail).indexOf(decodeURIComponent(escape(message["sender_name"])))===-1){
            reactionDetail[decodeURIComponent(escape(message["sender_name"]))]={"reactionReceive":message["reactions"].length,"reactionSend":0}
          } else {
            reactionDetail[decodeURIComponent(escape(message["sender_name"]))]["reactionReceive"]+=message["reactions"].length
          }

          message["reactions"].forEach(function(reaction){
            if (Object.keys(reactionDetail).indexOf(decodeURIComponent(escape(reaction["actor"])))===-1){
            reactionDetail[decodeURIComponent(escape(reaction["actor"]))]={"reactionReceive":0,"reactionSend":1}
            } else {
              reactionDetail[decodeURIComponent(escape(reaction["actor"]))]["reactionSend"]+=1
            }
          })
        }
      });
      let listeLabel = Object.keys(reactionDetail)
      let receiveList = [];
      let sendList = [];
      Object.keys(reactionDetail).forEach(function(participant){
        receiveList.push(reactionDetail[participant]["reactionReceive"])
        sendList.push(reactionDetail[participant]["reactionSend"])
      })
      let detail={"labels" :listeLabel, "data": {"receive":receiveList, "send":sendList} }
      return detail
    }

  //ONGLET AUTRES

  calculNbrCaracteresTotalPerUser(jsonContent : any){
    let nbrCaracteresTotalPerUser ={};
    jsonContent["messages"].forEach(
      function(message){
        if(Object.keys(nbrCaracteresTotalPerUser).indexOf(decodeURIComponent(escape(message["sender_name"])))!= -1){
              nbrCaracteresTotalPerUser[decodeURIComponent(escape(message["sender_name"]))]+= decodeURIComponent(escape(message["content"])).length; 
        } else{nbrCaracteresTotalPerUser[decodeURIComponent(escape(message["sender_name"]))]=decodeURIComponent(escape(message["content"])).length}
      });

    return nbrCaracteresTotalPerUser
  }

  calculNbrQuestionsOneMessage(message :string){
    let nbreQuestions = 0;
    let i =0;
    while(i<message.length){
      if(message[i]==='?'){
        let j=0;
        nbreQuestions +=1
        //On compte une seule question même si l'user a mis "????"
        while(message[i+j]==='?'){
          j=j+1
        }
        i = i+j
      }
      i=i+1
    }
    return nbreQuestions
  }
    
  

  calculNbrQuestionsPerUser(jsonContent : any){
    let nbrQuestionsPerUser = {};
    var self = this;
    jsonContent["messages"].forEach(
      function(message){
        if(Object.keys(nbrQuestionsPerUser).indexOf(decodeURIComponent(escape(message["sender_name"])))!= -1){
              nbrQuestionsPerUser[decodeURIComponent(escape(message["sender_name"]))]+= self.calculNbrQuestionsOneMessage(decodeURIComponent(escape(message["content"])));
              
        }
        else {nbrQuestionsPerUser[decodeURIComponent(escape(message["sender_name"]))]= self.calculNbrQuestionsOneMessage(decodeURIComponent(escape(message["content"])))
        }
      }
    )
    return nbrQuestionsPerUser
  }

  //La fonction calculbookStat, bookStat, qui est un dictionnaire qui contient le nombre de caractère moyen par personne, le nombre de caract total de la conv, le nombre de page écrites et le livre qui se rapproche le plus du nbre de caractère de la conv

  calculBookStat(jsonContent : any){
    let nbCaracteresPerPage = 1375;
    let sumCaracteres = 0;
    let bookStat = {};
    let nbCaracteresTotalPerUser = this.calculNbrCaracteresTotalPerUser(jsonContent);
    Object.keys(nbCaracteresTotalPerUser).forEach(
      function(participant){
        sumCaracteres += nbCaracteresTotalPerUser[participant];
      }
    )

    bookStat['sumCaracteres']=sumCaracteres;
    bookStat['averagePagesPerUser'] = Math.round((sumCaracteres/Object.keys(nbCaracteresTotalPerUser).length)/nbCaracteresPerPage);

    //Détermination du type de livre que représente la conversation
    bookStat['nbPages']= Math.round(sumCaracteres/nbCaracteresPerPage)

    let typeBook = this.selectionBook(sumCaracteres)

    bookStat['book']=typeBook[0];
    bookStat['nbPagesBook'] = typeBook[2];
    bookStat['nbCaractBook'] = typeBook[1];

  //Calcul de la vitesse de mots

  let vitesseTotal = 0;
  let timeEnd = jsonContent['messages'][0]['timestamp_ms']; //Premier temps de la conv en seconde
  let timeBegin = jsonContent['messages'][jsonContent['messages'].length-1]['timestamp_ms']; //Dernier temps de la conv

  let deltaTime = (timeEnd-timeBegin)/1000; 
  let unit = '';

  if(deltaTime>7776000){ //Si le deltaTemps est plus grand que 3 mois en seconde on va alors prendre une vitesse /mois
    vitesseTotal = Math.round((sumCaracteres/(deltaTime*5))*2592000*10)/10;
    unit = 'mois';
  }
  else if(1814400<deltaTime && deltaTime<7776000){//Si le deltaTemps est plus petit que 3 mois et plus grand que 3 semaine dans ce cas on va prendre une vitesse /semaine
    vitesseTotal= Math.round((sumCaracteres/(deltaTime*5))*604800*10)/10;
    unit = 'semaine';
  }
  else if(3600<deltaTime && deltaTime<1814400){//Si le deltaTemps est plus petit que 3 semaine et plus grand que 1 journée dans ce cas on va prendre une vitesse /jours
    vitesseTotal = Math.round((sumCaracteres/(deltaTime*5))*3600*10)/10;
    unit = 'jour';
  }


    bookStat['vitesse'] = vitesseTotal;
    bookStat['vitesseUnit'] = unit;

    return bookStat
  }

  //La fonction selectionBook, selectionne le livre le plus proche du nombre de caractères de la conv parmis une liste de livres

  selectionBook(nbCaracteres : number){

    //Ajoutez les livres ici dans listeBooks pour leur nom, nbCaracteresBooks pour leur nombre de caractères et nbPagesBooks pour leur nombre de pages (dans le même index)

    let nbCaracteresHarryPotter = 423500; //308 pages (école des sorciers), à peu près 275 mots par page, à peu près 5 caractères par mot
    let nbCaracteresLordOfRings = 944625; //687 pages (tome 1 la communauté de l'anneau), 275 mots par page, 5 caractères par mot
    let nbCaracteresPetitChaperonRouge = 24000; //32 pages, 150 mots par page, 5 caractères par mot
    let nbCaracteresSagaHarryPotter = 6238375; //4537 pages (1 jusqu'au 7), 275 mots par page, 5 caractères par mot
    let nbCaracteresSagaLordOfRings = 2649625;//1927 pages (tome 1 jusqu'à 3), 275 mots par page, 5 caractères par mot
    let nbCaracteresHalfHarryPotter = 211750 ; //154 pages (école des sorciers), à peu près 275 mots par page, à peu près 5 caractères par mot
    let nbCaracteresHarryAndRings = 1368125; //995 pages
    let nbCaracteresDoublePetitChaperonRouge = 48000; //64 pages, 150 mots par page, 5 caractères par mot
    let nbCaracteresHalfPetitChaperonRouge = 24000; //32 pages, 150 mots par page, 5 caractères par mot
    let nbCaracteresCorbeauRenard = 570; //1 page
    

    let listeBooks = ['le tome 1 de Harry Potter','le tome 1 du Seigneur des Anneaux ','le Petit Chaperon Rouge', 'la Saga Harry Potter tome 1 à 7', 'la Saga Seigneur des Anneaux tome 1 à 3','La moitié du tome 1 de Harry Potter','le tome 1 du Seigneur des Anneaux et celui de Harry Potter réunis','le double du Petit Chaperon Rouge','la moitié du Petit Chaperon Rouge','le Corbeau et le Renard de Jean de la Fontaine'];

    let nbCaracteresBooks = [nbCaracteresHarryPotter,nbCaracteresLordOfRings,nbCaracteresPetitChaperonRouge,nbCaracteresSagaHarryPotter,nbCaracteresSagaLordOfRings,nbCaracteresHalfHarryPotter,nbCaracteresHarryAndRings,nbCaracteresDoublePetitChaperonRouge,nbCaracteresHalfPetitChaperonRouge,nbCaracteresCorbeauRenard];

    let nbPagesBooks = [308,687,32,4537,1927,154,995,64,32,1]

    let i=0;
    let weightBooks = [];
    let minWeight = Math.abs(nbCaracteres/nbCaracteresBooks[0]-1);
    let indexMinWeight = 0;

    // Explication du poids : l'idée c'est de calculer le poids de chacun des livres, afin de choisir lequel afficher. Le poids est la valeur absolue du nombre de caractère de la conv, divisé par celui du livre -1. Comme ça, le poids qui sera le plus proche de 0, sera le livre qui sera le plus proche du nombre de caractères de la conversation

    for(i=0;i<listeBooks.length;i++){
      weightBooks.push([listeBooks[i],nbCaracteresBooks[i], nbPagesBooks[i], Math.abs(nbCaracteres/nbCaracteresBooks[i]-1)]);
      if(Math.abs(nbCaracteres/nbCaracteresBooks[i]-1)<minWeight){
        minWeight = Math.abs(nbCaracteres/nbCaracteresBooks[i]-1);
        indexMinWeight = i;
      }
      //On va avoir une liste où chaque élément possède '['Nom livre', nbreCaractère, nbPages, poids]'
    }

    return weightBooks[indexMinWeight]
  }

  timeSpent(jsonContent : any){
    let sumCaracteres = 0;

    //Differents temps approximatif 
    let nbCaracteresPerSecond = 20.83; //Pour un lecteur moyen
    let nbCaracteresPerSecondHand = 2.08; //Ecriture à la main pour qq de moyen
    let nbCaracteresPerSecondComputer = 8; //Ecriture à l'ordi/Smartphone pour quelqu'un de moyen

    let nbMessagesPerUser = this.calculNbMessagePerUser(jsonContent)
    let nbMessagesTotal =0;

    let nbCaracteresTotalPerUser = this.calculNbrCaracteresTotalPerUser(jsonContent);
    Object.keys(nbCaracteresTotalPerUser).forEach(
      function(participant){
        sumCaracteres += nbCaracteresTotalPerUser[participant];
      }
    )
    let i =0;
    for(i=0;i<nbMessagesPerUser['data'].length;i++){
      nbMessagesTotal += nbMessagesPerUser['data'][i]; //On compte le nombre de message total
    }
    //On approxime le temps par le nombre de caractères, et aussi par le nombre de messages, en disant qu'on ajoute 0.5 secondes par messages (qui serait équivalent à une eventuelle réflexion ou scroll,...)


    let timeSpentTotal = {}
    timeSpentTotal['hand'] = this.secondsToHms(sumCaracteres/nbCaracteresPerSecondHand+0.5*nbMessagesTotal); 
    timeSpentTotal['computer'] = this.secondsToHms(sumCaracteres/nbCaracteresPerSecondComputer+0.5*nbMessagesTotal); 
    timeSpentTotal['read']= this.secondsToHms(sumCaracteres/nbCaracteresPerSecond+0.5*nbMessagesTotal); 

    return(timeSpentTotal)
  }


  secondsToHms(d) {
    d = Number(d);

    var j = Math.floor(d / 86400);
    var h = Math.floor(d % 86400 / 3600);
    var m = Math.floor(d % 86400 % 3600 / 60);
    var s = Math.floor(d % 86400 % 3600 % 60);
        
    var jDisplay = j > 0 ? j + (j == 1 ? " jour, " : " jours, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " heure, " : " heures, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " seconde" : " secondes") : "";
    return jDisplay + hDisplay + mDisplay + sDisplay; 
}

distanceCaracteres(jsonContent : any){
  let sumCaracteres = 0;
  let distanceStat = {};
  let sizeOneCaractere = 2; //Police facebook (Tahoma), taille 11, un caractère mesure 2mm
  let nbCaracteresTotalPerUser = this.calculNbrCaracteresTotalPerUser(jsonContent);
  Object.keys(nbCaracteresTotalPerUser).forEach(
    function(participant){
      sumCaracteres += nbCaracteresTotalPerUser[participant];
    }
  )
  let distanceTotal = this.milimeterToKmMCmMm(sumCaracteres*sizeOneCaractere,true);
  distanceStat['distanceTotal'] = distanceTotal;

  //Calcul de la vitesse de mots en donnée metrique

  let vitesseTotal = 0;
  let timeEnd = jsonContent['messages'][0]['timestamp_ms']; //Premier temps de la conv en seconde
  let timeBegin = jsonContent['messages'][jsonContent['messages'].length-1]['timestamp_ms']; //Dernier temps de la conv

  let deltaTime = (timeEnd-timeBegin)/1000; 
  let unit = '';

  if(deltaTime>7776000){ //Si le deltaTemps est plus grand que 3 mois en seconde on va alors prendre une vitesse /mois
    vitesseTotal = Math.round((sumCaracteres/(deltaTime))*2592000*10)/10;
    unit = 'mois';
  }
  else if(1814400<deltaTime && deltaTime<7776000){//Si le deltaTemps est plus petit que 3 mois et plus grand que 3 semaine dans ce cas on va prendre une vitesse /semaine
    vitesseTotal= Math.round((sumCaracteres/(deltaTime))*604800*10)/10;
    unit = 'semaine';
  }
  else if(3600<deltaTime && deltaTime<1814400){//Si le deltaTemps est plus petit que 3 semaine et plus grand que 1 journée dans ce cas on va prendre une vitesse /jours
    vitesseTotal = Math.round((sumCaracteres/(deltaTime))*3600*10)/10;
    unit = 'jour';
  }


    distanceStat['vitesse'] = this.milimeterToKmMCmMm(vitesseTotal*2,false);//*2 car un caractère = 2mm
    distanceStat['vitesseUnit'] = unit;
  
  return distanceStat

}


  milimeterToKmMCmMm(d,precision) {
    d = Number(d);
    

    var km = Math.floor(d / 1000000);
    var m = Math.floor(d % 1000000 / 1000);
    var cm = Math.floor(d % 1000000 % 1000 / 10);
    var mm = Math.floor(d % 1000000 % 1000 % 10);
        
    var kmDisplay = km > 0 ? km + (km == 1 ? " km " : " km ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " m " : " m ") : "";
    var cmDisplay = cm > 0 ? cm + (cm == 1 ? " cm " : " cm ") : "";
    var mmDisplay = mm > 0 ? mm + (mm == 1 ? " mm" : " mm") : "";
    //Si on veut toutes les précisions
    if(precision===true){
      return kmDisplay + mDisplay + cmDisplay ; 
    }
    //Si on veut seulement la donnée la pus grande
    if(precision===false){
      if(km !==0){
        return kmDisplay
      }
      else if(m !==0){
        return mDisplay
      }
      else if(cm !==0){
        return cmDisplay
      }
      else if(mm !==0){
        return mmDisplay
      }

    }
}

firstToSpeak(jsonContent:any){
  if(jsonContent['messages'].length>1){
    if(Object.keys(jsonContent['messages'][jsonContent['messages'].length-1]).indexOf("content")!==-1 && jsonContent['messages'][jsonContent['messages'].length-1]['content'].substring(0,13)==='Dites bonjour'){
      return(decodeURIComponent(escape(jsonContent['messages'][jsonContent['messages'].length-2]['sender_name'])));
    }
    else{
      return(decodeURIComponent(escape(jsonContent['messages'][jsonContent['messages'].length-1]['sender_name'])));
    }
  }
  else {
    return(decodeURIComponent(escape(jsonContent['messages'][jsonContent['messages'].length-1]['sender_name'])));
  }
}

nbParticipants(jsonContent : any){
  return jsonContent['participants'].length
}

nbMessages(jsonContent : any){
  return jsonContent['messages'].length
}

dateCreationConv(jsonContent : any){
  return new Date(jsonContent["messages"][jsonContent["messages"].length-1]["timestamp_ms"])
}

}