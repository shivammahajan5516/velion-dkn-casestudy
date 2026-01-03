import { useEffect, useMemo, useState } from "react";
import "./styles.css";

const API = import.meta.env.VITE_API_BASE;

async function apiFetch(path, { token, method = "GET", body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("signin");
  const [msg, setMsg] = useState("");

  // auth
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("EU");
  const [password, setPassword] = useState("");

  // search
  const [query, setQuery] = useState("");
  const [assets, setAssets] = useState([]);

  // upload
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("logistics,framework");
  const [sourceType, setSourceType] = useState("URL");
  const [sourceValue, setSourceValue] = useState("");

  // governance + leaderboard
  const [govId, setGovId] = useState("");
  const [pending, setPending] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const loggedIn = useMemo(() => !!token, [token]);

  useEffect(() => {
    if (!token) return;
    apiFetch("/api/auth/me", { token })
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        setToken("");
      });
  }, [token]);

  async function refreshAssets() {
    if (!token) return;
    setMsg("");
    const list = await apiFetch(`/api/assets?query=${encodeURIComponent(query)}`, { token });
    setAssets(list);
  }

  async function refreshLeaderboard() {
    if (!token) return;
    const top = await apiFetch("/api/leaderboard", { token });
    setLeaderboard(top);
  }

  useEffect(() => {
    if (!token) return;
    refreshAssets();
    refreshLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function submitAuth() {
    setMsg("");
    try {
      if (mode === "signup") {
        await apiFetch("/api/auth/signup", {
          method: "POST",
          body: { name, email, password, region }
        });
      }
      const data = await apiFetch("/api/auth/signin", {
        method: "POST",
        body: { email, password }
      });
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      setMsg("✅ Signed in successfully");
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setAssets([]);
    setPending([]);
    setLeaderboard([]);
    setMsg("Logged out");
  }

  async function createAsset() {
    setMsg("");
    try {
      const body = {
        title,
        description,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        sourceType,
        sourceValue
      };
      await apiFetch("/api/assets", { token, method: "POST", body });
      setTitle("");
      setDescription("");
      setSourceValue("");
      setMsg("✅ Submitted (PENDING) — governance must approve to make it GLOBAL");
      refreshAssets();
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    }
  }

  async function loadPending() {
    setMsg("");
    try {
      const list = await apiFetch(`/api/governance/pending?govId=${encodeURIComponent(govId)}`, { token });
      setPending(list);
      setMsg("✅ Pending assets loaded");
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    }
  }

  async function approve(assetId) {
    setMsg("");
    try {
      await apiFetch(`/api/governance/approve/${assetId}?govId=${encodeURIComponent(govId)}`, { token, method: "POST" });
      setMsg("✅ Approved — points awarded");
      await loadPending();
      await refreshAssets();
      await refreshLeaderboard();
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    }
  }

  async function reject(assetId) {
    setMsg("");
    try {
      await apiFetch(`/api/governance/reject/${assetId}?govId=${encodeURIComponent(govId)}`, { token, method: "POST" });
      setMsg("✅ Rejected");
      await loadPending();
      await refreshAssets();
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="header">
          <h1 className="brand">Velion DKN — Web Prototype</h1>
          {loggedIn && (
            <button className="btn" onClick={logout}>Logout</button>
          )}
        </div>

        <div className="sub">
          {user ? (
            <div>
              Signed in as <b>{user.name}</b> — Points: <b>{user.points}</b> — Region: <b>{user.region}</b>
            </div>
          ) : (
            <div>Sign in to search, upload assets, approve governance, and see leaderboard.</div>
          )}
        </div>

        {msg && <div className="notice">{msg}</div>}

        {!loggedIn ? (
          <div style={{ marginTop: 18, width: "100%" }}>
            <div className="card">
              {/* <div className="row" style={{ marginBottom: 12 }}> */}
              <div className="card" style={{ width: "100%", maxWidth: 900 }}>
                <button className={`btn ${mode === "signin" ? "" : "secondary"}`} onClick={() => setMode("signin")}>Sign In</button>
                <button className={`btn ${mode === "signup" ? "" : "secondary"}`} onClick={() => setMode("signup")}>Sign Up</button>
              </div>

              {mode === "signup" && (
                <>
                  <input className="input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
                  <div style={{ height: 10 }} />
                  <select className="select" value={region} onChange={e => setRegion(e.target.value)}>
                    <option value="EU">EU</option>
                    <option value="ASIA">ASIA</option>
                    <option value="AMERICAS">AMERICAS</option>
                  </select>
                  <div style={{ height: 10 }} />
                </>
              )}

              <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              <div style={{ height: 10 }} />
              <input className="input" type="password" placeholder="Password (min 6)" value={password} onChange={e => setPassword(e.target.value)} />
              <div style={{ height: 10 }} />

              <button className="btn" style={{ width: "100%" }} onClick={submitAuth}>Continue</button>
            </div>
          </div>
        ) : (
          <div className="grid">
            <div className="card">
              <h2>Search Assets</h2>
              <div className="row">
                <input className="input" placeholder="Search by title or tag" value={query} onChange={e => setQuery(e.target.value)} />
                <button className="btn" onClick={refreshAssets}>Search</button>
              </div>

              <div style={{ height: 14 }} />
              <div className="list">
                {assets.map(a => (
                  <div key={a._id} className="item">
                    <div className="itemTop">
                      <b>{a.title}</b>
                      <span style={{ opacity: 0.9 }}>{a.status} / {a.visibility}</span>
                    </div>
                    {a.description && <div className="tagline">{a.description}</div>}
                    <div className="tagline">Tags: {a.tags?.join(", ")}</div>
                    <div className="tagline">Source: {a.sourceType} — {a.sourceValue}</div>
                  </div>
                ))}
                {assets.length === 0 && <div style={{ opacity: 0.85 }}>No assets found.</div>}
              </div>

              <hr style={{ margin: "18px 0", opacity: 0.25 }} />

              <h2>Upload Knowledge (URL / TEXT)</h2>
              <input className="input" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
              <div style={{ height: 10 }} />
              <input className="input" placeholder="Short description" value={description} onChange={e => setDescription(e.target.value)} />
              <div style={{ height: 10 }} />
              <input className="input" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
              <div style={{ height: 10 }} />
              <select className="select" value={sourceType} onChange={e => setSourceType(e.target.value)}>
                <option value="URL">URL</option>
                <option value="TEXT">TEXT</option>
              </select>
              <div style={{ height: 10 }} />
              <textarea
                className="textarea"
                placeholder={sourceType === "URL" ? "Paste URL (SharePoint / Drive / Web)" : "Paste knowledge text"}
                value={sourceValue}
                onChange={e => setSourceValue(e.target.value)}
              />
              <div style={{ height: 10 }} />
              <button className="btn" style={{ width: "100%" }} onClick={createAsset}>Submit for Governance</button>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <div className="card">
                <h2>Governance Approval</h2>
                <input className="input" placeholder="Governance ID (VELION-2026)" value={govId} onChange={e => setGovId(e.target.value)} />
                <div style={{ height: 10 }} />
                <button className="btn" style={{ width: "100%" }} onClick={loadPending}>Load Pending</button>

                <div style={{ height: 12 }} />
                <div className="list">
                  {pending.map(p => (
                    <div key={p._id} className="item">
                      <b>{p.title}</b>
                      <div className="tagline">{p.description}</div>
                      <div className="row" style={{ marginTop: 10 }}>
                        <button className="btn" onClick={() => approve(p._id)} style={{ flex: 1 }}>Approve</button>
                        <button className="btn secondary" onClick={() => reject(p._id)} style={{ flex: 1 }}>Reject</button>
                      </div>
                    </div>
                  ))}
                  {pending.length === 0 && <div style={{ opacity: 0.85 }}>No pending items loaded.</div>}
                </div>
              </div>

              <div className="card">
                <h2>Leaderboard</h2>
                <button className="btn" style={{ width: "100%" }} onClick={refreshLeaderboard}>Refresh</button>
                <div style={{ height: 12 }} />
                <div className="list">
                  {leaderboard.map((u, i) => (
                    <div key={u._id || u.email} className="item" style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>#{i + 1} {u.name}</span>
                      <b>{u.points}</b>
                    </div>
                  ))}
                  {leaderboard.length === 0 && <div style={{ opacity: 0.85 }}>No data.</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
