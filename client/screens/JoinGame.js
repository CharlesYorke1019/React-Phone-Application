import { Button, StyleSheet, Text, View, TextInput, LogBox, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native'
import GoHomeButton from '../Components/GoHomeButton';
import ProfileButton from '../Components/ProfileButton';

const JoinGame = ({route}) => {

    // Variables //

    const navigation = useNavigation();
    let user = route.params.paramKey

    let enteredGameCode = null;
    let gameCodeHolder;

    //////////////////////////////////////////////////////////////////

    // Functions //

    LogBox.ignoreLogs([
        'Non-serializable values were found in the navigation state',
    ]);

    user.changeCurrentPage('JoinGame')

    //////////////////////////////////////////////////////////////////

    // User Socket On's //

    user.socket.on('userIsClearedToJoinGame', () => {
        navigation.navigate('PlayerInGameDisplays', {
            paramKey: user,
        })
    })

    //////////////////////////////////////////////////////////////////

    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 8, borderRadius: 10, borderColor: 'lightgrey', backgroundColor: 'mistyrose'}}>
            <ProfileButton sentU={user} />
            <GoHomeButton user={user} />
            <View style={{position: 'absolute', top: 150, width: '100%'}}>
                <Text style={{fontSize: 32, textAlign: 'center', borderWidth: 3, borderRadius: 5, backgroundColor: 'papayawhip', fontFamily: 'Copperplate'}}>Enter Game Code</Text>
            </View>
            <View style={{backgroundColor: 'papayawhip', width: '100%', borderWidth: 3, borderRadius: 5, position: 'absolute', top: 235}}>
                <View>
                        <TextInput 
                            value={gameCodeHolder}
                            onChangeText={(gameCode) => enteredGameCode = gameCode}
                            style={styles.inputStyle}
                            placeholder='enter here'
                        />
                </View>
                <TouchableOpacity style={{borderWidth: 2, borderRadius: 5, backgroundColor: 'lavender', width: '35%', alignSelf: 'center', marginBottom: 40}}
                    onPress={() => user.socket.emit('playerEntersGameCode', enteredGameCode)}
                >
                    <Text style={{fontFamily: 'Copperplate', textAlign: 'center', fontSize: 22, marginRight: 5, marginLeft: 5}}>Join Lobby</Text>
                </TouchableOpacity>

            </View>
        </View>
    )
}

export default JoinGame


const styles = StyleSheet.create({
    inputStyle: {
        width: '80%',
        height: 40,
        padding: 10,
        marginVertical: 10,
        backgroundColor: 'lavender',
        alignSelf: 'center',
        borderWidth: 3,
        borderRadius: 5,
        borderColor: 'black',
        textAlign: 'center',
        marginBottom: 60,
        marginTop: 30
    }
})