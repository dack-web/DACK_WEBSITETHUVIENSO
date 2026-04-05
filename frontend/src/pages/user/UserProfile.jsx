import React, { useState, useEffect } from "react";
import "./UserProfile.css";
import { useAuth } from "../../contexts/authentication/AuthContext";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api";

const UserProfile = () => {
  const { updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    department: "",
    student_id: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type }), 3000);
  };

  const fetchProfile = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      const res = await fetch(`${BACKEND_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.data);

        setFormData({
          full_name: data.data.full_name || "",
          phone: data.data.phone || "",
          address: data.data.address || "",
          department: data.data.department || "",
          student_id: data.data.student_id || "",
        });

        if (data.data.avatar) {
          setAvatarPreview(`${BACKEND_URL}${data.data.avatar}`);
        }
      } else {
        showToast(data.message || "Load failed", "error");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      showToast("Cannot connect to server", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ✅ UPLOAD AVATAR (FIX REALTIME)
  const uploadAvatar = async () => {
    if (!avatarFile) {
      showToast("Please select an image first", "error");
      return;
    }

    setUploading(true);

    const formDataImg = new FormData();
    formDataImg.append("avatar", avatarFile);

    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      const response = await fetch(`${BACKEND_URL}/auth/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataImg,
      });

      const data = await response.json();

      if (data.success) {
        showToast("Avatar updated successfully!", "success");

        // update local
        setUser((prev) => ({
          ...prev,
          avatar: data.avatar,
        }));

        // update global (header)
        updateUser({
          ...user,
          avatar: data.avatar,
        });

        // chống cache
        setAvatarPreview(`${BACKEND_URL}${data.avatar}?t=${Date.now()}`);

        setAvatarFile(null);
      } else {
        showToast(data.message || "Avatar upload failed", "error");
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      showToast("Network error. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    if (!formData.full_name.trim()) {
      showToast("Full name is required", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);

    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      const response = await fetch(`${BACKEND_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data);
        updateUser(data.data);
        showToast("Profile updated successfully!", "success");
        setIsEditing(false);
      } else {
        showToast(data.message || "Update failed", "error");
      }
    } catch (error) {
      console.error("Update error:", error);
      showToast("Network error. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loader">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      {toast.show && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* HEADER */}
      <div className="profile-header">
        <div className="avatar-wrapper">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="avatar-img" />
          ) : user?.avatar ? (
            <img
              src={`${BACKEND_URL}${user.avatar}`}
              alt="Avatar"
              className="avatar-img"
            />
          ) : (
            <span className="avatar-placeholder">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </span>
          )}

          <label className="avatar-upload">
            📷
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </label>
        </div>

        {avatarFile && (
          <button
            className="upload-avatar-btn"
            onClick={uploadAvatar}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Avatar"}
          </button>
        )}

        <div className="header-info">
          <h1>{user?.full_name || user?.name || user?.username}</h1>
          <p className="user-email">{user?.email}</p>

          <div className="header-actions">
            <button
              className="edit-profile-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>

            <p className="member-since">
              Member since{" "}
              {user?.created_at
                ? new Date(user.created_at).getFullYear()
                : "2024"}
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="profile-body">
        <div className="info-section">
          <h2>Personal Information</h2>

          <div className="info-grid">
            <Info label="FULL NAME" value={user?.full_name} />
            <Info label="EMAIL ADDRESS" value={user?.email} />
            <Info label="PHONE NUMBER" value={user?.phone} />
            <Info label="ADDRESS" value={user?.address} />
            <Info label="DEPARTMENT" value={user?.department} />
            <Info label="STUDENT/STAFF ID" value={user?.student_id} />
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button className="close-btn" onClick={() => setIsEditing(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input value={user?.email || ""} disabled />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="info-item">
    <span className="info-label">{label}</span>
    <p className="info-value">{value || "Not set"}</p>
  </div>
);

export default UserProfile;
