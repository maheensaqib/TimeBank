// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faUser, faCommentDots, faEnvelopeOpen } from "@fortawesome/free-regular-svg-icons";
import { faCoins, faBookOpen, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { auth, db } from "../../firebase";
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Navbar = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [currentUserCredits, setCurrentUserCredits] = useState(0);
  const [hasUnseen, setHasUnseen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
      {/* Left side */}
      <div className="flex items-center">
        {/* Hamburger (visible only on mobile) */}
        <button
          className="md:hidden text-black text-2xl mr-4"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center">
          <Link to="/home" className="font-semibold hover:text-red-600 flex items-center ml-6">
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
            {hasUnseen && <span className="absolute bottom-1 left-5 w-3 h-3 bg-red-600 rounded-full"></span>}
          </Link>
          <Link to="/offers" className="font-semibold hover:text-red-600 flex items-center ml-6">
            <FontAwesomeIcon icon={faEnvelopeOpen} className="text-xl text-black" />
            <span className="ml-2">Offers</span>
          </Link>
          <Link to="/assignment" className="font-semibold hover:text-red-600 flex items-center ml-6">
            <FontAwesomeIcon icon={faBookOpen} className="text-xl text-black" />
            <span className="ml-2">Assignments</span>
          </Link>
        </div>
      </div>

      {/* Right side (credits + profile pic) */}
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-[rgb(248_193_70)] flex flex-col items-start p-4 md:hidden">
          <Link to="/home" className="py-2 font-semibold hover:text-red-600 flex items-center" onClick={() => setMenuOpen(false)}>
            <FontAwesomeIcon icon={faHouse} className="mr-2" /> Home
          </Link>
          <Link to="/profile" className="py-2 font-semibold hover:text-red-600 flex items-center" onClick={() => setMenuOpen(false)}>
            <FontAwesomeIcon icon={faUser} className="mr-2" /> Profile
          </Link>
          <Link to="/chat" className="py-2 font-semibold hover:text-red-600 flex items-center relative" onClick={() => setMenuOpen(false)}>
            <FontAwesomeIcon icon={faCommentDots} className="mr-2" /> Chat
            {hasUnseen && <span className="ml-2 w-3 h-3 bg-red-600 rounded-full"></span>}
          </Link>
          <Link to="/offers" className="py-2 font-semibold hover:text-red-600 flex items-center" onClick={() => setMenuOpen(false)}>
            <FontAwesomeIcon icon={faEnvelopeOpen} className="mr-2" /> Offers
          </Link>
          <Link to="/assignment" className="py-2 font-semibold hover:text-red-600 flex items-center" onClick={() => setMenuOpen(false)}>
            <FontAwesomeIcon icon={faBookOpen} className="mr-2" /> Assignments
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
