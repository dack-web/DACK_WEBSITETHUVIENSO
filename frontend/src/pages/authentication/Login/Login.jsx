import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./Login.css";

const Login = () => {
    const initialValues = {
        email: "",
        password: "",
        remember: false,
    };

    const validationSchema = Yup.object({
        email: Yup.string().required("Email or username is required"),

        password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    });

    const handleSubmit = (values) => {
        console.log(values);
    };

    return (
        <div className="login-page">
            <div className="login-header">
                <h1>The Scholarly Curator</h1>
                <p>ADVANCED LIBRARY MANAGEMENT SYSTEM</p>
            </div>

            <div className="login-card">
                <h2>Welcome back</h2>
                <p className="subtitle">Please enter your library credentials.</p>

                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                    <Form>
                        <div className="form-group">
                            <label>Email or Username</label>

                            <Field type="text" name="email" placeholder="curator@library.org" />

                            <ErrorMessage name="email" component="div" className="error" />
                        </div>

                        <div className="form-group">
                            <div className="password-row">
                                <label>Password</label>
                                <a href="#">Forgot password?</a>
                            </div>

                            <Field type="password" name="password" placeholder="••••••••" />

                            <ErrorMessage name="password" component="div" className="error" />
                        </div>

                        <div className="checkbox">
                            <Field type="checkbox" name="remember" />
                            <span>Keep me logged in</span>
                        </div>

                        <button type="submit" className="login-btn">
                            Access Portal →
                        </button>
                    </Form>
                </Formik>

                <div className="secure">
                    <i className="fa-solid fa-unlock"></i>Secure Administrative Node
                </div>
            </div>

            <div className="login-footer">
                <span>Need access to the digital archives?</span>{" "}
                <b>
                    <a href="/register">Request Credentials</a>
                </b>
            </div>
        </div>
    );
};

export default Login;
