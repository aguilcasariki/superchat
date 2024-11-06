/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { Filter } from "bad-words";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const detectEvilUsers = onDocumentCreated(
  "messages/{messageId}",
  async (event) => {
    const filter = new Filter();

    // Check if the document data exists
    const documentSnapshot = event.data;

    if (documentSnapshot) {
      const { text, uid } = documentSnapshot.data();

      if (filter.isProfane(text)) {
        const cleaned = filter.clean(text);
        await documentSnapshot.ref.update({
          text: "I got BANNED for saying " + cleaned,
        });
        await db.collection("banned").doc(uid).set({});
      }
    } else {
      console.error("Document snapshot is undefined or does not exist.");
    }
  }
);
