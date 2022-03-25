import {User} from "firebase/auth";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import React, {useState} from "react";
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

const storage = getStorage();

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

// TODO make url argument.
// TODO CORS
export const useStorageAsset = async () => {
    // const keyboardIndexReference = ref(storage, 'gs://keeb-43f9a-public/keyboard-index.json');
    // const keyboardIndexURL = await getDownloadURL(keyboardIndexReference);
    const keyboardIndexURL =
        "https://storage.googleapis.com/keeb-43f9a-public/keyboard-index.json";
    const keyboardIndexResponse = await fetch(keyboardIndexURL);
    const rawIndex = await keyboardIndexResponse.text();
    console.log(rawIndex);
};
useStorageAsset();
