import { Component, OnInit, ViewChild, TemplateRef, HostListener, AfterViewInit } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { CardsService } from './service/cards.service';
import { HelpersService } from './service/helpers.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  
})
export class AppComponent implements OnInit{

  @ViewChild('cardTmpl', {static: true}) cardTmpl: TemplateRef<any>;
  @ViewChild('chestAndChanceTmpl', {static: true}) chestAndChanceTmpl: TemplateRef<any>;
  @ViewChild('casinoTmpl', {static: true}) casinoTmpl: TemplateRef<any>;  
  @ViewChild('countryInfoTmpl', {static: true}) countryInfoTmpl: TemplateRef<any>;
  @ViewChild('mainMenuTrigger') mainMenuTrigger: MatMenuTrigger;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeBoard();
  }

  playerInterval:any;
  gameInterval  :any;

  UI = {
    fullMenuOpen: false,
    timer: 30,
    size: 1,
    cellInfo: {
      show: false,
      which: '',
      bg: '',
      text: ''
    },
    canRoll: true,
    boardCls: 'board-lg',
    playerClsPrefix: 'player-position-', 
    blocks: [ '00', '01', '02', '03', '04', '05', '06', '07', '17', '27', '37', '47', '57', '67', '77', '76', '75', '74', '73', '72', '71', '70', '60', '50', '40', '30', '20', '10' ], 
    currentBlock: '00',
    selectedBlock:<any> {},
    card:<any> {},
    continents: [
      {name: 'Africa', cls: 'mat-brown'}, 
      {name: 'Europe', cls: 'mat-red'}, 
      {name: 'Asia', cls: 'mat-green-700'}, 
      {name: 'America', cls: 'mat-blue'}
    ]
  };

  game = {
    totalPlayers: 0,
    currentPlayer: 0,
    playAgain: false,
    initMoney: 1000,
    passFromStartMoney: 200
  }




  players = [
    {
      color: 'red',
      areaBg: 'rgba(255,0,0,.4)',
      position: 0,
      cls: 'player-position-00',
      cards: {},
      money: this.game.initMoney,
      looseNextTurn: false,
      isActive: false,
    },
    {
      color: 'lime',
      areaBg: 'rgba(0, 255, 0, .2)',
      position: 0,
      cls: 'player-position-00',
      cards: {},
      money: this.game.initMoney,
      looseNextTurn: false,
      isActive: false
    },
    {
      color: 'cyan',
      areaBg: 'rgba(0, 255, 255, .2)',
      position: 0,
      cls: 'player-position-00',
      cards: {},
      money: this.game.initMoney,
      looseNextTurn: false,
      isActive: false
    },
    {
      color: 'fuchsia',
      areaBg: 'rgba(255, 0, 255,.2)',
      position: 0,
      cls: 'player-position-00',
      cards: {},
      money: this.game.initMoney,
      looseNextTurn: false,
      isActive: false
    },    
  ];

  board:any = {
	
    '00':  { type: 'edge',         continent: '',         verb: 'Start',             img: './assets/images/starting-point.png', cost: 0,   ownedBy: -1, cls: '' },

    '01':  { type: 'country',      continent: 'Africa',   verb: 'Congo',             img: '',                                   cost: 35,  ownedBy: -1, cls: 'rotate-none mat-brown', buildCls: 'building-top' },
    '02':  { type: 'community',    continent: '',         verb: 'Community Chest',   img: './assets/images/chest.png',          cost: 0,   ownedBy: -1, cls: 'rotate-none' },
    '03':  { type: 'country',      continent: 'Africa',   verb: 'Nigeria',           img: '',                                   cost: 40,  ownedBy: -1, cls: 'rotate-none mat-brown', buildCls: 'building-top' }, 
    '04':  { type: 'chance',       continent: '',         verb: 'Chance',            img: './assets/images/chance.png',         cost: 0,   ownedBy: -1, cls: 'rotate-none' },
    '05':  { type: 'country',      continent: 'Africa',   verb: 'Egypt',             img: '',                                   cost: 45,  ownedBy: -1, cls: 'rotate-none mat-brown', buildCls: 'building-top' }, 
    '06':  { type: 'country',      continent: 'Africa',   verb: 'S. Africa',         img: '',                                   cost: 70,  ownedBy: -1, cls: 'rotate-none mat-brown', buildCls: 'building-top' }, 
    
    '07': { type: 'edge',          continent: '',         verb: 'Jail',              img: './assets/images/jail.png',           cost: 0,   ownedBy: -1, cls: '' },
    
    '17': { type: 'country',       continent: 'Europe',   verb: 'Italy',             img: '',                                   cost: 50,  ownedBy: -1, cls: 'rotate-right mat-red', buildCls: 'building-right' },
    '27': { type: 'casino',        continent: '',         verb: 'Bellagio',            img: './assets/images/casino.png',         cost: 0,   ownedBy: -1, cls: 'rotate-right' },
    '37': { type: 'country',       continent: 'Europe',   verb: 'France',            img: '',                                   cost: 70,  ownedBy: -1, cls: 'rotate-right mat-red', buildCls: 'building-right' },
    '47': { type: 'country',       continent: 'Europe',   verb: 'England',           img: '',                                   cost: 70,  ownedBy: -1, cls: 'rotate-right mat-red', buildCls: 'building-right' },
    '57': { type: 'railroad',      continent: 'Railroal', verb: 'Frankfurt Station', img: './assets/images/railroad.png',       cost: 100, ownedBy: -1, cls: 'rotate-right' },  
    '67': { type: 'country',       continent: 'Europe',   verb: 'Germany',           img: '',                                   cost: 85,  ownedBy: -1, cls: 'rotate-right mat-red', buildCls: 'building-right' }, 
    
    '77': { type: 'edge',          continent: '',         verb: 'Free Parking',      img: './assets/images/parking.png',        cost: 0,   ownedBy: -1, cls: 'rotate-135' }, 
    
    '76': { type: 'country',       continent: 'Asia',     verb: 'Qatar',             img: '',                                   cost: 60,  ownedBy: -1, cls: 'rotate-180 mat-green-700', buildCls: 'building-bottom' },
    '75': { type: 'community',     continent: '',         verb: 'Community Chest',   img: './assets/images/chest.png',          cost: 0,   ownedBy: -1, cls: 'rotate-180' },
    '74': { type: 'country',       continent: 'Asia',     verb: 'S. Korea',          img: '',                                   cost: 60,  ownedBy: -1, cls: 'rotate-180 mat-green-700', buildCls: 'building-bottom' }, 
    '73': { type: 'country',       continent: 'Asia',     verb: 'Japan',             img: '',                                   cost: 75,  ownedBy: -1, cls: 'rotate-180 mat-green-700', buildCls: 'building-bottom' }, 
    '72': { type: 'chance',        continent: '',         verb: 'Chance',            img: './assets/images/chance.png',         cost: 0,   ownedBy: -1, cls: 'rotate-180' }, 
    '71': { type: 'country',       continent: 'Asia',     verb: 'China',             img: '',                                   cost: 105, ownedBy: -1, cls: 'rotate-180 mat-green-700', buildCls: 'building-bottom' }, 
    
    '70': { type: 'edge',          continent: '',         verb: 'Go to Jail',        img: './assets/images/go-to-jail.png',     cost: 0,   ownedBy: -1, cls: 'rotate-230' },     
    
    '60': { type: 'country',       continent: 'America',  verb: 'Mexico',            img: '',                                   cost: 60,  ownedBy: -1, cls: 'rotate-left mat-blue', buildCls: 'building-left' },
    '50': { type: 'casino',        continent: '',         verb: 'Estoril',            img: './assets/images/casino.png',         cost: 0,   ownedBy: -1, cls: 'rotate-left' }, 
    '40': { type: 'country',       continent: 'America',  verb: 'Canada',            img: '',                                   cost: 55, ownedBy: -1, cls: 'rotate-left mat-blue', buildCls: 'building-left' }, 
    '30': { type: 'country',       continent: 'America',  verb: 'Brazil',            img: '',                                   cost: 75, ownedBy: -1, cls: 'rotate-left mat-blue', buildCls: 'building-left' }, 
    '20': { type: 'railroad',      continent: 'Railroal', verb: 'Toronto Union Station',img: './assets/images/railroad.png',    cost: 150,ownedBy: -1, cls: 'rotate-left' }, 
    '10': { type: 'country',       continent: 'America',  verb: 'USA',               img: '',                                   cost: 115,ownedBy: -1, cls: 'rotate-left mat-blue', buildCls: 'building-left' }, 
      
    '22': { type: 'card',          continent: '',         verb: 'Community Chest',   img: './assets/images/chest.png',          cost: 0,  ownedBy: -1, cls: 'rotate-135 mat-blue' }, 
    '55': { type: 'card',          continent: '',         verb: 'Chance',            img: './assets/images/chance.png',         cost: 0,  ownedBy: -1, cls: 'rotate-315 mat-orange' }, 
    

  }
  

  constructor(
    public helpers: HelpersService,
    public cardsService: CardsService
    ){
    

 
  }
 
  async ngOnInit() {
    this.resizeBoard();
    this.calculateBuildingPrices();
    setTimeout(()=>{
      this.mainMenuTrigger.openMenu();
      
    }, 10); 

    this.renderDice(3,5);
    await this.emitPlayerMove(1, 8);
    // await this.emitPlayerMove(1, 12);

    //     await this.emitPlayerMove(2, 12);
    //     await this.emitPlayerMove(1, 12);

//db timestamp
      //  [hjk]

   this.monopolyInterval();
   

  }

  /** ΙΝΙΤ ************************/

  private calculateBuildingPrices(){
    for(let prop in this.board){
      if(this.board[prop].type === 'country'){

        let cost = this.board[prop].cost;
        let rents = [ Math.ceil(cost/7), Math.ceil(cost*.7), Math.ceil(cost*1.7) ];
        let buildCosts = [ 0, Math.ceil(cost*1.7), Math.ceil(cost*3.1) ];
        this.board[prop].building = 0;
        this.board[prop].rents = rents;
        this.board[prop].buildCosts = buildCosts;

      }
      else if(this.board[prop].type === 'railroad'){
        let cost = this.board[prop].cost;
        this.board[prop].tripCost = Math.ceil(cost/4);
      }    
    }
    console.log(this.board);
  }

  resizeBoard(){
    let w = window.innerWidth;
    if(w < 700){
      this.UI.boardCls = 'board-sm';
      this.UI.size = 1.6;
    }

    if(w < 351){ this.UI.size = .9; }
    else if(w < 401){ this.UI.size = 1.1; }
    else if(w < 501){ this.UI.size = 1.3; }
  }

  monopolyInterval(){
    this.gameInterval = setInterval(()=>{
      this.UI.timer-=1;
      if(this.UI.timer <= 0){
        this.UI.timer = 30;
        this.nextTurn();
      }
    }, 1000);
  }

  /** PLAYER TURN AND MOVEMENT *****************/

  //Emitted after the next button clicked and also when the time ends
  nextTurn(){
      this.UI.canRoll = true;
      this.UI.timer = 30;
      
      //if the player is marked to play again, unmark him and stop here
      if(this.game.playAgain){
        this.game.playAgain = false;
        return;
      }
      // give next player index
      if( this.game.currentPlayer < (this.players.length-1) ){
        this.game.currentPlayer+=1;
      }
      else{
        this.game.currentPlayer = 0;
      }
      //if has looses turn flag, unflag him and move to the next
      if(this.players[this.game.currentPlayer].looseNextTurn){
        this.players[this.game.currentPlayer].looseNextTurn = false;
        this.game.currentPlayer+=1;
        if( this.game.currentPlayer > (this.players.length-1) ){
          this.game.currentPlayer = 0;
        }
      }
      this.helpers.closeAllDialogs();

  }

  //helper
  showCellAnimation(which:string, text: string, bg = ''){
    this.UI.cellInfo.show = true;
    this.UI.cellInfo.which = which;
    this.UI.cellInfo.text = text;
    this.UI.cellInfo.bg = bg;

    setTimeout(()=>{
      this.UI.cellInfo.show = false;
    }, 1000);

  }

  moveTo(position:number, collectFromStart:boolean){
    let player = this.players[this.game.currentPlayer];
    if(collectFromStart && player.position > position){
      player.money+= this.game.passFromStartMoney;
    }
    player.position = position;
    player.cls = this.UI.playerClsPrefix+this.UI.blocks[player.position];
    this.checkBoardBlock();
  }

  movePlayer(e: any){
    let num = 9//e.diceOne+e.diceTwo;
    let counter = 0;
    let ind = this.game.currentPlayer;
    let player = this.players[ind];
    this.UI.canRoll = false;
    //if is the second/third... time to play in the row restart timer
    if(this.game.playAgain){
      this.UI.timer = 30;
    }

    //in doubles you play again only if the landing cell is not 'Go to Jail'
    if( (e.diceOne === e.diceTwo) && (player.position + num !== 21)){
      this.helpers.showToastrSuccess('Doubles! You play again!');
      this.game.playAgain = true;
      this.UI.canRoll = true;
    }
    else{
      this.game.playAgain = false;
    }

    //move Interval
    this.playerInterval = setInterval(()=>{
      player.position+=1;
      //reached the start
      if( player.position > 27){
        this.showCellAnimation('00', `+${this.game.passFromStartMoney}`, 'rgba(0,128,0,.5)');
        player.position = 0;
        player.money+= this.game.passFromStartMoney;
      }
      //give player position until he finishes
      player.cls = this.UI.playerClsPrefix+this.UI.blocks[player.position];
      counter+=1;
      if(counter >= num){
        clearInterval(this.playerInterval);
        this.checkBoardBlock();
      }
    }, 100);
  }


  /** BLOCK SPECIFIC ACTIONS *****************/

  private goToJail(){
    let player = this.players[this.game.currentPlayer];
    this.helpers.showToastrError('Jailed! You miss next turn!');
    this.UI.currentBlock = '07';
    player.cls = this.UI.playerClsPrefix+'07';
    player.position = 7;
    player.looseNextTurn = true;
  }

  private openChestAndChanceDialog(){
    let text = this.board[this.UI.currentBlock].verb;
    let type = this.board[this.UI.currentBlock].type;
    let cls = (type === 'community') ? 'mat-blue' : 'mat-orange';
    this.UI.card = (type === 'chance') ? 
                  this.cardsService.giveChanceCard() : 
                  this.cardsService.giveCommunityCard();

    this.helpers.openDialog({
      headerText: `${text}`,
      template: this.chestAndChanceTmpl,
      cls: cls,
      showClose: false
    });
  }

  private collectMoneyFromAll(){
    //@todo filter out finished players (no money)
    let len = this.players.length;
    let money = this.UI.card.money;
    let current = this.game.currentPlayer;
    for(let i=0; i < len; i+=1){
        if(i !== current){
        this.players[i].money-= money;
        }
    }
    this.players[current].money+= money*(len-1);
  }

  private giveMoneyToAll(){
    //@todo filter out finished players (no money)
    let len = this.players.length;
    let money = this.UI.card.money;
    let current = this.game.currentPlayer;
    for(let i=0; i < len; i+=1){
        if(i !== current){
          this.players[i].money+= money;
        }
    }
    this.players[current].money-= money*(len-1);
  }

  private payChanceOrCommunity(){
    //@todo filter out finished players (no money)
    let money = this.UI.card.money;
    let current = this.game.currentPlayer;
    this.players[current].money-= money;
  }

  private collectFromChanceOrCommunity(){
    //@todo filter out finished players (no money)
    let money = this.UI.card.money;
    let current = this.game.currentPlayer;
    this.players[current].money+= money;   
  }

  doActionForChanceOrCommunity(){
    this.helpers.closeAllDialogs();
    let type = this.UI.card.type;
    if(type === 'position no money'){
      let position = this.UI.card.position;
      this.moveTo(position, false);
    }
    else if(type === 'position'){
      let position = this.UI.card.position;
      this.moveTo(position, true);
    }
    else if(type === 'collect from all'){
      this.collectMoneyFromAll();
    }
    else if(type === 'pay all'){
      this.giveMoneyToAll();
    }
    else if(type === 'jail'){
      this.goToJail();
    }
    else if(type === 'pay'){
      this.payChanceOrCommunity();
    }
    else if(type === 'getPaid'){
      this.collectFromChanceOrCommunity();
    }
  }

  /** AFTER DICE ROLL */

  private openBuyBlockDialog(block: any){
    let cls = block.cls.split(' ').pop();
    this.helpers.openDialog({
      headerText: `${block.continent} - ${block.verb}`,
      template: this.cardTmpl,
      cls: cls,
    });
  }

  private payRentForCountry(block: any, player: any){
    let rent = block.rents[block.building];
    this.showCellAnimation(this.UI.currentBlock, `-${rent}`, 'rgba(255,0,0,.5)');
    player.money-= rent;
    this.players[block.ownedBy].money+= rent;
  }

  private payRentForRailroad(block: any, player: any){
    let rail1 = this.board['20'];
    let rail2 = this.board['57'];
    let tripCost = block.tripCost;
    //if the same player owns both the stations double the price
    if( (rail1.ownedBy > -1) && rail1.ownedBy === rail2.ownedBy ){
      tripCost = tripCost*2;
    }
    this.showCellAnimation(this.UI.currentBlock, `-${tripCost}`, 'rgba(255,0,0,.5)');
    player.money-= tripCost;
    this.players[block.ownedBy].money = this.players[block.ownedBy].money+block.rent;    
  }

  private checkCountryOrRailoadBlock(block: any, player: any):any{
    //owned by the current player
    if(block.ownedBy === this.game.currentPlayer){
      return;
    }

    //owned by other player
    if( block.ownedBy > -1 ){
      (block.type === 'country') ? this.payRentForCountry(block, player) :
                                   this.payRentForRailroad(block, player);
      return;
    }
    
    //havent got enough money so stop here
    if(player.money < block.cost){
      return false;
    }

    //finally if we get till here open buy dialog
    this.openBuyBlockDialog(block);
  }

  private openCasinoDialog(block:any){
    this.helpers.openDialog({
      headerText: `Casino  ${block.verb}`,
      template: this.casinoTmpl,
      cls: 'mat-pink',
    });   
  }

  checkBoardBlock():any{
    let player = this.players[this.game.currentPlayer];
    let position = player.position;
    this.UI.currentBlock = this.UI.blocks[position];
    let block = this.board[this.UI.currentBlock];
    
    if(block.type === 'country' || block.type === 'railroad'){
      this.checkCountryOrRailoadBlock(block, player);
    }
    else if(block.type === 'edge'){
      if(block.verb === 'Go to Jail'){
        this.goToJail();
      }
    }
    else if(block.type === 'community' || block.type === 'chance'){
      this.openChestAndChanceDialog();
    }
    else if(block.type === 'casino'){
      this.openCasinoDialog(block);
    }
  }

  buyBlock(){
    let block = this.board[this.UI.currentBlock];
    let cost = block.cost;
    let player = this.players[this.game.currentPlayer];
    let blockCode = this.UI.blocks[player.position];
    player.money-= cost;
    block.ownedBy = this.game.currentPlayer;

    if(!player.cards[block.continent]){
      player.cards[block.continent] = [blockCode];
    }
    else{
      player.cards[block.continent].push(blockCode);
    }
    this.helpers.closeAllDialogs();
    //console.log(this.players);
  }

  onSlotEnd(e:number){
    //this.helpers.closeAllDialogs();
    let player = this.players[this.game.currentPlayer];
    player.money+=e;
    let bg = e > 0 ? 'rgba(0,128,0,.5)' : 'rgba(255,0,0,.5)';
    this.showCellAnimation(this.UI.currentBlock, `${e}`, bg);
  }
  
  openCountryInfoDialog(card:any){
    let block = this.board[card];
    this.UI.selectedBlock = block;
    let cls = block.cls.split(' ').pop();
    this.helpers.openDialog({
      headerText: `${block.continent} - ${block.verb}`,
      template: this.countryInfoTmpl,
      cls: cls,
    });
  }

  build(){
    let level = this.UI.selectedBlock.building;
    let cost = this.UI.selectedBlock.buildCosts[level];
    this.UI.selectedBlock.building+=1;
    this.players[this.game.currentPlayer].money-= cost;
  }

  //emittedEvents{roomId:number type:string player:number info:any}

  /** EMIT EVENTS *******************************************/

  async emitPlayerMove(playerIndex: number, diceTotal: number){
    let counter = 0;
    let player = this.players[playerIndex];
    //move Interval
    return new Promise((resolve, reject) => {
      this.playerInterval = setInterval(()=>{
        player.position+=1;
        //reached the start
        if( player.position > 27){
          this.showCellAnimation('00', `+${this.game.passFromStartMoney}`, 'rgba(0,128,0,.5)');
          player.position = 0;
          //@todo decide what to do with the money
          //player.money+= this.game.passFromStartMoney;
        }
        //give player position until he finishes
        player.cls = this.UI.playerClsPrefix+this.UI.blocks[player.position];
        counter+=1;
        if(counter >= diceTotal){
          clearInterval(this.playerInterval);
          //@todo decide what to show
          //this.checkBoardBlock();
          resolve('emitPlayerMoveFinished');
        }
      //@todo should be a little faster so the gap between requests closes
      }, 100);
    });

  }

  renderDice(diceOne:number, diceTwo: number) {
    let elDiceOne = document.getElementById('dice1');
    let elDiceTwo = document.getElementById('dice2');
    elDiceOne.classList.add('show-' + diceOne);
    elDiceTwo.classList.add('show-' + diceTwo);
  }


}
