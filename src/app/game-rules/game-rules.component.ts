import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-game-rules',
  templateUrl: './game-rules.component.html',
  styleUrls: ['./game-rules.component.scss']
})
export class GameRulesComponent implements OnInit {

  @Input() filteredBoard: any[]; 
  @Input() game: any;  
  @Input() railroads: any;

  constructor() { }

  ngOnInit(): void {
  }

}
