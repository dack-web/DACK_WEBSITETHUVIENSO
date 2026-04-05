import React from "react";
import "./ForgotPass.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../contexts/authentication/AuthContext";

const ForgotPass = () => {
  const { requestResetPassword } = useAuth();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
  });

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

          <p className="description">
            Enter the email address associated with your Archivist Pro account.
          </p>

          <Formik
            initialValues={{ email: "" }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, setStatus }) => {
              try {
                await requestResetPassword(values.email);

                setStatus({
                  success:
                    "Recovery email has been sent. Please check your inbox.",
                });
              } catch (err) {
                setStatus({
                  error:
                    err?.response?.data?.message ||
                    "Something went wrong. Please try again.",
                });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, status }) => (
              <Form>
                <label>INSTITUTIONAL EMAIL ADDRESS</label>

                <div className="input">
                  <i className="fa-solid fa-envelope"></i>
                  <Field
                    type="email"
                    name="email"
                    placeholder="name@university.edu"
                  />
                </div>

                {/* ERROR */}
                <ErrorMessage
                  name="email"
                  component="div"
                  className="error-text"
                />

                {status?.success && (
                  <div className="success-text">{status.success}</div>
                )}

                <button
                  type="submit"
                  className="recovery-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Recovery Link →"}
                </button>
              </Form>
            )}
          </Formik>

          <div className="divider"></div>

          <a className="back-link" href="/login">
            ← Back to Archivist Login
          </a>
        </div>

        {/* INFO BOXES */}
        <div className="info-boxes">
          <div className="info-card blue">
            <h3>Need Access?</h3>
            <p>
              Contact your system administrator if you've lost access to your
              primary email.
            </p>
          </div>

          <div className="info-card yellow">
            <h3>Security Note</h3>
            <p>
              Recovery links expire after 24 hours for your collection's
              security.
            </p>
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
