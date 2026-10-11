import { useEffect, useState } from "react";
import { getStudentProfile, saveStudentProfile, uploadResume, downloadResume } from "./api";

const emptyProfile = { phone: "", location: "", education: "", skills: "", bio: "", resumeOriginalName: "" };

export default function StudentProfile({ user, onBack }) {
  const [profile, setProfile] = useState(emptyProfile);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getStudentProfile()
      .then((data) => { if (active) setProfile({ ...emptyProfile, ...data }); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function update(event) {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function save(event) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const saved = await saveStudentProfile(profile);
      setProfile({ ...emptyProfile, ...saved });
      setMessage("Your student profile has been saved.");
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }


async function resumeUpload(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!file) {
        setError("Please choose a PDF, DOC, or DOCX file first.");
        return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
        const saved = await uploadResume(file);
        setProfile((current) => ({ ...current, ...saved }));
        setFile(null);
        form.reset();
        setMessage("Resume uploaded successfully.");
    } catch (err) {
        setError(err.message);
    } finally {
        setSaving(false);
    }
}


  async function download() {
    setError("");
    try { await downloadResume(profile.resumeOriginalName || "resume"); }
    catch (err) { setError(err.message); }
  }

  return (
    <main className="dashboard-page">
      <header className="navbar dashboard-nav">
        <div className="brand"><span className="brand-icon">C</span><span>Career<span className="blue">Connect</span></span></div>
        <button className="outline-btn" onClick={onBack}>← Back to dashboard</button>
      </header>
      <section className="profile-content">
        <span className="eyebrow">STUDENT WORKSPACE</span>
        <h1>My student profile</h1>
        <p className="muted">Keep your education, skills, and resume ready for recruiters.</p>
        <div className="profile-card">
          <div className="profile-card-heading">
            <div className="profile-avatar">{user.fullName?.charAt(0)?.toUpperCase() || "S"}</div>
            <div><h2>{user.fullName}</h2><p>{user.email}</p><span className="role-pill">STUDENT</span></div>
          </div>
          {loading ? <p>Loading your profile…</p> : (
            <form className="student-profile-form" onSubmit={save}>
              <div className="profile-grid">
                <label>Phone number<input name="phone" value={profile.phone || ""} onChange={update} maxLength={30} placeholder="e.g. 9876543210" /></label>
                <label>Location<input name="location" value={profile.location || ""} onChange={update} maxLength={120} placeholder="City, State" /></label>
                <label className="profile-full">Education<input name="education" value={profile.education || ""} onChange={update} maxLength={120} placeholder="Degree, college, graduation year" /></label>
                <label className="profile-full">Skills<textarea name="skills" value={profile.skills || ""} onChange={update} maxLength={2000} rows={3} placeholder="Java, React, SQL, communication…" /></label>
                <label className="profile-full">About me<textarea name="bio" value={profile.bio || ""} onChange={update} maxLength={2000} rows={4} placeholder="A short introduction about your goals and experience" /></label>
              </div>
              {error && <div className="error-message" role="alert">{error}</div>}
              {message && <div className="success-message" role="status">{message}</div>}
              <button className="primary-btn" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
            </form>
          )}
        </div>
        <div className="profile-card resume-card">
          <h2>Resume</h2>
          <p className="muted">Upload one PDF, DOC, or DOCX file. Maximum size: 5 MB.</p>
          {profile.resumeOriginalName && <p className="resume-name">Current resume: <strong>{profile.resumeOriginalName}</strong></p>}
          <form className="resume-form" onSubmit={resumeUpload}>
            <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            <button className="primary-btn" disabled={saving}>{saving ? "Please wait…" : "Upload resume"}</button>
            {profile.resumeOriginalName && <button className="outline-btn" type="button" onClick={download}>Download current resume</button>}
          </form>
        </div>
      </section>
    </main>
  );
}
