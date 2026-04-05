import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../contexts/authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const initialValues = {
    email: "",
    password: "",
    remember: false,
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Email không đúng định dạng")
      .required("Vui lòng nhập email"),

    password: Yup.string()
      .min(12, "Mật khẩu phải có ít nhất 12 ký tự")
      .matches(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 số")
      .matches(/[!@#$%^&*]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt")
      .required("Vui lòng nhập mật khẩu"),
  });
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await login(values);

      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <h1>The Scholarly Curator</h1>
        <p>ADVANCED LIBRARY MANAGEMENT SYSTEM</p>
      </div>

      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Please enter your library credentials.</p>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="form-group">
                <label>Email</label>

                <Field
                  type="email"
                  name="email"
                  placeholder="curator@library.org"
                />

                <ErrorMessage name="email" component="div" className="error" />
              </div>

              <div className="form-group">
                <div className="password-row">
                  <label>Password</label>
                  <a href="forgot-password">Forgot password?</a>
                </div>

                <Field type="password" name="password" placeholder="••••••••" />

                <ErrorMessage
                  name="password"
                  component="div"
                  className="error"
                />
              </div>

              <div className="checkbox">
                <Field type="checkbox" name="remember" />
                <span>Keep me logged in</span>
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Accessing Portal..." : "Access Portal →"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="secure">
          <i className="fa-solid fa-unlock"></i>
          Secure Administrative Node
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
