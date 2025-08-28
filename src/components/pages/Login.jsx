import { useState } from 'react'
import { useNavigate } from 'react-router-dom'; 
import { auth} from "../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handlelogin = async (e) => {
       e.preventDefault();
       try {
        const userCredentail=await signInWithEmailAndPassword(
            auth,email,password
        );
        console.log("✅ Logged in:", userCredentail.user);
        navigate("/home");

       } catch (error) {
        console.error("Login error:", error.message);
            alert(error.message);
       }
    }

    const gotopage=()=>{
navigate('/Signup')
    }
    return (
        <div className="auth_bg">
            <div className="auth_box">
                <h1 className="text-2xl font-bold text-white drop-shadow-[1px_1px_0px_black]">Login Page</h1>
                <form onSubmit={handlelogin} className="space-y-4 flex flex-col">
                    <input
                        className='login_input'
                        type='email'
                        placeholder='Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                    <input
                        className='login_input'
                        type='password'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                        <button className="rounded-md text-white cursor-pointer bg-[rgb(148_3_3)] w-[190px] h-[35px] 
             focus:outline-[rgb(180_4_4)] focus:outline-2 focus:outline-offset-2">Login</button>
                </form>
                <p className="text-1md font-bold text-white drop-shadow-[1px_1px_0px_black]">Don't have an account? Sign Up</p>
                <button onClick={gotopage}
                className="rounded-md text-white cursor-pointer bg-[rgb(148_3_3)] w-[100px] h-[35px] 
             focus:outline-[rgb(180_4_4)] focus:outline-2 focus:outline-offset-2" >Sign up</button>
            </div>
        </div>
    );
}
export default Login