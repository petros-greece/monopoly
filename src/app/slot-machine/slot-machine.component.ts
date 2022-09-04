import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HelpersService } from '../service/helpers.service';

@Component({
  selector: 'app-slot-machine',
  templateUrl: './slot-machine.component.html',
  styleUrls: ['./slot-machine.component.scss']
})
export class SlotMachineComponent implements OnInit {

  @Output("onSlotEnd") public onSlotEnd: EventEmitter<any> = new EventEmitter<any>();
  
  cls = ['', '', '', ''];
  rolled = false;

  constructor(public helpers: HelpersService) { }

  ngOnInit(): void {
  }

  rollSlot(){
    this.rolled = true;
    let num1 =  Math.floor(Math.random()*10);
    let num2 =  Math.floor(Math.random()*10);
    let num3 =  Math.floor(Math.random()*10);
    let num4 =  Math.floor(Math.random()*10);
    this.cls = [`slot-num-${num1}`, `slot-num-${num2}`, `slot-num-${num3}`, `slot-num-${num4}`];
 

    setTimeout(()=>{
      // let num = diceOne+diceTwo;
      // this.isRolling = false;
      let total = parseInt(`${num2}${num3}${num4}`);
      if( !(num1%2) ){
        total = total*(-1)
      }
      this.onSlotEnd.emit(total);
    }, 3100);

  }

}
