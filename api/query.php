<?php
//session_start();
require_once('./connect_db.php');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Request-Method: GET, POST, PUT, DELETE, OPTIONS');

$requestMethod = $_SERVER["REQUEST_METHOD"];


/*
A player enters the game fills his/her name
1. if there is an available game put him there,
2. else create a new table
*/

/* 



function getOpenedGames(){
	$now = (int)time();
	$now = $now - (5*60);
	$beforeNow = date("Y-m-d H:i:s", $now);
	
	$query = $conn->prepare("SELECT * FROM monopoly_game WHERE has_started = 0 AND created >= $beforeNow LIMIT 10");
	$query->execute();
	$games = $query->fetch(PDO::FETCH_ASSOC);
	return json_encode($games);
}

 */

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

function addPlayerToGame($gameId, $player){
	global $conn;
	$query = $conn->prepare("SELECT * FROM monopoly_game WHERE id = :gameId");
	$query->execute([ ":gameId" => $gameId ]);
	$game = $query->fetch(PDO::FETCH_ASSOC);
	if($game['has_started'] === 1){
		return json_encode(['error' => 'The table is already full!']);
	}
	
	$players = json_decode($game['players'], true);
	array_push($players, $player);
	$hasStarted = 0;
	
	if( count($players) === $game['num_players']){
		$hasStarted = 1;
	}
	
	$query = $conn->prepare("UPDATE monopoly_game SET players = :players, has_started = :hasStarted WHERE id = :gameId");
	$query->execute([
		":players" => json_encode($players), 
		":hasStarted" => $hasStarted, 
		":gameId" => $gameId
	]);   
	return json_encode( ['hasStarted' => $hasStarted, 'playerIndex' => (count($players)-1) ] );
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
	return json_encode($games);
}

function getGameInfo($gameId){
	global $conn;
	$query = $conn->prepare("SELECT * FROM monopoly_game WHERE id = :gameId");	
	$query->execute( [ ':gameId' => $gameId ] );
	$game = $query->fetch(PDO::FETCH_OBJ);
	return json_encode($game); 
}


/* 
function updateGame($id, $players){
  global $conn;
  $query = $conn->prepare("UPDATE monopoly_game SET players = :players WHERE id = :id");
	$query->execute([ 
		":id" => $id, 
		":players" => $players 
	]);
	return json_encode(['status'=> 'OK']);
}

function getLastGame($numPlayers){
	//if is full create new Game
	global $conn;
	$query = $conn->prepare("SELECT * FROM monopoly_game 
	WHERE num_players = :numPlayers AND created <= :afterTime ORDER BY id DESC LIMIT 1");
	$query->execute( ['numPlayers'=>$numPlayers, 'afterTime'=> $afterTime] );
	return $query->fetch(PDO::FETCH_OBJ);
}

function addPlayerToGame($player){
  global $conn;
  $lastGame = getLastGame();
  if(!$lastGame || $lastGame->created <=){
    return createGame($player);
  }
  else{
    $lastGamePlayers = json_decode($lastGame->players);
    $id = $lastGame->id;
	$lastGamePlayersLen = count($lastGamePlayers);
    if( $lastGamePlayersLen < 4 ){	 
		array_push($lastGamePlayers, $player);
		$lastGamePlayers = json_encode($lastGamePlayers);
		updateGame($id, $lastGamePlayers);
		if((int)$lastGamePlayersLen === 3){
			insertBoardForGame($id, '[]', '[]');
		}
    }
    else{
      $id = createGame($player);
    }
    return json_encode(['id'=> $id]);
  }
}

function removePlayerFromGame(){
return 'yo';
}
 */



/** *********************************/

function getLastBoardFromGame($gameId){
  global $conn;
  $query = $conn->prepare("SELECT * FROM monopoly_board_turn WHERE game_id = : gameId ORDER BY id DESC LIMIT 1");
  $query->execute(['gameId' => $gameId]);
  return $query->fetch(PDO::FETCH_OBJ);
}

