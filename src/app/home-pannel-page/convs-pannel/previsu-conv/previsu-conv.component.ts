import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-previsu-conv',
  templateUrl: './previsu-conv.component.html',
  styleUrls: ['./previsu-conv.component.css']
})
export class PrevisuConvComponent implements OnInit {
  @Input() file : any;
  content:any
  name:any
  nbrMessage:any
  currentStreak:any //TOPRINT
  maxStreak:any //TOPRINT
  maxFreeze:any //TOPRINT
  nbrParticipant : any;
  dateLastMessage : any;


  isConvGroup: boolean;

  constructor() { }

  ngOnInit() {
    this.content=this.file["content"]
    this.name=this.file["name"]
    this.nbrMessage=this.file["nbrMessage"]
    this.currentStreak=decodeURIComponent(escape("\u00f0\u009f\u0094\u00a5"))+this.file["currentStreak"]
    this.maxStreak=decodeURIComponent(escape("\u00e2\u009a\u00a1\u00ef\u00b8\u008f"))+this.file["maxStreak"]
    this.maxFreeze=decodeURIComponent(escape("\u00e2\u009d\u0084\u00ef\u00b8\u008f"))+this.file["maxFreeze"]
    this.isConvGroup=this.file["isConvGroup"]
    this.nbrParticipant=this.file["nbrParticipant"]
    this.dateLastMessage = new Date(this.file["lastMessage"])
  }
}