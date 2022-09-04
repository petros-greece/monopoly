import { Injectable  } from '@angular/core';

@Injectable({
	providedIn: 'root'
})

export class CardsService {
  constructor(){}

  //{verb: '', type: 'position|money|turn|jail|collect|payForProperties'}
  communityCards = [
    {
      text: 'You was convicted convicted of urban planning illegalities. Pay each player 50€', 
      type: 'pay all',
      money: 50
    },
    {
      text: 'Someone saw you with the banker\'s wife. Pay each player 20€, so he don\'t shares your secret.', 
      type: 'pay all',
      money: 20
    },
    {
      text: 'It is your birthday. Collect 20€ from every player', 
      type: 'collect from all',
      money: 20
    }, 
    {
      text: 'Who had massive damages from a hurricane. Collect 50€ from every player', 
      type: 'collect from all',
      money: 50
    },
    {
      text: 'Go to Qatar. If you pass from the start don\'t collect the money.', 
      type: 'position no money',
      position: 15
    },
    {
      text: 'Go to Nigeria. If you pass from the start don\'t collect the money.', 
      type: 'position no money',
      position: 3
    },        
    {
      text: 'Go to Mexico. If you pass from the start don\'t collect the money.', 
      type: 'position no money',
      position: 22
    },     
    {
      text: 'Go to Egypt.', 
      type: 'position',
      position: 5
    },
    {
      text: 'Go to France.', 
      type: 'position',
      position: 10
    },
    {
      text: 'Go to Canada.', 
      type: 'position',
      position: 24
    },
    {
      text: 'Pay 75€ for insurance contributions.', 
      type: 'pay',
      money: 75
    },
    {
      text: 'Speeding fine 15€.', 
      type: 'pay',
      money: 15
    },
    {
      text: 'Speeding fine 15€.', 
      type: 'pay',
      money: 15
    },
    {
      text: 'Give for your bills 45€.', 
      type: 'pay',
      money: 45
    },
    {
      text: 'Bank pays you dividend of 25€.', 
      type: 'getPaid',
      money: 25
    },
    {
      text: 'You inherit 125€.', 
      type: 'getPaid',
      money: 125
    },    
    {
      text: 'Go to Jail. If you pass from the start don\'t collect the money.', 
      type: 'jail'
    },
  ]
  chanceCards = [
    {
      text: 'Go to Canada. If you pass from the start don\'t collect the money.', 
      type: 'position no money',
      position: 24
    },    
    {
      text: 'Go to Germany. If you pass from the start don\'t collect the money.', 
      type: 'position no money',
      position: 13
    },
    {
      text: 'Go to Japan.', 
      type: 'position',
      position: 18
    },  
    {
      text: 'Go to Congo.', 
      type: 'position',
      position: 1
    },  
    {
      text: 'You won 55€ in the lottery!', 
      type: 'getPaid',
      money: 55
    },
    {
      text: 'You won 15€ coupons!', 
      type: 'getPaid',
      money: 15
    },
    {
      text: 'Give to your doctor 35€.', 
      type: 'pay',
      money: 25
    },
    {
      text: 'You had an unfortinate night at the casino. Pay 35€.', 
      type: 'pay',
      money: 35
    },    
    {
      text: 'Go to Jail. If you pass from the start don\'t collect the money.', 
      type: 'jail'
    },        
  ];

  giveChanceCard(){
    let max  = this.chanceCards.length;
    let rand = Math.floor(Math.random()*max);
    return this.chanceCards[rand];
  }

  giveCommunityCard(){
    let max  = this.communityCards.length;
    let rand = Math.floor(Math.random()*max);
    return this.communityCards[rand];
  }

}








