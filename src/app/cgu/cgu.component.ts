import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cgu',
  templateUrl: './cgu.component.html',
  styleUrls: ['./cgu.component.css']
})
export class CguComponent implements OnInit {

  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
    this.httpClient
      .get<any[]>('https://statsmess.firebaseio.com/compteurVisites.json')
      .subscribe(
        (response) => {
          let idPage = "cgu"
          let compteurVisites = response;
          let compteurPage;
          let keyModified;
          for(var k=0;k<Object.keys(compteurVisites).length ;k++){
            let key = Object.keys(compteurVisites)[k]
            if (compteurVisites[key]["idPage"]===idPage){
              compteurPage=compteurVisites[key]
              keyModified=key
            }
          }
          compteurPage["nbrVisite"]+=1
          compteurPage["timeSpent"]+=0
          compteurVisites[keyModified]=compteurPage
          this.httpClient.put('https://statsmess.firebaseio.com/compteurVisites.json', compteurVisites).subscribe(
            () => {
              console.log("compteur "+idPage+" succes update")
            },
            (error) => {
            }
          );
        },
        (error) => {
        })
  }

}