function addNewBoardTurn($gameId, $playerIndex){
	//return json_encode(['id'=>$gameId.' '.$playerIndex]);
  global $conn; 
  $query = $conn->prepare("INSERT INTO monopoly_board_turn (game_id, player_index) 
  VALUES (:gameId, :playerIndex)");
  $query->execute([ ':gameId' => $gameId, ":playerIndex" => $playerIndex]);
  return json_encode(['id'=>$conn->lastInsertId()]);
}

function addDiceToBoardTurn($boardId, $diceObj){
  global $conn; 
  $query = $conn->prepare("UPDATE monopoly_board_turn SET dice = :dice WHERE id = :boardId");
  $query->execute([":boardId" => $boardId, ':dice' => json_encode($diceObj) ]);
  return json_encode(['status'=> 'OK']);
}

function finalizeBoardTurn($boardId, $boardSnapshot, $turnEvents){
  global $conn; 
  $query = $conn->prepare("UPDATE monopoly_board_turn SET board_snapshot = :boardSnapshot,
  turn_events = :turnEvents WHERE id = :id");
  $query->execute([ 
	  ':id' => $boardId, 
	  ':boardSnapshot' => json_encode($boardSnapshot),  
	  ':turnEvents' => json_encode($turnEvents)
  ]);
  return json_encode(['status'=> 'OK']);
}

function getBoardTurnForGame($gameId, $offset){
  global $conn;
  $offset = (int)$offset;
  $query = $conn->prepare("SELECT * FROM monopoly_board_turn WHERE game_id = :gameId LIMIT 1 OFFSET $offset");
  $query->execute([ ':gameId' => (int)$gameId ]);
  $response = $query->fetch(PDO::FETCH_OBJ);
  return $response ? json_encode($response) : json_encode(['noMoreTurns'=>true]);
}

function getLastBoardTurnForGame($gameId){
  global $conn;
  $query = $conn->prepare("SELECT * FROM monopoly_board_turn WHERE game_id = :gameId ORDER BY id DESC LIMIT 1");
  $query->execute([ ':gameId' => (int)$gameId ]);
  $response = $query->fetch(PDO::FETCH_OBJ);
  return json_encode($response);
}

function getBoardTurnById($boardId){
  global $conn;
  $query = $conn->prepare("SELECT * FROM monopoly_board_turn WHERE id = :boardId");
  $query->execute([ ':boardId' => (int)$boardId ]);
  $response = $query->fetch(PDO::FETCH_OBJ);
  return json_encode($response);
}

function getLastBoardTurnWithEventsForGame($gameId){
  global $conn;
  $query = $conn->prepare("SELECT * FROM monopoly_board_turn 
  WHERE game_id = :gameId AND turn_events IS NOT NULL ORDER BY id DESC LIMIT 1");
  $query->execute([ ':gameId' => (int)$gameId ]);
  $response = $query->fetch(PDO::FETCH_OBJ);
  return json_encode($response);	
}


if( $requestMethod === 'POST' ){

  $data = json_decode(file_get_contents('php://input'));

  if( isset($data->newBoardTurn) ){
	echo addNewBoardTurn($data->gameId, $data->playerIndex);
    exit();
  }
  else if( isset($data->diceToBoardTurn) ){
	echo addDiceToBoardTurn($data->boardId,$data->diceObj);
	exit();
  }
  else if( isset($data->finalizeBoardTurn) ){
	echo finalizeBoardTurn($data->boardId, $data->boardSnapshot, $data->turnEvents);
	exit();
  } 
  else if( isset($data->createGame) ){
	echo createGame($data->createGame);
	exit();
  }
  else if( isset($data->addPlayerToGame) ){
    echo addPlayerToGame($data->gameId, $data->addPlayerToGame);
	//return json_encode($data);
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
	else if( isset( $_GET['boardTurnForGame'] ) ){
		echo getBoardTurnForGame($_GET['gameId'], $_GET['offset']);
		exit();
	}
	else if( isset( $_GET['lastBoardTurnForGame'] ) ){
		echo getLastBoardTurnForGame($_GET['lastBoardTurnForGame']);
		exit();
	}
	else if( isset( $_GET['boardTurnById'] ) ){
		echo getBoardTurnById($_GET['boardTurnById']);
		exit();
	}
	else if( isset( $_GET['lastBoardTurnWithEvents'] ) ){
		echo getLastBoardTurnWithEventsForGame($_GET['lastBoardTurnWithEvents']);
		exit();
	}	
	
}







exit();



/** HELPERS **************************************/

function getIp(){
	$ip = '';
	if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
		$ip = $_SERVER['HTTP_CLIENT_IP'];
	} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
		$ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
	} else {
		$ip = $_SERVER['REMOTE_ADDR'];
	}
	return $ip;
}

function hashPassword($password){
	$salt = hex2bin('75D6215CA44339B645E86BE790FF562D3EE4BC51034FDC6A9697F767BB961B5B');
	$saltchars = $salt;
	$passwordchars = mb_convert_encoding($password, 'UTF-16LE');
	return hash('sha256', $passwordchars . $saltchars);
}

function joinIds($id1, $id2){
	$ids = [$id1, $id2];
	sort($ids);
    return '#'.join('#', $ids).'#';
}

/** USER LOGIN **************************************/

function createNewUser($user, $fetchMode = PDO::FETCH_ASSOC){
	
	if(!$user->name || strlen($user->name) < 3 || strlen($user->name) > 50){
		echo json_encode(['error'=>'User Name is not corrent']);
		return;
	}
	
	
	global $conn;
    $query = $conn->prepare("SELECT * FROM chat_users WHERE user_mail = :mail LIMIT 1");
	$query->execute([ ":mail" => $user->email ]);
	$mailExists = $query->fetchAll($fetchMode);
	if($mailExists){
		return json_encode(['error'=>'Mail allready exists!']); 
	}
	
	//also validate with ip
	$ip = getIp();
    $query = $conn->prepare("INSERT INTO chat_users 
	(name, user_mail, avatar, ip, password, gender) VALUES (:name, :user_mail, :avatar, :ip, :password, :gender)");
	$query->execute([
		":name" => $user->name, 
		":user_mail" => $user->email, 
		":avatar" => $user->avatar,
		":ip" => $ip,
		":password" => hashPassword($user->password),
		":gender"=>$user->gender
	]);
	return json_encode(['msg'=>'OK']);	
	
}

function insertGuest($user){
	global $conn;
	//also validate with ip
	$ip = getIp();
	$lastAction = time();
    $query = $conn->prepare("INSERT INTO chat_users
	(name,  avatar, ip, is_active, last_action, gender) VALUES (:name, :avatar, :ip, :isActive, :lastAction, :gender)");
	$user = $query->execute([
		":name" => $user->name, 
		":avatar" => $user->avatar,
		":ip" => $ip,
		":isActive" => true,
		":lastAction" => $lastAction,
		":gender" => $user->gender
	]);
	return json_encode(['id'=>$conn->lastInsertId()]);		
}

function loginUser($user, $fetchMode = PDO::FETCH_ASSOC){
	global $conn;
	if(!$user->name || strlen($user->name) < 3 || strlen($user->name) > 50){
		echo json_encode(['error'=>'User Name is not corrent']);
		return;
	}	
	if($user->isGuest){
		$query = $conn->prepare("SELECT * FROM chat_users WHERE name = :name LIMIT 1");
		$query->execute([ ":name" => $user->name ]);
		$otherUser = $query->fetchAll($fetchMode);
		if($otherUser && isset($otherUser[0]['id']) && $otherUser[0]['user_mail'] !== ''){
			$user->name.= time();
		}
		$loggedUser = insertGuest($user);	
		echo $loggedUser;	
		exit();		
	}
	else{
		$pass = hashPassword($user->password);
		$query = $conn->prepare("SELECT * FROM chat_users WHERE name = :name AND password = :pass LIMIT 1");
		$query->execute([ ":name" => $user->name, ":pass" => $pass ]);
		$userExists = $query->fetchAll($fetchMode);
		if($userExists){
			echo json_encode(['id'=>$userExists[0]['id']]); 
		}
		else{
			echo json_encode(['error'=>'Credentails are incorrect!']);
		}
		exit();		
	}
}

function logoutUser($user, $fetchMode = PDO::FETCH_ASSOC){
	global $conn;
	$query = $conn->prepare("UPDATE chat_users SET is_active = 0 WHERE id = :id LIMIT 1");
	$query->execute([ ":id" => $user->id ]);
	return json_encode(['status'=>'OK']);		
}

/** USER ACTIVATION **************************************/

function setActivation($id, $isActive){
	global $conn;
	if($isActive === 0){
		$query = $conn->prepare("UPDATE chat_users SET is_active = $isActive WHERE id = :id");
		$query->execute([ ":id" => $id ]);
	}
	else{
		$now = time();
		$query = $conn->prepare("UPDATE chat_users SET is_active = $isActive, last_action = $now WHERE id = :id");
		$query->execute([ ":id" => $id ]);		
	}
	//$query->fetchAll(PDO::FETCH_ASSOC);		
}

function getActiveUsers(){
	global $conn;
	$query = $conn->prepare("SELECT id, name, avatar, last_action, gender FROM chat_users WHERE is_active = 1");
	$query->execute();
	$activeUsers = $query->fetchAll(PDO::FETCH_ASSOC);
	$now = (int)time();
	foreach($activeUsers as $user){
		if( ( (int)$user['last_action'] + 90 ) < $now ){
			setActivation($user['id'], 0);	
		}
	} 
	return $activeUsers;
}

/** MAIN CHAT ROOM **************************************/

function sendMessageToMain($userId, $msg){
	global $conn;
	$query = $conn->prepare("INSERT INTO chat_messages (user_id, message) VALUES (:user_id, :message)");
	$query->execute([
		":user_id" => $userId, 
		":message" => $msg, 
	]);
	//$query->fetchAll(PDO::FETCH_ASSOC); 
	return json_encode(['msg'=>'OK']);	
}

function readMainMessages($fetchMode = PDO::FETCH_ASSOC){
	global $conn;
    $query = $conn->prepare("SELECT 
	chat_messages.message, chat_messages.created, chat_messages.id, chat_messages.user_id, 
	chat_users.name, chat_users.avatar, chat_users.gender FROM chat_messages INNER JOIN chat_users
    ON chat_messages.user_id=chat_users.id ORDER BY chat_messages.id DESC LIMIT 10;");
	$query->execute();
	return json_encode(array_reverse($query->fetchAll($fetchMode))); 
}

/** PRIVATE CHAT **************************************/

function sendPrivateMessage($from, $to, $message){
	global $conn;
	$ids = joinIds($from, $to);
    $query = $conn->prepare("INSERT INTO chat_dialogs (fromId, toId, ids, message) 
	VALUES (:from, :to, :ids, :message)");
	$query->execute([ 
		":from" => $from, 
		":to" => $to, 
		":ids" => $ids, 
		":message" => $message
	]);
	return json_encode(['msg'=>'OK']); 	
}

function readDialogMessages($from, $to){
	global $conn;
	$ids = joinIds($from, $to);
	$query = $conn->prepare("SELECT 
	chat_dialogs.message, chat_dialogs.created, chat_dialogs.id, chat_dialogs.fromId, 
	chat_users.name, chat_users.avatar, chat_users.gender FROM chat_dialogs INNER JOIN chat_users
    ON chat_dialogs.fromId=chat_users.id WHERE ids = :ids ORDER BY chat_dialogs.id 
	DESC LIMIT 10;");
	$query->execute([ ":ids" => $ids ]);
	return json_encode(array_reverse($query->fetchAll(PDO::FETCH_ASSOC))); 	
}

function getUnreadPrivateMessages($toId){
	global $conn;
	$query = $conn->prepare("SELECT DISTINCT chat_dialogs.fromId AS id, chat_users.name, 
	chat_users.avatar, chat_users.gender FROM chat_dialogs 
	INNER JOIN chat_users ON chat_dialogs.fromId=chat_users.id WHERE toId = :toId AND isRead = 0 LIMIT 10;");
	$query->execute([ ":toId" => $toId ]);
	return json_encode($query->fetchAll(PDO::FETCH_ASSOC)); 	
}

function markMessagesAsRead($fromId, $toId){
	global $conn;
	$query = $conn->prepare("UPDATE chat_dialogs SET isRead = 1 
	WHERE fromId = :fromId AND toId = :toId LIMIT 50");
	$query->execute([ ":fromId" => $fromId, ":toId" => $toId ]);
	return json_encode(['status'=>'OK']);

}

/** CHALLANGES **************************************/

//from, to, chalType
function sendChallenge($chalObj){
	global $conn;

	$query = $conn->prepare("SELECT id FROM `chat_challenges` WHERE fromId = :fromId AND toId = :toId AND isRead = 0 LIMIT 1");
	$query->execute([":fromId" => $chalObj->fromId, ":toId" => $chalObj->toId]);		
	$res = $query->fetchAll(PDO::FETCH_ASSOC);
	if(count($res)){
		return json_encode(['error'=>'The user has already been challenged!']);
	} 
	
	$ids = joinIds($chalObj->fromId, $chalObj->toId);
	
    $query = $conn->prepare("INSERT INTO `chat_challenges` (fromId, toId, chal_type, chal_info, ids) 
	VALUES (:fromId, :toId, :chal_type, :chal_info, :ids)");
	$query->execute([ 
		":fromId" => $chalObj->fromId,  
		":toId" => $chalObj->toId, 
		":chal_type" => $chalObj->chalType,
		":chal_info" => json_encode($chalObj->chalInfo),
		":ids" => $ids
	]);
	return json_encode(['id'=>$conn->lastInsertId()]);
}

function getUnreadChallenges($toId){
	global $conn;
	//$t=time(;
	//$date = date("Y-m-d h:m:s",$t)
    $query = $conn->prepare("SELECT DISTINCT chat_challenges.chal_type, chat_challenges.chal_info,
			chat_challenges.fromId AS id, chat_challenges.id AS chalId, chat_users.name, 
			chat_users.avatar, chat_users.gender FROM chat_challenges 
			INNER JOIN chat_users ON chat_challenges.fromId=chat_users.id 
			WHERE toId = :toId AND isRead = 0 AND isAccepted = 0 LIMIT 10;");
	$query->execute([ ":toId" => $toId ]);
	return json_encode($query->fetchAll(PDO::FETCH_ASSOC)); 
}

function getPendingChallange($chalId){
	global $conn;
	$query = $conn->prepare("SELECT * FROM `chat_challenges` 
	WHERE id = :chalId");
	$query->execute([ ":chalId" => $chalId ]);		
	return json_encode($query->fetchAll(PDO::FETCH_ASSOC));
}

function respondToMatchChallenge($questionsNum, $chalId, $isAccepted){
	global $conn;
	$chalInfo = [];
	//$isAccepted = ()
	if($isAccepted){
		$qIds = '';
		$query = $conn->prepare("SELECT COUNT(*) FROM chat_match_questions");
		$query->execute();
		$max = ($query->fetch())[0];

		for($x = 0; $x < $questionsNum; $x+=1){
			$rand = rand(1, $max);
			$qIds.= ",$rand";
		} 
		$qIds = ltrim($qIds, ',');

		$query = $conn->prepare("SELECT * FROM chat_match_questions WHERE ID IN ($qIds)");
		$query->execute();
		$chalInfo['questions'] =  $query->fetchAll(PDO::FETCH_ASSOC);
			
	}
	
	$query = $conn->prepare("UPDATE `chat_challenges` 
	SET chal_info = :chalInfo, 
		isAccepted = :isAccepted, 
		isRead = 1 
		WHERE id = :chalId;");
	$query->execute([ ":chalInfo" => json_encode($chalInfo),  ":isAccepted" => $isAccepted, ":chalId" => $chalId ]);
	return json_encode($chalInfo); 	
} 

function saveChallengeAnswers($chalId, $fromOrTo, $answers){
	global $conn;
	$answers = json_encode($answers);
	$sql = '';
	if($fromOrTo === 'from'){
		$sql = "UPDATE `chat_challenges` SET fromAnswers = :answers WHERE id = :chalId;";
	}
	else if($fromOrTo === 'to'){
		$sql = "UPDATE `chat_challenges` SET toAnswers = :answers WHERE id = :chalId;";
	}
    $query = $conn->prepare($sql);
	$query->execute([ ":chalId" => $chalId, ":answers" => $answers ]);
	return json_encode(['status' => 'OK']);
}

function checkChallengeCompletion($chalId){
	global $conn;
	$query = $conn->prepare("SELECT * FROM `chat_challenges` WHERE id = :chalId");
	$query->execute([ ":chalId" => $chalId ]);
	return json_encode($query->fetch(PDO::FETCH_OBJ));
}

function markChallengeAsCompleted($chalId, $score){	
	global $conn;
	$query = $conn->prepare("UPDATE `chat_challenges` SET isCompleted = 1, score = :score WHERE id = :chalId");
	$query->execute([ ":chalId" => $chalId, ":score" => $score ]);
	return json_encode(['status' => 'OK']);
}

function saveChallengeAnswersForUser($userId, $answers){
	global $conn;
	$query = $conn->prepare("SELECT * FROM `chat_match_history` WHERE userId = :userId");
	$query->execute([ ":userId" => $userId ]);
	$response = $query->fetch(PDO::FETCH_OBJ);
	
	if($response){
		$id = $response->id;
		
		$historyAnswers = json_decode($response->answers);
		foreach($answers as $key=>$value){
			$historyAnswers->$key = $value;
		}	
		$historyAnswers = json_encode($historyAnswers);
		$query = $conn->prepare("UPDATE `chat_match_history` SET answers = :historyAnswers WHERE id = $id");
		$query->execute([ ":historyAnswers" => $historyAnswers ]);
	}
	else{
		$historyAnswers = json_encode($answers);
		$query = $conn->prepare("INSERT INTO `chat_match_history` (userId, answers) VALUES ( :userId, :answers )");
		$query->execute([ ":userId" => $userId, ":answers" => $historyAnswers ]);		
	}
	return json_encode( $historyAnswers, JSON_UNESCAPED_SLASHES);
}

function cancelChallenge($fromId, $toId){
	global $conn;
	$query = $conn->prepare("DELETE FROM `chat_challenges` 
	WHERE fromId = :fromId 
	AND toId = :toId 
	AND isCompleted = 0");
	$query->execute([ ":fromId" => $fromId, ":toId" => $toId ]);		
	return json_encode(['status' => 'OK']);	
}

function getChallengeHistoryForUser($userId, $offset, $limit = 10){
	global $conn;
	$userId	= (int) $userId;
	$offset = (int) $offset;
	$limit = (int) $limit;

	$sql = "SELECT 
			chat_challenges.chal_type, 
			chat_challenges.chal_info, 
			chat_challenges.fromAnswers, 
			chat_challenges.toAnswers,
			chat_challenges.fromId,
			chat_challenges.toId,
			fromName.name AS fromName,
			toName.name AS toName
			FROM chat_challenges
			JOIN chat_users fromName ON chat_challenges.fromId = fromName.id 
			JOIN chat_users toName ON chat_challenges.toId = toName.id
			WHERE ids LIKE '%#".$userId."#%' LIMIT $limit OFFSET $offset";
	$query = $conn->prepare($sql);
	$query->execute();
	return json_encode($query->fetchAll(PDO::FETCH_ASSOC)); 
}


if( $requestMethod === 'POST' ){

  	$data = json_decode(file_get_contents('php://input'));
	
	if( isset($data->newUser) ){
		echo createNewUser($data->newUser);
		exit();
	}
	else if( isset($data->loginUser) ){
		echo loginUser($data->loginUser);
		exit();
	}
	else if( isset($data->logoutUser) ){
		echo logoutUser($data->logoutUser);
		exit();
	}	
	else if( isset($data->mainMessage) ){
		echo sendMessageToMain($data->userId, $data->mainMessage);
		exit();
	}
	else if( isset($data->privateMessage) ){
		echo sendPrivateMessage((int)$data->from, (int)$data->to, $data->privateMessage);
		exit();
	} 
	else if( isset($data->markAsRead) ){
		echo markMessagesAsRead($data->from, $data->to);
		exit();
	}
	else if( isset($data->newChallenge) ){
		echo sendChallenge($data->newChallenge);
		exit();
	}  	
	else if( isset($data->respondToMatchChallenge) ){
		echo respondToMatchChallenge($data->questionsNum, $data->chalId, $data->isAccepted);
		exit();
	}
	else if( isset($data->saveChallengeAnswers) ){
		echo saveChallengeAnswers($data->chalId, $data->fromOrTo, $data->answers);
		exit();
	}
	else if( isset($data->saveChallengeAnswersForUser) ){
		echo saveChallengeAnswersForUser($data->userId, $data->answers);
		exit();
	}
	
	
}
if( $requestMethod === 'GET' ){
	if( isset( $_GET['checkLoggedUsers'] ) ){
		echo json_encode(getActiveUsers());
		exit();
	}
	else if( isset( $_GET['mainMessages'] ) ){
		setActivation($_GET['userId'], 1);
		echo readMainMessages();
		exit();		
	}
	else if( isset( $_GET['privateMessages'] ) ){
		setActivation($_GET['from'], 1);
		echo readDialogMessages($_GET['from'], $_GET['to']);
		exit();	
	}
	else if( isset( $_GET['unreadPrivateMessages'] ) ){
		echo getUnreadPrivateMessages($_GET['userId']);
		exit();	
	}
	else if( isset( $_GET['unreadChallenges'] ) ){
		echo getUnreadChallenges($_GET['toId']);
		exit();	
	}
	else if( isset( $_GET['pendingChallenge'] ) ){
		echo getPendingChallange( $_GET['chalId'] );
		exit();	
	}	
	else if( isset( $_GET['checkChallengeCompletion'] ) ){
		echo checkChallengeCompletion( $_GET['chalId'] );
		exit();		
	}
	else if( isset( $_GET['checkChallengeCompletion'] ) ){
		echo checkChallengeCompletion( $_GET['chalId'] );
		exit();		
	}	
	else if( isset( $_GET['markChallengeAsCompleted'] ) ){
		echo markChallengeAsCompleted( $_GET['chalId'], $_GET['score'] );
		exit();		
	}
	else if( isset( $_GET['cancelChallenge'] ) ){
		echo cancelChallenge( $_GET['fromId'], $_GET['toId'] );
		exit();		
	}
	else if( isset( $_GET['challengeHistoryForUser'] ) ){
		echo getChallengeHistoryForUser( $_GET['userId'], $_GET['offset'] );
		exit();		
	}	
	
}







?>
