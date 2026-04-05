import React from "react";
import "./Register.css";
const Register = () => {
    return (
        <div className="register-page">
            <div className="register-header">
                <h1>Archivist Pro</h1>
                <p>Enter the sanctum of digital preservation.</p>
            </div>

            <div className="register-card">
                <h2>Create Account</h2>
                <p className="subtitle">Join the network of professional scholarly curators.</p>

                <form className="form-register">
                    <label>FULL NAME</label>
                    <div className="input-group">
                        <i class="fa-solid fa-user"></i>
                        <input type="text" placeholder="Alexandros Mercer" />
                    </div>

                    <label>LIBRARY EMAIL</label>
                    <div className="input-group">
                        <i class="fa-solid fa-envelope"></i>
                        <input type="email" placeholder="curator@institution.edu" />
                    </div>

                    <label>PASSWORD</label>
                    <div className="input-group">
                        <i class="fa-solid fa-lock"></i>
                        <input type="password" placeholder="••••••••••" />
                    </div>

                    <p className="policy">
                        By proceeding, you acknowledge the <span>Library Guidelines</span> and agree to our <span>Data Preservation Policy</span>.
                    </p>

                    <button className="register-btn">Create Account →</button>
                </form>

                <p className="login">
                    Already an archivist? <a href="/login">Login to Curator</a>
                </p>
            </div>

            <div className="footer">
                <p>© 2024 THE SCHOLARLY CURATOR. ALL RIGHTS RESERVED.</p>

                <div className="links">
                    <a href="#">PRIVACY POLICY</a>
                    <a href="#">TERMS OF SERVICE</a>
                    <a href="#">LIBRARY GUIDELINES</a>
                </div>
            </div>
        </div>
    );
};

export default Register;
