import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function Signup() {
    const navigate = useNavigate();

    // Single state object for all fields
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        bio: "",
        skills: "",
        picture: "", // will hold base64
        dob: "",
        password: "",
        institution: "",
        semester: "",
        city: ""
    });

    // Update any field dynamically
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "picture" && files && files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, picture: reader.result }); // store Base64
            };
            reader.readAsDataURL(files[0]);
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth, formData.email, formData.password
            );

            const user = userCredential.user;

            // save all the credentials
            await setDoc(doc(db, "users", user.uid), {
                name: formData.name,
                email: formData.email,
                bio: formData.bio,
                skills: formData.skills.split(",").map(s => s.trim()),
                dob: formData.dob,
                institution: formData.institution,
                semester: formData.semester,
                city: formData.city,
                pictureUrl: formData.picture, // ✅ now stores Base64
                timeCredits: 20,
                offersGiven: 0,
                offersAccepted: 0,
                createdAt: new Date()
            });
            console.log("✅ User signed up & saved in Firestore");
            navigate("/home");
        } catch (error) {
            console.error("Signup error:", error.message);
            alert(error.message);
        }
    };

    return (
        <div className="auth_bg flex justify-center items-center min-h-screen">
            <div className="auth_box w-[400px] h-[500px] bg-white rounded-lg shadow-lg flex flex-col p-4">
                <h1 className="text-2xl font-bold text-white drop-shadow-[1px_1px_0px_black]">Signup Page</h1>
                <div className="flex-1 overflow-y-auto pr-6">
                    <form onSubmit={handleSignup} className="space-y-4 flex flex-col">

                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            className="login_input"
                        />
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="login_input"
                        />
                        <input
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Short Bio"
                            className="login_input"
                        />
                        <input
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            placeholder="Skills Offered"
                            className="login_input"
                        />
                        {/* ✅ Profile picture input (file type) */}
                        <input
                            name="picture"
                            type="file"
                            accept="image/*"
                            onChange={handleChange}
                            className="login_input w-[180px] text-sm"
                        />
                        <input
                            name="dob"
                            type="date"
                            value={formData.dob}
                            onChange={handleChange}
                            className="login_input w-[180px] text-sm"
                        />
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className="login_input"
                        />
                        <input
                            name="institution"
                            value={formData.institution}
                            onChange={handleChange}
                            placeholder="Institution Name"
                            className="login_input"
                        />
                        <input
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            placeholder="Semester"
                            className="login_input"
                        />
                        <input
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City"
                            className="login_input"
                        />
                    </form>
                </div>

                {/* Signup button fixed at bottom */}
                <div className="mt-4">
                    <button
                        onClick={handleSignup}
                        className="rounded-md text-white cursor-pointer bg-[rgb(148,3,3)] w-[100px] h-[35px] 
        focus:outline-[rgb(180,4,4)] focus:outline-2 focus:outline-offset-2">
                        Sign Up
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Signup;
