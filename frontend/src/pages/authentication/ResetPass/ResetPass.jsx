import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./ResetPass.css";
import { useAuth } from "../../../contexts/authentication/AuthContext";
import { useSearchParams } from "react-router-dom";

const ResetPass = () => {
    const { resetPassword } = useAuth();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const passwordSchema = Yup.object({
        password: Yup.string()
            .min(12, "Mật khẩu phải có ít nhất 12 ký tự")
            .matches(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 số")
            .matches(/[!@#$%^&*]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt")
            .required("Vui lòng nhập mật khẩu"),

        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password")], "Mật khẩu xác nhận không khớp")
            .required("Vui lòng xác nhận mật khẩu"),
    });

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

                        <Formik
                            initialValues={{
                                password: "",
                                confirmPassword: "",
                            }}
                            validationSchema={passwordSchema}
                            onSubmit={async (values, { setSubmitting }) => {
                                try {
                                    await resetPassword({
                                        token,
                                        new_password: values.password,
                                    });
                                } catch (err) {
                                    console.error(err);
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            {({ values, isSubmitting }) => {
                                const hasLength = values.password.length >= 12;
                                const hasNumber = /[0-9]/.test(values.password);
                                const hasSpecial = /[!@#$%^&*]/.test(values.password);

                                return (
                                    <Form className="form-reset">
                                        <label>NEW PASSWORD</label>

                                        <div className="input">
                                            <i className="fa-solid fa-lock"></i>

                                            <Field name="password" type="password" placeholder="••••••••••••" autoComplete="new-password" />
                                        </div>

                                        <ErrorMessage name="password" component="div" className="error" />

                                        <label>CONFIRM NEW PASSWORD</label>

                                        <div className="input">
                                            <i className="fa-solid fa-lock"></i>

                                            <Field name="confirmPassword" type="password" placeholder="••••••••••••" autoComplete="new-password" />
                                        </div>

                                        <ErrorMessage name="confirmPassword" component="div" className="error" />

                                        {/* PASSWORD RULES */}

                                        <div className="rules">
                                            <div className={`rule ${hasLength ? "active" : ""}`}>
                                                <i className={`fa-solid ${hasLength ? "fa-circle-check" : "fa-circle"}`}></i>
                                                Minimum 12 characters
                                            </div>

                                            <div className={`rule ${hasSpecial ? "active" : ""}`}>
                                                <i className={`fa-solid ${hasSpecial ? "fa-circle-check" : "fa-circle"}`}></i>
                                                Includes a special character (@,#,$)
                                            </div>

                                            <div className={`rule ${hasNumber ? "active" : ""}`}>
                                                <i className={`fa-solid ${hasNumber ? "fa-circle-check" : "fa-circle"}`}></i>
                                                At least one numeral (0-9)
                                            </div>
                                        </div>

                                        <button type="submit" className="reset-btn" disabled={isSubmitting}>
                                            {isSubmitting ? "Updating..." : "Update Password →"}
                                        </button>
                                    </Form>
                                );
                            }}
                        </Formik>
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
