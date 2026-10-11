import { useState } from "react";
import StudentProfile from "./StudentProfile";
import "./App.css";
import { getJobs, applyForJob } from "./api";

const API_URL = "http://localhost:8080/api/auth";

function App() {
  const [page, setPage] = useState("home");
  const [role, setRole] = useState("STUDENT");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
const [jobsLoading, setJobsLoading] = useState(false);
const [jobsError, setJobsError] = useState("");
const [appliedJobs, setAppliedJobs] = useState([]);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("careerconnect_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  function updateField(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }
  async function loadJobs() {
  setJobsLoading(true);
  setJobsError("");
  setMessage("");
  setPage("jobs");

  try {
    const data = await getJobs();
    setJobs(Array.isArray(data) ? data : []);
  } catch (err) {
    setJobsError(err.message || "Unable to load jobs.");
  } finally {
    setJobsLoading(false);
  }
}
  function openPage(nextPage) {
    setMessage("");
    setForm({ fullName: "", email: "", password: "" });
    setPage(nextPage);
  }

  async function submitAuth(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const isRegister = page === "register";

      const payload = isRegister
        ? {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            password: form.password,
            role,
          }
        : {
            email: form.email.trim(),
            password: form.password,
          };

      const response = await fetch(
        `${API_URL}/${isRegister ? "register" : "login"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            (response.status === 409
              ? "This email is already registered. Please sign in."
              : `Request failed (${response.status}). Please check your details.`)
        );
      }

      const loggedInUser = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      };

      localStorage.setItem("careerconnect_token", data.token);
      localStorage.setItem(
        "careerconnect_user",
        JSON.stringify(loggedInUser)
      );

      setUser(loggedInUser);
      setMessage("");
      setPage("dashboard");
    } catch (error) {
      setMessage(
        error.message ||
          "Cannot connect to the server. Check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("careerconnect_token");
    localStorage.removeItem("careerconnect_user");
    setUser(null);
    setForm({ fullName: "", email: "", password: "" });
    setMessage("");
    setPage("home");
  }

  if (page === "register" || page === "login") {
    const isRegister = page === "register";

    return (
      <main className="auth-page">
        <section className="auth-card">
          <button
            className="back-link"
            type="button"
            onClick={() => openPage("home")}
          >
            ← Back to home
          </button>

          <div className="brand auth-brand">
            <span className="brand-icon">C</span>
            <span>Career<span className="blue">Connect</span></span>
          </div>

          <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>

          <p className="muted">
            {isRegister
              ? "Start building your future with CareerConnect."
              : "Sign in to continue your career journey."}
          </p>

          <form onSubmit={submitAuth}>
            {isRegister && (
              <label>
                Full name
                <input
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={updateField}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label>
              Email address
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={updateField}
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={updateField}
                autoComplete={
                  isRegister ? "new-password" : "current-password"
                }
                minLength={8}
                required
              />
            </label>

            {isRegister && (
              <label>
                I am registering as
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                >
                  <option value="STUDENT">Student</option>
                  <option value="RECRUITER">Recruiter</option>
                </select>
              </label>
            )}

            {message && (
              <div className="error-message" role="alert">
                {message}
              </div>
            )}

            <button className="primary-btn full-width" disabled={loading}>
              {loading
                ? "Please wait..."
                : isRegister
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <p className="switch-text">
            {isRegister
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <button
              type="button"
              className="text-btn"
              onClick={() => openPage(isRegister ? "login" : "register")}
            >
              {isRegister ? "Sign in" : "Create account"}
            </button>
          </p>
        </section>
      </main>
    );
  }

  if (page === "profile" && user) {
    if (user.role !== "STUDENT") {
      setPage("dashboard");
    } else {
      return <StudentProfile user={user} onBack={() => setPage("dashboard")} />;
    }
  }

if (page === "jobs" && user) {
  return (
    <main className="dashboard-page">
      <header className="navbar dashboard-nav">
        <div className="brand">
          <span className="brand-icon">C</span>
          <span>Career<span className="blue">Connect</span></span>
        </div>
        <button
          className="outline-btn"
          onClick={() => setPage("dashboard")}
        >
          Back to dashboard
        </button>
      </header>

      <section className="dashboard-content">
        <h1>Available jobs</h1>
        <p>Explore opportunities and apply for jobs.</p>

        {jobsLoading && <p>Loading jobs...</p>}

        {jobsError && (
          <p role="alert">{jobsError}</p>
        )}

        {!jobsLoading && !jobsError && jobs.length === 0 && (
          <p>No active jobs are available right now.</p>
        )}

        {jobs.map((job) => (
          <article className="dashboard-card" key={job.id}>
            <h2>{job.title}</h2>
            <p><strong>Company:</strong> {job.company}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Job type:</strong> {job.jobType}</p>
            <p>{job.description}</p>
            {job.requirements && (
              <p><strong>Requirements:</strong> {job.requirements}</p>
            )}
            {job.applicationDeadline && (
              <p>
                <strong>Deadline:</strong> {job.applicationDeadline}
              </p>
            )}

            <button
              className="primary-btn"
              disabled={appliedJobs.includes(job.id)}
              onClick={async () => {
                setMessage("");
                setJobsError("");

                try {
                  await applyForJob(job.id);
                  setAppliedJobs((current) => [...current, job.id]);
                  setMessage(`Application submitted for ${job.title}.`);
                } catch (err) {
                  setJobsError(err.message || "Application failed.");
                }
              }}
            >
              {appliedJobs.includes(job.id) ? "Applied" : "Apply now"}
            </button>
          </article>
        ))}

        {message && <p role="status">{message}</p>}
      </section>
    </main>
  );
}

  if (page === "dashboard" && user) {
    return (
      <main className="dashboard-page">
        <header className="navbar dashboard-nav">
          <div className="brand">
            <span className="brand-icon">C</span>
            <span>Career<span className="blue">Connect</span></span>
          </div>
          <button className="outline-btn" onClick={logout}>
            Sign out
          </button>
        </header>

        <section className="dashboard-content">
          <span className="eyebrow">YOUR CAREER SPACE</span>
          <h1>Welcome, {user.fullName}!</h1>
          <p className="muted">
            You are signed in to your CareerConnect account.
          </p>

          <div className="dashboard-card">
            <div className="profile-avatar">
              {user.fullName?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <h2>{user.fullName}</h2>
            <p>{user.email}</p>
            <span className="role-pill">{user.role}</span>
          </div>

          {user.role === "STUDENT" && (
            <div className="dashboard-card">
              <h2>Complete your student profile</h2>
              <p>Add your education, skills, contact details, and resume so your career information is ready.</p>
              <button className="primary-btn" onClick={() => { setMessage(""); setPage("profile"); }}>
                Manage my profile
              </button>
            </div>
          )}

{user.role === "STUDENT" && (
  <div className="dashboard-card">
    <h2>Your next opportunity starts here.</h2>
    <p>Explore jobs and prepare your profile for employers.</p>
    <button
  className="primary-btn"
  onClick={loadJobs}
>
  Explore jobs
</button>
    {message && <p className="muted">{message}</p>}
  </div>
)}

          {user.role === "RECRUITER" && (
            <div className="dashboard-card">
              <h2>Find your next great candidate.</h2>
              <p>Recruiter job posting and applicant management can be added next.</p>
            </div>
          )}

          {user.role === "ADMIN" && (
            <div className="dashboard-card">
              <h2>Placement administration</h2>
              <p>Admin management features can be added next.</p>
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <div className="site">
      <div className="announcement">
        Your next opportunity starts here.{" "}
        <button onClick={() => openPage("register")}>
          Explore open roles ↗
        </button>
      </div>

      <header className="navbar">
        <button className="brand brand-button" onClick={() => openPage("home")}>
          <span className="brand-icon">C</span>
          <span>
            Career<span className="blue">Connect</span>
            <small>YOUR CAREER. YOUR FUTURE.</small>
          </span>
        </button>

        <nav className="nav-links">
          <a href="#overview">Overview</a>
          <a href="#jobs">Find Jobs</a>
          <a href="#companies">Companies</a>
          <a href="#students">For Students</a>
        </nav>

        <div className="nav-actions">
          <button className="employer-link" onClick={() => {
            setRole("RECRUITER");
            openPage("register");
          }}>
            For Employers
          </button>
          <button className="primary-btn" onClick={() => openPage("login")}>
            Sign in ↗
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="overview">
          <div className="hero-copy">
            <span className="eyebrow">
              ✳ &nbsp; THE SMARTER WAY TO GET HIRED
            </span>

            <h1>
              Your future
              <br />
              deserves a <span className="blue">great start.</span>
            </h1>

            <p>
              Discover opportunities that match your ambitions. Connect with
              leading employers and turn your potential into your next big
              career move.
            </p>

            <div className="hero-actions">
              <button
                className="primary-btn"
                onClick={() => openPage("register")}
              >
                Explore opportunities ↗
              </button>
              <button
                className="outline-btn"
                onClick={() => openPage("register")}
              >
                Create your profile
              </button>
            </div>

            <div className="community">
              <div className="avatar-stack">
                <span>A</span><span>R</span><span>S</span><span>K</span>
              </div>
              <div>
                <strong>Start your journey today</strong>
                <small>Build your profile. Discover your potential.</small>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="career-card">
              <div className="card-heading">
                <span className="mini-logo">C</span>
                <strong>My career space</strong>
                <span className="opportunity-tag">✓ Career opportunities</span>
              </div>

              <div className="welcome-panel">
                <small>MONDAY, YOUR NEXT CHAPTER</small>
                <h2>Make it happen.</h2>
                <p>Small steps. Big possibilities.</p>
              </div>

              <div className="stats-row">
                <div className="stat-box">
                  <small>Profile progress</small>
                  <h2>80%</h2>
                  <div className="progress-track">
                    <span />
                  </div>
                </div>
                <div className="stat-box">
                  <small>Recommended</small>
                  <h2>12 roles</h2>
                  <small>Worth exploring</small>
                </div>
              </div>

              <div className="suggestions-heading">
                <strong>Suggested for you</strong>
                <button onClick={() => openPage("register")}>View all ↗</button>
              </div>

              <div className="job-item">
                <span className="company-icon">G</span>
                <div><strong>Software Engineer</strong><small>Google · Hyderabad</small></div>
                <span className="match">95% match</span>
              </div>

              <div className="job-item">
                <span className="company-icon">M</span>
                <div><strong>Graduate Developer</strong><small>Technology · India</small></div>
                <span className="match">88% match</span>
              </div>
            </div>
            <div className="floating-note">
              <span>✦</span>
              <div><strong>Your next step</strong><small>Starts with one application</small></div>
            </div>
          </div>
        </section>

        <section className="audience-strip" id="students">
          <span>ONE PLATFORM. THREE POSSIBILITIES.</span>
          <div>🎓 Students</div>
          <div>↗ Recruiters</div>
          <div>✦ Placement teams</div>
        </section>

        <section className="lower-section" id="jobs">
          <span className="eyebrow">YOUR NEXT OPPORTUNITY</span>
          <h2>Find work that <span className="blue">moves you.</span></h2>
          <p>Build your profile, discover career opportunities and connect with employers.</p>
          <button className="primary-btn" onClick={() => openPage("register")}>
            Get started ↗
          </button>
        </section>

        <section className="lower-section companies-section" id="companies">
          <span className="eyebrow">FOR EMPLOYERS</span>
          <h2>Meet your next great hire.</h2>
          <p>Create a recruiter account to get started.</p>
          <button className="outline-btn" onClick={() => {
            setRole("RECRUITER");
            openPage("register");
          }}>
            Join as a recruiter
          </button>
        </section>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} CareerConnect. Your career, your future.
      </footer>
    </div>
  );
}

export default App;