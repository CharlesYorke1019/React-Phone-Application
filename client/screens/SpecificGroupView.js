import { Text, View, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import InvitingFriendsToGroup from './InvitingFriendsToGroup';
import { useNavigation } from '@react-navigation/native'
import SpecificGroupSettings from './SpecificGroupSettings';
import Icon from 'react-native-vector-icons/Ionicons'

const SpecificGroupView = ({user, currentView, setDisplayOpen, groupName}) => {

    // Variables //

    const navigation = useNavigation();

    let membersArr = [];

    let [invitingMember, setInvitingMember] = useState(false);

    let [selectGroupMembers, setSelectGroupMembers] = useState([]);

    let [initStartGame, setInitStartGame] = useState(false);

    let [initLeaveGroup, setInitLeaveGroup] = useState(false)

    let [settingsPage, setSettingsPage] = useState(false)

    let groupButtonsArr = [];

    
    //////////////////////////////////////////////////////////////////

    // Functions //

    const initGroupInvite = () => {
        setInvitingMember(true)
    }

    const invitingPlayersToGroupGame = (username) => {
        if (initStartGame) {
            if (!selectGroupMembers.includes(username)) {
                
                selectGroupMembers.push(username)
                // setSelectGroupMembers(selectGroupMembers)

                setSelectGroupMembers([
                    ...selectGroupMembers
                ])

                

            } else {

                for (let i = 0; i < selectGroupMembers.length; i++) {
                    if (selectGroupMembers[i] === username) {
                        selectGroupMembers.splice(i, 1);
                        setSelectGroupMembers([
                            ...selectGroupMembers
                        ])
                    }
                }

            }
        }
    }

    const userBeginsGameWithGroup = () => {
        let mArr = [];

        for (let i = 0; i < selectGroupMembers.length; i++) {
            mArr.push(user.groups[groupName].members[selectGroupMembers[i]]);
        }

        user.socket.emit('startingGameWithGroup', mArr);
    }

    const userConfirmsLeaveGroup = () => {
        user.socket.emit('userLeavesGroup', groupName);
    }

    const xOutOfStartGame = () => {
        setSelectGroupMembers([]);
        setInitStartGame(false);
    }

    
    //////////////////////////////////////////////////////////////////

    // User Socket On's //

    user.socket.on('gameThroughGroupConfirmed', (membersInvitedArr) => {
        user.creatingGameMethod = 'group_game';
        user.groupMembersGameArr = membersInvitedArr;
        navigation.navigate('CreateGame', {
            paramKey: user
        })
    })

    user.socket.on('leaveGroupConfirmed', (groups) => {

        user.updateGroupsAll(groups)

        navigation.navigate('Profile', {
            paramKey: user
        })
    })

    //////////////////////////////////////////////////////////////////

    // Specific Group Elements //

    if (currentView) {
        for (var key in user.groups) {
            if (key === groupName) {
                for (let i = 0; i < user.groups[key].members.length; i++) {
                    if (user.groups[key].members[i] != user.accountInfo.username) {
                        membersArr.push(
                            <TouchableOpacity key={i} style={{ borderWidth: 2, borderRadius: 5, minWidth: '25%', maxHeight: '15%', justifyContent: 'center', marginTop: 10, justifyContent: 'center', alignContent: 'center', backgroundColor: selectGroupMembers.includes(i) ? 'lightcoral' : 'lavender', marginRight: '2%'}} disabled={!initStartGame}
                                onPress={() => invitingPlayersToGroupGame(i)}
                            >
                                <Text style={{textAlign: 'center', fontFamily: 'Copperplate', fontSize: 20, marginRight: 5, marginLeft: 5, marginBottom: 5, marginTop: 5}}>{user.groups[key].members[i]}</Text>
                            </TouchableOpacity>
                        )
                    }
                }
                if (user.groups[key].host === user.accountInfo.username) {
                    groupButtonsArr.push(
                        <View key={'hostStuff'} style={{alignSelf: 'center', justifyContent: 'center', position: 'absolute', top: '100%'}}>
                            <TouchableOpacity style={{borderWidth: 3, borderRadius: 5, backgroundColor: 'lavender', alignSelf: 'center', marginBottom: 15}}
                                onPress={() => setInitStartGame(true)}
                            >
                                <Text style={{textAlign: 'center', fontSize: 20, fontFamily: 'Copperplate', margin: 5}}>Start Game</Text>
                            </TouchableOpacity>
                        </View>,

                        <TouchableOpacity key={'hostStuff2'} style={{position: 'absolute', top: '19%', alignSelf: 'center'}}
                        onPress={() => setSettingsPage(true)}
                        >
                        <Icon name='settings' size={25}></Icon>
                        </TouchableOpacity> ,

                        <TouchableOpacity key={'hostStuff3'} style={{borderWidth: 3, borderRadius: 5, backgroundColor: 'lavender', alignSelf: 'center', justifyContent: 'center', position: 'absolute', top: '87%'}}
                            onPress={() => initGroupInvite()}
                        >
                            <Text style={{textAlign: 'center', fontFamily: 'Copperplate', fontSize: 20, marginRight: 5, marginLeft: 5, marginBottom: 5, marginTop: 5}}>Invite Members</Text>
                        </TouchableOpacity>
                    )
                } else {
                    groupButtonsArr.push(
                        <View key={'memberStuff'} style={{alignSelf: 'center', justifyContent: 'center', position: 'absolute', top: 500}}>
                            <TouchableOpacity style={{borderWidth: 3, borderRadius: 5, backgroundColor: 'lavender', alignSelf: 'center', marginBottom: 15}}
                                onPress={() => setInitLeaveGroup(true)}
                            >
                                <Text style={{textAlign: 'center', fontSize: 22, marginRight: 5, marginLeft: 5, fontFamily: 'Copperplate'}}>Leave Group</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }
            }
        }
    }

    //////////////////////////////////////////////////////////////////

    return (
        <View style={{borderWidth: 3, borderRadius: 5, backgroundColor: 'papayawhip', height: '85%'}}>
            <View style={{display: invitingMember === false && initStartGame === false && initLeaveGroup === false && settingsPage === false ? 'flex' : 'none', height: '90%'}}>
              
                <TouchableOpacity style={{borderBottomWidth: 2, backgroundColor: 'lavender'}}
                    onPress={() => setDisplayOpen(false)}
                >
                    <Text style={{fontFamily: 'Copperplate', fontSize: 20, lineHeight: 40, textAlign: 'center'}}>X</Text>
                </TouchableOpacity>

                <View style={{width: '80%', position: 'absolute', alignSelf: 'center', top: '10%'}}>
                    <Text style={{fontSize: 30, textAlign: 'center', borderBottomWidth: 2, fontFamily: 'Copperplate'}}>{groupName}</Text>
                </View>
        
                <View style={{position: 'absolute', alignSelf: 'center', top: '27%'}}>
                    <Text style={{textAlign: 'center', fontSize: 20, fontFamily: 'Copperplate'}}>Members</Text>
                </View>

                <View style={{borderWidth: 3, borderRadius: 5, width: '90%', height: '53%', alignSelf: 'center', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', position: 'absolute', top: '31%'}}>
                    {membersArr}
                </View>
                {groupButtonsArr}
            </View>
            <View style={{display: invitingMember === true ? 'flex' : 'none', height: '100%', width: '100%', alignSelf: 'center'}}>
                <InvitingFriendsToGroup user={user} setCurrentView={setInvitingMember} groupName={groupName} />
            </View>

            <View style={{display: initStartGame === true ? 'flex' : 'none'}}>
        
                <TouchableOpacity style={{borderBottomWidth: 2, backgroundColor: 'lavender'}}
                    onPress={() => xOutOfStartGame()}
                >
                    <Text style={{fontFamily: 'Copperplate', textAlign: 'center', fontSize: 20, lineHeight: 40}}>Back</Text>
                </TouchableOpacity>

                <Text style={{textAlign: 'center', marginTop:'5%', marginBottom:'6%', fontSize: 22, fontFamily: 'Copperplate', width: '75%', alignSelf: 'center'}}>Select The Group Members To Invite</Text>
                <View style={{borderWidth: 3, borderRadius: 5, width: '90%', height: '50%', alignSelf: 'center', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '6%'}}>
                    {membersArr}
                </View>

                <TouchableOpacity style={{borderWidth: 2, backgroundColor: 'lavender', width: '45%', alignSelf: 'center', borderRadius: 5, position: 'absolute', top: '85%'}}
                    onPress={() => setSelectGroupMembers([])}
                >
                    <Text style={{fontFamily: 'Copperplate', textAlign: 'center', fontSize: 18, margin: '2%'}}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{borderWidth: 2, backgroundColor: 'lavender', position: 'absolute', top: '115%', height: '10%', justifyContent: 'center', alignSelf: 'center', borderRadius: 5, width: '70%'}}
                    onPress={() => userBeginsGameWithGroup()}
                >
                    <Text style={{fontFamily: 'Copperplate', textAlign: 'center', fontSize: 20, margin: '2%'}}>Begin Game</Text>
                </TouchableOpacity>

            </View>

            <View style={{display: initLeaveGroup === true ? 'flex' : 'none', height: '100%'}}>
                <View style={{width: '85%', alignSelf: 'center', marginTop: 20, marginBottom: 50}}>
                    <Text style={{fontFamily: 'Copperplate', fontSize: 24, textAlign: 'center'}}>Are You Sure You Want To Leave This Group?</Text>
                </View>

                <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                    <TouchableOpacity style={{borderWidth: 3, borderRadius: 5, backgroundColor: 'lavender', justifyContent: 'center', marginRight: 10}}
                        onPress={() => userConfirmsLeaveGroup()}
                    >
                        <Text style={{fontFamily: 'Copperplate', fontSize: 26, textAlign: 'center', margin: 3}}>Yes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{borderWidth: 3, borderRadius: 5, backgroundColor: 'lavender', justifyContent: 'center'}}
                        onPress={() => setInitLeaveGroup(false)}
                    >
                        <Text style={{fontFamily: 'Copperplate', fontSize: 26, textAlign: 'center', margin: 3}}>No</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{display: settingsPage === true ? 'flex' : 'none', height: '100%'}}>
                <SpecificGroupSettings user={user} groupName={groupName} currentView={settingsPage} setCurrentView={setSettingsPage} />
            </View>


        </View>
    )
}

export default SpecificGroupView