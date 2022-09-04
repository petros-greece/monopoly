import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.scss']
})
export class BuildingComponent implements OnInit {
  
  @Input()        cls: string; 
  @Input()        type: number;  
  constructor() { }

  ngOnInit(): void {
  }

}
