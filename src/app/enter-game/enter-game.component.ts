import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { HelpersService } from '../service/helpers.service';
import { MonopolyService } from '../service/monopoly-api.service';

@Component({
  selector: 'app-enter-game',
  templateUrl: './enter-game.component.html',
  styleUrls: ['./enter-game.component.scss']
})
export class EnterGameComponent implements OnInit , OnDestroy{

  @Output("onEnterGame") public onEnterGame: EventEmitter<any> = new EventEmitter<any>();
  @Output("onRenderFromHistory") public onRenderFromHistory: EventEmitter<any> = new EventEmitter<any>();


  //onRenderFromHistory
  availTablesInterval: any;

  newGameForm = {
    name: '',
    numOfPlayers: 2,
    pass:<any> '',
    tableName: ''
  };

  enterGameForm = {
    name: '',
  }

  selectedIndex = 0;
  availableGames: any;
  historyGames: any;

  constructor(
    public helpers: HelpersService,
    private apiService: MonopolyService
  ) { }

  async ngOnInit() {
    await this.checkAvailableGames();
    await this.checkAvailTablesInterval();

  }

  async ngOnDestroy() {
    clearInterval(this.availTablesInterval);
  }

  async checkAvailTablesInterval(){
    this.availTablesInterval = setInterval(async() => {
      await this.checkAvailableGames();
    }, 3000);
  }

  async checkAvailableGames(){
    let games = await this.apiService.getAvailableGames();
    let mappedGames = games.map((game) => {
      game.players = JSON.parse(game.players);
      return game;
    });
    this.availableGames = mappedGames;
  }

  async createGame(){
    if(this.newGameForm.pass && (this.newGameForm.pass > 9999)){
      this.helpers.showToastrError('The password cannot be larger than 4 digits!');
      return;
    }

    if(!this.newGameForm.name){
      this.helpers.showToastrError('You name is required!');
      return;
    }
    let gameId = await this.apiService.createGame(this.newGameForm);
    this.onEnterGame.emit({gameId: gameId, playerIndex: 0});
  }

  async enterBoardGame(game: any, pass?:number){
    if(!this.enterGameForm.name){
      this.helpers.showToastrError('You name is required!');
      return;
    }    
    let res = await this.apiService.addPlayerToGame(this.enterGameForm.name, game.id, pass);
    this.onEnterGame.emit({gameId: game.id, playerIndex: res.playerIndex });
  }

  togglePassMenu(openOrClose:string){
    if(openOrClose === 'open'){
      clearInterval(this.availTablesInterval);
    }
    else{
      this.checkAvailTablesInterval();
    }
  }

  async onTabChange(event:any){
    console.log(event.index);
    if(event.index === 2 && !this.historyGames){
      this.historyGames = await this.apiService.getHistoryGames(0, 10);
    }

  }

  renderFromHistory(gameId: number){
    this.onRenderFromHistory.emit({gameId: gameId });
  }


}
