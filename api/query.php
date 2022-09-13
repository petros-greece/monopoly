<?php
//session_start();
require_once('./connect_db.php');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Request-Method: GET, POST');

$requestMethod = $_SERVER["REQUEST_METHOD"];

function createGame($gameObj){
	global $conn;
	if(!$gameObj->name || !$gameObj->numOfPlayers){
		json_encode( ['error' => 'The info is not correct'] );
	}
	$query = $conn->prepare("INSERT INTO monopoly_game (players, num_players, password, table_name) 
	                        VALUES (:players, :numPlayers, :password, :tableName)");
	$query->execute([ 
		":players" => json_encode( [ $gameObj->name ] ), 
		":numPlayers" => $gameObj->numOfPlayers,
		":password" => $gameObj->pass,
		":tableName" => $gameObj->tableName
	]);
	return $conn->lastInsertId();
} 

function addPlayerToGame($gameId, $player, $pass){
	global $conn;
	$pass = !$pass ? 0 : (int)$pass;
	$query = $conn->prepare("SELECT * FROM monopoly_game WHERE id = :gameId AND password = :pass");
	$query->execute([ ":gameId" => $gameId, ":pass" => $pass ]);
	$game = $query->fetch(PDO::FETCH_ASSOC);
	if(!$game){
		return json_encode(['error' => 'The password is not correct!!']);
	}	
	if($game['has_started'] === 1){
		return json_encode(['error' => 'The table is already full!']);
	}

	
	$players = json_decode($game['players'], true);
	array_push($players, $player);
	$hasStarted = 0;
	
	if( count($players) === (int)$game['num_players']){
		$hasStarted = 1;
	}
	
	$query = $conn->prepare("UPDATE monopoly_game SET 
	players = :players, has_started = $hasStarted WHERE id = :gameId");
	$query->execute([
		":players" => json_encode($players), 
		":gameId" => $gameId
	]);   
	return json_encode( [
		'hasStarted' => $hasStarted, 
		'playerIndex' => (count($players)-1),
		'count($players)' => count($players),
		'$game[num_players]' => $game['num_players']
	] );
}

function getAvailableGames(){
	global $conn;
	$now = (int)time();
	$now = $now - (160*60);
	$beforeNow = (string)date("Y-m-d H:i:s", $now);
	
	$query = $conn->prepare("SELECT * FROM monopoly_game WHERE has_started = 0 
	AND created >= :beforeNow LIMIT 10");
	$query->execute([':beforeNow' => $beforeNow]);
	$games = $query->fetchAll(PDO::FETCH_ASSOC);
	return json_encode($games, JSON_NUMERIC_CHECK);
}

function getGames($limit, $offset){
	global $conn;	
	$query = $conn->prepare("SELECT * FROM monopoly_game WHERE has_started = 1 
	ORDER BY id DESC LIMIT $limit OFFSET $offset");
	$query->execute();
	$games = $query->fetchAll(PDO::FETCH_ASSOC);
	return json_encode($games, JSON_NUMERIC_CHECK);
}

function getGameInfo($gameId){
	global $conn;
	$query = $conn->prepare("SELECT * FROM monopoly_game WHERE id = :gameId");	
	$query->execute( [ ':gameId' => $gameId ] );
	$game = $query->fetch(PDO::FETCH_OBJ);
	return json_encode($game, JSON_NUMERIC_CHECK); 
}


/** *********************************/

function insertGameEvent($eventObj){
    global $conn;	
	$gameId = $eventObj->gameId;
	$info = json_encode($eventObj->info);
	$playerIndex = $eventObj->playerIndex;
	$query = $conn->prepare("INSERT INTO monopoly_board_turn_events (game_id, event_info, player_index) 
    VALUES (:gameId, :info, :playerIndex)");
    $query->execute([ ':gameId' => $gameId, ':info' => $info, ":playerIndex" => $playerIndex]);
    return json_encode(['id'=>$conn->lastInsertId()]);
}

function getGameEvents($gameId, $lastSeenEventId){
    global $conn;	
	$query = $conn->prepare("SELECT * FROM monopoly_board_turn_events WHERE id > :id AND game_id = :gameId");
    $query->execute([ ':gameId' => $gameId,':id' => $lastSeenEventId]);
	$response = $query->fetchAll(PDO::FETCH_ASSOC);
    return json_encode($response, JSON_NUMERIC_CHECK);
}




if( $requestMethod === 'POST' ){

  $data = json_decode(file_get_contents('php://input'));

  if( isset($data->createGame) ){
	echo createGame($data->createGame);
	exit();
  }
  else if( isset($data->addPlayerToGame) ){
    echo addPlayerToGame($data->gameId, $data->addPlayerToGame, $data->pass);
	//return json_encode($data);
    exit();
  }
  else if( isset($data->newGameEvent) ){
    echo insertGameEvent( $data->newGameEvent );
    exit();
  }

}

if( $requestMethod === 'GET' ){


	if( isset( $_GET['availableGames'] ) ){
		echo getAvailableGames();
		exit();
	}
	else if( isset( $_GET['gameInfo'] ) ){
		echo getGameInfo($_GET['gameInfo']);
		exit();
	}
	else if( isset( $_GET['lastSeenEventId'] ) ){
		echo getGameEvents($_GET['gameId'], $_GET['lastSeenEventId']);
		exit();
	}	
	else if( isset( $_GET['historyGames'] ) ){
		echo getGames($_GET['limit'], $_GET['offset']);
		exit();
	}		
	

	
}


exit();






?>
