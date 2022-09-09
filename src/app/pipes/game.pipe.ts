import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';


@Pipe({ name: 'abbreviation' })
export class AbbreviationPipe implements PipeTransform {
  transform(val:string) {
    if(!val){return ''};
    let final = '';
    for(let letter of val.split(' ')){
      final += letter[0]+'.'
    }
    val = final
    return val;   
  };
};

@Pipe({ name: 'formatDate' })
export class FormatDatePipe implements PipeTransform {
  transform(date: any) {
    return new Date(date).toLocaleString('el-GR', {/* dateStyle: 'medium',  timeStyle: 'short',*/ hour12: false });  
  };
};

@Pipe({ name: 'matIcon' })
export class MatIconPipe implements PipeTransform {
  transform(iconName: string) {
    return `<mat-icon>${iconName}</mat-icon>`;  
  };
};

@Pipe({ name: 'inactivePlayers' })
export class MatInactivePipe implements PipeTransform {
  transform(players:any) {
    return players.filter((p:any)=>{
      return p.isActive;
    }); 
  };
};













