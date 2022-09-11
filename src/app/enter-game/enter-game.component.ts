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

  availTablesInterval: any;

  newGameForm = {
    name: '',
    numOfPlayers: 2,
    pass: '',
    tableName: ''
  };

  enterGameForm = {
    name: '',
  }

  selectedIndex = 0;
  availableGames: any;

  constructor(
    public helpers: HelpersService,
    private apiService: MonopolyService
  ) { }

  async ngOnInit() {
    await this.checkAvailableGames();
    this.availTablesInterval = setInterval(async() => {
      await this.checkAvailableGames();
    }, 3000);

  }

  async ngOnDestroy() {
    clearInterval(this.availTablesInterval);
  }



  async checkAvailableGames(){
    let games = await this.apiService.getAvailableGames();
    this.availableGames = games.map((game) => {
      game.players = JSON.parse(game.players);
      return game;
    });
  }

  async createGame(){

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

}
