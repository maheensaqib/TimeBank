import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import { auth, db } from "../../firebase"; // adjust path
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCamera } from '@fortawesome/free-solid-svg-icons';
import Navbar from "./Navbar";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;

      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data());
        setFormData(userSnap.data());
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, formData);

    setUserData(formData);
    setEditMode(false);
    alert("Profile updated successfully!");
  };

  if (!userData) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
     <Navbar /> 

      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-red-50 to-orange-100 flex justify-center items-start py-10">
        <div className="bg-white w-full max-w-4xl p-8 rounded-2xl shadow-2xl border border-red-200">
          {/* Profile Picture */}
<div className="flex flex-col items-center mb-8">
  <div className="relative">
    <img
      src={formData.pictureUrl  || "/default-profile.png"}
      alt="Profile"
      className="w-32 h-32 rounded-full border-4 border-[rgb(158,3,3)] shadow-md object-cover"
    />

    {editMode && (
      <>
        {/* Hidden file input */}
        <input
          type="file"
          id="profilePicInput"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                setFormData({ ...formData, pictureUrl: reader.result }); // ✅ store Base64
              };
              reader.readAsDataURL(file);
            }
          }}
        />

        {/* Camera Icon Button */}
        <button
          type="button"
          onClick={() => document.getElementById("profilePicInput").click()}
          className="absolute bottom-2 right-2 bg-[rgb(158,3,3)] text-white p-2 rounded-full shadow hover:bg-[rgb(148,3,3)]"
        >
          <FontAwesomeIcon icon={faCamera} className="w-4 h-4" />
        </button>
      </>
    )}
  </div>

            <h2 className="text-3xl font-bold mt-4 text-[rgb(158,3,3)]">
              {userData.name}
            </h2>
            <p className="text-gray-600">{userData.email}</p>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="bg-red-50 p-4 rounded-xl">
              <label className="block font-semibold text-[rgb(158,3,3)]">Name</label>
              {editMode ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="p-2">{userData.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="bg-yellow-50 p-4 rounded-xl">
              <label className="block font-semibold text-yellow-700">Email</label>
              {editMode ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="p-2">{userData.email}</p>
              )}
            </div>

            {/* Bio */}
            <div className="bg-red-50 p-4 rounded-xl">
              <label className="block font-semibold text-[rgb(158,3,3)]">Bio</label>
              {editMode ? (
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="p-2">{userData.bio || "No bio yet."}</p>
              )}
            </div>

            {/* Skills */}
            <div className="bg-yellow-50 p-4 rounded-xl">
              <label className="block font-semibold text-yellow-700">Skills</label>
              {editMode ? (
                <input
                  type="text"
                  name="skills"
                  value={Array.isArray(formData.skills) ? formData.skills.join(",") : formData.skills}
                  onChange={(e) => setFormData({
                    ...FormData, skills: e.target.value.split(",").map((skill) => skill.trim()),

                  })}
                  placeholder="E.g. Linear Algebra, Physics"
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="p-2">{Array.isArray(userData.skills) ? userData.skills.join(",") : userData.skills}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="bg-red-50 p-4 rounded-xl">
              <label className="block font-semibold text-[rgb(158,3,3)]">Date of Birth</label>
              {editMode ? (
                <input
                  type="date"
                  name="dob"
                  value={formData.dob || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="p-2">{userData.dob || "Not set"}</p>
              )}
            </div>

            {/* Institution */}
            <div className="bg-yellow-50 p-4 rounded-xl">
              <label className="block font-semibold text-yellow-700">Institution</label>
              {editMode ? (
                <input
                  type="text"
                  name="institution"
                  value={formData.institution || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="p-2">{userData.institution || "Not set"}</p>
              )}
            </div>

            {/* Semester */}
            <div className="bg-red-50 p-4 rounded-xl">
              <label className="block font-semibold text-[rgb(158,3,3)]">Semester</label>
              {editMode ? (
                <input
                  type="text"
                  name="semester"
                  value={formData.semester || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="p-2">{userData.semester || "Not set"}</p>
              )}
            </div>

            {/* City */}
            <div className="bg-yellow-50 p-4 rounded-xl">
              <label className="block font-semibold text-yellow-700">City</label>
              {editMode ? (
                <input
                  type="text"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p className="p-2">{userData.city || "Not set"}</p>
              )}
            </div>

            {/* Credits */}
            <div className="bg-red-50 p-4 rounded-xl">
              <label className="block font-semibold text-[rgb(158,3,3)]">
                Credits
              </label>
              <p className="p-2">{userData.credits || 0}</p>
            </div>

            {/* Rating */}
            <div className="bg-yellow-50 p-4 rounded-xl">
              <label className="block font-semibold text-yellow-700">Rating</label>
              <p className="p-2">
                {userData.rating ? `${userData.rating} ⭐` : "0 ⭐"}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-[rgb(158,3,3)] text-white px-6 py-2 rounded-lg hover:bg-[rgb(148,3,3)]"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
