import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Observable, of, timer, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { environment } from './../../environments/environment';
import { HelpersService } from './helpers.service';

export interface GameI {
  id: number;
  players: string;
  num_players: number;
  has_started: number;
  table_name: string;
  password: number;
  created: string;
  updated: string;
  [propName: string]: any;
}


export interface BoardTurnI {
  id: number;
  game_id: number;
  board_snapshot: any;
  turn_events: any;
  dice: any;
  player_index: number;
  created: number;
  updated: number;
  [propName: string]: any;
}

@Injectable({
	providedIn: 'root' 
})

export class MonopolyService {
  environment:any;
  endpoint = 'http://localhost/monopoly/api/query.php';

  constructor(
    private router: Router,
    private toastr : ToastrService,
    private http : HttpClient,
    private helpers: HelpersService 
  ) { 
    this.environment = environment;
    if(this.environment.production){
      this.endpoint = 'https://siteland.eu/chat/api/query.php';
    }
  }

  showToastrError(msg: string, title: string = '', opts: any = {}){
    this.toastr.error(msg, title, opts);
  }

  validateEmail(email: string){
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  async getData( urlParams : any ) : Promise<any>{
    return this.http.get(this.endpoint, { params: urlParams }).
      pipe(catchError(err => { throw 'error in source. Details: ' + err; })).
      toPromise();
  }

  async postData( data : any ) : Promise<any>{
    let res:any = await this.http.post(this.endpoint, data).toPromise();
    if(res.error){
      this.toastr.error(res.error);
      return null;
    }
    return res;
  }  

  async createGame( gameObj: any) : Promise<number>{
    return await this.postData({
      createGame: gameObj
    });
  }

  async addPlayerToGame(player: any, gameId:number, pass?:number) : Promise<{hasStarted: boolean, playerIndex: number}>{
    return await this.postData({
      addPlayerToGame: player,
      gameId: gameId,
      pass: pass
    });
  }

  async getAvailableGames(): Promise<GameI[]>{
    return await this.getData({
      availableGames: true,
    });      
  }

  async getGameInfo(gameId:number) : Promise<GameI>{
    return await this.getData({
      gameInfo: gameId,
    });     
  }



  async newBoardTurn(gameId: number, playerIndex: number) : Promise<{id:number}> {
    return await this.postData({
      newBoardTurn: true,
      gameId: gameId,
      playerIndex: playerIndex 
    });
  }

  async addDiceToBoardTurn(boardId: number, diceObj: any) : Promise<{status:string}>{
    return await this.postData({
      diceToBoardTurn: true,
      boardId: boardId,
      diceObj: diceObj 
    });
  }

  async finalizeBoardTurn(boardId: number, boardSnapshot: any, turnEvents: any[]) : Promise<{status:string}>{
    return await this.postData({
      finalizeBoardTurn: true,
      boardId: boardId,
      turnEvents: turnEvents,
      boardSnapshot: boardSnapshot
    });    
  }

  async getLastBoardTurnForGame(gameId:number):Promise<BoardTurnI>{
    return await this.getData({
      lastBoardTurnForGame: gameId,
    });
  }

  async getBoardTurnById(id:number):Promise<BoardTurnI>{
    return await this.getData({
      boardTurnById: id,
    });
  }

  async getLastBoardTurnWithEvents(gameId:number):Promise<BoardTurnI>{
    return await this.getData({
      lastBoardTurnWithEvents: gameId,
    });
  }

  async getBoardTurnForGame(gameId: number, offset: number):Promise<BoardTurnI | any >{
    return await this.getData({
      boardTurnForGame: true,
      gameId: gameId,
      offset: offset
    });      
  }







  async getMainMessages(userId: string){
    return await this.getData({
      mainMessages: true,
      userId: userId
    });      
  }




}

