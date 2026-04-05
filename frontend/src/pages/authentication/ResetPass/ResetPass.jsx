import React from "react";
import "./ResetPass.css";

const ResetPass = () => {
    return (
        <div className="reset-page">
            {/* MAIN */}
            <div className="reset-card">
                <div className="card">
                    {/* LEFT PANEL */}
                    <div className="left-panel">
                        <i className="fa-solid fa-shield-halved shield"></i>

                        <h2>Archivist Pro Security</h2>

                        <p>Protecting the integrity of your scholarly collections. Please choose a strong password to ensure your research remains private and secure.</p>

                        <div className="divider"></div>

                        <div>
                            <div className="security">
                                <i className="fa-solid fa-shield"></i>
                                <span>Multi-factor ready</span>
                            </div>

                            <p className="session">Session ID: PRO-9241-ARK-2024</p>
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="right-panel">
                        <h2>Reset Password</h2>

                        <p className="subtitle">Enter your new credentials below to regain access to your dashboard.</p>

                        <form className="form-reset">
                            <label>NEW PASSWORD</label>

                            <div className="input">
                                <i className="fa-solid fa-lock"></i>
                                <input type="password" placeholder="••••••••••••" />
                            </div>

                            <label>CONFIRM NEW PASSWORD</label>

                            <div className="input">
                                <i className="fa-solid fa-lock"></i>
                                <input type="password" placeholder="••••••••••••" />
                            </div>

                            <div className="rules">
                                <div className="rule active">
                                    <i className="fa-solid fa-circle-check"></i>
                                    Minimum 12 characters
                                </div>

                                <div className="rule ">
                                    <i className="fa-solid fa-circle"></i>
                                    Includes a special character (@,#,$)
                                </div>

                                <div className="rule">
                                    <i className="fa-solid fa-circle"></i>
                                    At least one numeral (0-9)
                                </div>
                            </div>

                            <button className="reset-btn">Update Password →</button>
                        </form>

                        <a className="back-link" href="/login">
                            <span className="arrow">←</span>
                            Return to Login
                        </a>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="footer">
                <p>© 2024 THE SCHOLARLY CURATOR. ALL RIGHTS RESERVED.</p>

                <div className="links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Library Guidelines</a>
                </div>
            </div>
        </div>
    );
};

export default ResetPass;
