import { Component, Input, ViewChild, ElementRef, AfterViewInit} from '@angular/core';



@Component({
  selector: 'ad-custom',
  templateUrl: './ad-custom.component.html',
  styleUrls: [ './ad-custom.component.css' ]
})
export class AdCustomComponent implements AfterViewInit {
    @ViewChild('iframeToFill') iframe: ElementRef;
    url:any
  constructor() {}

  ngAfterViewInit(): void {
    var tag = "<div id='39493-1'><script src='//ads.themoneytizer.com/s/gen.js?type=1'></script><script src='//ads.themoneytizer.com/s/requestform.js?siteId=39493&formatId=1'></script></div>"
    let doc =  this.iframe.nativeElement.contentDocument || this.iframe.nativeElement.contentWindow;
    doc.open();
    doc.write(tag);
    doc.close();
  }
}