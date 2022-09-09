import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HelpersService } from '../service/helpers.service';
import { MonopolyService } from '../service/monopoly-api.service';

@Component({
  selector: 'app-enter-game',
  templateUrl: './enter-game.component.html',
  styleUrls: ['./enter-game.component.scss']
})
export class EnterGameComponent implements OnInit {

  @Output("onEnterGame") public onEnterGame: EventEmitter<any> = new EventEmitter<any>();

  newGameForm = {
    name: 'testing',
    numOfPlayers: 2,
    pass: '',
    tableName: ''
  };

  enterGameForm = {
    name: 'jhg',
  }

  selectedIndex = 1;
  availableGames: any;

  constructor(
    public helpers: HelpersService,
    private apiService: MonopolyService
  ) { }

  async ngOnInit() {
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

  async enterBoardGame(game: any, pass?:string){
    if(!this.enterGameForm.name){
      this.helpers.showToastrError('You name is required!');
      return;
    }    
    let res = await this.apiService.addPlayerToGame(this.enterGameForm.name, game.id);
    this.onEnterGame.emit({gameId: game.id, playerIndex: res.playerIndex });
  }

}
