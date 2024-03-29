import { StyleSheet, Text, View, TextInput, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import React, { useState, useRef } from 'react';
import { useNavigation } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import style from '../Styles/style';
import BackBttn from '../Components/BackBttnProfileSubPages';

const LogIn = ({route}) => {

    // Variables //

    const navigation = useNavigation();
    let user = route.params.paramKey

    let usernameHolder;
    let passwordHolder;

    const usernameRef = useRef();
    const passwordRef = useRef();

    let [username, setUsername] = useState(null);
    let [password, setPassword] = useState(null);

    let [loginFail, setLoginFail] = useState(false)
    let [responseText, setResponseText] = useState('');

    let [showPassword, setShowPassword] = useState(false);

    //////////////////////////////////////////////////////////////////

    // Functions //

    const userAttemptsToLogIn = () => {
        user.socket.emit('userLogsIn', username, password)
    }

    const togglePassword = () => {
        setShowPassword(!showPassword)
    }

    //////////////////////////////////////////////////////////////////

    // User Socket On's

    user.socket.on('logInSuccessful', (userInfo) => {
        user.setInfo('log_in', userInfo);

        navigation.navigate('Profile', {
            paramKey: user,
        })
    })

    user.socket.on('logInFailed', () => {
        setResponseText('User credientials are incorrect. Try again.')

        setLoginFail(true)

        setTimeout(() => {
            setLoginFail(false)
        }, 2000)
    })

    //////////////////////////////////////////////////////////////////

    return (
        <TouchableWithoutFeedback
            onPress={() => Keyboard.dismiss()}
        >
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'mistyrose', borderWidth: 8, borderRadius: 10, borderColor: 'lightgrey'}}>
                <BackBttn user={user} />
                <View style={{borderWidth: 3, backgroundColor: 'papayawhip', borderRadius: 5, width: '70%', position: 'absolute', top: 55}}>
                    <Text style={{fontSize: 30, textAlign: 'center', fontFamily: 'Copperplate', lineHeight: 38}}>Log In!</Text>
                </View>

                <View style={{width: '100%', height: 40, borderWidth: 3, borderRadius: 5, borderColor: 'red', backgroundColor: 'lavender', display: loginFail === true ? 'flex' : 'none', position: 'absolute', justifyContent: 'center', top: '15%'}}>
                    <Text style={{textAlign: 'center', fontSize: 14, fontFamily: 'Copperplate'}}>{responseText}</Text>
                </View>

                <View style={{width: '100%', marginTop: -310}}>

                    <TextInput 
                        value={usernameHolder}
                        onChangeText={(v) => setUsername(v)}
                        onSubmitEditing={() => passwordRef.current.focus()}
                        style={styles.inputStyle}
                        placeholder='Username/Email'
                        ref={usernameRef}
                        autoCorrect={false}
                    />
                    

                    <TextInput 
                        value={passwordHolder}
                        onChangeText={(v) => setPassword(v)}
                        style={styles.inputStyle}
                        placeholder='Password'
                        ref={passwordRef}
                        secureTextEntry={!showPassword}
                        autoCorrect={false}
                    />

                    <MaterialCommunityIcons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={24}
                        color="#aaa"
                        style={{position: 'absolute', top: 130, left: '90%'}}
                        onPress={() => togglePassword()}
                    />


                </View>
                <TouchableOpacity style={style.liSubmitBttn}
                    onPress={() => userAttemptsToLogIn()}
                >
                    <Text style={style.liSubmitBttnText}>Log In</Text>
                </TouchableOpacity>

            </View>
        </TouchableWithoutFeedback>
    )
}

export default LogIn

const styles = StyleSheet.create({
    inputStyle: {
        width: '100%',
        height: 60,
        padding: 10,
        marginVertical: 10,
        backgroundColor: 'papayawhip',
        alignSelf: 'center',
        borderBottomWidth: 2.5,
        borderTopWidth: 2.5,
        borderRadius: 3,
        fontSize: 15,
        textAlign: 'center',
        marginTop: 20,
        color: 'black'
    }
})