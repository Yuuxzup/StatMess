import { Component, OnInit,Input } from '@angular/core';
import { StatsConvService } from '../../home-pannel-page/convs-pannel/stats-conv.service'
@Component({
  selector: 'app-loading-custom',
  templateUrl: './loading-custom.component.html',
  styleUrls: ['./loading-custom.component.scss']
})
export class LoadingCustomComponent implements OnInit {

  @Input() valeurChargement : number;

  constructor(private statsConvService : StatsConvService) { }

  ngOnInit() {
    //Scroll to the top
    document.body.scrollTop = 0;

    //chargement
    this.valeurChargement=Math.floor(this.valeurChargement*100)
    
  }

}