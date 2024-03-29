import { Button, StyleSheet, Text, View, TouchableOpacity, TextInput, Animated } from 'react-native';
import React, { useState, useRef } from 'react';
import GameModel from './GameModel';
import settingPlayerPositions from './PlayerPositionsModel';
import { useNavigation } from '@react-navigation/native'
import style from '../Styles/style';


var gModel;

export const GameViewModel = ({rS, user, gameObj, gameStarted, setGameStart, playerView, setPlayerView}) => {

    // Variables //

    const navigation = useNavigation();

    // let roomSize = rS;
    let [roomSize, setRoomSize] = useState(rS);

    let gameState = gameObj;

    let PlayerBorders = [];
    let PlayersDisplayName;
    let PlayersDisplayChips;
    let inGamePlayerPositions = settingPlayerPositions(roomSize);
    let BigBlindSelection = [];
    let WinnerSelection = [];
    let SidePotWinnerSelection = [];
    let BuyInsArr = [];
    let sidePots = [];

    let [gameInfoDisplay, setGameInfoDisplay] = useState(false)
    let [inGameMenuActive, setInGameMenuActive] = useState(false);
    let [menuButton, setMenuButton] = useState(true)
    let [roundTransition, setRoundTransition] = useState(false);
    let [selectedWinner, setSelectedWinner] = useState(0);
    let [winnerChosen, setWinnerChosen] = useState(false);
    let [initLeaveGame, setInitLeaveGame] = useState(false);
    let [initInvitingPlayer, setInitInvitingPlayer] = useState(false);
    let [readyResponse, setReadyResponse] = useState(false);
    let [responseText, setResponseText] = useState('')
    let [responseStatus, setResponseStatus] = useState(0);
    let [restrictionInvitingPlayers, setRestrictionInvitingPlayers] = useState(false);
    let [restrictionReason, setRestrictionReason] = useState('');
    let [changeRS, setChangeRS] = useState(false);
    let [changeRSOptions, setChangeRSOptions] = useState(0);
    let [activeBBSelect, setActiveBBSelect] = useState(0);
    let [toggleBBSelect, setToggleBBSelect] = useState(false)
    let [activeSBSelect, setActiveSBSelect] = useState();
    let [activePot, setActivePot] = useState();
    let [activeRound, setActiveRound] = useState();
    let [gameTurn, setGameTurn] = useState();
    let [totalSidePots, setTotalSidePots] = useState(0);
    let [sidePotSelectedWinner, setSidePotSelectedWinner] = useState(0);
    let [sidePotActive, setSidePotActive] = useState(false);
    let [sidePot, setSidePot] = useState(0);
    let [addOnWindow, setAddOnWindow] = useState(false);
    let [restrictionAddOn, setRestrictionAddOn] = useState(false);

    let usernameInviting = null;
    let usernameInvitingHolder;

    let addOnAmount = null;
    let addOnHolder;
    let addOnRef = useRef();

    let usernameRef = useRef();

    const leftValue = useState(new Animated.Value(0))[0]

    //////////////////////////////////////////////////////////////////

    // Functions //

    const initGameStart = () => {
        user.socket.emit('initGameStarted', activeBBSelect, activeSBSelect);
        setToggleBBSelect(false)
    }

    const WinnerSubmitted = () => {
        user.socket.emit('winnerHasBeenChosen', selectedWinner, 'main');
        setWinnerChosen(true);
    }

    const userSettingBigBlind = (turn) => {
        setActiveBBSelect(turn);
    }

    const userInivitingPlayerToGame = () => {
        triggerGameMenuAnimation();
        if (roomSize > gameState.players.length) {
            setInitInvitingPlayer(true);
        } else {
            setRestrictionReason('The Game Lobby Is Full. You Currently Cannot Invite Other Players.')
            setRestrictionInvitingPlayers(true);
        }

        moveMenu();
    }

    const userXOutInvitingPlayer = () => {
        if (readyResponse) {
            
            if (responseStatus === 200) {
                setInitInvitingPlayer(false);
                setRestrictionInvitingPlayers(false);
                setInGameMenuActive(true);
                moveMenu();
            } else if (responseStatus === 400) {
                setReadyResponse(false);
                setInitInvitingPlayer(true);
            }

            usernameRef.current.clear();

        } else {
            setInitInvitingPlayer(false);
            setRestrictionInvitingPlayers(false);
            setInGameMenuActive(true);

            moveMenu();

            if (usernameInviting != null) {
                usernameRef.current.clear();
            }
        }
    }

    const toggleLeaveGame = () => {
        setInitLeaveGame(!initLeaveGame);
        triggerGameMenuAnimation();

        moveMenu();
    }

    const userLeavesGame = () => {
        user.leaveGame(user.playerGameObj.turn);
        navigation.navigate('Home');
    }

    const toggleRoomSizeChangeWindow = () => {
        setChangeRS(!changeRS);
        triggerGameMenuAnimation();

        if (changeRSOptions != 0) {
            setChangeRSOptions(0);
        }

        moveMenu();
    }

    const roomSizeChangeSubmitted = () => {
        user.socket.emit('roomSizeChanged', changeRSOptions);
        setChangeRS(false)
        setMenuButton(true)
    }

    const toggleGameInfoWindow = () => {
        triggerGameMenuAnimation();
        setGameInfoDisplay(!gameInfoDisplay);

        moveMenu();
    }

    const toggleAddOnWindow = () => {
        setAddOnWindow(!addOnWindow);
        triggerGameMenuAnimation();

        if (gameStarted) {
            setRestrictionReason('Please Wait Until The Current Round Is Over To Add-On.')
            setRestrictionAddOn(true);
        }

        if (readyResponse) {
            setReadyResponse(false);
            setResponseText('');

            addOnRef.current.clear();
        } else {
            if (addOnRef.current != null) {
                addOnRef.current.clear();
            }
        }

        moveMenu();
    }

    const moveMenu = () => {

        if (!inGameMenuActive) {
            Animated.timing(leftValue, {
                toValue: 300,
                duration: 400,
                useNativeDriver: false
            }).start()

        } else {
            Animated.timing(leftValue, {
                toValue: 0,
                duration: 500,
                useNativeDriver: false
            }).start()
        }
    }

    const triggerGameMenuAnimation = () => {
        if (!inGameMenuActive) {
            setInGameMenuActive(true);
        } else {
            setTimeout(() => {
                setInGameMenuActive(false);
            }, 350)
        }
    }

    const toggleInGameMenu = () => {
        setMenuButton(!menuButton);
        triggerGameMenuAnimation();

        moveMenu();
    }

    //////////////////////////////////////////////////////////////////

    // User Socket On's //

    user.socket.on('sendingBackGameStart', (info) => {
        gModel = new GameModel(roomSize, 0, 0, 0, 0, [], info, 0, 0, Number(gameState.ante), [], setActiveRound, setRoundTransition, gameState.pNickNames, gameState.pChips, gameState.gameStyle)

        setGameStart(true)
        setPlayerView(false)

        gModel.gameStarted = true;

        gModel.initRound(gameState)
        setGameTurn(gModel.currentTurn);
        setActivePot(gModel.pot);
        setActiveRound(gModel.currentRoundName)

        user.playerGameObj.setInGameInfo(gModel)

        // if (gModel.bigBlind === user.playerGameObj.turn) {
        //     user.socket.emit('isABlind', 'bb');
        // }

        // if (gModel.smallBlind === user.playerGameObj.turn) {
        //     user.socket.emit('isABlind', 'sb');
        // }

        // gModel.setPlayerBorders(gameState, gameState.pChips[gModel.bigBlind - 1] - gameState.ante, gModel.bigBlind);
        // gModel.setPlayerBorders(gameState, gameState.pChips[gModel.smallBlind - 1] - (gameState.ante / 2), gModel.smallBlind)

    })

    user.socket.on('playerSubmitsBet', (turn, betAmount, stateArr) => {
        user.playerGameObj.displayBet();
        gModel.handleBet(betAmount, activePot, setActivePot, turn, setGameTurn);
        user.playerGameObj.setInGameInfo(gModel)
        gameState.pChips = stateArr;
    })

    user.socket.on('playerFolds', (turn) => {
        gModel.handleFold(turn, setGameTurn);
        user.playerGameObj.setInGameInfo(gModel);
    })

    user.socket.on('playerChecks', (turn) => {
        gModel.handleCheck(turn, setGameTurn)
        user.playerGameObj.setInGameInfo(gModel);
    })

    user.socket.on('playerCallsBet', (turn, callAmount, stateArr) => {
        user.playerGameObj.displayCall();
        gModel.handleCall(callAmount, activePot, setActivePot, turn, setGameTurn)
        user.playerGameObj.setInGameInfo(gModel);
        gameState.pChips = stateArr;

    })

    user.socket.on('sendingBackWinnerOfRound', (winner, type) => {
        if (winner === user.playerGameObj.turn) {
            user.playerGameObj.winnerOfRound(gModel.pot);
        }

    })

    user.socket.on('sendingBackInitNextRound', () => {
        gModel.initNextRound(setWinnerChosen, setRoundTransition, setPlayerView, setActiveBBSelect, setGameTurn, setActivePot, setActiveRound)
        user.playerGameObj.setInGameInfo(gModel);
    })   
    
    user.socket.on('inviteToGameConfirmed', () => {
        setResponseText('Invite To Game Sent!');
        setReadyResponse(true);
        setResponseStatus(200);
    })

    user.socket.on('inviteToGameFailed', () => {
        setResponseText('Invite To Game Failed. Please Try Again');
        setReadyResponse(true);
        setResponseStatus(400);
    })

    user.socket.on('playerHasLeftGame', (turn) => {
        if (gameStarted) {
            gModel.handlePlayerLeaving(gameState, gameStarted, turn, setGameTurn)
            user.playerGameObj.setInGameInfo(gModel);
        } else {
            gameState.pNickNames[turn - 1] = undefined;
        }
    })

    user.socket.on('sendingBackRSChange', (newRS) => {
        setRoomSize(newRS)

        if (gameStarted) {
            gModel.updateGameSize(newRS)
        }
    })

    user.socket.on('sendingBackAddOn', (stateArr, stateArr2, totalChips) => {
        if (gameStarted) {
            gModel.handleAddOn(gameState, stateArr, stateArr2, setResponseText, setReadyResponse);
        } else {
            gameState.pChips = stateArr;
            gameState.totalBuyIns = stateArr2;
            setResponseText('Chips Have Been Added On!');
            setReadyResponse(true);
        }

        user.playerGameObj.setChips(totalChips);
    })

    user.socket.on('grabbingGameStateMidGame', (userJoining) => {
        socket.emit('sendingBackGameStateMidGame', gameState, userJoining);
    })

    //////////////////////////////////////////////////////////////////

    // In Game Elements //

    const PokerTable = (
        <View style={{borderWidth: 4, borderRadius: '70%', borderColor: 'black', width: 175, height: 500, backgroundColor:'papayawhip', alignSelf: 'center'}}>

        </View>
    )

    const StartButton = (
        <TouchableOpacity style={{justifyContent: 'center', position: 'absolute', borderWidth: 2, borderRadius: 5, borderColor: 'black', backgroundColor: 'lavender', display: gameStarted === false && user.playerGameObj.turn === 1 ? 'flex' : 'none'}}
            onPress={() => setToggleBBSelect(true)}
        >
            <Text style={{fontFamily: 'Copperplate', marginLeft: 5, marginRight: 5, fontSize: 22}}>Start</Text>
        </TouchableOpacity>
    )

    const InGameMenuButton = (
        <TouchableOpacity style={{borderWidth: 3, borderRadius: 5, backgroundColor: 'lavender', display: playerView === true && menuButton === true ? 'flex' : 'none', position: 'absolute', left: '-28%', top: '10%', height: '7%', alignItems: 'center', justifyContent: 'center', width: '10%'}}
            onPress={() => toggleInGameMenu()}
        >
             <Text style={{fontFamily: 'Copperplate', fontSize: 32}}>{'>'}</Text>
        </TouchableOpacity>
    )

    const InGameMenu = (
        <Animated.View style={{borderWidth: 3, borderRadius: 5, backgroundColor: 'papayawhip', width: '60%', height: '80%', left: '-110%', top: '10%', position: 'absolute', marginLeft: leftValue, display: inGameMenuActive === true ? 'flex' : 'none', zIndex: 1}}>
        
            <TouchableOpacity style={{borderBottomWidth: 2, borderRadius: 3, backgroundColor: 'lavender', position: 'absolute', top:-2, left: 0, width: '100%'}}
                onPress={() => toggleInGameMenu()}
            >
                <Text style={{fontFamily: 'Copperplate', fontSize: 32, textAlign: 'center', lineHeight: 40}}>{'<'}</Text>
            </TouchableOpacity>

            <Text style={{borderWidth: 2, borderRadius: 3, backgroundColor: 'lavender', position: 'absolute', alignSelf: 'center', top: 60, marginRight: 10, marginLeft: 10, fontWeight: 'bold'}}>Game Code: {gameState.idHolder}</Text>

            <TouchableOpacity style={{borderWidth: 2, borderRadius: 5, backgroundColor: 'lavender', position: 'absolute', top: '30%', alignSelf: 'center'}}
                onPress={() => toggleGameInfoWindow()}
            >
                <Text style={{textAlign: 'center', fontSize: 20, marginRight: 10, marginLeft: 10, fontFamily: 'Copperplate'}}>Game Info</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{borderWidth: 2, borderRadius: 3, backgroundColor: 'lavender', position: 'absolute', top: '45%', alignSelf: 'center', display: gameState.gameStyle != 'tourney' ? 'flex' : 'none'}}
                onPress={() => toggleAddOnWindow()}
            >
                <Text style={{textAlign: 'center', fontSize: 20, marginRight: 10, marginLeft: 10, fontFamily: 'Copperplate'}}>Add-On</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{borderWidth: 2, borderRadius: 3, backgroundColor: 'lavender', position: 'absolute', top: '60%', alignSelf: 'center'}}
                onPress={() => userInivitingPlayerToGame()}
            >
                <Text style={{textAlign: 'center', marginRight: 5, marginLeft: 5, fontSize: 20, fontFamily: 'Copperplate'}}>Invite Players</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{borderWidth: 2, borderRadius: 3, backgroundColor: 'lavender', position: 'absolute', top: '75%', alignSelf: 'center', display: gameState.hostId === user.socket.id && gameState.gameStyle != 'tourney' ? 'flex' : 'none'}}
                onPress={() => toggleRoomSizeChangeWindow()}
            >
                <Text style={{textAlign: 'center', marginRight: 5, marginLeft: 5, fontSize: 20, fontFamily: 'Copperplate'}}>Change Game Size</Text>
            </TouchableOpacity>

            {/* WILL GO AT BOTTOM OF MENU SO LEAVING SPACE FOR OTHER ELEMENTS */}
            <TouchableOpacity style={{borderWidth: 2, borderRadius: 5, backgroundColor: 'lavender', alignSelf: 'center', position: 'absolute', top: '90%'}}
                onPress={() => toggleLeaveGame()}
            >
                <Text style={{textAlign: 'center', marginRight: 5, marginLeft: 5, fontSize: 20, fontFamily: 'Copperplate'}}>Leave Game</Text>
            </TouchableOpacity>
        </Animated.View>
    )

    const LeaveGameConfirmation = (
        <View style={{borderWidth: 3, borderRadius: 5, backgroundColor: 'papayawhip', width: '90%', height: '35%', alignSelf: 'center', display: initLeaveGame === true ? 'flex' : 'none', position: 'absolute', top: '20%'}}>
            <Text style={{textAlign: 'center', marginTop: 35, marginBottom: 50, fontSize: 30, fontFamily: 'Copperplate'}}>Are You Sure You Want To Leave The Game?</Text>
            <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 20}}>
                <TouchableOpacity style={{borderWidth: 3, borderRadius: 5, backgroundColor: 'lavender', marginRight: 20}}
                    onPress={() => userLeavesGame()}
                >
                    <Text style={{textAlign: 'center', marginRight: 5, marginLeft: 5, fontSize: 25, fontFamily: 'Copperplate', lineHeight: 30}}>Yes</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{borderWidth: 3, borderRadius: 5, backgroundColor: 'lavender'}}
                    onPress={() => toggleLeaveGame(false)}
                >
                    <Text style={{textAlign: 'center', marginRight: 7, marginLeft: 7, fontSize: 25, fontFamily: 'Copperplate', lineHeight: 30}}>No</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
    
    const GameInfo = (
        <View style={{borderWidth: 2, borderRadius: 5, backgroundColor: 'lavender', width: '25%', alignSelf: 'center', position: 'absolute', top: '55%', display: gameStarted === true && winnerChosen === false ? 'flex' : 'none'}}>
            <Text style={{textAlign: 'center', fontFamily: 'Copperplate', marginBottom: 5}}>{activePot}</Text>
            <Text style={{textAlign: 'center', fontFamily: 'Copperplate'}}>{activeRound}</Text>
        </View>
    )

    for (let i = 0; i < roomSize; i++) {
        if (gameState.pNickNames[i] != undefined && gameState.pNickNames[i] != '+') {
            PlayersDisplayName = () => 
            <Text style={{textAlign: 'center', fontFamily: 'Copperplate', fontSize: 16}}>{gameState.pNickNames[i]}</Text>;
            PlayersDisplayChips = () => 
            <Text style={{textAlign: 'center', fontFamily: 'Copperplate', fontSize: 20}}>{gameState.pChips[i]}</Text>

            BuyInsArr.push(
                <Text key={i} style={{textAlign: 'center', fontSize: 22, fontFamily: 'Copperplate'}}>{gameState.pNickNames[i]}: {gameState.totalBuyIns[i]}</Text>
            );

        } else {
            PlayersDisplayName = () => 
            <Text style={{textAlign: 'center', fontFamily: 'Copperplate'}}>+</Text>;
            PlayersDisplayChips = () => 
            <Text style={{textAlign: 'center'}}></Text>
        }
        PlayerBorders.push(
            <View key={i + 1} style={{borderWidth: 3, borderRadius: 5, backgroundColor: 'lavender', position: 'absolute', borderColor: toggleBBSelect === true && activeBBSelect === i + 1 ? 'blue' : gameTurn === i + 1 ? 'red' : 'black' , minWidth: '27%', top: inGamePlayerPositions[i].pTop, left: inGamePlayerPositions[i].pLeft}}>
                <PlayersDisplayName />
                <PlayersDisplayChips />
            </View>
        )
        BigBlindSelection.push(
            <TouchableOpacity key={i + 1} style={{borderWidth: 2, borderRadius: 5, backgroundColor: activeBBSelect === i + 1 ? 'lightcoral' : 'lavender', marginRight: 5}}
                onPress={() => userSettingBigBlind(i + 1)}
            >
                <Text style={{fontFamily: 'Copperplate', marginRight: 5, marginLeft: 5, fontSize: 24}}>{`p${i + 1}`}</Text>
            </TouchableOpacity>
        )
        WinnerSelection.push(
            <View key={i + 1} style={{borderWidth: 2, borderRadius: 5, backgroundColor: selectedWinner === i + 1 ? 'lightcoral' : 'lavender'}}>
                <Button 
                    title={`p${i + 1}`}
                    color='black'
                    onPress={() => setSelectedWinner(i + 1)}
                />
            </View>
        )
        SidePotWinnerSelection.push(
            <View key={i + 1} style={{borderWidth: 2, borderRadius: 5, backgroundColor: sidePotSelectedWinner === i + 1 ? 'lightcoral' : 'lavender'}}>
                <Button 
                    title={`p${i + 1}`}
                    color='black'
                    onPress={() => setSidePotSelectedWinner(i + 1)}
                />
            </View>
        )

    }

    if (gameStarted) {
        for (let i = 1; i < totalSidePots; i++) {
            sidePots.push(
                <View key={i} style={{alignSelf: 'center', borderWidth: 2 ,borderRadius: 5 , backgroundColor: 'lavender'}}>
                    <Text style={{fontFamily: 'Copperplate', textAlign: 'center', marginBottom: 3}}>(Side Pot {i})</Text>
                    <Text style={{fontFamily: 'Copperplate', textAlign: 'center'}}>{sidePot}</Text>
                </View>
            )
        }
    }

    let blindLegend = (
        <View style={{borderWidth: 3, borderRadius: 5, backgroundColor: 'papayawhip', width: '30%', height: '10%', position: 'absolute', top: 240, alignSelf: 'center', display: toggleBBSelect === true ? 'flex' : 'none'}}>
            <Text style={{textAlign: 'center', fontSize: 10}}>If Applicable</Text>
            <View style={{width: '15%', height: '15%', backgroundColor: 'blue', position: 'absolute', left: 15, marginTop: 20, borderWidth: 1, borderRadius: 2}}>

            </View>
            <View style={{width: '15%', height: '15%', backgroundColor: 'lightcoral', position: 'absolute', left: 15, marginTop: 40, borderWidth: 1, borderRadius: 2}}>

            </View>
            <View style={{width: '15%', height: '15%', backgroundColor: 'purple', position: 'absolute', left: 15, marginTop: 60, borderWidth: 1, borderRadius: 2}}>

            </View>
            <Text style={{fontSize: 10, position: 'absolute', marginTop: 20, left: 35}}>= Big Blind</Text>
            <Text style={{fontSize: 10, position: 'absolute', marginTop: 40, left: 35}}>= Small Blind</Text>
            <Text style={{fontSize: 10, position: 'absolute', marginTop: 60, left: 35}}>= 1st To Act</Text>
        </View>
    )

    let beginButton = (
        <TouchableOpacity style={{borderWidth: 2, borderRadius: 5, backgroundColor: 'lavender', width: '35%', marginTop: 10, alignSelf: 'center', marginTop: '13%'}}
            onPress={() => initGameStart()}
        >
            <Text style={{fontFamily: 'Copperplate', textAlign: 'center', fontSize: 22}}>Begin</Text>
        </TouchableOpacity>
    )

    let submitWinnerButton = (
        <TouchableOpacity style={{borderWidth: 2, borderRadius: 5, backgroundColor: 'lavender', width: '55%', marginTop: 10, alignSelf: 'center'}}
            onPress={() => WinnerSubmitted()}
        >
            <Text style={{fontFamily: 'Copperplate', textAlign: 'center', marginBottom: 5, marginTop: 5}}>Submit</Text>
        </TouchableOpacity>
    )

    let nextRoundButton = (
        <TouchableOpacity style={{borderWidth: 2, borderRadius: 5, backgroundColor: 'lavender', width: '35%', top: '55%', alignSelf: 'center', display: roundTransition === true && winnerChosen === true ? 'flex' : 'none', position: 'absolute'}}
            onPress={() => user.socket.emit('initNextRound')}
        >
            <Text style={{fontFamily: 'Copperplate', textAlign: 'center', marginBottom: 5, marginTop: 5, fontSize: 20}}>Next Round</Text>
        </TouchableOpacity>
    )

    let playerGameView = (
        <TouchableOpacity style={{borderWidth: 2, borderRadius: 5, backgroundColor: 'lavender', display: gameStarted === true && playerView === true ? 'flex' : 'none', position: 'absolute', top: 300, width: '20%'}}
            onPress={() => setPlayerView(false)}
        >
            <Text style={{fontFamily: 'Copperplate', textAlign: 'center', marginRight: 5, marginLeft: 5, fontSize: 22}}>Game View</Text>
        </TouchableOpacity>
    )

    let BigBlindSelectionWindow = (
        <View style={{borderWidth: 4, borderRadius: 5, backgroundColor: 'papayawhip', minWidth: '60%', height: '20%', position: 'absolute', display: toggleBBSelect === true ? 'flex' : 'none'}}>
            <Text style={{fontSize: 18, textAlign: 'center', marginTop: 15, marginBottom: 20, fontFamily: 'Copperplate'}}>Choose The Big Blind</Text>
            <View style={{flexDirection: 'row', justifyContent: 'center', marginLeft: 5}}>
                {BigBlindSelection}
            </View>
            {beginButton}
        </View>
    )

    let WinnerSelectionWindow = (
        <View style={{borderWidth: 4, borderRadius: 5, backgroundColor: 'papayawhip', width: '60%', height: '20%', position: 'absolute', display: roundTransition === true && winnerChosen === false && user.playerGameObj.turn === 1 ? 'flex' : 'none'}}>
            <Text style={{fontSize: 20, textAlign: 'center', marginTop: 15, marginBottom: 10}}>Choose The Winner</Text>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                {WinnerSelection}
            </View>
            {submitWinnerButton}
        </View>
    )

    let InvitingUserToGameWindow = (
        <View style={{borderWidth: 3, borderRadius: 5, backgroundColor: 'papayawhip', alignSelf: 'center', width: '102%', height: '50%', display: initInvitingPlayer === true  ? 'flex' : 'none', position: 'absolute', top: '10%'}}>
            <TouchableOpacity style={style.xBttn}
                onPress={() => userXOutInvitingPlayer()}
            >
                <Text style={style.xBttnFont}>X</Text>
            </TouchableOpacity>

            <View style={{display: readyResponse === false  ? 'flex' : 'none', marginTop: '35%'}}>
                <Text style={{textAlign: 'center', fontSize: 22, position: 'absolute', alignSelf: 'center', top: -85, fontFamily: 'Copperplate'}}>Enter Username To Invite</Text>
                <TextInput 
                    value={usernameInvitingHolder}
                    onChangeText={(username) => usernameInviting = username}
                    style={styles.inputStyle}
                    placeholder='enter here'
                    ref={usernameRef}
                />

                <TouchableOpacity style={{borderWidth: 2, borderRadius: 5, backgroundColor: 'lavender', position: 'absolute', width: '40%', top: 80, alignSelf: 'center'}}
                    onPress={() => user.socket.emit('invitingPlayerToGame', usernameInviting)}
                >
                    <Text style={{fontFamily: 'Copperplate', textAlign: 'center', fontSize: 20}}>Invite</Text>
                </TouchableOpacity>


            </View>
            <View style={{display: readyResponse === true ? 'flex' : 'none', marginTop: '35%'}}>
                <Text style={{textAlign: 'center', fontSize: 24, fontFamily: 'Copperplate'}}>{responseText}</Text>  
            </View>



        </View>
    )

    let RestrictedInvitingPlayersWindow = (
        <View style={{borderWidth: 3, borderRadius: 5, backgroundColor: 'papayawhip', alignSelf: 'center', justifyContent: 'center', width: '102%', height: '50%', display: restrictionInvitingPlayers === true ? 'flex' : 'none', position: 'absolute', top: '10%'}}>
            <TouchableOpacity style={{borderBottomWidth: 2, borderRadius: 3, backgroundColor: 'lavender', position: 'absolute', top:-2, left: 0, width: '100%'}}
                onPress={() => userXOutInvitingPlayer()}
            >
                <Text style={style.xBttnFont}>X</Text>
            </TouchableOpacity>
            
            <View style={{width: '75%', alignSelf: 'center'}}>
                <Text style={{textAlign: 'center', fontFamily: 'Copperplate', fontSize: 20}}>{restrictionReason}</Text>
            </View>
        </View>
    )

    let ChangeGameSizeWindow = (
        <View style={{display: changeRS === true ? 'flex' : 'none', width: '102%', height: '50%', alignSelf: 'center', justifyContent: 'center', position: 'absolute', borderWidth: 3, borderRadius: 5, backgroundColor: 'papayawhip', top: '10%'}}>
            <TouchableOpacity style={{borderBottomWidth: 2, borderRadius: 3, backgroundColor: 'lavender', width: '100%', position: 'absolute', top: 0}}
                onPress={() => toggleRoomSizeChangeWindow()}
            >
                <Text style={style.xBttnFont}>X</Text>
            </TouchableOpacity>

            <View style={{display: roundTransition === true || gameStarted === false ? 'flex' : 'none'}}>
                <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 50, marginBottom: 10}}>
                    <TouchableOpacity style={{borderWidth: 2, width: '15%', alignSelf: 'center', backgroundColor: changeRSOptions === 2 ? 'lightcoral' : 'lavender', borderRadius: 5, marginRight: 5}} 
                        onPress={() => setChangeRSOptions(2)}
                    >
                        <Text style={{fontFamily: 'Copperplate', textAlign: 'center', fontSize: 28}}>2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{borderWidth: 2, width: '15%', alignSelf: 'center', backgroundColor: changeRSOptions === 3 ? 'lightcoral' : 'lavender', borderRadius: 5, marginRight: 5}} 
                        onPress={() => setChangeRSOptions(3)}
                    >
                        <Text style={{fontFamily: 'Copperplate', textAlign: 'center', fontSize: 28}}>3</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{borderWidth: 2, width: '15%', alignSelf: 'center', backgroundColor: changeRSOptions === 4 ? 'lightcoral' : 'lavender', borderRadius: 5, marginRight: 5}} 
                        onPress={() => setChangeRSOptions(4)}
                    >
                        <Text style={{fontFamily: 'Copperplate', textAlign: 'center', fontSize: 28}}>4</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{borderWidth: 2, width: '15%', alignSelf: 'center', backgroundColor: changeRSOptions === 5 ? 'lightcoral' : 'lavender', borderRadius: 5, marginRight: 5}} 
                        onPress={() => setChangeRSOptions(5)}
                    >
                        <Text style={{fontFamily: 'Copperplate', textAlign: 'center', fontSize: 28}}>5</Text>
                    </TouchableOpacity>
                </View>

                <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 50}}>
                    <TouchableOpacity style={{borderWidth: 2, width: '15%', alignSelf: 'center', backgroundColor: changeRSOptions === 6 ? 'lightcoral' : 'lavender', borderRadius: 5, marginRight: 5}} 
                        onPress={() => setChangeRSOptions(6)}
                    >
                        <Text style={{fontFamily: 'Copperplate', textAlign: 'center', fontSize: 28}}>6</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{borderWidth: 2, width: '15%', alignSelf: 'center', backgroundColor: changeRSOptions === 7 ? 'lightcoral' : 'lavender', borderRadius: 5, marginRight: 5}} 
                        onPress={() => setChangeRSOptions(7)}
                    >
                        <Text style={{fontFamily: 'Copperplate', textAlign: 'center', fontSize: 28}}>7</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{borderWidth: 2, width: '15%', alignSelf: 'center', backgroundColor: changeRSOptions === 8 ? 'lightcoral' : 'lavender', borderRadius: 5, marginRight: 5}} 
                        onPress={() => setChangeRSOptions(8)}
                    >
                        <Text style={{fontFamily: 'Copperplate', textAlign: 'center', fontSize: 28}}>8</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{borderWidth: 2, width: '15%', alignSelf: 'center', backgroundColor: changeRSOptions === 9 ? 'lightcoral' : 'lavender', borderRadius: 5, marginRight: 5}} 
                        onPress={() => setChangeRSOptions(9)}
                    >
                        <Text style={{fontFamily: 'Copperplate', textAlign: 'center', fontSize: 28}}>9</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={{alignContent: 'center', alignSelf: 'center', borderWidth: 2, borderRadius: 5, borderColor: 'black', backgroundColor: 'lavender'}}
                    onPress={() => roomSizeChangeSubmitted()} 
                >
                    <Text style={{fontFamily: 'Copperplate', textAlign: 'center', fontSize: 22, marginRight: 5, marginLeft: 5}}>Submit</Text>
                </TouchableOpacity>


            </View>

            <View style={{display: roundTransition === false && gameStarted === true ? 'flex' : 'none'}}>
                <View style={{width: '80%', alignSelf: 'center'}}>
                    <Text style={{textAlign: 'center', fontFamily: 'Copperplate', fontSize: 22}}>You Cannot Change The Room Size Currently. Please Wait Until The Next Round Is Over.</Text>
                </View>
            </View>
        </View>
    )

    let GameInfoWindow = (
        <View style={{borderWidth: 3, borderRadius: 5, backgroundColor: 'papayawhip', alignSelf: 'center', display: gameInfoDisplay === true ? 'flex' : 'none', width: '102%', height: '50%', position: 'absolute', top: '10%'}}>
            <TouchableOpacity style={style.xBttn}
                onPress={() => toggleGameInfoWindow()}
            >
                <Text style={style.xBttnFont}>X</Text>
            </TouchableOpacity>

            <View style={{marginTop: 10}}>
                <Text style={{textAlign: 'center', fontSize: 29, marginBottom: 20, fontFamily: 'Copperplate'}}>Buy-Ins: </Text>
                <View style={{flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'center', width: '45%'}}>
                    {BuyInsArr}
                </View> 
            </View>
            

        </View>
    )

    let AddOnWindow = (
        <View style={{width: '102%', height: '50%', alignSelf: 'center', position: 'absolute', borderWidth: 3, borderRadius: 5, backgroundColor: 'papayawhip', display: addOnWindow === true ? 'flex' : 'none', flex: 1, top: '10%'}}>
            <TouchableOpacity style={style.xBttn}
                onPress={() => toggleAddOnWindow()}
            >
                <Text style={style.xBttnFont}>X</Text>
            </TouchableOpacity>

            <View style={{display: restrictionAddOn === false ? 'flex' : 'none', alignItems: 'center', position: 'absolute', top: '20%', width: '100%'}}>
                <View style={{display: readyResponse === false ? 'flex' : 'none'}}>
                    <View style={{marginBottom: '19%', alignItems: 'center', marginTop: '2%'}}>
                        <Text style={{textAlign: 'center', fontSize: 26, fontFamily: 'Copperplate'}}>Enter Add-On</Text>
                    </View>
                    
                    <View style={{width: '100%', alignSelf: 'center', marginBottom: '18%'}}>
                        <TextInput 
                            value={addOnHolder}
                            onChangeText={(v) => addOnAmount = v}
                            keyboardType='numeric'
                            style={styles.inputStyle}
                            placeholder='enter here'
                            ref={addOnRef}
                        />
                    </View>
                    
                    <TouchableOpacity style={{borderWidth: 2, borderRadius: 3, backgroundColor: 'lavender', width: '40%', alignSelf: 'center'}}
                        onPress={() => user.playerGameObj.reBuys(Number(addOnAmount))}
                    >
                        <Text style={{fontFamily: 'Copperplate', fontSize: 22, marginRight: 5, marginLeft: 5}}>Submit</Text>
                    </TouchableOpacity>

                </View>

                <View style={{display: readyResponse === true ? 'flex' : 'none', width: '80%'}}>
                    <View style={{width: '80%', alignSelf: 'center'}}>
                        <Text style={{textAlign: 'center', fontSize: 22, fontFamily: 'Copperplate'}}>{responseText}</Text>
                    </View>
                </View>
            </View>

            <View style={{display: restrictionAddOn === true ? 'flex' : 'none'}}>
                <View style={{width: '80%', alignSelf: 'center', marginTop: '20%'}}>
                    <Text style={{textAlign: 'center', fontSize: 22, fontFamily: 'Copperplate'}}>{restrictionReason}</Text>
                </View>
            </View>
        </View>
    )
    

    //////////////////////////////////////////////////////////////////

    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            {PokerTable}
            {PlayerBorders}
            {StartButton}
            {BigBlindSelectionWindow}
            {playerGameView}
            {GameInfo}
            {blindLegend}
            {InGameMenuButton}
            {InGameMenu}
            {nextRoundButton}
            {WinnerSelectionWindow}
            {LeaveGameConfirmation}
            {InvitingUserToGameWindow}
            {RestrictedInvitingPlayersWindow}
            {ChangeGameSizeWindow}
            {GameInfoWindow}
            {AddOnWindow}
        </View>
    )

}

const styles = StyleSheet.create({
    inputStyle: {
        width: '80%',
        height: 40,
        padding: 10,
        marginVertical: 10,
        backgroundColor: '#DBDBD6'
    },

    bigBlind: {
        borderColor: 'blue'
    },

    smallBlind: {
        borderColor: 'lightcoral'
    },

    firstToAct: {
        borderColor: 'purple'
    },

    inputStyle: {
        width: '80%',
        height: 40,
        padding: 10,
        marginVertical: 10,
        backgroundColor: 'lavender',
        alignSelf: 'center',
        textAlign: 'center',
        borderWidth: 2,
        position: 'absolute',
        top: -35,
        borderRadius: 5
    },
})

