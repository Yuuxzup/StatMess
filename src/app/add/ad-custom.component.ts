import { Component, Input, OnInit, AfterViewInit} from '@angular/core';



@Component({
  selector: 'ad-custom',
  templateUrl: './ad-custom.component.html',
  styleUrls: [ './ad-custom.component.css' ]
})
export class AdCustomComponent implements OnInit, AfterViewInit {

    @Input() urlAddon:any;
    url:any
  constructor() {}

  ngOnInit(){
    var addon = this.urlAddon==2 ? "Double" : "One";
    this.url="http://ptondereau.perso.centrale-marseille.fr/add"+addon+"Bis.html";
  }

  ngAfterViewInit(){
    console.log("test")
    this.createIframe();
  }

  createIframe(){
    var i = document.createElement("iframe");
    i.src = this.url;
    i.scrolling = "auto";
    i.width = "100%";
    i.height = "300px";
    document.getElementById("div-that-holds-the-iframe").appendChild(i);
  };
}




