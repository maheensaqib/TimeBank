// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faUser, faCommentDots, faEnvelopeOpen } from "@fortawesome/free-regular-svg-icons";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { auth, db } from "../../firebase";
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Navbar = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [currentUserCredits, setCurrentUserCredits] = useState(0);
  const [hasUnseen, setHasUnseen] = useState(false);

  // ✅ Fetch profile picture
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.pictureUrl) {
              setProfilePic(userData.pictureUrl);
            }
          }
        } catch (err) {
          console.error("Error fetching profile picture:", err);
        }
      } else {
        setProfilePic(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Calculate credits
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const calculateCredits = async () => {
      let creditsReceived = 0;
      let creditsGiven = 0;

      const receivedQuery = query(collection(db, "transaction_collection"), where("recieverid", "==", currentUser.uid));
      const receivedSnapshot = await getDocs(receivedQuery);
      receivedSnapshot.forEach((doc) => {
        creditsReceived += doc.data().creditsExchanged;
      });

      const givenQuery = query(collection(db, "transaction_collection"), where("giverid", "==", currentUser.uid));
      const givenSnapshot = await getDocs(givenQuery);
      givenSnapshot.forEach((doc) => {
        creditsGiven += doc.data().creditsExchanged;
      });

      setCurrentUserCredits(creditsReceived - creditsGiven);
    };

    const transactionsQuery = query(collection(db, "transaction_collection"));
    const unsubscribe = onSnapshot(transactionsQuery, () => {
      calculateCredits();
    });

    calculateCredits();
    return () => unsubscribe();
  }, []);

  // ✅ Unseen messages
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(collection(db, "chats"), where("participats", "array-contains", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setHasUnseen(false);
        return;
      }

      let anyUnseen = false;
      snapshot.docs.forEach((chatDoc) => {
        const msgsRef = collection(db, "chats", chatDoc.id, "messeges");
        const msgsQuery = query(
          msgsRef,
          where("status", "==", "unseen"),
          where("senderid", "!=", auth.currentUser.uid)
        );

        onSnapshot(msgsQuery, (msgsSnap) => {
          if (!msgsSnap.empty) {
            anyUnseen = true;
            setHasUnseen(true);
          }
        });
      });

      if (!anyUnseen) setHasUnseen(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <nav className="sticky top-0 bg-[rgb(248_193_70)] shadow-xl flex justify-between items-center p-4 z-10">
      <div className="flex items-center">
        <Link to="/home" className="font-semibold hover:text-red-600 flex items-center">
          <FontAwesomeIcon icon={faHouse} className="text-xl text-black" />
          <span className="ml-2">Home</span>
        </Link>
        <Link to="/profile" className="font-semibold hover:text-red-600 flex items-center ml-6">
          <FontAwesomeIcon icon={faUser} className="text-xl text-black" />
          <span className="ml-2">Profile</span>
        </Link>
        <Link to="/chat" className="font-semibold hover:text-red-600 flex items-center ml-6 relative">
          <FontAwesomeIcon icon={faCommentDots} className="text-xl text-black" />
          <span className="ml-2">Chat</span>
          {hasUnseen && <span className="bottom-1 left-5 w-3 h-3 bg-red-600 rounded-full"></span>}
        </Link>
        <Link to="/offers" className="font-semibold hover:text-red-600 flex items-center ml-6">
          <FontAwesomeIcon icon={faEnvelopeOpen} className="text-xl text-black" />
          <span className="ml-2">Offers</span>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center bg-[rgb(148_3_3)] px-3 py-1 rounded-full">
          <FontAwesomeIcon icon={faCoins} className="text-[rgb(248_193_70)]" />
          <span className="font-bold text-[rgb(248_193_70)] ml-2">{currentUserCredits}</span>
        </div>
        <img
          src={profilePic || "/default-profile.png"}
          alt="profile"
          className="w-8 h-8 rounded-full object-cover"
        />
      </div>
    </nav>
  );
};

export default Navbar;
