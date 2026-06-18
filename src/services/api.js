const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

const request = async (method, url, body = null) => {
  const options = { method, headers: headers() };
  if (body) options.body = JSON.stringify(body);
  const res  = await fetch(`${BASE}${url}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API error");
  return data;
};

const auth = {
  register: (body) => request("POST", "/auth/register", body),
  login:    (body) => request("POST", "/auth/login",    body),
  me:       ()     => request("GET",  "/auth/me"),
};

const users = {
  getAll:  ()   => request("GET", "/users"),
  getById: (id) => request("GET", `/users/${id}`),
};

const requirements = {
  getAll:  (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request("GET", `/requirements${q ? "?" + q : ""}`);
  },
  getById: (id)       => request("GET",    `/requirements/${id}`),
  create:  (body)     => request("POST",   "/requirements", body),
  update:  (id, body) => request("PUT",    `/requirements/${id}`, body),
  delete:  (id)       => request("DELETE", `/requirements/${id}`),
};

const stories = {
  getAll:  (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request("GET", `/stories${q ? "?" + q : ""}`);
  },
  getById:        (id)           => request("GET",    `/stories/${id}`),
  create:         (body)         => request("POST",   "/stories", body),
  update:         (id, body)     => request("PUT",    `/stories/${id}`, body),
  updateStatus:   (id, status)   => request("PATCH",  `/stories/${id}/status`,   { status }),
  updateAssignee: (id, assignee) => request("PATCH",  `/stories/${id}/assignee`, { assignee }),
  delete:         (id)           => request("DELETE", `/stories/${id}`),
};

const sprints = {
  getAll:      ()                    => request("GET",    "/sprints"),
  getById:     (id)                  => request("GET",    `/sprints/${id}`),
  getStats:    (id)                  => request("GET",    `/sprints/${id}/stats`),
  create:      (body)                => request("POST",   "/sprints", body),
  update:      (id, body)            => request("PUT",    `/sprints/${id}`, body),
  addStory:    (sprintId, storyId)   => request("POST",   `/sprints/${sprintId}/stories`, { storyId }),
  removeStory: (sprintId, storyId)   => request("DELETE", `/sprints/${sprintId}/stories/${storyId}`, null),
  delete:      (id)                  => request("DELETE", `/sprints/${id}`),
};

const estimations = {
  getAll:  ()      => request("GET",    "/estimations"),
  create:  (body)  => request("POST",   "/estimations", body),
  delete:  (id)    => request("DELETE", `/estimations/${id}`),
};

const api = { auth, users, requirements, stories, sprints, estimations };
export default api;