import { Component, OnInit, Input } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser'
import { SliderType } from "igniteui-angular";

@Component({
  selector: 'app-slider-perso',
  templateUrl: './slider-perso.component.html',
  styleUrls: ['./slider-perso.component.scss']
})
export class SliderPersoComponent implements OnInit {

  @Input() labelMin : any;
  @Input() labelMax : any;
  @Input() value : any;
  @Input() listInformations : any;
  @Input() index : number;

  isInfosOpen : boolean;
  listInfosOdd : any;
  listInfosEven : any;

  public sliderType = SliderType;
  public priceRange: PriceRange;
  isLeft:boolean

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.isInfosOpen=false;
    this.listInfosOdd=[]
    this.listInfosEven=[]
    for(var k=0; k<Math.min(6,this.listInformations.length);k++){
      var stringToDisplay =this.sanitizer.bypassSecurityTrustHtml("↣ "+this.listInformations[k].replace("<b>", "<b style=\'color:rgba(40, 37, 88, 0.815)\'>"))
      if(k%2===0){
        this.listInfosOdd.push(stringToDisplay)
      } else {
        this.listInfosEven.push(stringToDisplay)
      }
    }
    if (this.value<0){
      this.priceRange = new PriceRange(this.value, 0);
      this.isLeft= true;
    } else {
      this.priceRange = new PriceRange(0, this.value);
      this.isLeft= false;
    }
  }

  invertInfos(){
    this.isInfosOpen=!this.isInfosOpen
    const btn = document.getElementById('buttonSpan-'+this.index);
    if (btn.className.indexOf('active') === -1) {
		  btn.classList.add('active');
    } else {
		  btn.classList.remove('active');
    }
  }
}

class PriceRange {
  constructor(
    public lower: number,
    public upper: number
  ) {
  }
}
