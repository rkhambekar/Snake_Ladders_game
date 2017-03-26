'use strict';
var app = angular.module('snlApp', []);

//purposely using run instead of config as I want this block to run after everything has been injected properly
app.run(function ($rootScope) {
	$rootScope.settings = {'playerCount': 1};
    $rootScope.players = [];
    
    $rootScope.ladders = [{
        "index": 7,
        "end": 28
    }, {
        "index": 16,
        "end": 40
    },
    {
        "index": 25,
        "end": 51
    },
    {
        "index": 30,
        "end": 62
    },
    {
        "index": 39,
        "end": 68
    },
    {
        "index": 55,
        "end": 76
    },
    {
        "index": 66,
        "end": 84
    },
    {
        "index": 78,
        "end": 97
    }];
    $rootScope.snakes = [{
        "index": 99,
        "end": 69
    },
    {
        "index": 75,
        "end": 51
    },
    {
        "index": 62,
        "end": 33
    }, 
    {
        "index": 46,
        "end": 23
    },
    {
        "index": 34,
        "end": 16
    },
    {
        "index": 26,
        "end": 8
    }];
    $rootScope.board = {};
    $rootScope.activeSquare = {};
	$rootScope.currentPlayer = 0;
	$rootScope.gameOver = false;
	$rootScope.showBoard = false;
	$rootScope.isLoading = false;
	$rootScope.isLoadingText ='';
	$rootScope.winner = -1;
});

//Game Controller
app.controller('GameController', function ($scope, $rootScope) {
	
	$scope.initializeGame = function(){
	for (i = 0; i < $rootScope.settings.playerCount; ++i) {
        $rootScope.players[i] = {
            'currentPos': -1,
			'isAuto':false
        };
    }
	if($rootScope.settings.playerCount === 1){
	$rootScope.players[1] = {
            'currentPos': -1,
			'isAuto':true
        };
	}
	}
	
	$scope.setSettings = function(count){
	
		$rootScope.settings.playerCount = count;
		$scope.initializeGame();
        //show the board only when player count is set
		$rootScope.showBoard = true;
	}
});

//Board Controller
app.controller('BoardController', function ($scope, $rootScope) {
    var board = [], i = 0, ladders, snakes;
    
    //Board squares
    for (i = 0; i < 100; ++i) {
        //Even squares
        if (Math.floor(i / 10) % 2 == 0) {
            board[i] = {
                "start": i,
                "end": i,
                "isEven": true,
				"class":'',
				"activeClass" :''
            };
        } else {
            //Odd squares
            board[i] = {
                "start": i,
                "end": i,
                "isEven": false,
				"class":'',
				"activeClass" :''
            };
        }


    }
    for (i = 0; i < $rootScope.ladders.length; ++i) {
        //-1 as i is starting from 0
        board[($rootScope.ladders[i].index - 1)].end = $rootScope.ladders[i].end - 1;
    }
    for (i = 0; i < $rootScope.snakes.length; ++i) {
        //-1 as i is starting from 0
        board[($rootScope.snakes[i].index - 1)].end = $rootScope.snakes[i].end - 1;
    }
    $rootScope.board = board;
    //very important to reverse as I want to print i from 1 to 100 bottom to top
    $scope.board = board.reverse();
	
	for (i = 0; i < 100; ++i) {
		if(board[i].isEven){
            //keeping the continuity in numbering by floating numbers
			board[i].class = board[i].class+'fnumber ';
		}
		if(board[i].start > board[i].end){
            //display snake image
			board[i].class = board[i].class+'snake ';
		}
		if(board[i].start < board[i].end){
            //display ladder image
			board[i].class = board[i].class+'ladder ';
		}
	}


});

//Button Controller
app.controller('ButtonController', function ($scope, $rootScope,$timeout) {
    $scope.diceValues = [-1, -1];
    $scope.rollDice = function () {
        //adding 1 to get dice values from 1 to 6
        $scope.diceValues[0] = Math.floor(Math.random() * 6) + 1;
        $scope.diceValues[1] = Math.floor(Math.random() * 6) + 1;
		$rootScope.isLoadingText ='Dice 1 : '+$scope.diceValues[0]+ '\n' + ' Dice 2 : '+$scope.diceValues[1];
    }
	$scope.changeCurrentPlayer = function(){
		if($rootScope.currentPlayer !== $rootScope.players.length-1){
			$rootScope.currentPlayer++;
		}else{
		$rootScope.currentPlayer = 0;
		}
		$rootScope.isLoading = false;
        //returning control back to start rolling the dice again
		if($rootScope.players[$rootScope.currentPlayer].isAuto){
			$scope.startGame();
		}
	}
    $scope.makeMove = function (player) {
		$rootScope.isLoadingText ="Player"+($rootScope.currentPlayer+1)+"'s turn";
        if ($scope.diceValues[0] == -1 || $scope.diceValues[1] == -1) {
            return;
        }
        var newPos = $rootScope.players[player].currentPos + $scope.diceValues[0] + $scope.diceValues[1];
        if (newPos <= 99) {
            $rootScope.players[player].currentPos = newPos;
            $rootScope.activeSquare = $rootScope.board[100 - $rootScope.players[player].currentPos - 1];
			console.log($rootScope.activeSquare);
            if ($rootScope.activeSquare.start != $rootScope.activeSquare.end) {
                //going up
                if ($rootScope.activeSquare.start < $rootScope.activeSquare.end) {
                    $rootScope.isLoadingText ="Player " + ($rootScope.currentPlayer+1) + "climbs a ladder";
                }
                //coming down
                if ($rootScope.activeSquare.start > $rootScope.activeSquare.end) {
                   $rootScope.isLoadingText ="Player " + ($rootScope.currentPlayer+1) + "hits a snake";
                }
                $rootScope.players[player].currentPos = $rootScope.activeSquare.end;
                $rootScope.activeSquare = $rootScope.board[$rootScope.players[player].currentPos];
            }
		$rootScope.isLoadingText ="Player " + ($rootScope.currentPlayer+1) +"'s new position is "+ ($rootScope.players[player].currentPos+1) ;
		
        //check for Game over
        if(newPos === 99){
		console.log($rootScope.gameOver);
			$rootScope.winner = $rootScope.currentPlayer+1 ;
			$rootScope.gameOver = true;
			$rootScope.isLoadingText ="Player " + ($rootScope.winner) +"wins";
		}
        }
		else {
			
			$rootScope.isLoadingText ="Player"+($rootScope.currentPlayer+1)+" cannot move";
		}
		//resetting the dice values to default
        $scope.diceValues = [-1, -1];
		$scope.gameOver = $rootScope.gameOver;
    }

    //everything together in a modular way for function calls
	$scope.startGame = function(){
			
			$rootScope.isLoading = true;
			$rootScope.isLoadingText ='Rolling Dice..';
			
            //pause for 1 second
            $timeout(function(){
                $scope.rollDice();
            },1000);
			
            //happens 1 second after rollDice is executed
			$timeout(function(){
                $scope.makeMove($rootScope.currentPlayer);
            },2000);
			
            //change current player after makeMove is executed
			if(!$rootScope.gameOver){ 
                $timeout(function(){
                    $scope.changeCurrentPlayer();
                },3000); 
            }			
	}
});