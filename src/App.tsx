import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useRef, useState } from "react";
import {
  addDoc,
  collection,
  DocumentData,
  getFirestore,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { Options } from "react-firebase-hooks/firestore/dist/firestore/types";

console.log(import.meta.env);

// Initialize Firebase app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_VERCEL_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_VERCEL_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_VERCEL_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_VERCEL_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_VERCEL_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_VERCEL_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export default function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 text-xl font-bold">
        <div className="container mx-auto flex justify-between items-center">
          <h1>Superchat</h1>
          <SignOut />
        </div>
      </header>
      <section className="flex-1 overflow-hidden">
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

const ChatRoom = () => {
  const messageRef = collection(firestore, "messages");
  const dummy = useRef<HTMLDivElement>(null);
  const q = query(messageRef, orderBy("createdAt"), limit(25));
  const [messages] = useCollectionData(q, { idField: "id" } as Options);
  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser || {};
    const msg = formValue;
    setFormValue("");

    await addDoc(messageRef, {
      text: msg,
      createdAt: new Date(),
      uid,
      photoURL,
    });
    dummy.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage} className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <Input
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="Type your message"
            className="flex-1"
          />
          <Button type="submit" disabled={!formValue}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

const ChatMessage = ({ message }: { message: DocumentData }) => {
  const { text, uid, photoURL } = message;
  const messageClass =
    uid === auth.currentUser?.uid ? "flex-row-reverse" : "flex-row";

  return (
    <div className={`flex items-end space-x-2 gap-2 ${messageClass}`}>
      <Avatar>
        <AvatarImage src={photoURL} alt="User avatar" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      <div
        className={`px-4 py-2 rounded-lg ${
          uid === auth.currentUser?.uid
            ? "bg-blue-500 text-white"
            : "bg-gray-200"
        }`}
      >
        {text}
      </div>
    </div>
  );
};

const SignIn = () => {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  return (
    <div className="flex items-center justify-center h-full">
      <Button onClick={signInWithGoogle} className="px-6 py-3 text-lg">
        Sign in with Google
      </Button>
    </div>
  );
};

const SignOut = () => {
  return (
    auth.currentUser && (
      <Button
        onClick={() => signOut(auth)}
        variant="ghost"
        className="text-white hover:text-blue-200"
      >
        Sign Out
      </Button>
    )
  );
};
