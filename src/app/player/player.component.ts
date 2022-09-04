import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  
  @Input("cls") public cls: string = '';
  @Input("playerCls") public playerCls: string = ''; 
  @Input("bg") public bg: string = ''; 
  
  constructor() { }

  ngOnInit(): void {
  }

}
