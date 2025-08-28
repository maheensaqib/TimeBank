import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import {collection, getDocs, doc, getDoc, query, where, addDoc, onSnapshot} from "firebase/firestore";
import { db, auth } from "../../firebase"; // adjust path
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComputer,
  faCalculator,
  faAtom,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

const Home = () => {
  const [subjectsData, setSubjectsData] = useState([]);
  const [offers, setOffers] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  const subjectIcons = {
    "Computer Science": faComputer,
    Maths: faCalculator,
    Physics: faAtom,
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Subjects"));
        const subjects = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubjectsData(subjects);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        const offersSnapshot = await getDocs(collection(db, "offers"));

        const offersList = await Promise.all(offersSnapshot.docs.map(async (offerDoc) => {
          const offerData = offerDoc.data();
          let userDetails = { name: "Unknown User", averageRating: 0, ratingCount: 0 };

          if (offerData.userId) {
            const userDoc = await getDoc(doc(db, "users", offerData.userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              userDetails.name = userData.name || "Unknown User";
              const ratingsQuery = query(collection(db, "ratings"), where("helperId", "==", offerData.userId));
              const ratingsSnapshot = await getDocs(ratingsQuery);

              if (!ratingsSnapshot.empty) {
                let totalRating = 0;
                ratingsSnapshot.forEach(ratingDoc => {
                  totalRating += ratingDoc.data().rating;
                });
                userDetails.averageRating = totalRating / ratingsSnapshot.size;
                userDetails.ratingCount = ratingsSnapshot.size;
              }
            }
          }

          return {
            id: offerDoc.id,
            ...offerData,
            user: userDetails
          };
        }));

        setOffers(offersList);

      } catch (err) {
        console.error("Error fetching offer details:", err);
      }
    };

    fetchOfferDetails();
  }, []);


  const handleAccept = async (offer) => {
    const currentUserId = auth.currentUser.uid;
    const otherUserId = offer.userId;
    const q = query(
      collection(db, "chats"),
      where("participats", "array-contains", currentUserId)
    );
    const snapshot = await getDocs(q);
    let convoExists = false;
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const participants = data.participats;
      if (
        participants.includes(currentUserId) &&
        participants.includes(otherUserId) &&
        data.requestid === offer.id
      ) {
        convoExists = true;
      }
    });
    if (!convoExists) {
      await addDoc(collection(db, "chats"), {
        participats: [currentUserId, otherUserId],
        requestid: offer.id,
        last_message: "",
        last_message_time: new Date(),
      });
    }
    navigate("/chat");
  };
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
       <Navbar /> 

      {/* Main content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subjects menu */}
        {/* ✅ RESTORED: This is the original code to display your subjects */}
        <div className="bg-white p-4 rounded-lg shadow-md h-fit">
          <h2 className="text-xl text-[rgb(148_3_3)] font-bold mb-3">Subjects</h2>
          {subjectsData.map((subject) => (
            <div key={subject.id} className="mb-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedSubject(subject);
                  setSelectedSub(null);
                }}
                className={`w-full text-left font-medium p-2 rounded hover:bg-[rgb(249_205_109)] flex items-center ${selectedSubject?.id === subject.id ? "bg-[rgb(249_205_109)]" : ""
                  }`}
              >
                <span>{subject.name}</span>
                {subjectIcons[subject.name] && (
                  <FontAwesomeIcon
                    icon={subjectIcons[subject.name]}
                    className="ml-2 text-gray-600"
                  />
                )}
              </button>

              {selectedSubject?.id === subject.id && (
                <div className="pl-4 mt-1">
                  {subject.subskills.map((sub) => (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => setSelectedSub(sub)}
                      className={`block w-full text-left text-[rgb(148_3_3)] p-1 rounded hover:bg-[rgb(252_231_186)] ${selectedSub === sub ? "bg-[rgb(252_231_186)] font-bold" : ""
                        }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Offers list */}
        <div className="col-span-2 bg-white p-4 rounded-lg shadow-md h-[500px] overflow-y-auto">
          <h2 className="text-xl font-bold mb-3 text-[rgb(148_3_3)]">
            {selectedSub ? `Offers for ${selectedSub}` : "Select a subject to see offers"}
          </h2>

          {selectedSub &&
            offers
              .filter((offer) => offer.subSubject === selectedSub && offer.userId !== auth.currentUser?.uid)
              .map((offer) => {
                return (
                  <div
                    key={offer.id}
                    className="flex justify-between items-center p-3 mb-2 border rounded hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-semibold">{offer.user?.name || "Unknown User"}</p>
                      <p className="text-sm text-gray-500">
                        Subject: {offer.subject} → {offer.subSubject}
                      </p>
                      <p className="text-sm text-gray-500">{offer.description}</p>
                      <div className="flex items-center text-sm">
                        <p className="text-gray-500 mr-1">
                          Rating: {offer.user.averageRating?.toFixed(1) || "N/A"} ({offer.user.ratingCount} reviews)
                        </p>
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleAccept(offer)} className="bg-[rgb(248_193_70)] text-white px-3 py-1 rounded hover:bg-[rgb(238_174_35)]">
                        Accept
                      </button>
                      <button className="bg-[rgb(168_3_3)] text-white px-3 py-1 rounded hover:bg-[rgb(148_3_3)]">
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
};

export default Home;