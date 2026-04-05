import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../contexts/authentication/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const initialValues = {
    fullName: "",
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    fullName: Yup.string()
      .min(3, "Họ và tên phải có ít nhất 3 ký tự")
      .required("Vui lòng nhập họ và tên"),

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
      await register(values);

      navigate("/login");
    } catch (err) {
      console.error(err.response?.data?.message || "Register failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-header">
        <h1>Archivist Pro</h1>
        <p>Enter the sanctum of digital preservation.</p>
      </div>

      <div className="register-card">
        <h2>Create Account</h2>
        <p className="subtitle">
          Join the network of professional scholarly curators.
        </p>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form className="form-register">
              {/* FULL NAME */}
              <label>FULL NAME</label>
              <div className="input-group">
                <i className="fa-solid fa-user"></i>
                <Field
                  type="text"
                  name="fullName"
                  placeholder="Alexandros Mercer"
                />
              </div>
              <ErrorMessage name="fullName" component="div" className="error" />

              {/* EMAIL */}
              <label>LIBRARY EMAIL</label>
              <div className="input-group">
                <i className="fa-solid fa-envelope"></i>
                <Field
                  type="email"
                  name="email"
                  placeholder="curator@institution.edu"
                />
              </div>
              <ErrorMessage name="email" component="div" className="error" />

              {/* PASSWORD */}
              <label>PASSWORD</label>
              <div className="input-group">
                <i className="fa-solid fa-lock"></i>
                <Field
                  type="password"
                  name="password"
                  placeholder="••••••••••"
                />
              </div>
              <ErrorMessage name="password" component="div" className="error" />

              <p className="policy">
                By proceeding, you acknowledge the{" "}
                <span>Library Guidelines</span> and agree to our{" "}
                <span>Data Preservation Policy</span>.
              </p>

              <button
                type="submit"
                className="register-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Account..." : "Create Account →"}
              </button>
            </Form>
          )}
        </Formik>

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
