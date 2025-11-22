import React, { useState, useEffect } from "react";
import GlassCard from "../components/GlassCard";
import { getToken } from "../services/authService";
import { getUserProfile, updateUserProfile, updatePassword } from "../services/authService";
import { UserCircleIcon } from "@heroicons/react/24/outline";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form states for details
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    tel: "",
    telCode: "+216",
  });

  // Form states for password
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    confirmCurrentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await getUserProfile();
      setUser(userData);
      setFormData({
        nom: userData.nom || "",
        prenom: userData.prenom || "",
        email: userData.email || "",
        tel: userData.tel || "",
        telCode: userData.telCode || "+216",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      setMessage({ type: "error", text: "Erreur lors du chargement du profil" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      await updateUserProfile(formData);
      setMessage({ type: "success", text: "Profil mis à jour avec succès!" });
      
      // Reload user profile to get updated data
      await loadUserProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: error.message || "Erreur lors de la mise à jour du profil" });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    try {
      setPasswordSaving(true);
      setMessage({ type: "", text: "" });

      // Validate passwords match
      if (passwordData.currentPassword !== passwordData.confirmCurrentPassword) {
        setMessage({ type: "error", text: "Les mots de passe actuels ne correspondent pas" });
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        setMessage({ type: "error", text: "Les nouveaux mots de passe ne correspondent pas" });
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setMessage({ type: "error", text: "Le nouveau mot de passe doit contenir au moins 6 caractères" });
        return;
      }

      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage({ type: "success", text: "Mot de passe mis à jour avec succès!" });
      
      // Clear password fields
      setPasswordData({
        currentPassword: "",
        confirmCurrentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage({ type: "error", text: error.message || "Erreur lors de la mise à jour du mot de passe" });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--page-bg)" }}>
        <div className="text-lg" style={{ color: "var(--text-main)" }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--page-bg)", color: "var(--text-main)" }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--text-main)" }}>User Settings</h1>

        {/* Message notification */}
        {message.text && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Profile Card and Information Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <GlassCard>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center mb-4">
                  <UserCircleIcon className="w-24 h-24 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    @{user?.prenom?.toLowerCase() || "user"}-{user?.nom?.toLowerCase() || "name"}
                  </p>
                  <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                    {user?.email || "user@email.com"}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Information Card */}
            <GlassCard>
              <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--text-main)" }}>
                Information
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Name:</span> {user?.prenom || ""} {user?.nom || ""}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {user?.email || ""}
                </p>
                <p>
                  <span className="font-semibold">Tel:</span>{" "}
                  {user?.telCode || "+216"} {user?.tel || "66 696 123"}
                </p>
              </div>
            </GlassCard>
          </div>

          {/* Right Column - User Settings Form */}
          <div className="lg:col-span-2">
            <GlassCard>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--text-main)" }}>
                User Settings
              </h2>

              {/* Details Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--text-main)" }}>
                  Details
                </h3>
                <form onSubmit={handleSaveDetails}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-main)" }}>
                        Name
                      </label>
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleInputChange}
                        placeholder="Pepito Rodrick..."
                        className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                        style={{
                          background: "var(--input-bg, white)",
                          borderColor: "var(--border-color, #e5e7eb)",
                          color: "var(--text-main)",
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-main)" }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        placeholder="Coronel Sifuentes..."
                        className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                        style={{
                          background: "var(--input-bg, white)",
                          borderColor: "var(--border-color, #e5e7eb)",
                          color: "var(--text-main)",
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-main)" }}>
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="pepito.c.sifuentes@uni.pe"
                        className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                        style={{
                          background: "var(--input-bg, white)",
                          borderColor: "var(--border-color, #e5e7eb)",
                          color: "var(--text-main)",
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-main)" }}>
                        Tel - Number:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="telCode"
                          value={formData.telCode}
                          onChange={handleInputChange}
                          placeholder="+51"
                          className="w-24 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{
                            background: "var(--input-bg, white)",
                            borderColor: "var(--border-color, #e5e7eb)",
                            color: "var(--text-main)",
                          }}
                        />
                        <input
                          type="text"
                          name="tel"
                          value={formData.tel}
                          onChange={handleInputChange}
                          placeholder="969 123 456"
                          className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{
                            background: "var(--input-bg, white)",
                            borderColor: "var(--border-color, #e5e7eb)",
                            color: "var(--text-main)",
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Enregistrement..." : "Save changes"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Password Section */}
              <div className="border-t pt-8" style={{ borderColor: "var(--border-color, #e5e7eb)" }}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--text-main)" }}>
                  Password
                </h3>
                <form onSubmit={handleSavePassword}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-main)" }}>
                        Change password
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Put your password..."
                          className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{
                            background: "var(--input-bg, white)",
                            borderColor: "var(--border-color, #e5e7eb)",
                            color: "var(--text-main)",
                          }}
                        />
                        <input
                          type="password"
                          name="confirmCurrentPassword"
                          value={passwordData.confirmCurrentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm password..."
                          className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{
                            background: "var(--input-bg, white)",
                            borderColor: "var(--border-color, #e5e7eb)",
                            color: "var(--text-main)",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-main)" }}>
                        New password
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Put your new password..."
                          className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{
                            background: "var(--input-bg, white)",
                            borderColor: "var(--border-color, #e5e7eb)",
                            color: "var(--text-main)",
                          }}
                        />
                        <input
                          type="password"
                          name="confirmNewPassword"
                          value={passwordData.confirmNewPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password..."
                          className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{
                            background: "var(--input-bg, white)",
                            borderColor: "var(--border-color, #e5e7eb)",
                            color: "var(--text-main)",
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordSaving ? "Enregistrement..." : "Save changes"}
                    </button>
                  </div>
                </form>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

