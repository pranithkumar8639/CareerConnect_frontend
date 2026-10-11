
import { useEffect, useState } from "react";
import { getMyApplications } from "./api";
import "./App.css";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadApplications() {
      try {
        const data = await getMyApplications();

        if (!cancelled) {
          setApplications(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Unable to load applications."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="applications-page">
      <h1>My Applications</h1>
      <p>Track the jobs you have applied for.</p>

      {loading && <p>Loading your applications...</p>}

      {!loading && error && (
        <p className="application-error">{error}</p>
      )}

      {!loading && !error && applications.length === 0 && (
        <section className="application-empty">
          <h2>No applications yet</h2>
          <p>
            Explore available jobs and apply to get started.
          </p>
        </section>
      )}

      {!loading && !error && applications.length > 0 && (
        <section className="application-list">
          {applications.map((application) => (
            <article
              className="application-card"
              key={application.applicationId}
            >
              <h2>{application.jobTitle}</h2>

              <p>
                <strong>Company:</strong> {application.company}
              </p>

              <p>
                <strong>Location:</strong> {application.location}
              </p>

              <p>
                <strong>Job type:</strong> {application.jobType}
              </p>

              <p>
                <strong>Applied on:</strong>{" "}
                {application.appliedAt
                  ? new Date(
                      application.appliedAt
                    ).toLocaleDateString()
                  : "Not available"}
              </p>

              <span className="application-status">
                {application.status}
              </span>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
