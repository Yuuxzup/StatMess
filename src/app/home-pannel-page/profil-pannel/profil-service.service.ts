import { Injectable } from '@angular/core';
import {OwnStatsService} from '../../../app/home-pannel-page/own-stats-pannel/own-stats.service';
import {StatsConvService} from '../../../app/home-pannel-page/convs-pannel/stats-conv.service';
import * as baseGenre from '../../../data/baseGenre.json';
import * as baseGenre2 from '../../../data/baseGenre2.json';

@Injectable()
export class ProfilServiceService {

  scoreResBav : any;
  scoreFidExt : any;
  scoreSpoRef : any;
  scoreSolExp : any;
  scoreConCur : any;
  scoreEgoAlt : any;
  scorePro : any;
  scoreInf : any;
  scoreBla : any;
  scoreRie : any;
  scoreEntCon : any;
  scoreTch : any;
  scoreAtWork : any;
  scoreCoucheLeve : any;
  userName : any;
  userSex : any;
  hoursISend : any;

  pinkColor= 'rgb(241,77,156)' ;
  blueColor = 'rgb(77,89,241)';

  constructor(private ownStatsService : OwnStatsService, private statsConvService : StatsConvService) { }

  // Ici : Reservé = -1 et Bavard = +1
  calculScoreResBav(listFileDico : any){
    if (this.scoreResBav){
      return this.scoreResBav
    }
    //Corps de la fonction
 
    var scoreCaracParPeriod =this.sousCalculTotalCaracLastPeriod(listFileDico)
    var scoreTempsEntre2Mess =this.sousCalculTempsEntreDeuxMess(listFileDico)
    var scoreDominationConv =this.sousCalculNbConvDominees(listFileDico)

    let scoreLocal = (scoreCaracParPeriod + scoreTempsEntre2Mess + scoreDominationConv)/3
    
    this.scoreResBav = scoreLocal
    return scoreLocal
  }

  // Ici : Fidèle = -1 et Extrasociable = +1
  calculScoreFidExt(listFileDico : any){
    if (this.scoreFidExt){
      return this.scoreFidExt
    }

    //Corps de la fonction, on coefficiente dans scoreLocal
 
    let scoreRepStreaks = this.sousCalculRepartitionStreaks (listFileDico)
    let scoreNbConvDuoGrp = this.sousCalculNbConvDuoAndGroupPerPeriod (listFileDico)
    let scoreNbNewContacts = this.sousCalculNbDeNewContactPerPeriod (listFileDico)
    let scoreTailleGrp = this.sousCalculMoyenneTailleGroup (listFileDico)

    let scoreLocal = (2*scoreRepStreaks + 2*scoreNbConvDuoGrp[0] + 2*scoreNbConvDuoGrp[1] + 2*scoreNbNewContacts + scoreTailleGrp)/9
    
    this.scoreFidExt = scoreLocal
    return scoreLocal
  }

 // Score Spontané-Réfléchi : Spontané = -1, Réfléchi = +1
  calculScoreSpoRef(listFileDico : any){
    if (this.scoreSpoRef){
      return this.scoreSpoRef
    }
    //Corps de la fonction

    let scoreLongueurMess =this.sousCalculMoyenneLongueurMess (listFileDico)
    let scoreMessDaffile =this.sousCalculMoyenneNbMessDaffile (listFileDico)
    let scoreTempsReponse =this.sousCalculTempsReponse (listFileDico)
    
    let scoreLocal = (scoreLongueurMess + scoreMessDaffile + scoreTempsReponse)/3

    this.scoreSpoRef = scoreLocal
    return scoreLocal
  }

 // Score Solennel Expressif : Solennel = -1, Expressif = +1
  calculScoreSolExp(listFileDico : any){
    if (this.scoreSolExp){
      return this.scoreSolExp
    }
    //Corps de la fonction

    let scoreSmiley = this.sousCalculNbMoyenSmileyPerMess (listFileDico)
    let scorePonctu = this.sousCalculPonctuationDetect (listFileDico)
    let scoreReact = this.sousCalculTotalSentReactions (listFileDico)

    let scoreLocal = (scoreSmiley + scorePonctu + scoreReact)/3
    
    this.scoreSolExp = scoreLocal
    return scoreLocal
  }

 // Ici : Confiant = -1, Curieux = +1
  calculScoreConCur(listFileDico : any){
    if (this.scoreConCur){
      return this.scoreConCur
    }
    //Corps de la fonction

 let nbInterro = 0
 let nbMessEnvoyes = 0
 let username = this.userName


  listFileDico.forEach(function(file){
    file["content"]["messages"].forEach(function(message){
      if(decodeURIComponent(escape(message["sender_name"])) == username && message["content"]){
        nbMessEnvoyes += 1

        let k = 0
        let term1 = "?"
        let messageText = decodeURIComponent(escape(message["content"]))
        let tabDesIndex = []
        tabDesIndex.push(messageText.indexOf(term1))

          while(tabDesIndex[k] != -1 && tabDesIndex[k] < messageText.length -1){
              tabDesIndex.push(messageText.indexOf(term1, (tabDesIndex[k] + 1)))
              k += 1
          }
        
        tabDesIndex.forEach(function(element){
          if(element != -1){
            nbInterro += 1
          }
        })

      }
    })
  })  

  // Wolf : 0.21, Hugo : 0.18, Tond : 0.13
  //console.log("Nb de <?> par message : " + nbInterro/nbMessEnvoyes)

  let ref = 0.175
  let ecartMax = 0.075

  let scoreLocal = 0

  if(nbInterro/nbMessEnvoyes > ref + ecartMax){
    scoreLocal = 1
  }
  else if(nbInterro/nbMessEnvoyes < ref - ecartMax){
    scoreLocal = -1
  }
  else{
    scoreLocal = (nbInterro/nbMessEnvoyes - ref)/ecartMax
  }
    
    this.scoreConCur = scoreLocal
    return scoreLocal
  }

