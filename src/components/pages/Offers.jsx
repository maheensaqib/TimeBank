import { useState,} from "react";
import { auth, db } from "../../firebase";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import Navbar from "./Navbar";

function Offers() {
  const [subject, setSubject] = useState("");
  const [subSubject, setSubSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to create an offer!");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "offers"), {
        userId: user.uid,
        subject,
        subSubject,
        description,
        createdAt: serverTimestamp(),
        status: "open", // open → accepted → completed
        completedBy: [],
      });

      setSubject("");
      setSubSubject("");
      setDescription("");
      setSuccess(true);
    } catch (error) {
      console.error("Error creating offer: ", error);
      alert("Failed to create offer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
     <Navbar /> 
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-4 text-[rgb(148,3,3)]">
            Create a New Offer
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(148,3,3)]"
              />
            </div>
            <div>
              <label className="block font-medium">Sub-Subject</label>
              <input
                type="text"
                value={subSubject}
                onChange={(e) => setSubSubject(e.target.value)}
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(148,3,3)]"
              />
            </div>
            <div>
              <label className="block font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(148,3,3)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[rgb(148,3,3)] text-white py-2 rounded-md hover:bg-[rgb(180,4,4)] transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Offer"}
            </button>
          </form>

          {success && (
            <p className="text-green-600 text-center mt-4">
              ✅ Offer created successfully!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Offers;
