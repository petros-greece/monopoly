import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http'; 
import { ToastrModule } from 'ngx-toastr';
import { DialogModule } from './dialog/dialog.module';
import { MaterialModule } from './material/material.module';
import { FormsModule } from '@angular/forms';
import { DiceComponent } from './dice/dice.component';
import { PlayerComponent } from './player/player.component';
import { BuildingComponent } from './building/building.component';
import { SlotMachineComponent } from './slot-machine/slot-machine.component';

@NgModule({
  declarations: [
    AppComponent,
    DiceComponent,
    PlayerComponent,
    BuildingComponent,
    SlotMachineComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    DialogModule,
    MaterialModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
