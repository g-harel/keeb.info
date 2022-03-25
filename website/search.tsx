import {Storage} from "@google-cloud/storage";

// TODO make url argument.
// TODO CORS
// TODO doesn't work in-browser!!!
export const useStorageAsset = async () => {
    // const keyboardIndexReference = ref(storage, 'gs://keeb-43f9a-public/keyboard-index.json');
    // const keyboardIndexURL = await getDownloadURL(keyboardIndexReference);const bucketName='bucket name here';

    const storage = new Storage();
    const file = storage
        .bucket("keeb-43f9a-public")
        .file("keyboard-index.json");

    file.download((err, contents) => {
        console.log("file err: " + err);
        console.log("file data: " + contents);
    });

    // const keyboardIndexURL =
    //     "https://storage.googleapis.com/keeb-43f9a-public/keyboard-index.json";
    // const keyboardIndexResponse = await fetch(keyboardIndexURL);
    // const rawIndex = await keyboardIndexResponse.text();
    // console.log(rawIndex);
};
useStorageAsset();
