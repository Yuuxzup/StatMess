import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit} from '@angular/core';



@Component({
  selector: 'ad-custom',
  templateUrl: './ad-custom.component.html',
  styleUrls: [ './ad-custom.component.css' ]
})
export class AdCustomComponent implements OnInit, AfterViewInit {
    @ViewChild('iframeToFill') iframe: ElementRef;
    url:any
  constructor() {}

  ngOnInit(){
  }

  ngAfterViewInit(): void {
    console.log("hey")
    var tagBillBoard = "<div style='text-align:center;' id='39493-31'><script async src='//ads.themoneytizer.com/s/gen.js?type=31'></script><script async src='//ads.themoneytizer.com/s/requestform.js?siteId=39493&formatId=31'></script></div>"
    var tagMegabannerHaut = "<div id='39493-1'><script async src='//ads.themoneytizer.com/s/gen.js?type=1'></script><script async src='//ads.themoneytizer.com/s/requestform.js?siteId=39493&formatId=1'></script></div>"
    var tagMegabannerBas = "<div id='39493-1'><script async src='//ads.themoneytizer.com/s/gen.js?type=1'></script><script async src='//ads.themoneytizer.com/s/requestform.js?siteId=39493&formatId=1'></script></div>"
    let doc =  this.iframe.nativeElement.contentDocument || this.iframe.nativeElement.contentWindow;
    console.log(doc)
    doc.open();
    console.log("writing")
    doc.write(tagBillBoard);
    doc.close();
  }
}