import React, { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [token, setToken] = useState(localStorage.getItem("bg_token") || "");
  const [user, setUser] = useState(null);
  const [pickup, setPickup] = useState({ address: "Ballia Railway Station", coordinates: { lat: 25.758, lng: 84.148 } });
  const [drop, setDrop] = useState({ address: "Ballia Bus Stand", coordinates: { lat: 25.764, lng: 84.149 } });
  const [vehicleType, setVehicleType] = useState("bike");
  const [rides, setRides] = useState([]);
  const [message, setMessage] = useState("");

  const update = (key, value) => setForm(old => ({ ...old, [key]: value }));
  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed");
    return data;
  }
  async function auth(kind) {
    try {
      const data = await request(`/api/auth/${kind}`, { method: "POST", body: JSON.stringify({ ...form, role }) });
      setToken(data.token); setUser(data.user); localStorage.setItem("bg_token", data.token);
      setMessage("Welcome to BalliaGo!");
    } catch (e) { setMessage(e.message); }
  }
  async function loadRides() {
    try { const data = await request("/api/rides/mine"); setRides(data.rides); }
    catch (e) { setMessage(e.message); }
  }
  async function book() {
    try {
      await request("/api/rides", { method: "POST", body: JSON.stringify({ pickup, drop, vehicleType }) });
      setMessage("Ride request created. This is a demo; no driver dispatch is guaranteed.");
      loadRides();
    } catch (e) { setMessage(e.message); }
  }
  async function accept(id) {
    try { await request(`/api/rides/${id}/accept`, { method: "PATCH" }); setMessage("Ride accepted"); loadRides(); }
    catch (e) { setMessage(e.message); }
  }
  function logout() { localStorage.removeItem("bg_token"); setToken(""); setUser(null); setRides([]); }

  return <main>
    <nav><div className="brand"><span className="mark">B</span> BalliaGo</div><span>Apne Shehar Ki Apni Ride</span></nav>
    <section className="hero">
      <div><p className="eyebrow">YOUR CITY. YOUR RIDE.</p><h1>Ballia mein safar,<br/><em>ab aur aasaan.</em></h1>
      <p className="sub">Bike, Auto aur Cab booking — ek local mobility platform ka demo.</p></div>
      <div className="booking card">
        {!token ? <>
          <h2>Get started</h2>
          <div className="tabs"><button className={role==="customer"?"active":""} onClick={()=>setRole("customer")}>Customer</button><button className={role==="captain"?"active":""} onClick={()=>setRole("captain")}>Captain demo</button></div>
          <input placeholder="Full name (registration)" value={form.name} onChange={e=>update("name",e.target.value)}/>
          <input placeholder="Email" value={form.email} onChange={e=>update("email",e.target.value)}/>
          <input placeholder="Password (8+ characters)" type="password" value={form.password} onChange={e=>update("password",e.target.value)}/>
          <input placeholder="Phone (optional)" value={form.phone} onChange={e=>update("phone",e.target.value)}/>
          <div className="actions"><button onClick={()=>auth("register")}>Create account</button><button className="secondary" onClick={()=>auth("login")}>Login</button></div>
        </> : <>
          <h2>Hello{user?.name ? `, ${user.name}` : "!"}</h2>
          <p className="muted">Role: {user?.role || "signed in"}</p>
          {user?.role === "customer" && <>
            <label>Pickup address</label><input value={pickup.address} onChange={e=>setPickup(old=>({...old,address:e.target.value}))}/>
            <label>Pickup latitude</label><input type="number" value={pickup.coordinates.lat} onChange={e=>setPickup(old=>({...old,coordinates:{...old.coordinates,lat:Number(e.target.value)}}))}/>
            <label>Pickup longitude</label><input type="number" value={pickup.coordinates.lng} onChange={e=>setPickup(old=>({...old,coordinates:{...old.coordinates,lng:Number(e.target.value)}}))}/>
            <label>Drop address</label><input value={drop.address} onChange={e=>setDrop(old=>({...old,address:e.target.value}))}/>
            <label>Drop latitude</label><input type="number" value={drop.coordinates.lat} onChange={e=>setDrop(old=>({...old,coordinates:{...old.coordinates,lat:Number(e.target.value)}}))}/>
            <label>Drop longitude</label><input type="number" value={drop.coordinates.lng} onChange={e=>setDrop(old=>({...old,coordinates:{...old.coordinates,lng:Number(e.target.value)}}))}/>
            <label>Vehicle</label><select value={vehicleType} onChange={e=>setVehicleType(e.target.value)}><option value="bike">Bike</option><option value="auto">Auto</option><option value="cab">Cab</option></select>
            <button onClick={book}>Request demo ride</button>
          </>}
          <button className="secondary" onClick={loadRides}>Refresh rides</button>
          <button className="link" onClick={logout}>Logout</button>
          <div className="rides">{rides.map(r=><article key={r._id}><b>{r.vehicleType.toUpperCase()}</b> · {r.pickup} → {r.drop}<small>{r.status} · ₹{r.estimatedFare}</small>{user?.role==="captain" && r.status==="requested" && <button onClick={()=>accept(r._id)}>Accept demo ride</button>}</article>)}</div>
        </>}
        {message && <p className="notice">{message}</p>}
      </div>
    </section>
    <section className="features"><div><b>01 / Local first</b><h3>Ballia ke liye bana</h3><p>Local pickup points aur neighbourhood journeys ko dhyan mein rakhkar.</p></div><div><b>02 / Choice</b><h3>Bike · Auto · Cab</h3><p>Alag-alag vehicle categories ka demo booking flow.</p></div><div><b>03 / Safety</b><h3>Verified journeys</h3><p>Production launch se pehle driver checks, insurance aur safety workflows zaroori hain.</p></div></section>
    <footer>© {new Date().getFullYear()} BalliaGo · Development prototype · Not available for commercial rides</footer>
  </main>;
}
