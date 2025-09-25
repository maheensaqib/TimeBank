import React, { useState, useEffect } from "react";
import {
  collection, query, where, onSnapshot, doc, getDoc, getDocs, addDoc, serverTimestamp, orderBy, updateDoc,deleteDoc
} from "firebase/firestore";
import Navbar from "./Navbar";
import { db, auth } from "../../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingContext, setRatingContext] = useState(null);

  const currentUser = auth.currentUser;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Please log in to use the chat.
      </div>
    );
  }

  // ✅ Helper: mark completion
  const markOfferCompleted = async (offerId) => {
    if (!offerId) {
      console.error("Offer ID is undefined. Cannot mark as completed.");
      return;
    }
    const offerRef = doc(db, "offers", offerId);
    const offerSnap = await getDoc(offerRef);

    if (offerSnap.exists()) {
      const offerData = offerSnap.data();
      const completedBy = offerData.completedBy || [];

      if (!completedBy.includes(currentUser.uid)) {
        await updateDoc(offerRef, {
          completedBy: [...completedBy, currentUser.uid],
        });
      }

      // ✅ If both users marked as completed → trigger rating
      if (completedBy.length + 1 === 2) {
        setRatingContext({
            offerId: offerId,
            helperId: selectedChat.otherUser.id
        });
        setShowRating(true); // pop up modal
      }
    }
  };

  // ✅ Handle rating + credits transfer
const submitRating = async () => {
  if (!ratingContext) {
      console.error("Rating context is not set.");
      return;
  }
  const { offerId, helperId } = ratingContext;
  console.log("working");

  try {
    // Save rating
    await addDoc(collection(db, "ratings"), {
      offerId,
      raterId: currentUser.uid,
      helperId,
      rating,
      createdAt: serverTimestamp(),
    });

    // Create transaction (5 credits)
    await addDoc(collection(db, "transaction_collection"), {
      creditsExchanged: 5,
      date: serverTimestamp(),
      giverid: currentUser.uid,
      recieverid: helperId,
      requestid: offerId,
      status: "completed",
    });

    // ✅ Check if both users completed offer
   if (selectedChat?.id) {
        const offerRef = doc(db, "offers", offerId);
        const offerSnap = await getDoc(offerRef);

        if (offerSnap.exists() && offerSnap.data().completedBy?.length === 2) {
            await deleteDoc(doc(db, "chats", selectedChat.id));
            setSelectedChat(null); // reset UI
        }
    }


    setShowRating(false);
    setRating(0);
    setRatingContext(null); // Clean up context
  } catch (err) {
    console.error("❌ Error submitting rating:", err);
  }
};

