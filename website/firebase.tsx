import {User} from "firebase/auth";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import React from "react";
import {useAuthState as uas} from "react-firebase-hooks/auth";
import {StyledFirebaseAuth} from "react-firebaseui";

const firebaseConfig = {
    apiKey: "AIzaSyDXm0AEHF4KhhOrradeieM3aAa2axQGf1c",
    authDomain: "keeb-43f9a.firebaseapp.com",
    projectId: "keeb-43f9a",
    storageBucket: "keeb-43f9a.appspot.com",
    messagingSenderId: "266862395969",
    appId: "1:266862395969:web:145758a3bd0fb96de6fcc0",
    measurementId: "G-4P3P8PSQ2H",
};

const uiConfig: firebaseui.auth.Config = {
    signInFlow: "popup",
    signInSuccessUrl: "/",
    signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
};

firebase.initializeApp(firebaseConfig);

export const Login = () => (
    <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
);

export const useAuthState: () => [
    User | null | undefined,
    boolean,
    Error | undefined,
] = uas.bind(null, firebase.auth());

export const logout = (): Promise<void> => {
    return firebase.auth().signOut();
};
