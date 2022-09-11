CREATE TABLE `monopoly_game` (
  `id` int(6) UNSIGNED NOT NULL AUTO_INCREMENT,
  `players` json NOT NULL,
  `num_players` int(1) UNSIGNED NOT NULL,
  `has_started` bit DEFAULT 0,
  `table_name` varchar(100) DEFAULT '',
  `password` int(4) UNSIGNED NOT NULL,
  `created` timestamp NOT NULL default current_timestamp,
  `updated` timestamp NOT NULL default current_timestamp on update current_timestamp,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `monopoly_board_turn_events` (
  `id` int(6) UNSIGNED NOT NULL AUTO_INCREMENT,
  `game_id` int(6) UNSIGNED NOT NULL, 
  `event_info` json,
  `player_index` int(1) UNSIGNED,
  `created` timestamp NOT NULL default current_timestamp,
  `updated` timestamp NOT NULL default current_timestamp on update current_timestamp,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`game_id`) REFERENCES monopoly_game(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



`
1. When the dice is rolled a new 'monopoly_board_turn' is created with the dice field filled
2. The other users render the dice, and they mark the dice event as seen.
3. Afterwards they hear for events in the same turn.  
4. When the player changes his/her turn render also the turn events, mark the turn as finished and start to hear events for the next turn
5. If the player does not finishes his/her turn, the timestamp is checked by the other players and when a time of 35 secs exceeded for the last turn,
mark the turn as finished, and force a new one.
6. If a player does not play for three turns in the row he gets banned from the game
`