// ✅ Corrected: Fetch conversations and user data reliably
useEffect(() => {
  if (!currentUser?.uid) return;

  const q = query(
    collection(db, "chats"),
    where("participats", "array-contains", currentUser.uid)
  );

  const unsubscribe = onSnapshot(q, async (querySnapshot) => {
    // Map each chat document to a promise that resolves with the full conversation data
    const conversationsPromises = querySnapshot.docs.map(async (docSnap) => {
      const convoData = docSnap.data();
      const otherUserId = convoData.participats.find(
        (id) => id !== currentUser.uid
      );

      let otherUser = null;
      if (otherUserId) {
        // Await the user document to ensure we have the data
        const userDoc = await getDoc(doc(db, "users", otherUserId));
        if (userDoc.exists()) {
          otherUser = { id: otherUserId, ...userDoc.data() };
        }
      }
      
      const msgsRef = collection(db, "chats", docSnap.id, "messeges");
      const msgsQuery = query(
          msgsRef,
          where("status", "==", "unseen"),
          where("senderid", "==", otherUserId)
      );
      const unseenSnap = await getDocs(msgsQuery); // Using getDocs for a one-time fetch

      return {
        id: docSnap.id,
        ...convoData,
        otherUser, // otherUser is now guaranteed to be populated or null
        hasUnseen: !unseenSnap.empty,
      };
    });

    // Wait for all the promises to resolve
    const resolvedConversations = await Promise.all(conversationsPromises);
    
    // Set the state once with the complete data
    setConversations(resolvedConversations);
  });

  return () => unsubscribe();
}, [currentUser.uid]);

  // Fetch messages
  useEffect(() => {
    if (!selectedChat) return;

    const q = query(
      collection(db, "chats", selectedChat.id, "messeges"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);

      const unseenMsgs = snapshot.docs.filter(
        (doc) =>
          doc.data().senderid !== currentUser.uid &&
          doc.data().status === "unseen"
      );

      unseenMsgs.forEach(async (docSnap) => {
        await updateDoc(doc(db, "chats", selectedChat.id, "messeges", docSnap.id), {
          status: "seen",
        });
      });
    });

    return () => unsubscribe();
  }, [selectedChat]);

  // Convert file → Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Send message
  const sendMessage = async () => {
    if ((!newMessage.trim() && !file) || !selectedChat) return;

    try {
      setUploading(true);

      let fileBase64 = "";
      if (file) {
        fileBase64 = await convertToBase64(file);
      }

      const docRef = await addDoc(
        collection(db, "chats", selectedChat.id, "messeges"),
        {
          text: newMessage || "",
          senderid: currentUser.uid,
          fileurl: fileBase64,
          status: "unseen",
          timestamp: serverTimestamp(),
        }
      );

      await updateDoc(doc(db, "chats", selectedChat.id, "messeges", docRef.id), {
        messegeid: docRef.id,
      });

      setNewMessage("");
      setFile(null);
    } catch (err) {
      console.error("❌ Error sending message:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar /> 

      {/* Main content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations list */}
        <div className="bg-white p-4 rounded-lg shadow-md h-[500px] overflow-y-auto">
          <h2 className="text-xl text-[rgb(148_3_3)] font-bold mb-3">Chats</h2>
          {conversations.map((convo) => (
            <button
              key={convo.id}
              onClick={() => setSelectedChat(convo)}
              className={`w-full text-left p-2 rounded mb-2 hover:bg-[rgb(249_205_109)] ${
                selectedChat?.id === convo.id ? "bg-[rgb(249_205_109)]" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold">{convo.otherUser?.name || "Unknown"}</p>
                {convo.hasUnseen && (
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Chat window */}
        <div className="col-span-2 bg-white p-4 rounded-lg shadow-md h-[500px] flex flex-col">
          {selectedChat ? (
            <>
              <h2 className="text-xl font-bold text-[rgb(148_3_3)] mb-3">
                Chat with {selectedChat.otherUser?.name}
              </h2>
              <div className="flex-1 overflow-y-auto border p-2 mb-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-2 p-2 rounded max-w-[70%] ${
                      msg.senderid === currentUser.uid
                        ? "bg-[rgb(248_193_70)] ml-auto text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {msg.text && <p>{msg.text}</p>}
                    {msg.fileurl &&
                      (msg.fileurl.startsWith("data:image") ? (
                        <img src={msg.fileurl} alt="upload" className="mt-2 max-w-full rounded" />
                      ) : (
                        <a
                          href={msg.fileurl}
                          download={msg.messegeid || "file"}
                          className="underline text-blue-600"
                        >
                          📎 File
                        </a>
                      ))}
                  </div>
                ))}
              </div>

              {/* ✅ Mark completion button */}
              <button
                onClick={() => markOfferCompleted(selectedChat.requestid)}
                disabled={!selectedChat.otherUser}
                className="mb-3 bg-green-600 text-white px-3 py-1 rounded"
              >
                Mark as Completed
              </button>

              <div className="flex items-center">
                <label className="cursor-pointer px-2">
                  <FontAwesomeIcon icon={faPaperclip} className="text-gray-500" />
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>

                {file && (
                  <span className="text-sm text-gray-600 mr-2 truncate max-w-[150px]">
                    {file.name}
                  </span>
                )}

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-l px-2 py-1"
                />
                <button
                  onClick={sendMessage}
                  disabled={uploading}
                  className={`px-4 rounded-r text-white ${
                    uploading ? "bg-gray-400" : "bg-[rgb(148_3_3)]"
                  }`}
                >
                  {uploading ? "Sending..." : "Send"}
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center m-auto">
              Select a chat to start messaging
            </p>
          )}
        </div>
      </div>

      {/* ✅ Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-bold mb-4">Rate your helper</h3>
            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`cursor-pointer text-2xl ${
                    star <= rating ? "text-yellow-500" : "text-gray-400"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <button
              onClick={submitRating}
              className="bg-[rgb(148_3_3)] text-white px-4 py-2 rounded"
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;