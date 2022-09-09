import { NgModule } from "@angular/core";
import { 
  AbbreviationPipe,
  FormatDatePipe,
  MatInactivePipe
} from './game.pipe';

const GamePipes = [
  AbbreviationPipe, 
  FormatDatePipe, 
  MatInactivePipe
];

@NgModule({
  declarations: GamePipes,
  exports: GamePipes
})
export class GamePipesModule {}
