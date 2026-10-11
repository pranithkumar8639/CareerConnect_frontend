const API_BASE_URL = "http://localhost:8080/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("careerconnect_token");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
const text = await response.text();

let data = null;

try {
  data = text ? JSON.parse(text) : null;
} catch {
  data = null;
}

if (!response.ok) {
  const message =
    data?.message ||
    data?.error ||
    `Request failed (${response.status})`;

  throw new Error(message);
}

return data;

  return data;
}

export function registerUser(user) {
  return request("/auth/register", { method: "POST", body: JSON.stringify(user) });
}
export function loginUser(credentials) {
  return request("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
}
export function getStudentProfile() {
  return request("/student/profile", { method: "GET" });
}
export function saveStudentProfile(profile) {
  return request("/student/profile", {
    method: "PUT",
    body: JSON.stringify({ phone: profile.phone, location: profile.location, education: profile.education, skills: profile.skills, bio: profile.bio }),
  });
}
export function uploadResume(file) {
  const formData = new FormData();
  formData.append("file", file);
  return request("/student/profile/resume", { method: "POST", body: formData });
}
export async function downloadResume(filename = "resume") {
  const token = localStorage.getItem("careerconnect_token");
  const response = await fetch(`${API_BASE_URL}/student/profile/resume`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || data.error || `Download failed (${response.status})`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}


export function getJobs() {
  return request("/jobs", { method: "GET" });
}

export function applyForJob(jobId) {
  return request(`/jobs/${jobId}/apply`, {
    method: "POST",
    body: JSON.stringify({})
  });
}


export function getMyApplications() {
  return request("/applications/me");
}