 // Ici : Egoiste = -1, Altruiste = +1
  calculScoreEgoAlt(listFileDico : any){
    if (this.scoreEgoAlt){
      return this.scoreEgoAlt
    }
    //Corps de la fonction
    let exempleTrucARenvoyer = NaN;

    let nbConvOuEgoDominant = 0
    let nbTotalConvComptees = 0
    let username = this.userName

    const setDesTermes = new Set(["moi", "Moi", "je", "Je", "mon","ma","j", "J", "personnellement"])

    listFileDico.forEach(function(file){
      if(file["content"]["participants"].length == 2 && file["content"]["messages"]){

        let nbEgoUser = 0
        let nbEgoOther = 0

         file["content"]["messages"].forEach(function(message){

          if(message["content"]){
           let tableauDeTxt = message["content"].split(/'| /)
           tableauDeTxt.forEach(function(txt){
               if(setDesTermes.has(txt)){
                 if(decodeURIComponent(escape(message["sender_name"])) == username){
                   nbEgoUser += 1
                 }
                 else{
                   nbEgoOther +=1
                 }
               }
             })
          }
         })

      if(nbEgoUser > nbEgoOther){
        nbConvOuEgoDominant += 1
        nbTotalConvComptees += 1
      }
      else if(nbEgoOther > nbEgoUser){
        nbTotalConvComptees += 1
      }

      }
    })
    
    // Wolf : 0.63, Hugo : 0.53, Tond : 0.52
    //console.log("Nombre de conv où on est plus egoiste " + nbConvOuEgoDominant/nbTotalConvComptees)

    let ref = 0.55
    let ecartMax = 0.15

    let scoreLocal = 0

    if(nbConvOuEgoDominant/nbTotalConvComptees > ref + ecartMax){
      scoreLocal = -1
    }
    else if(nbConvOuEgoDominant/nbTotalConvComptees < ref - ecartMax){
      scoreLocal = 1
    }
    else{
      scoreLocal = (ref - nbConvOuEgoDominant/nbTotalConvComptees)/ecartMax
    }
    
    this.scoreEgoAlt = scoreLocal
    return scoreLocal
  }

 // Ici : Professionnel de -1 à +1 (max)
  calculScorePro(listFileDico : any){
    if (this.scorePro){
      return this.scorePro
    }
    //Corps de la fonction

  let sommePouceHaut = 0
  let sommePouceBas = 0
  let sommeOther = 0
  let sommePouceHautSent = 0
  let sommePouceBasSent = 0
  let sommeOtherSent = 0
  let sommeMessEnvoyes = 0
  let username = this.userName

  let reactionUp = decodeURIComponent(escape('\u00f0\u009f\u0091\u008d'))
  let reactionDown = decodeURIComponent(escape('\u00f0\u009f\u0091\u008e'))

    var now = new Date(Date.now());
    var dateCible = new Date(Date.now());
    if(now.getMonth() == 0 || now.getMonth() == 1){
      if(now.getMonth() == 0){
         dateCible.setMonth(10)
         dateCible.setFullYear(now.getFullYear()-1)
      }
      else{
         dateCible.setMonth(11)
         dateCible.setFullYear(now.getFullYear()-1)
      }
    }
    else{
      dateCible.setMonth(now.getMonth()-2)
    }
  
      listFileDico.forEach(function(file){


      let longueur = file["content"]["messages"].length
      let k = 0

      while(file["content"]["messages"][k]["timestamp_ms"] >= dateCible.valueOf() && k < longueur-1){
        if(decodeURIComponent(escape(file["content"]["messages"][k]["sender_name"])) == username){
          sommeMessEnvoyes += 1
          if(file["content"]["messages"][k]["reactions"]){
            file["content"]["messages"][k]["reactions"].forEach(function(reaction){
              if(decodeURIComponent(escape(reaction["reaction"])) == reactionUp){
                sommePouceHaut += 1
              }
              else if(decodeURIComponent(escape(reaction["reaction"])) == reactionDown){
                sommePouceBas += 1
              }
              else{
                sommeOther += 1
              }
            })
          }
        }
        else if(decodeURIComponent(escape(file["content"]["messages"][k]["sender_name"])) != username){
          if(file["content"]["messages"][k]["reactions"]){
            file["content"]["messages"][k]["reactions"].forEach(function(reaction){
            if(decodeURIComponent(escape(reaction["actor"])) == username){
              if(decodeURIComponent(escape(reaction["reaction"])) == reactionUp){
                sommePouceHautSent += 1
              }
              else if(decodeURIComponent(escape(reaction["reaction"])) == reactionDown){
                sommePouceBasSent += 1
              }
              else{
                sommeOtherSent += 1
              }
            }
            })
          }
        }
        k +=1
      }

    })

    // Wolf : 0.02, 213, 0.06, 522, Hugo : 0.02, 101, 0.02, 64, Tond : 0.05, 210, 0.08, 209
    //console.log("Pouces par message envoyé " + (sommePouceHaut + sommePouceBas)/sommeMessEnvoyes + " Pouces envoyés " + (sommePouceHautSent + sommePouceBasSent) + " Reaction autres reçues par mess " + sommeOther/sommeMessEnvoyes + " Autre reactions envoyées " + sommeOtherSent)

    let calculReacRecues = 0 // On met un coeff 0.25 pour se ramener à l'échelle -1/+1 en agrandissant proportionnelement les ecarts par 25

    if((sommePouceHaut + sommePouceBas)/sommeMessEnvoyes > sommeOther/sommeMessEnvoyes){  
      calculReacRecues = (((sommePouceHaut + sommePouceBas)/sommeMessEnvoyes)/(sommeOther/sommeMessEnvoyes))*0.25 
    }
    else if((sommePouceHaut + sommePouceBas)/sommeMessEnvoyes < sommeOther/sommeMessEnvoyes){
      calculReacRecues = -((sommeOther/sommeMessEnvoyes)/((sommePouceHaut + sommePouceBas)/sommeMessEnvoyes))*0.25
    }

    let calculReacEnvoy = 0

    if((sommePouceHautSent + sommePouceBasSent) > sommeOtherSent){
      calculReacEnvoy = ((sommePouceHautSent + sommePouceBasSent)/sommeOtherSent)*0.25
    }
    else if((sommePouceHautSent + sommePouceBasSent) < sommeOtherSent){
      calculReacEnvoy = -(sommeOtherSent/(sommePouceHautSent + sommePouceBasSent))*0.25
    }

    let scoreReacRecues = 0
    let scoreReacEnvoy = 0

    if(calculReacRecues > 1){
      scoreReacRecues = 1
    }
    else if(calculReacRecues < -1){
      scoreReacRecues = -1
    }
    else{
      scoreReacRecues = calculReacRecues
    }

    if(calculReacEnvoy > 1){
      scoreReacEnvoy = 1
    }
    else if(calculReacEnvoy < -1){
      scoreReacEnvoy = -1
    }
    else{
      scoreReacEnvoy = calculReacEnvoy
    }

    //console.log("Recues " + scoreReacRecues + " Envoy " + scoreReacEnvoy)

    let scoreLocal = (scoreReacRecues + scoreReacEnvoy)/2
    
    this.scorePro = scoreLocal
    return scoreLocal
  }

 // Ici : Influenceur de -1 à 1
  calculScoreInf(listFileDico : any){
    if (this.scoreInf){
      return this.scoreInf
    }
    //Corps de la fonction

    let self = this
    let username = this.userName
    let nbDeConv = 0
    let sommeInfluence = 0

    listFileDico.forEach(function(file){
     if(file["content"]["messages"].length > 200){
      let nbMess = self.statsConvService.calculNbMessagePerUser(file["content"])
      let avLength = self.statsConvService.calculAverageLengthOfMessagesPerUser
      (file["content"], nbMess)
      let reactionsDetail = self.statsConvService.calculReactionDetail(file["content"])
      let infUser = self.statsConvService.calculInfluenceUser(nbMess, avLength, reactionsDetail)

      let k = 0
      let sommeData = 0
      infUser["data"].forEach(function(data){
        sommeData += data
      })

    if(infUser["labels"]){
      while(k < infUser["labels"].length){
        if(infUser["labels"][k] == username){
          nbDeConv += 1 // Attention nombre de gens dans la conv
          sommeInfluence += (infUser["data"][k]/sommeData)*(file["content"]["participants"].length/2) 
          k = infUser["labels"].length
        }
        k += 1
      }
    }
     }
    })

     if(nbDeConv < 8){ // Si l'user à peu de conv au dessus de 200 mess
     listFileDico.forEach(function(file){
       if(file["content"]["messages"].length > 10){
       nbDeConv = 0
       sommeInfluence = 0
      let nbMess = self.statsConvService.calculNbMessagePerUser(file["content"])
      let avLength = self.statsConvService.calculAverageLengthOfMessagesPerUser
      (file["content"], nbMess)
      let reactionsDetail = self.statsConvService.calculReactionDetail(file["content"])
      let infUser = self.statsConvService.calculInfluenceUser(nbMess, avLength, reactionsDetail)

      let k = 0
      let sommeData = 0
      infUser["data"].forEach(function(data){
        sommeData += data
      })

    if(infUser["labels"]){
      while(k < infUser["labels"].length){
        if(infUser["labels"][k] == username){
          nbDeConv += 1
          sommeInfluence += (infUser["data"][k]/sommeData)*(file["content"]["participants"].length/2)
          k = infUser["labels"].length
        }
        k += 1
      }
    }
     }
     })
     }

    let influenceUser = sommeInfluence/nbDeConv

    // Wolf : 0.55, Hugo : 0.49, Tond : 0.64
    //console.log("Votre influence utilisateur est " +influenceUser + ". Quel homme !")

    let ref = 0.5 //On a tout ramené à 0.5
    let ecartMax = 0.2

    let scoreLocal = 0

    if(influenceUser > ref + ecartMax){
      scoreLocal = 1
    }
    else if(influenceUser < ref - ecartMax){
      scoreLocal = -1
    }
    else{
      scoreLocal = (influenceUser - ref)/ecartMax
    }

    this.scoreInf = scoreLocal
    return scoreLocal
  }

 // Blagueur de -1 à 1
  calculScoreBla(listFileDico : any){
    if (this.scoreBla){
      return this.scoreBla
    }
    //Corps de la fonction

    let scoreReac = this.sousCalculReactionsRire(listFileDico,"bla")
    let scoreWords = this.sousCalculLolWords(listFileDico,"bla")

    let scoreLocal = (scoreReac + 2*scoreWords)/3
    
    this.scoreBla = scoreLocal
    return scoreLocal
  }

 // Rieur de -1 à 1
  calculScoreRie(listFileDico : any){
    if (this.scoreRie){
      return this.scoreRie
    }
    //Corps de la fonction
    let exempleTrucARenvoyer = NaN;

    let scoreReac = this.sousCalculReactionsRire(listFileDico,"rie")
    let scoreWords = this.sousCalculLolWords(listFileDico,"rie")

    let scoreLocal = (scoreReac + 2*scoreWords)/3
    
    this.scoreRie = scoreLocal
    return scoreLocal
  }

 // Ici : Entreprenant = -1, Convoité = +1
  calculScoreEntCon(listFileDico : any){
    if (this.scoreEntCon){
      return this.scoreEntCon
    }
    //Corps de la fonction

    let scoreFirstMess = this.sousCalculConvFirstMessSent(listFileDico)
    let scoreNbCarac = this.sousCalculDominationNbCarac(listFileDico)
    let scoreTempsRep = this.sousCalculComparaisonTempsRep(listFileDico)
    let scoreNbReac = this.sousCalculComparaisonNbReactions(listFileDico)

    let scoreLocal = (scoreFirstMess + scoreNbCarac + scoreTempsRep + scoreNbReac)/4
    
    this.scoreEntCon = scoreLocal
    return scoreLocal
  }

 // Ici : Tchatcheur de -1 à 1
  calculScoreTch(listFileDico : any){
    if (this.scoreTch){
      return this.scoreTch
    }
    //Corps de la fonction

    let scoreConv = this.sousCalculSexualiteConv(listFileDico)
    let scoreCarac = this.sousCalculSexualiteSommeCarac(listFileDico)
    let scoreBestFriend = this.sousCalculSexualiteBestFriend(listFileDico)

    let scoreLocal = (scoreConv + scoreCarac + scoreBestFriend)/3
    
    this.scoreTch = scoreLocal
    return scoreLocal
  }

 // Score at work : Lazy = -1, Serious = +1
  calculScoreAtWork(listFileDico : any){
    if (this.scoreAtWork){
      return this.scoreAtWork
    }
    //Corps de la fonction

    var dicoMoyennes={"week":0, "weekend":0}
    var username=this.userName
    var timeStampLimite=(new Date()).getTime()-30*2*24*60*60*1000;
    listFileDico.forEach(function(file){
      var listMessages=file["content"]["messages"]
      var k=0;
      while (k<listMessages.length && listMessages[k]["timestamp_ms"]>timeStampLimite){
        if(decodeURIComponent(escape(listMessages[k]["sender_name"])) == username && (new Date(listMessages[k]["timestamp_ms"]).getHours()<=17 && new Date(listMessages[k]["timestamp_ms"]).getHours()>=9)){
          var isWe = new Date(listMessages[k]["timestamp_ms"]).getDay() === 5 || new Date(listMessages[k]["timestamp_ms"]).getDay() === 6 ? true : false;
          dicoMoyennes[isWe ? "weekend" : "week"]+=decodeURIComponent(escape(listMessages[k]["content"])).length
        }
        k+=1
      }
      ////console.log(dicoMoyennes)
    })
    dicoMoyennes["week"]= dicoMoyennes["week"]/(60*(5/7))
    dicoMoyennes["weekend"]= dicoMoyennes["weekend"]/(60*(2/7))

    // Wolf : 2252-1994, Hugo : 2400-1800, Tond : 1600-1050
    //console.log(dicoMoyennes)

    let rapport = 0

    if(dicoMoyennes["week"] > dicoMoyennes["weekend"]){
      rapport = -(dicoMoyennes["week"]/dicoMoyennes["weekend"])
    }
    else if(dicoMoyennes["week"] < dicoMoyennes["weekend"]){
      rapport = dicoMoyennes["weekend"]/dicoMoyennes["week"]
    }
    rapport = rapport*0.40

    let scoreLocal = 0

    if(rapport > 1){
      scoreLocal = 1
    }
    else if(rapport < -1){
      scoreLocal = -1
    }
    else{
      scoreLocal = rapport
    }
    
    //console.log("score loc " + scoreLocal)
    this.scoreAtWork = scoreLocal
    return scoreLocal
  }

 // Ici : Couche tôt = -1, Couche tard = +1, Lève tôt = -1, Lève tard = +1
  calculScoreCoucheLeve(listFileDico : any){
    if (this.scoreCoucheLeve){
      return this.scoreCoucheLeve
    }
    //Corps de la fonction

    let hoursArray = this.calculHoursISend(listFileDico)
    let sommeMess = 0
    let toleranceEnPourcent = 0.03 //En dessous de ce % de mess dans un créneau horaire on considère que l'user dort

    hoursArray.forEach(function(value){
      sommeMess += value
    })

    let k = 3;  // On cherche l'heure de levé de 3h à 15h
    let heureDeLeve = 30
    while(heureDeLeve == 30 && k < 16){
      if(hoursArray[k]/sommeMess > toleranceEnPourcent){
        heureDeLeve = k
      }
      k += 1
    }

    let p = 20;   // On cherche l'heure de couché de 20h à 5h
    let heureDeCouche = 30
    while(heureDeCouche == 30 && p != 6){
      if(hoursArray[p]/sommeMess < toleranceEnPourcent){
        heureDeCouche = p
      }
      if(p == 23){
        p = 0
      }
      else{
        p += 1
      }
    }

    //console.log("Heure moyenne de levé " +heureDeLeve)
    //console.log("Heure moyenne de couché " +heureDeCouche)

    let refHeureLeve = 9
    let refHeureCouche = 23
    let ecartMax = 3

    let heureDeCoucheUnlimited = heureDeCouche
    if(heureDeCoucheUnlimited < 10){
      heureDeCoucheUnlimited = 24 + heureDeCoucheUnlimited
    }

    let scoreHeureLeve = (heureDeLeve - refHeureLeve)/ecartMax
    let scoreHeureCouche = (heureDeCoucheUnlimited - refHeureCouche)/ecartMax

    if(heureDeLeve > refHeureLeve + ecartMax){
      scoreHeureLeve = 1
    }
    if(heureDeLeve < refHeureLeve - ecartMax){
      scoreHeureLeve = -1
    }
    if(heureDeCoucheUnlimited > refHeureCouche + ecartMax){
      scoreHeureCouche = +1
    }
    if(heureDeCoucheUnlimited < refHeureCouche - ecartMax){
      scoreHeureCouche = -1
    }
    
    if(heureDeLeve == 30){
      scoreHeureLeve = 0
      //console.log("Pb avec heure de levé")
    }
    if(heureDeCouche == 30){
      scoreHeureCouche = 0
      //console.log("Pb avec heure de couché")
    }

    let dicoScoreLocal = {"Levé" : scoreHeureLeve, "Couché" : scoreHeureCouche}

    this.scoreCoucheLeve = dicoScoreLocal
    //console.log(dicoScoreLocal)
    return dicoScoreLocal
  }

  calculHoursISend(listFileDico : any){
    if (this.hoursISend){
      return this.hoursISend;
    }

    let myHoursArrayUser = this.ownStatsService.calculHoursISend(listFileDico)

    this.hoursISend = myHoursArrayUser
    return myHoursArrayUser
  }

  findUserName(listFileDico : any){ 
    if (this.userName){
      return this.userName;
    }
    
    this.userName= this.ownStatsService.findUserName(listFileDico)
    this.statsConvService.findUserName(listFileDico)
    return this.userName
  }

  findUserSex(listFileDico : any){
    if (this.userSex){
      return this.userSex;
    }

    this.userSex = this.findOneSex(this.userName)
    if(this.userSex == "i"){
      //console.log("ATTENTION VOTRE SEXE EST INDETERMINE")
    }
    return this.userSex
  }


//    -----     -----    -----  SOUS CALCULS    -----    -----     -----


  //Score ResBav
  sousCalculTotalCaracLastPeriod(listFileDico : any){

    var sommeCarac = 0

    var now = new Date(Date.now());
    var dateCible = new Date(Date.now());
    if(now.getMonth() == 0 || now.getMonth() == 1){
      if(now.getMonth() == 0){
         dateCible.setMonth(10)
         dateCible.setFullYear(now.getFullYear()-1)
      }
      else{
         dateCible.setMonth(11)
         dateCible.setFullYear(now.getFullYear()-1)
      }
    }
    else{
      dateCible.setMonth(now.getMonth()-2)
    }

    listFileDico.forEach(function(file){

      let longueur = file["content"]["messages"].length
      let k = 0

      while(file["content"]["messages"][k]["timestamp_ms"] >= dateCible.valueOf() && k < longueur-1){
        sommeCarac += decodeURIComponent(escape(file["content"]["messages"][k]["content"])).length
        k +=1
      }

    })
          // Wolf : 700 000 Tond : 350 000 Hugo : 730 000
      //console.log("la valeur somme carac est " + sommeCarac)

      let refNbCarac = 350000
      let ecartMax = 350000

      let scoreLocal = 0

      if(sommeCarac > refNbCarac + ecartMax){
        scoreLocal = 1
      }
      else{
        scoreLocal = (sommeCarac - refNbCarac)/ecartMax
      }

      return scoreLocal

  }

  // Score Reserve : -1 Bavard : +1
  sousCalculNbConvDominees(listFileDico : any){

    var nbConvDominees = 0
    var nbConvTotal = 0
    var username = this.userName

    listFileDico.forEach(function(file){

      if(file["content"]["participants"].length == 2 && file["content"]["messages"].length > 2){

        let sommeCaracUser = 0
        let sommeCaracOther = 0

        file["content"]["messages"].forEach(function(message){

          if(decodeURIComponent(escape(message["sender_name"])) == username){
            sommeCaracUser += decodeURIComponent(escape(message["content"])).length
          }
          else{
            sommeCaracOther += decodeURIComponent(escape(message["content"])).length
          }
        })

        if(sommeCaracUser > sommeCaracOther){
          nbConvDominees += 1
        }
        nbConvTotal += 1
      }
    })

    // La référence tombe naturellement : 50%
    //console.log("Pour les conv dominees " + nbConvDominees/nbConvTotal)
    return Math.round(100*(((nbConvDominees/nbConvTotal)-0.5)*2))/100

  }

  // Le but de cette fonction est d'identifier la fréquence à laquelle l'user prend son portable pour parler par message
  // Score Reserve : -1 Bavard : +1

  sousCalculTempsEntreDeuxMess(listFileDico : any){

  var tabDesTempsDenvoi = []
  var username = this.userName

    var now = new Date(Date.now());
    var dateCible = new Date(Date.now());
    if(now.getMonth() == 0 || now.getMonth() == 1){
      if(now.getMonth() == 0){
         dateCible.setMonth(10)
         dateCible.setFullYear(now.getFullYear()-1)
      }
      else{
         dateCible.setMonth(11)
         dateCible.setFullYear(now.getFullYear()-1)
      }
    }
    else{
      dateCible.setMonth(now.getMonth()-2)
    }

  listFileDico.forEach(function(file){

      let longueur = file["content"]["messages"].length
      let k = 0

// On fait d'abord un grand tableau des temps d'envois depuis deux mois

      while(file["content"]["messages"][k]["timestamp_ms"] >= dateCible.valueOf() && k < longueur-1){
        if (decodeURIComponent(escape(file["content"]["messages"][k]["sender_name"])) == username){
          tabDesTempsDenvoi.push(file["content"]["messages"][k]["timestamp_ms"])
        }
        k +=1
      }
  })
// On le trie du plus petit au plus grand
  tabDesTempsDenvoi.sort(function(a, b) {
   return a - b;
  });

  let CinqMinEnMs = 1000*60*5
  let SeptHeureEnMs = 1000*60*60*7
  let sommeDesDelais = 0
  let nbDeDelais = 0

  let i = 0
  for(i=0; i < tabDesTempsDenvoi.length -1; i++){
    if(tabDesTempsDenvoi[i+1]-tabDesTempsDenvoi[i] > CinqMinEnMs && tabDesTempsDenvoi[i+1]-tabDesTempsDenvoi[i] < SeptHeureEnMs ){
      sommeDesDelais += tabDesTempsDenvoi[i+1]-tabDesTempsDenvoi[i]
      nbDeDelais += 1
    }
  }

  var ref = 60
  var ecartMax = 60  // Wolf : 36, Tond : 35, Hugo : 30
  var tempsPerso = Math.round(sommeDesDelais/(nbDeDelais*1000*60))

  //console.log("Temps entre deux utilisations " + tempsPerso)

  let scoreLocal = 0

  if(tempsPerso > ref + ecartMax){
    scoreLocal = -1
  }
  else{
    scoreLocal = (ref-tempsPerso)/ecartMax
  }

  return scoreLocal

  }

// Score Fidèle Extrasociable
// Mesure la proportion de gens à qui on parle vraiment (cad au moins une fois sur plus de trois jours d'affilé)
sousCalculRepartitionStreaks(listFileDico : any){

  var nbConvDuo = 0
  var nbConvAvecPlusDe3Streaks = 0

  listFileDico.forEach(function(file){
      if(file["content"]["participants"].length == 2){
        if(file["maxStreak"] >= 3){
          nbConvAvecPlusDe3Streaks +=1
        }
        nbConvDuo += 1
      }
  })

  // Wolf : 0.08, Hugo : 0.06, Tond : 0.04
  //console.log("Nombre conv + de 3 streaks " + nbConvAvecPlusDe3Streaks/nbConvDuo)

  let ref = 0.05
  let ecartMax = 0.05

  let scoreLocal = 0

  if(nbConvAvecPlusDe3Streaks/nbConvDuo > ref + ecartMax){
    scoreLocal = 1
  }
  else{
    scoreLocal = (nbConvAvecPlusDe3Streaks/nbConvDuo - ref)/ecartMax
  }

  return scoreLocal 

}

// Score Fidèle Extrasociable
// Mesure nombre conv duo et nombre conv groupe dans les deux derniers mois
sousCalculNbConvDuoAndGroupPerPeriod(listFileDico : any){

  var nbConvDuo = 0
  var nbConvGroup = 0

    var now = new Date(Date.now());
    var dateCible = new Date(Date.now());
    if(now.getMonth() == 0 || now.getMonth() == 1){
      if(now.getMonth() == 0){
         dateCible.setMonth(10)
         dateCible.setFullYear(now.getFullYear()-1)
      }
      else{
         dateCible.setMonth(11)
         dateCible.setFullYear(now.getFullYear()-1)
      }
    }
    else{
      dateCible.setMonth(now.getMonth()-2)
    }

  listFileDico.forEach(function(file){

      if(file["content"]["messages"][0]["timestamp_ms"] >= dateCible.valueOf() && file["content"]['messages'].length > 2){
        if(file["content"]["participants"].length == 2){
          nbConvDuo += 1
        }
        if(file["content"]["participants"].length > 2){
          nbConvGroup += 1
        }
      }

  })

  //Wolf : Duo 100, Grp 28 ; Hugo : Duo 49, Grp 25 ; Tond : Duo 43, Grp  23
  //console.log("Nb conv duo " + nbConvDuo + " Nb conv group " + nbConvGroup)

  let refDuo = 65
  let ecartMaxDuo = 45
  let refGrp = 15
  let ecartMaxGrp = 15

  let scoreDuo = 0
  let scoreGrp = 0

  if(nbConvDuo > refDuo + ecartMaxDuo){
    scoreDuo = 1
  }
  else if(nbConvDuo < refDuo - ecartMaxDuo){
    scoreDuo = -1
  }
  else{
    scoreDuo = (nbConvDuo - refDuo)/ecartMaxDuo 
  }

  if(nbConvGroup > refGrp + ecartMaxGrp){
    scoreGrp = 1
  }
  else{
    scoreGrp = (nbConvGroup - refGrp)/ecartMaxGrp
  }

  return [scoreDuo,scoreGrp]

}

// Score Fid Ext - Nouveaux contacts de maintenant à now -2 en comparaison de nos contacts de now-2mois à now-4mois 
// Prend volontairement en compte les nouveaux amis fb
sousCalculNbDeNewContactPerPeriod(listFileDico : any){

    var now = new Date(Date.now());
    var dateCible2Month = new Date(Date.now());
    var dateCible4Month = new Date(Date.now());
    if(now.getMonth() == 0 || now.getMonth() == 1){
      if(now.getMonth() == 0){
         dateCible2Month.setMonth(10)
         dateCible2Month.setFullYear(now.getFullYear()-1)
      }
      else{
         dateCible2Month.setMonth(11)
         dateCible2Month.setFullYear(now.getFullYear()-1)
      }
    }
    else{
      dateCible2Month.setMonth(now.getMonth()-2)
    }

    if(now.getMonth() == 0 || now.getMonth() == 1 || now.getMonth() == 2 || now.getMonth() == 3){
      if(now.getMonth() == 0){
         dateCible4Month.setMonth(8)
         dateCible4Month.setFullYear(now.getFullYear()-1)
      }
      if(now.getMonth() == 1){
         dateCible4Month.setMonth(9)
         dateCible4Month.setFullYear(now.getFullYear()-1)
      }
      if(now.getMonth() == 2){
         dateCible4Month.setMonth(10)
         dateCible4Month.setFullYear(now.getFullYear()-1)
      }
      if(now.getMonth() == 3){
         dateCible4Month.setMonth(11)
         dateCible4Month.setFullYear(now.getFullYear()-1)
      }
    }
    else{
      dateCible4Month.setMonth(now.getMonth()-4)
    }

    var tabCorespSince2Month = []
    var tabCorespBetween2and4Month = []

    listFileDico.forEach(function(file){

      if(file["content"]["messages"][0]["timestamp_ms"] >= dateCible2Month.valueOf()){
        file["content"]["participants"].forEach(function(participant){
          if(tabCorespSince2Month.indexOf(participant["name"]) == -1){
             tabCorespSince2Month.push(participant["name"])
          }
        })
      }

      let indicateurDeTemps = false; //Il y a au moins un mess entre 2 et 4 mois avant now
      let longueur = file["content"]["messages"].length
      let k = 0

      while(k < longueur-1 && !indicateurDeTemps){
        if(file["content"]["messages"][k]["timestamp_ms"] >= dateCible4Month.valueOf() && file["content"]["messages"][k]["timestamp_ms"] <= dateCible2Month.valueOf() ){
          indicateurDeTemps = true
        }
        k +=1
      }

      if(indicateurDeTemps){
        file["content"]["participants"].forEach(function(participant){
          if(tabCorespBetween2and4Month.indexOf(participant["name"]) == -1){
             tabCorespBetween2and4Month.push(participant["name"])
          }
        })
      }
    })

    let nbDanciensContacts = 0

    tabCorespBetween2and4Month.forEach(function(name){
      if(tabCorespSince2Month.indexOf(name) != -1){
        nbDanciensContacts += 1
      }
    })

    // Wolf : 11%, Hugo : 5%, Tond 3%
    //console.log("Nb de nouveaux contacts " + (tabCorespSince2Month.length - nbDanciensContacts)/tabCorespSince2Month.length)

    let ref = 0.06
    let ecartMax = 0.06

    let scoreLocal = 0

    if((tabCorespSince2Month.length - nbDanciensContacts)/tabCorespSince2Month.length > ref + ecartMax){
      scoreLocal = 1
    }
    else{
      scoreLocal = ((tabCorespSince2Month.length - nbDanciensContacts)/tabCorespSince2Month.length - ref)/ecartMax
    }

    return scoreLocal

}

// Score Fid Ext : taille moyenne des groupes
sousCalculMoyenneTailleGroup(listFileDico : any){

  let sommePeopleInGroup = 0
  let nbDeGroup = 0

  listFileDico.forEach(function(file){
    if(file["content"]["participants"].length > 2){
      sommePeopleInGroup += file["content"]["participants"].length
      nbDeGroup += 1
    }
  })

  // Wolf : 13, Hugo : 12, Tond : 9.5
  //console.log("Taille moyenne d'un groupe " + sommePeopleInGroup/nbDeGroup)

  let ref = 7
  let ecartMax = 7

  let scoreLocal = 0

  if(sommePeopleInGroup/nbDeGroup > ref + ecartMax){
    scoreLocal = 1
  }
  else{
    scoreLocal = (sommePeopleInGroup/nbDeGroup - ref)/ecartMax
  }

  return scoreLocal 

}

// Score Spo Ref
sousCalculMoyenneLongueurMess(listFileDico : any){

  let sommeCarac = 0
  let nbMessageTotalUserSent = 0

  let username = this.userName

  listFileDico.forEach(function(file){
      file["content"]["messages"].forEach(function(message){

        if (decodeURIComponent(escape(message["sender_name"])) == username && message["content"]){
             nbMessageTotalUserSent += 1;
             sommeCarac+=decodeURIComponent(escape(message["content"])).length
          }

        })
    })

  let averageLengthPerMess = sommeCarac/nbMessageTotalUserSent

  // Wolf : 50, Hugo 35, Tond 40
  //console.log("Longueur moyenne mess " +averageLengthPerMess)

  let ref = 43
  let ecartMax = 15

  let scoreLocal = 0

  if(averageLengthPerMess > ref + ecartMax){
    scoreLocal = +1
  }
  else if(averageLengthPerMess < ref - ecartMax){
    scoreLocal = -1
  }
  else{
    scoreLocal = (averageLengthPerMess - ref)/ecartMax
  }

  return scoreLocal

}

// Score Spo Ref
sousCalculMoyenneNbMessDaffile(listFileDico : any){

  let sommeMessDaffile = 0
  let nbMessageTotalUserSent = 0

  let username = this.userName

  listFileDico.forEach(function(file){

      let k = 0
      for(k=0; k < file["content"]["messages"].length-1; k++){

        if (decodeURIComponent(escape(file["content"]["messages"][k]["sender_name"])) == username && file["content"]["messages"][k]["content"]){
             nbMessageTotalUserSent += 1;
             if(decodeURIComponent(escape(file["content"]["messages"][k+1]["sender_name"])) == username && file["content"]["messages"][k+1]["content"]){
                sommeMessDaffile += 1
             }
          }

        }
    })

    // Wolf : 0.39, Hugo : 0.43, Tond : 0.41
    //console.log("Pourcentage de mess d'affilé " + sommeMessDaffile/nbMessageTotalUserSent)

    let ref = 0.35
    let ecartMax = 0.15

    let scoreLocal = 0

    if(sommeMessDaffile/nbMessageTotalUserSent > ref + ecartMax){
      scoreLocal = -1
    }
    else if(sommeMessDaffile/nbMessageTotalUserSent < ref - ecartMax){
      scoreLocal = 1
    }
    else{
      scoreLocal = (ref - sommeMessDaffile/nbMessageTotalUserSent)/ecartMax
    }

    return scoreLocal

}

// Score Spo Ref
sousCalculTempsReponse(listFileDico : any){

  let userAverageAnswerTime = (this.ownStatsService.calculUserAverageAnswerTime(listFileDico))["data"]

  // Wolf : 94 - 62, Hugo : 35 - 44, Tond : 20 - 40
  //console.log("Average user answer time " + userAverageAnswerTime[0] + " et ses contacts " + userAverageAnswerTime[1])

  let ref = 50
  let ecartMax = 45

  let scoreLocal = 0

  if(userAverageAnswerTime[0] > ref + ecartMax){
    scoreLocal = 1
  }
  else if(userAverageAnswerTime[0] < ref - ecartMax){
    scoreLocal = -1
  }
  else{
    scoreLocal = (userAverageAnswerTime[0] - ref)/ecartMax
  }

  return scoreLocal

}

//Score Sol Exp -- On prend volontairement par message et non pas par n caractères car envoyer un message avec juste un smiley rend compte d'une expressivité plus forte que mettre un smiley dans un message
sousCalculNbMoyenSmileyPerMess(listFileDico : any){

  let nbMessEnvoyes = 0
  let nbSmileyTotal = 0
  let username = this.userName

  listFileDico.forEach(function(file){
    file["content"]["messages"].forEach(function(message){
      if(decodeURIComponent(escape(message["sender_name"])) == username && message["content"]){
        nbMessEnvoyes += 1

        let txt = decodeURIComponent(escape(message["content"]))
        let regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g // Peut être amélioré

        let found = txt.match(regex)
        if(found){
          nbSmileyTotal += found.length
          ////console.log("What is found" + found)
        }

      }
    })
  })
  

  // Wolf : 0.14, Hugo : 0.07, Tond : 0.23
  //console.log("Nb de smileys moyen par message " + nbSmileyTotal/nbMessEnvoyes)

  let ref = 0.12
  let ecartMax = 0.07

  let scoreLocal = 0

  if(nbSmileyTotal/nbMessEnvoyes > ref + ecartMax){
    scoreLocal = 1
  }
  else if(nbSmileyTotal/nbMessEnvoyes < ref - ecartMax){
    scoreLocal = -1
  }
  else{
    scoreLocal = (nbSmileyTotal/nbMessEnvoyes - ref)/ecartMax
  }

  return scoreLocal
}

//Score Sol Exp --- Compte nb de ponctuation faible : "./../..." et ponctuation forte "!/..!"
sousCalculPonctuationDetect(listFileDico : any){

 let nbPoint = 0
 let nbExclamation = 0
 let nbMessEnvoyes = 0
 let username = this.userName


  listFileDico.forEach(function(file){
    file["content"]["messages"].forEach(function(message){
      if(decodeURIComponent(escape(message["sender_name"])) == username && message["content"]){
        nbMessEnvoyes += 1

        let k = 0
        let i = 0
        let term1 = ". "
        let term2 = "!"
        let messageText = decodeURIComponent(escape(message["content"]))
        let tabDesIndex = []
        let tabDesIndex2 = []
        tabDesIndex.push(messageText.indexOf(term1))
        tabDesIndex2.push(messageText.indexOf(term2))

          while(tabDesIndex[k] != -1 && tabDesIndex[k] < messageText.length -1){
              tabDesIndex.push(messageText.indexOf(term1, (tabDesIndex[k] + 1)))
              k += 1
          }

          while(tabDesIndex2[i] != -1 && tabDesIndex2[i] < messageText.length -1){
              tabDesIndex2.push(messageText.indexOf(term2, (tabDesIndex2[i] + 1)))
              i += 1
          }
        
        tabDesIndex.forEach(function(element){
          if(element != -1){
            nbPoint += 1
          }
        })

        tabDesIndex2.forEach(function(element){
          if(element != -1){
            nbExclamation += 1
          }
        })

      }
    })
  })

    // Wolf : 0.30 et 0.34, Hugo : 0.04 et 0.17, Tond : 0.03 et 0.06
    //console.log("Proportion de point par mess " + nbPoint/nbMessEnvoyes + " et proportion d'exclamation par mess " + nbExclamation/nbMessEnvoyes)

    let coeff = nbExclamation/nbMessEnvoyes - nbPoint/nbMessEnvoyes

    let scoreLocal = 0

    coeff = coeff*5

    if(coeff > 1){
      scoreLocal = 1
    }
    else if(coeff < -1){
      scoreLocal = -1
    }
    else{
      scoreLocal = coeff
    }

    return scoreLocal

}

//Score Sol Exp --- total réaction envoyées
sousCalculTotalSentReactions(listFileDico : any){

  let sommeReactions = 0
  let sommeMessRecus = 0
  let username = this.userName

    var now = new Date(Date.now());
    var dateCible = new Date(Date.now());
    if(now.getMonth() == 0 || now.getMonth() == 1){
      if(now.getMonth() == 0){
         dateCible.setMonth(10)
         dateCible.setFullYear(now.getFullYear()-1)
      }
      else{
         dateCible.setMonth(11)
         dateCible.setFullYear(now.getFullYear()-1)
      }
    }
    else{
      dateCible.setMonth(now.getMonth()-2)
    }
  
      listFileDico.forEach(function(file){


      let longueur = file["content"]["messages"].length
      let k = 0

      while(file["content"]["messages"][k]["timestamp_ms"] >= dateCible.valueOf() && k < longueur-1){
        if(decodeURIComponent(escape(file["content"]["messages"][k]["sender_name"])) != username){
          sommeMessRecus += 1
          if(file["content"]["messages"][k]["reactions"]){
            file["content"]["messages"][k]["reactions"].forEach(function(reaction){
              if(decodeURIComponent(escape(reaction["actor"])) == username){
                sommeReactions += 1
              }
            })
          }
        }
        k +=1
      }

    })

  // Wolf : 0.07, Hugo : 0.02, Tond : 0.05
  //console.log("Nombre de reaction user par message reçu " + sommeReactions/sommeMessRecus)

  let ref = 0.05
  let ecartMax = 0.05

  let scoreLocal = 0

  if(sommeReactions/sommeMessRecus > ref + ecartMax){
    scoreLocal = 1
  }
  else{
    scoreLocal = (sommeReactions/sommeMessRecus - ref)/ecartMax
  }

  return scoreLocal

}

//Score bla/rie --- réactions lol aux mess envoyés/recus
sousCalculReactionsRire(listFileDico : any, keyword : any){

  let lol = decodeURIComponent(escape('\u00f0\u009f\u0098\u0086'))
  let username = this.userName
  let scoreLocal = 0

  if(keyword == "bla"){

    let sommeLol = 0
    let sommeMessEnvoy = 0

    listFileDico.forEach(function(file){
      file["content"]["messages"].forEach(function(message){
        if(decodeURIComponent(escape(message["sender_name"])) == username){
          sommeMessEnvoy += 1
          if(message["reactions"]){
            message["reactions"].forEach(function(reaction){
              if(decodeURIComponent(escape(reaction["reaction"])) == lol && decodeURIComponent(escape(reaction["actor"])) != username){
                sommeLol += 1
              }
            })
          }
        }
      })
    })

    // Wolf : 0.014, Hugo : 0.011, Tond : 0.022
    //console.log("bla rapport reactions lol/envoy " + sommeLol/sommeMessEnvoy)

    let ref = 0.02
    let ecartMax = 0.02

    if(sommeLol/sommeMessEnvoy > ref + ecartMax){
      scoreLocal = 1
    }
    else{
      scoreLocal = (sommeLol/sommeMessEnvoy - ref)/ecartMax
    }
  }

  if(keyword == "rie"){

    let sommeLol = 0
    let sommeMessRecus = 0

    listFileDico.forEach(function(file){
     if(file["content"]["participants"].length == 2){
      file["content"]["messages"].forEach(function(message){
        if(decodeURIComponent(escape(message["sender_name"])) != username){
          sommeMessRecus += 1
          if(message["reactions"]){
            message["reactions"].forEach(function(reaction){
              if(decodeURIComponent(escape(reaction["reaction"])) == lol && decodeURIComponent(escape(reaction["actor"])) == username){
                sommeLol += 1
              }
            })
          }
        }
      })
     }
    })

    // Wolf : 0.009, Hugo : 0.002, Tond : 0.004
    //console.log("rie rapport reaction lol/reçus " + sommeLol/sommeMessRecus)

    let ref = 0.007
    let ecartMax = 0.007

    if(sommeLol/sommeMessRecus > ref + ecartMax){
      scoreLocal = 1
    }
    else{
      scoreLocal = (sommeLol/sommeMessRecus - ref)/ecartMax
    }

  }

  return scoreLocal
}

//Score bla/rie --- Mots de type rire sur mess des autres/de user
sousCalculLolWords(listFileDico : any, keyword : any){

  let username = this.userName
  let scoreLocal = 0

  if(keyword == "bla"){

    let nbMessRecus = 0
    let nbLolWords = 0

    listFileDico.forEach(function(file){
      if(file["content"]["participants"].length == 2){
        file["content"]["messages"].forEach(function(message){
          if(decodeURIComponent(escape(message["sender_name"])) != username){
           if(message["content"]){
            nbMessRecus += 1

            let texte = decodeURIComponent(escape(message["content"]))
            let regex = /😆|🤣|😝|😂|😄|😁|\w*[Mm]d+r+|[Ll]o+l|[Aa]h ?(ah)+|[Hh]a ?(ha)+/g

            let found = texte.match(regex)
            if(found){
             nbLolWords += found.length
            }
           }
          }
        })
      }
    })

    // Wolf : 0.13, Hugo : 0.10, Tond : 0.15
    //console.log("Lol words par mess reçus " + nbLolWords/nbMessRecus)

    let ref = 0.09
    let ecartMax = 0.11

    if(nbLolWords/nbMessRecus > ref + ecartMax){
      scoreLocal = 1
    }
    else{
      scoreLocal = (nbLolWords/nbMessRecus - ref)/ecartMax
    }
  }

  if(keyword == "rie"){

    let nbMessEnvoy = 0
    let nbLolWords = 0

    listFileDico.forEach(function(file){
      if(file["content"]["participants"].length == 2){
        file["content"]["messages"].forEach(function(message){
          if(decodeURIComponent(escape(message["sender_name"])) == username){
           if(message["content"]){
            nbMessEnvoy += 1

            let texte = decodeURIComponent(escape(message["content"]))
            let regex = /😆|🤣|😝|😂|😄|😁|\w*[Mm]d+r+|[Ll]o+l|[Aa]h ?(ah)+|[Hh]a ?(ha)+/g

            let found = texte.match(regex)
            if(found){
             nbLolWords += found.length
            }
           }
          }
        })
      }
    })

    // Wolf : 0.19, Hugo : 0.09, Tond : 0.15
    //console.log("Lol words par mess envoyés " + nbLolWords/nbMessEnvoy)

    let ref = 0.09
    let ecartMax = 0.13

    if(nbLolWords/nbMessEnvoy > ref + ecartMax){
      scoreLocal = 1
    }
    else{
      scoreLocal = (nbLolWords/nbMessEnvoy - ref)/ecartMax
    }
  }

    return scoreLocal
}

//Score Ent Con 
sousCalculConvFirstMessSent(listFileDico : any){

    let nbConv = 0;
    let nbFirst = 0;
    let username = this.userName

    listFileDico.forEach(function(file){
      if(file["content"]["messages"].length > 2){
       if(decodeURIComponent(escape(file["content"]["messages"][0]["sender_name"])) === username){
         nbFirst += 1;
    }
        nbConv += 1;
      }
    })

    // Wolf : 0.53, Hugo : 0.35, Tond : 0.48
    //console.log("Nombre de conv commencées " + nbFirst/nbConv)

    let ref = 0.5
    let ecartMax = 0.17
    let scoreLocal = 0

    if(nbFirst/nbConv > ref + ecartMax){
      scoreLocal = -1
    }
    else if(nbFirst/nbConv < ref - ecartMax){
      scoreLocal = 1
    }
    else{
      scoreLocal = (ref - nbFirst/nbConv)/ecartMax
    }
    
    return scoreLocal
}

//Score Ent Con 
sousCalculDominationNbCarac(listFileDico : any){

  let nbConvDom = 0
  let nbConv = 0
  let username = this.userName

  listFileDico.forEach(function(file){
    if(file["content"]["participants"].length == 2 && file["content"]["messages"].length > 1){
      let nbCaracUser = 0
      let nbCaracOther = 0

      file["content"]["messages"].forEach(function(message){
        if(decodeURIComponent(escape(message["sender_name"])) == username && message["content"]){
          nbCaracUser += message["content"].length
        }
        else if(decodeURIComponent(escape(message["sender_name"])) != username && message["content"]){
          nbCaracOther += message["content"].length
        }
      })

      if(nbCaracUser > nbCaracOther){
        nbConvDom += 1
        nbConv += 1
      }
      else if(nbCaracUser < nbCaracOther){
        nbConv += 1
      }
    }
  })

  // Wolf : 0.72, Hugo : 0.50, Tond : 0.58
  //console.log("Nb conv dominée en nb carac " + nbConvDom/nbConv)

  let ref = 0.50
  let ecartMax = 0.20
  let scoreLocal = 0

  if(nbConvDom/nbConv > ref + ecartMax){
    scoreLocal = -1
  }
  else if(nbConvDom/nbConv < ref - ecartMax){
    scoreLocal = 1
  }
  else{
    scoreLocal = (ref - nbConvDom/nbConv)/ecartMax
  }

  return scoreLocal
}

//Score Ent Con 
sousCalculComparaisonTempsRep(listFileDico : any){

  let userAverageAnswerTime = (this.ownStatsService.calculUserAverageAnswerTime(listFileDico))["data"]

  let rapport = 0

  if(userAverageAnswerTime[0] > userAverageAnswerTime[1]){
    rapport = userAverageAnswerTime[0]/userAverageAnswerTime[1]
  }
  else if(userAverageAnswerTime[1] > userAverageAnswerTime[0]){
    rapport = -(userAverageAnswerTime[1]/userAverageAnswerTime[0])
  }

  let scoreLocal = 0
  let calcul = rapport*0.33  // Permet de garder un impact modéré

  if(calcul > 1){
    scoreLocal = 1
  }
  else if(calcul < -1){
    scoreLocal = -1
  }
  else{
    scoreLocal = calcul
  }

  // Wolf : 0.45, Hugo = -0.38, Tond = -0.61
  //console.log("Score local comparaison temps " + scoreLocal)
  return scoreLocal
}

//Score Ent Con 
sousCalculComparaisonNbReactions(listFileDico : any){

  let totalReactions = this.ownStatsService.calculNbReactionsUser(listFileDico)
  let tabEnvoy = totalReactions["dataSent"]
  let tabRecu = totalReactions["dataReceived"]

  let sommeEnvoy = 0
  let sommeRecues = 0

  tabEnvoy.forEach(function(elmtEnvoy){
    sommeEnvoy += elmtEnvoy
  })
  tabRecu.forEach(function(elmtRecu){
    sommeRecues += elmtRecu
  })

  //console.log("reaction recues : " + sommeRecues + " envoy : " + sommeEnvoy)

  let rapport = 0

  if(sommeRecues > sommeEnvoy){
    rapport = sommeRecues/sommeEnvoy
  }
  else if(sommeRecues < sommeEnvoy){
    rapport = -(sommeEnvoy/sommeRecues)
  }

  let scoreLocal = 0
  let calcul = rapport*0.25

  if(calcul > 1){
    scoreLocal = 1
  }
  else if(calcul < -1){
    scoreLocal = -1
  }
  else{
    scoreLocal = calcul
  }

  // Wolf : -0.47, Hugo : 0.53, Tond : 0.51 (en *0.35)
  //console.log("Score local comparaison réactions " + scoreLocal)
  return scoreLocal
}

//Score Tchatcheur
sousCalculSexualiteConv(listFileDico : any){

  let tabNoms = []
  let username = this.userName

  listFileDico.forEach(function(file){
    if(file["content"]["participants"].length == 2 && file["content"]["messages"].length > 1){
      file["content"]["participants"].forEach(function(participant){
        if(decodeURIComponent(escape(participant["name"])) != username){
          tabNoms.push(decodeURIComponent(escape(participant["name"])))
        }
      })
    }
  })

  // Wolf : f317, m307, i88 (51% f), Hugo : f181, m281, i88 (39% f), Tond : f246, m360, i139 (41%)
  //console.log(this.calculSexualiteGrp(tabNoms))
  //console.log("Ci dessus nb Conv. Mon sexe est " +this.userSex)

  let rapportSexeOppose = 0
  if(this.userSex == "m"){
    rapportSexeOppose = this.calculSexualiteGrp(tabNoms)["f"]/(this.calculSexualiteGrp(tabNoms)["f"] + this.calculSexualiteGrp(tabNoms)["m"])
  }
  else if(this.userSex == "f"){
    rapportSexeOppose = this.calculSexualiteGrp(tabNoms)["m"]/(this.calculSexualiteGrp(tabNoms)["f"] + this.calculSexualiteGrp(tabNoms)["m"])
  }
  else{
    //console.log("ATTENTION VOTRE SEXE EST INDETERMINE, IMPOSSIBLE DE CALCULER SCORE TCHATCHEUR") 
  }

  let ref = 0.4
  let ecartMax = 0.15
  let scoreLocal = 0

  if(rapportSexeOppose > ref + ecartMax){
    scoreLocal = 1
  }
  else if(rapportSexeOppose < ref - ecartMax){
    scoreLocal = -1
  }
  else{
    scoreLocal = (rapportSexeOppose - ref)/ecartMax
  }

  return scoreLocal
}

//Score Tchatcheur
sousCalculSexualiteSommeCarac(listFileDico : any){

  let username = this.userName
  let self = this
  let caracM = 0
  let caracF = 0

  listFileDico.forEach(function(file){
    if(file["content"]["participants"].length == 2 && file["content"]["messages"].length > 1){
      let sexOther = "i"
      file["content"]["participants"].forEach(function(participant){
        if(decodeURIComponent(escape(participant["name"])) != username){
          sexOther = self.findOneSex(decodeURIComponent(escape(participant["name"])))
        }
      })
      if(sexOther == "m"){
        file["content"]["messages"].forEach(function(message){
          caracM += decodeURIComponent(escape(message["content"])).length
        })
      }
      else if(sexOther == "f"){
        file["content"]["messages"].forEach(function(message){
          caracF += decodeURIComponent(escape(message["content"])).length
        })
      }
    }
  })

  // Wolf : 3 136 000 et 2 471 000 (56%), Hugo : 2 750 000 et 1 940 000 (59%), Tond : 3 100 000 et 1 800 000 (63%)
  //console.log("Nombre de carac avec f " + caracF + " Nombre carac avec m " + caracM)

  let rapportSexeOppose = 0
  if(this.userSex == "m"){
    rapportSexeOppose = caracF/(caracF + caracM)
  }
  else if(this.userSex == "f"){
    rapportSexeOppose = caracM/(caracF + caracM)
  }
  else{
    //console.log("ATTENTION VOTRE SEXE EST INDETERMINE, IMPOSSIBLE DE CALCULER SCORE TCHATCHEUR") 
  }

  let ref = 0.5
  let ecartMax = 0.15
  let scoreLocal = 0

  if(rapportSexeOppose > ref + ecartMax){
    scoreLocal = 1
  }
  else if(rapportSexeOppose < ref - ecartMax){
    scoreLocal = -1
  }
  else{
    scoreLocal = (rapportSexeOppose - ref)/ecartMax
  }

  return scoreLocal
}

//Score Tchatcheur
sousCalculSexualiteBestFriend(listFileDico : any){

 let genderColor = this.ownStatsService.calculBestCorrespondantPerPeriod(listFileDico)["data"]["gendersColor"]
 let nbM = 0
 let nbF = 0
 let self = this
 
 genderColor.forEach(function(color){
   if(color == self.pinkColor){
     nbF += 1
   }
   else if(color == self.blueColor){
     nbM += 1
   }
 })

  // Wolf : m36, f47 (57%), Hugo : m42, f35 (46%), Tond : m30, f35 (54%)
 //console.log("Dans vos bff : males : " + nbM + " femelles : " + nbF)

  let rapportSexeOppose = 0
  if(this.userSex == "m"){
    rapportSexeOppose = nbF/(nbF + nbM)
  }
  else if(this.userSex == "f"){
    rapportSexeOppose = nbM/(nbF + nbM)
  }
  else{
    //console.log("ATTENTION VOTRE SEXE EST INDETERMINE, IMPOSSIBLE DE CALCULER SCORE TCHATCHEUR") 
  }

  let ref = 0.5
  let ecartMax = 0.10
  let scoreLocal = 0

  if(rapportSexeOppose > ref + ecartMax){
    scoreLocal = 1
  }
  else if(rapportSexeOppose < ref - ecartMax){
    scoreLocal = -1
  }
  else{
    scoreLocal = (rapportSexeOppose - ref)/ecartMax
  }

  return scoreLocal
}

// D'une liste de noms retourne un dictionnaire avec "f":nbF etc
calculSexualiteGrp(setUser : any){

      let dicoCompt={"f":0,"m":0, "i":0}
      setUser.forEach(function(oneUser){
        let prenom1 = oneUser.split(" ")[0].toLowerCase()
        let prenom2 = oneUser.split(" ")[0].replace("é","e").replace("è","e").replace("ê","e").replace("ë","e").replace("ï","i").replace("î","i").replace("É","E")
        if(Object.keys(baseGenre).indexOf(prenom1)!=-1){
          dicoCompt[baseGenre[prenom1]["02_genre"][0]]+=1
        } else if (baseGenre2["f"].indexOf(prenom2)!=-1){
          dicoCompt["f"]+=1
        } else if (baseGenre2["m"].indexOf(prenom2)!=-1){
          dicoCompt["m"]+=1
        } else {
          dicoCompt["i"]+=1
        }
      })
      return dicoCompt
}

// D'un prénom retourne "f" "m" ou "i"
findOneSex(name : any){

    let sex = "i"
    let dicoSex = this.calculSexualiteGrp([name])
    if(dicoSex["m"]){
      sex = "m"
    }
    else if(dicoSex["f"]){
      sex = "f"
    }
    return sex
}

}