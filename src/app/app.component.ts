import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent  {
  isReady=false;
  isCguVisible=false;

  launch(){
    this.isReady=true;
  }

  showHideCgu(){
    this.isCguVisible=!this.isCguVisible
  }
}
