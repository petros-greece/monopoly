import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dice',
  templateUrl: './dice.component.html',
  styleUrls: ['./dice.component.scss']
})
export class DiceComponent implements OnInit {
  
  elDiceOne:any;
  elDiceTwo:any;
  isRolling = false;

  @Input() canRoll: boolean; 
  @Input() showNextPlayer: boolean;  
  @Input() isCurrentPlayer: boolean; 
  @Output("onDiceTotal") public onDiceTotal: EventEmitter<any> = new EventEmitter<any>();
  @Output("onNextTurnClbk") public onNextTurnClbk: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
    this.elDiceOne     = document.getElementById('dice1');
    this.elDiceTwo     = document.getElementById('dice2');
  }

  rollDice() {
    this.isRolling = true;
    let diceOne   = Math.floor((Math.random() * 6) + 1);
    let diceTwo   = Math.floor((Math.random() * 6) + 1);
    for (var i = 1; i <= 6; i++) {
      this.elDiceOne.classList.remove('show-' + i);
      if (diceOne === i) {
        this.elDiceOne.classList.add('show-' + i);
      }
    }

    for (var k = 1; k <= 6; k++) {
      this.elDiceTwo.classList.remove('show-' + k);
      if (diceTwo === k) {
        this.elDiceTwo.classList.add('show-' + k);
      }
    } 
    let timeout = (diceOne + diceTwo)*200;
    setTimeout(()=>{
      this.isRolling = false;
      this.onDiceTotal.emit({'diceOne': diceOne, 'diceTwo': diceTwo});
    }, timeout);
      
  }



  nextTurnClbk(){
    this.onNextTurnClbk.emit();
  }

}
