import firebase from "firebase/app";
import "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import "firebase/firestore";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useRef, useState } from "react";

// Initialize Firebase app
firebase.initializeApp({
  apiKey: "AIzaSyB3k_PTFFeGgwI8YiJmXn21Q4uvQqG757M",
  authDomain: "superchat-69c81.firebaseapp.com",
  projectId: "superchat-69c81",
  storageBucket: "superchat-69c81.firebasestorage.app",
  messagingSenderId: "944802448751",
  appId: "1:944802448751:web:31493c79de0f2749e9149a",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

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
  const messageRef = firestore.collection("messages");
  const dummy = useRef();
  const query = messageRef.orderBy("createdAt").limit(25);
  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: new Date(),
      uid,
      photoURL,
    });
    setFormValue("");
    dummy.current!.scrollIntoView({ behavior: "smooth" });
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

const ChatMessage = ({ message }) => {
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
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
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
        onClick={() => auth.signOut()}
        variant="ghost"
        className="text-white hover:text-blue-200"
      >
        Sign Out
      </Button>
    )
  );
};
