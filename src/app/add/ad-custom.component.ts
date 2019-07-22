import { Component, Input, OnInit} from '@angular/core';



@Component({
  selector: 'ad-custom',
  templateUrl: './ad-custom.component.html',
  styleUrls: [ './ad-custom.component.css' ]
})
export class AdCustomComponent implements OnInit {
    @Input() urlAddon:any;
    url:any
  constructor() {}

  ngOnInit(){
    var addon = this.urlAddon==2 ? "Double" : "One";
    this.url="http://ptondereau.perso.centrale-marseille.fr/add"+addon+".html";
  }
}




