import { Component, OnInit, ViewChild, TemplateRef, HostListener, AfterViewInit } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { CardsService } from './service/cards.service';
import { HelpersService } from './service/helpers.service';
import { BoardTurnI, GameI, MonopolyService } from './service/monopoly-api.service';

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
  @ViewChild('enterGameTmpl', {static: true}) enterGameTmpl: TemplateRef<any>;
  @ViewChild('gameRulesTmpl', {static: true}) gameRulesTmpl: TemplateRef<any>;
  @ViewChild('auctionTmpl', {static: true}) auctionTmpl: TemplateRef<any>;
 
  @ViewChild('mainMenuTrigger') mainMenuTrigger: MatMenuTrigger;

  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    this.resizeBoard();
  }

  playerInterval:any;
  gameInterval  :any;
  timerInterval : any;
  auction: any;
  auctionInterval: any;



  timers = {
    checkBoardPlayers: 3000,
    myPlayerMove: 200,
    yourPlayerMove: 100,
    gameInterval: 2500
  }

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
    canRoll: false,
    showNextPlayer: false,
    boardCls: 'board-lg',
    playerClsPrefix: 'player-position-', 
    blocks: [ '00', '01', '02', '03', '04', '05', '06', '07', '17', '27', '37', '47', '57', '67', '77', '76', '75', '74', '73', '72', '71', '70', '60', '50', '40', '30', '20', '10' ], 
    currentBlock: '00',
    selectedBlock:<any> {},
    selectedBlockIndex: -1,
    card:<any> {},
    continents: [
      {name: 'Africa', cls: 'mat-brown'}, 
      {name: 'Europe', cls: 'mat-red'}, 
      {name: 'Asia', cls: 'mat-green-700'}, 
      {name: 'America', cls: 'mat-blue'}
    ]
  };

  game = {
    currentPlayer: 0,
    playAgain: false,
    initMoney: 1000,
    passFromStartMoney: 200,
    turn: 0,
    id: 1,
  }

  boardTurn:any = {};

  emittedEvents = {
    diceRoll: false,
    turnEvents: false
  };


  myPlayerIndex: number;

  lastEmittedEventId = 0;

  players = [
    {
      name: 'Player 1',
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
      name: 'Player 2',      
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
      name: 'Player 3',
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
      name: 'Player 4',
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
    '27': { type: 'casino',        continent: '',         verb: 'Bellagio',          img: './assets/images/casino.png',       cost: 0,   ownedBy: -1, cls: 'rotate-right' },
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
    '50': { type: 'casino',        continent: '',         verb: 'Estoril',            img: './assets/images/casino.png',        cost: 0,   ownedBy: -1, cls: 'rotate-left' }, 
    '40': { type: 'country',       continent: 'America',  verb: 'Canada',            img: '',                                   cost: 55, ownedBy: -1, cls: 'rotate-left mat-blue', buildCls: 'building-left' }, 
    '30': { type: 'country',       continent: 'America',  verb: 'Brazil',            img: '',                                   cost: 75, ownedBy: -1, cls: 'rotate-left mat-blue', buildCls: 'building-left' }, 
    '20': { type: 'railroad',      continent: 'Railroal', verb: 'Toronto Union Station',img: './assets/images/railroad.png',    cost: 150,ownedBy: -1, cls: 'rotate-left' }, 
    '10': { type: 'country',       continent: 'America',  verb: 'USA',               img: '',                                   cost: 115,ownedBy: -1, cls: 'rotate-left mat-blue', buildCls: 'building-left' }, 
      
    '22': { type: 'card',          continent: '',         verb: 'Community Chest',   img: './assets/images/chest.png',          cost: 0,  ownedBy: -1, cls: 'rotate-135 mat-blue' }, 
    '55': { type: 'card',          continent: '',         verb: 'Chance',            img: './assets/images/chance.png',         cost: 0,  ownedBy: -1, cls: 'rotate-315 mat-orange' }, 
    

  }
  
  //used for info
  filteredBoard: any[];
  filteredRailroads: any[];

  constructor(
    public helpers: HelpersService,
    public cardsService: CardsService,
    public apiService: MonopolyService
    ){
    

 
  }
 
  async ngOnInit() {

    this.openEnterGameDialog();
    this.resizeBoard();
    this.calculateBuildingPrices();
    this.getFilteredBoard();
    //this.renderGameFromHistory(1);
  }

  renderFromHistory(e){
    this.renderGameFromHistory(e.gameId);
  }


  /** BEFORE  ************************/

  openRulesDialog(){
    this.helpers.openDialog({
      headerText: `Sitelandopoly Rules & Info`,
      template: this.gameRulesTmpl,
    });
  }

  filterPlayers(players:any[]):any[]{
    return players.filter((p:any)=>{
      return p.isActive;
    });
  }

  openEnterGameDialog(){
    this.helpers.openDialog({
      headerText: `Sitelandopoly`,
      template: this.enterGameTmpl,
    });
  }

  async checkBoardPlayers() : Promise<GameI>{
    this.helpers.showToastrInfo('Waiting for other players to enter', '', 
    {timeOut: (this.timers.checkBoardPlayers-100), easing: 'ease-in-out'});
    let res = await this.apiService.getGameInfo(this.game.id);
    let names = JSON.parse(res.players);
    for(let i = 0, len = names.length; i < len; i+=1){
      this.players[i].isActive = true;
      this.players[i].name = names[i];
    }
    return res;    
  }

  async enterGame(e:{gameId: number, playerIndex: number}){
    this.helpers.closeAllDialogs();
    this.myPlayerIndex = e.playerIndex;
    this.game.id = e.gameId;
    let res = await this.checkBoardPlayers();
    this.playerInterval = setInterval(async()=>{
      res = await this.checkBoardPlayers();
      if( res['has_started'] ){
        clearInterval(this.playerInterval);
        if(window.innerWidth > 700){     
          this.mainMenuTrigger.openMenu();
        }        
        this.UI.canRoll = true;
        this.helpers.showToastrSuccess('The game has began!!');
        this.monopolyInterval();
        this.runTimerInterval();
      } 
    }, this.timers.checkBoardPlayers);
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
    //console.log(this.board);

  }

  getFilteredBoard(){
    let board = this.helpers.clone(this.board);
    let boardArr = [];
    let railroadArr = [];
    for(let prop in board){
      if( board[prop].type === 'country'){
        board[prop].cls = (board[prop].cls).split(' ').pop();
        boardArr.push(board[prop]);
      }
      else if( board[prop].type === 'railroad'){
        railroadArr.push(board[prop]);
      }
    }

    this.filteredRailroads = railroadArr;
    this.filteredBoard = boardArr.sort((a,b) => (a.continent > b.continent) ? 1 : ((b.continent > a.continent) ? -1 : 0));
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
    this.gameInterval = setInterval(async()=>{

      //if is not me render the the emitted events
      if(this.game.currentPlayer !== this.myPlayerIndex){
        
        let emittedEvents = await this.apiService.getEventsForGame(this.game.id, this.lastEmittedEventId);
        if( emittedEvents.length ){
          this.lastEmittedEventId = emittedEvents[emittedEvents.length-1].id;
          await this.renderUnseenEmittedEvents(emittedEvents);
          this.checkBankruptedPlayers();
        }     
      }
    }, this.timers.gameInterval);
  }

  runTimerInterval(){
    this.timerInterval = setInterval(()=>{
      if(this.UI.timer >= 0){
        this.UI.timer-= 1;
      }
      else{
        //@todo inactivate player if he looses his turn 3 times in the row
        this.nextTurn();
      }
    }, 1000);
  }

  /** INTERVAL CHECKS */

  checkBankruptedPlayers(){
    for(let i =0, len = this.players.length; i < len; i+=1){
      if(this.players[i].money < 0){
        this.players[i].isActive = false;
        for(let prop in this.board){
          if(this.board[prop].ownedBy === i){
            this.board[prop].ownedBy = -1;
            this.board[prop].building = 0;
          }
        }
      }
    }
  }


  /** PLAYER TURN AND MOVEMENT *****************/

  findNextPlayerToPlay(){
    let foundAscPlayer = false;
    while( (this.game.currentPlayer < (this.players.length-1)) && !foundAscPlayer){
      let player = this.players[this.game.currentPlayer+1];
      this.game.currentPlayer+=1; 
      if(player.isActive && !player.looseNextTurn){
        foundAscPlayer = true;
      }
      else if(player.isActive && player.looseNextTurn){
        player.looseNextTurn = false;
      }
    }
    if(!foundAscPlayer){
      this.game.currentPlayer = 0;
    }
  }

  //Emitted after the next button clicked and also when the time ends
  async nextTurn(){
      //console.log('Change Turn');
      this.UI.canRoll = true;
      this.UI.showNextPlayer = false;
      this.UI.timer = 30;
      
      //if the player is marked to play again, unmark him and stop here only if he didn go to jail
      if(this.game.playAgain){
        this.game.playAgain = false;
        if(!this.players[this.game.currentPlayer].looseNextTurn){
          return;
        }
      }
   
      //give next player index
      this.findNextPlayerToPlay();
      
      //if has 'loose turn' flag, unflag him and move to the next
      //this only happens when we reach to the end and the first player is
      //flagged as loose their turn
      if(this.players[this.game.currentPlayer].looseNextTurn){
        this.players[this.game.currentPlayer].looseNextTurn = false;
        this.findNextPlayerToPlay();
      }
      this.emitEvent({nextTurn: this.game.currentPlayer}); 
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

  moveTo(position:number, collectFromStart:boolean, playerIndex = -1){
    let index = (playerIndex > -1) ? playerIndex : this.game.currentPlayer;
    let player = this.players[index];
    if(collectFromStart && player.position > position){
      player.money+= this.game.passFromStartMoney;
    }
    player.position = position;
    player.cls = this.UI.playerClsPrefix+this.UI.blocks[player.position];
    if(playerIndex === -1){
      this.checkBoardBlock();
    }
    else{          
      let blockKey = this.UI.blocks[player.position];
      let block = this.board[blockKey];
      //owned by other player
      if((block.ownedBy > -1) && (block.ownedBy !== playerIndex)){
        (block.type === 'country') ? this.payRentForCountry(block, player, blockKey) :
                                    this.payRentForRailroad(block, player, blockKey);
      }
    }
  }

  //emitted
  async movePlayer(e: any){
    let num = e.diceOne+e.diceTwo;
    let counter = 0;
    let ind = this.game.currentPlayer;
    let player = this.players[ind];
    this.UI.canRoll = false;
    //if is the second/third... time to play in the row restart timer
    //also finalize turn data
    if(this.game.playAgain){
      this.UI.timer = 30;
    }

    //in doubles you play again only if the landing cell is not 'Go to Jail'
    if( (e.diceOne === e.diceTwo) && (player.position + num !== 21)){
      this.helpers.showToastrSuccess('Doubles! You play again!');
      this.game.playAgain = true;
      this.emitEvent({ doubles: true });
    }
    else{
      this.game.playAgain = false;
    }

    //no need for if just for safety measurements
    if(this.game.currentPlayer === this.myPlayerIndex){
      await this.emitEvent({dice: { d1: e.diceOne , d2: e.diceTwo }});
    }
    
    //move Interval
    this.playerInterval = setInterval(() => {
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
        if( (e.diceOne === e.diceTwo) && (player.position + num !== 21)){
          this.UI.canRoll = true;
          this.UI.showNextPlayer = false;
        }
        else{
          this.UI.showNextPlayer = true; 
        }
      }
    }, this.timers.myPlayerMove);
  }

  private async emitEvent(info:any){
    let e = await this.apiService.insertGameEvent({
      gameId: this.game.id,  
      info: info, 
      playerIndex: this.myPlayerIndex
    }); 
    this.lastEmittedEventId = e.id; 
  }

  /** BLOCK SPECIFIC ACTIONS *****************/

  //emitted from cards
  private goToJail(playerIndex = -1){
    let player = (playerIndex > -1) ? this.players[playerIndex] : this.players[this.game.currentPlayer];
    this.helpers.showToastrError('Jailed! You miss next turn!');
    this.UI.currentBlock = '07';
    player.cls = this.UI.playerClsPrefix+'07';
    player.position = 7;
    player.looseNextTurn = true;
  }

  private async openChestAndChanceDialog(){
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
    },
    {
      id: 'chestAndChanceDialog'
    });
    await this.helpers.pause(1000);
    this.doActionForChanceOrCommunity();

  }

  private collectMoneyFromAll(card:any = {}, playerIndex = -1){
    //@todo filter out finished players (no money)
    let len = this.players.length;
    let money = card.money ? card.money : this.UI.card.money;
    let current = playerIndex > -1 ? playerIndex : this.game.currentPlayer;
    for( let i = 0; i < len; i +=1 ){
      if( i !== current && this.players[i].isActive ){
        this.players[i].money-= money;
        this.players[current].money+= money;
      }
    }
  }

  private giveMoneyToAll(card:any = {}, playerIndex = -1){
    //@todo filter out finished players (no money)
    let len = this.players.length;
    let money = card.money ? card.money : this.UI.card.money;
    let current = playerIndex > -1 ? playerIndex : this.game.currentPlayer;
    for(let i=0; i < len; i+=1){
        if(i !== current && this.players[i].isActive){
          this.players[i].money+= money;
          this.players[current].money-= money;
        }
    } 
  }

  private payChanceOrCommunity(card:any = {}, playerIndex = -1){
    //@todo filter out finished players (no money)
    let money = card.money ? card.money : this.UI.card.money;
    let current = playerIndex > -1 ? playerIndex : this.game.currentPlayer;
    this.players[current].money-= money;
  }

  private collectFromChanceOrCommunity(card:any = {}, playerIndex = -1){
    //@todo filter out finished players (no money)
    let money = card.money ? card.money : this.UI.card.money;
    let current = playerIndex > -1 ? playerIndex : this.game.currentPlayer;
    this.players[current].money+= money;   
  }

  //emitted
  async doActionForChanceOrCommunity(card:any = {}, playerIndex = -1){
    let type = card.type ? card.type : this.UI.card.type;
    if(type === 'position no money'){
      let position = card.position ? card.position : this.UI.card.position;
      this.moveTo(position, false, playerIndex);
    }
    else if(type === 'position'){
      let position = card.position ? card.position : this.UI.card.position;
      this.moveTo(position, true, playerIndex);
    }
    else if(type === 'collect from all'){
      this.collectMoneyFromAll(card, playerIndex);
    }
    else if(type === 'pay all'){
      this.giveMoneyToAll(card, playerIndex);
    }
    else if(type === 'jail'){
      this.goToJail();
    }
    else if(type === 'pay'){
      this.payChanceOrCommunity(card, playerIndex);
    }
    else if(type === 'getPaid'){
      this.collectFromChanceOrCommunity(card, playerIndex);
    }

    if(playerIndex === -1){
      await this.emitEvent({card: this.UI.card});
    }

  }

  /** AFTER DICE ROLL */
  private openBuyBlockDialog(block: any){
    let cls = block.cls.split(' ').pop();
    this.helpers.openDialog({
      headerText: `${block.continent} - ${block.verb}`,
      template: this.cardTmpl,
      cls: cls,
    },
    {id: 'buyBlockDialog'});
  }

  private payRentForCountry(block: any, player: any, blockKey?: string){
    let rent = block.rents[block.building];
    let key = blockKey ? blockKey : this.UI.currentBlock;
    this.showCellAnimation(key, `-${rent}`, 'rgba(255,0,0,.5)');
    player.money-= rent;
    this.players[block.ownedBy].money+= rent;
  }

  private payRentForRailroad(block: any, player: any, blockKey?: string){
    let rail1 = this.board['20'];
    let rail2 = this.board['57'];
    let tripCost = block.tripCost;
    //console.log(tripCost);
    let key = blockKey ? blockKey : this.UI.currentBlock;
    //if the same player owns both the stations double the price
    if( (rail1.ownedBy > -1) && rail1.ownedBy === rail2.ownedBy ){
      tripCost = tripCost*2;
    }
    this.showCellAnimation(key, `-${tripCost}`, 'rgba(255,0,0,.5)');
    player.money-= tripCost;
    this.players[block.ownedBy].money+= tripCost;    
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
    },
    {id: 'CasinoDialog'}
    );   
  }

  openCountryInfoDialog(card:string){
    let block = this.board[card];
    if(block.type !== 'country' || block.ownedBy !== this.myPlayerIndex){
      return;
    }
    this.UI.selectedBlock = block;
    this.UI.selectedBlockIndex = this.UI.blocks.indexOf(card);
    let cls = block.cls.split(' ').pop();
    this.helpers.openDialog({
      headerText: `${block.continent} - ${block.verb}`,
      template: this.countryInfoTmpl,
      cls: cls,
    });
  }

  //emitted directly only for jail
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
        this.emitEvent({ jail: true });
      }
    }
    else if(block.type === 'community' || block.type === 'chance'){
      this.openChestAndChanceDialog();
    }
    else if(block.type === 'casino'){
      this.openCasinoDialog(block);
    }
  }

  //emitted
  async buyBlock(){
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
    this.emitEvent({ buyBlockIndex: this.UI.blocks.indexOf(this.UI.currentBlock) });
    //console.log(this.players);
  }

  //emitted
  onSlotEnd(e:number){
    let player = this.players[this.game.currentPlayer];
    player.money+=e;
    let bg = e > 0 ? 'rgba(0,128,0,.5)' : 'rgba(255,0,0,.5)';
    this.showCellAnimation(this.UI.currentBlock, `${e}`, bg);
    this.emitEvent({casino: e});    
  }
  
  //emitted
  build(){
    let level = this.UI.selectedBlock.building;
    let cost = this.UI.selectedBlock.buildCosts[level];
    this.UI.selectedBlock.building+=1;
    this.players[this.game.currentPlayer].money-= cost;
    this.emitEvent({buildBlockIndex: this.UI.selectedBlockIndex}); 
  }

  //emittedEvents{roomId:number type:string player:number info:any}

  /** EMIT EVENTS *******************************************/

  emitGoToJail(playerIndex: number){
    let player = this.players[playerIndex];
    this.helpers.showToastrError(`${player.name} Jailed!`);
    player.cls = this.UI.playerClsPrefix+'07';
    player.position = 7;
    player.looseNextTurn = true;
  }

  createBordSnapshot(){
    let boardState = {};
    (this.UI.blocks).forEach(i => {
      boardState[i] = {
        o: this.board[i].ownedBy,
        b: this.board[i].building
      }
    });    
    return boardState;
  }

  buildBoardFromSnapshot(snapshot: any){
    //boardSnapShot
    for(let prop in snapshot){
      this.board[prop] = Object.assign(this.board[prop], {ownedBy: snapshot[prop].o, building: snapshot[prop].b});
    }
  }

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
          player.money+= this.game.passFromStartMoney;
        }
        //give player position until he finishes
        let blockKey = this.UI.blocks[player.position];
        player.cls = this.UI.playerClsPrefix+blockKey;
        counter+=1;
        if(counter >= diceTotal){
          clearInterval(this.playerInterval); 
          let block = this.board[blockKey];
          //owned by other player
          if( block.ownedBy > -1 && block.ownedBy !== playerIndex){
            (block.type === 'country') ? this.payRentForCountry(block, player, blockKey) :
                                        this.payRentForRailroad(block, player, blockKey);
          }

          resolve('emitPlayerMoveFinished');
        }
      //@todo should be a little faster so the gap between requests closes
      }, this.timers.yourPlayerMove);
    });

  }

  async renderDice(diceOne:number, diceTwo: number) {
    let elDiceOne = document.getElementById('dice1');
    let elDiceTwo = document.getElementById('dice2');

    for (var i = 1; i <= 6; i++) {
      elDiceOne.classList.remove('show-' + i);
      elDiceTwo.classList.remove('show-' + i);
    }

    elDiceOne.classList.add('show-' + diceOne);
    elDiceTwo.classList.add('show-' + diceTwo);
    return new Promise((resolve, reject) => {
      setTimeout(()=>{
        resolve('emitPlayerMoveFinished');
      }, 500);
    });
  }

  emitBuyBlock(playerIndex: number, blockIndex: number){
    let block = this.board[this.UI.blocks[blockIndex]];
    let cost = block.cost;
    let player = this.players[playerIndex];
    let blockCode = this.UI.blocks[player.position];
    player.money-= cost;
    block.ownedBy = playerIndex;

    if(!player.cards[block.continent]){
      player.cards[block.continent] = [blockCode];
    }
    else{
      player.cards[block.continent].push(blockCode);
    }
    this.showCellAnimation(this.UI.blocks[blockIndex], `-${cost} €`);
    //console.log(this.players);
  }

  emitBuild(playerIndex: number, blockIndex: number){
    let block = this.board[this.UI.blocks[blockIndex]];
    let level = block.building;
    let cost = block.buildCosts[level];
    block.building+=1;
    this.players[playerIndex].money-= cost;
    //console.log(block)
    //console.log(this.board);
  }

  emitOnSlotEnd(playerIndex: number, amount: number){
    let player = this.players[playerIndex];
    player.money+=amount;
    let bg = amount > 0 ? 'rgba(0,128,0,.5)' : 'rgba(255,0,0,.5)';
    let currentBlock = this.UI.blocks[this.players[playerIndex].position];
    this.showCellAnimation(currentBlock, `${amount}`, bg);
  }

  async renderUnseenEmittedEvents(e: any[]){
    this.UI.canRoll = false;
    for(let i = 0, len = e.length; i < len; i+=1){
      let event = JSON.parse(e[i]['event_info']);
      let playerIndex = e[i]['player_index'];
      // if(playerIndex === this.myPlayerIndex){
      //   continue;
      // }
      let key = Object.keys(event)[0];
      let val = event[key];

      await this.helpers.pause(1000);
      if(key === 'buyBlockIndex'){
        this.emitBuyBlock(playerIndex, val);
      }
      else if(key === 'card'){ 
        await this.doActionForChanceOrCommunity(val, playerIndex);
        this.helpers.showToastrInfo(val.text);
      }
      else if(key === 'casino'){ 
        this.emitOnSlotEnd(playerIndex, val);
      }
      else if(key === 'jail'){
        this.emitGoToJail(playerIndex);
      }
      else if(key === 'buildBlockIndex'){
        //await this.helpers.pause(5000);
        //console.log(playerIndex, val);
        this.emitBuild(playerIndex, val);
      }
      else if(key === 'dice'){
        await this.renderDice(val.d1, val.d2);
        await this.emitPlayerMove( playerIndex, (val.d1+val.d2) );        
      } 
      else if(key === 'nextTurn'){
        this.game.currentPlayer = val;
        this.UI.timer = 30;
      } 
      else if(key === 'doubles'){
        this.UI.timer = 30;
      }            
      else if(key === 'auction'){
        
      }     
    }
    this.UI.canRoll = true;

  }


  /** AUCTION *********************************************************/

  beginAuction(amount: number){
    console.log(this.UI.selectedBlockIndex);
    //console.log(amount);
    //this.emitEvent( { auction: {amount: amount, blockIndex: this.UI.selectedBlockIndex } } ); 
  }


  openAuctionDialog(){
    
  }



  /** RENDER GAME FROM HISTORY *******************************************/ 

  async renderGameFromHistory(gameId: number){
    this.helpers.closeAllDialogs();
    let info = await this.apiService.getGameInfo(gameId);
    let players = JSON.parse(info['players']);
    //console.log(players)
    for(let i = 0, len = players.length; i < len; i+=1){
      this.players[i].isActive = true;
      this.players[i].name = players[i];

    }
    let e = await this.apiService.getEventsForGame(gameId, 0);
    await this.renderUnseenEmittedEvents(e);
  }
  
}
