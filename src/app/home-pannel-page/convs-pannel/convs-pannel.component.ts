import { Component, OnInit, Input } from '@angular/core';
import { StatsConvService } from './stats-conv.service';

@Component({
  selector: 'app-convs-pannel',
  templateUrl: './convs-pannel.component.html',
  styleUrls: ['./convs-pannel.component.scss']
})
export class ConvsPannelComponent implements OnInit {

  @Input() listFilesDico : any;

  //Variable pour les filtres et les tris
  filtreDico={text:"", listeStatus:{isConvGroup:true,isConvSolo:true}}
  listFilesDicoFiltered : any;
  sortedChoices={"name":"","nbrMessage":"", "currentStreak":"", "maxStreak":"", "maxFreeze":"", "nbrParticipant":"", "lastMessage":""}

  //Variable pour savoir si on est dans une stat ou dans le navigateur de stat
  isStats : boolean;
  fileConvToDisplay : any;

  constructor(private statsConvService: StatsConvService) { }

  ngOnInit() {
    this.isStats= false;
    this.statsConvService.findUserName(this.listFilesDico)
    //On remplit le tableau de la vue à partir de l'enseble des fichiers
    let listFiltered=[]
    let original = this.listFilesDico.slice()
    this.listFilesDico.forEach(function(element) {
      let newElement=element
      newElement["index"]=original.indexOf(element)
      listFiltered.push(newElement)
    });
    this.listFilesDicoFiltered=listFiltered.slice()
    //On initialise le tableau pour sort
    this.sortedChoices={"name":"","nbrMessage":"", "currentStreak":"", "maxStreak":"", "maxFreeze":"", "nbrParticipant":"", "lastMessage":"↑"}
    this.sort()
  }

  invertStat(){
    this.isStats=false;
  }

  //Fonction qui filtre les messages selon les différents champs du filtre
  filter(){
    //On reinitialise le dico
    this.listFilesDicoFiltered=[]
    let newListFiltered=[]
    let filter=this.filtreDico
    let original=this.listFilesDico.slice()
    this.listFilesDico.forEach(function(element) {
        let passThroughFilter = true
        //On commence par check le filtre texte
        if (filter.text!=""){
          //Si le filtre texte n'est pas respecté on met la variable à false
          if (!element["name"].toLowerCase().includes(filter.text.toLowerCase())){
            passThroughFilter=false
          }
        }
        //On check maintenant si le type de conv fait partie des types filtrés
        // Si on a pas :
        //Si c'est conv groupe et que conv groupe est coché
        //OU
        //Si c'est conv solo et que conv solo est coché
        //Alors on met la variable à false
        if (!((element.isConvGroup && filter.listeStatus["isConvGroup"])||(!element.isConvGroup && filter.listeStatus["isConvSolo"]))){
          passThroughFilter=false
        }
        
        //Si notre element passe à travers le filtre
        if(passThroughFilter){
          let onFilePassing = element
          onFilePassing["index"]=original.indexOf(element)
          newListFiltered.push(onFilePassing)
        }
      })
    
    this.listFilesDicoFiltered=newListFiltered.slice()
    //On resort comme ça l'était
    this.sort()
  }

  //Fonction faisant le lien entre la vue quand un bouton est cliqué et une fonction sort qui peut être rappelé à l'extérieur
  correspondanceSort(paramToSortId : number){
    let paramToSort = ["name","nbrMessage","currentStreak","maxStreak","maxFreeze", "nbrParticipant","lastMessage"][paramToSortId]
    //MODIF DE L'AFFICHAGE
    if (this.sortedChoices[paramToSort]==="↑"){
      this.sortedChoices[paramToSort]="↓"
    } else{
      this.sortedChoices={"name":"","nbrMessage":"", "currentStreak":"", "maxStreak":"", "maxFreeze":"", "nbrParticipant":"", "lastMessage":""}
      this.sortedChoices[paramToSort]="↑"
    }
    //On lance le sort
    this.sort()
  }

  //Fonction qui réorganise tous les élements de listDicoFiltered dans un sens qui correspond au bouton cliqué
  sort(){
    //On récupère le param selon lequel on veut sort et dans quel sens on veut sort
    let vueSortedChoices=this.sortedChoices
    let paramToSort = ""
    Object.keys(this.sortedChoices).forEach(function(element) {
       if (vueSortedChoices[element]!=""){
         paramToSort=element
       }
    });
    //Si aucun filtre n'est à appliquer
    if (paramToSort===""){
      return
    }

    //On sort en fonction du type la liste correspondante
    if (this.sortedChoices[paramToSort]==="↓"){
    this.listFilesDicoFiltered.sort(function(first,second) {
      if (typeof first[paramToSort]=== "string"){
        return first[paramToSort].localeCompare(second[paramToSort]);
      }
      if (typeof first[paramToSort]=== "number"){
        return first[paramToSort]-second[paramToSort];
      }
    });}
    if (this.sortedChoices[paramToSort]==="↑"){
    this.listFilesDicoFiltered.sort(function(second,first) {
      if (typeof first[paramToSort]=== "string"){
        return first[paramToSort].localeCompare(second[paramToSort]);
      }
      if (typeof first[paramToSort]=== "number"){
        return first[paramToSort]-second[paramToSort];
      }
    });}
  }

  onSubmit(i : number){
    this.isStats=true;
    this.fileConvToDisplay = this.listFilesDico[i]
  }
}