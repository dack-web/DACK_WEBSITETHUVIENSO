import React from "react";
import "./ForgotPass.css";
const ForgotPass = () => {
    return (
        <div className="recovery-page">
            {/* NAVBAR */}
            <header className="navbar">
                <div className="logo">The Scholarly Curator</div>

                <div className="help-icon">
                    <i className="fa-solid fa-circle-question"></i>
                </div>
            </header>

            {/* MAIN */}

            <div className="recovery-container">
                <div className="recovery-card">
                    <div className="icon-box">
                        <i className="fa-solid fa-rotate-left"></i>
                    </div>

                    <h1>Password Recovery</h1>

                    <p className="description">Enter the email address associated with your Archivist Pro account. We will send you a secure link to reset your scholarly credentials.</p>

                    <form>
                        <label>INSTITUTIONAL EMAIL ADDRESS</label>

                        <div className="input">
                            <i className="fa-solid fa-envelope"></i>
                            <input type="email" placeholder="name@university.edu" />
                        </div>

                        <button className="recovery-btn">Send Recovery Link →</button>
                    </form>

                    <div className="divider"></div>

                    <a className="back-link" href="/login">
                        ← Back to Archivist Login
                    </a>
                </div>

                {/* INFO BOXES */}

                <div className="info-boxes">
                    <div className="info-card blue">
                        <h3>Need Access?</h3>

                        <p>Contact your system administrator if you've lost access to your primary email.</p>
                    </div>

                    <div className="info-card yellow">
                        <h3>Security Note</h3>

                        <p>Recovery links expire after 24 hours for your collection's security.</p>
                    </div>
                </div>
            </div>

            {/* FOOTER */}

            <footer>
                <p>© 2024 THE SCHOLARLY CURATOR. ALL RIGHTS RESERVED.</p>

                <div className="footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Library Guidelines</a>
                </div>
            </footer>
        </div>
    );
};

export default ForgotPass;
