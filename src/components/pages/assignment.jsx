import React, { useState } from "react";
import Navbar from "./Navbar";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebase";

const AssignmentPage = () => {
  const [subject, setSubject] = useState("");
  const [subSubject, setSubSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // encodes file as base64
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Upload assignment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !topic || !subject || !subSubject) {
      alert("Please fill all fields and select a file.");
      return;
    }

    try {
      const base64File = await fileToBase64(file);

      await addDoc(collection(db, "assignment"), {
        subject,
        subSubject,
        topic,
        fileData: base64File,
        createdBy: auth.currentUser?.uid,
        createdAt: new Date(),
      });

      alert("Assignment uploaded successfully!");
      setSubject("");
      setSubSubject("");
      setTopic("");
      setFile(null);
    } catch (err) {
      console.error("Error uploading:", err);
    }
  };

  // Search assignment by topic
  const handleSearch = async () => {
    if (!searchTerm) return;

    const q = query(collection(db, "assignment"), where("topic", "==", searchTerm));
    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setResults(data);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload form */}
        <div className="bg-white p-4 rounded-lg shadow-md h-fit">
          <h2 className="text-xl text-[rgb(148_3_3)] font-bold mb-3">Upload Assignment</h2>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Sub-Subject"
              value={subSubject}
              onChange={(e) => setSubSubject(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Topic Name"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="p-2 border rounded"
            />
            <button type="submit" className="bg-[rgb(248_193_70)] text-white px-3 py-2 rounded hover:bg-[rgb(238_174_35)]">
              Upload
            </button>
          </form>
        </div>

        {/* Search + Results */}
        <div className="col-span-2 bg-white p-4 rounded-lg shadow-md h-[500px] overflow-y-auto">
          <h2 className="text-xl font-bold mb-3 text-[rgb(148_3_3)]">Search Assignments</h2>
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              placeholder="Enter Topic Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button onClick={handleSearch} className="bg-[rgb(168_3_3)] text-white px-3 py-2 rounded hover:bg-[rgb(148_3_3)]">
              Search
            </button>
          </div>

          {results.map((assignment) => (
            <div key={assignment.id} className="p-3 border-b">
              <p className="font-semibold">{assignment.topic}</p>
              <p className="text-sm text-gray-500">
                {assignment.subject} → {assignment.subSubject}
              </p>
              {/* download link */}
              <a
                href={assignment.fileData}
                download={`${assignment.topic}.pdf`}
                className="text-blue-600 underline"
              >
                Download File
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssignmentPage;
