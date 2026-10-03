import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("therapist", JSON.stringify(response.data.therapist));

      alert("Login successful!");
      navigate(`/${response.data.therapist.slug}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      setError(msg);
      alert("Error: " + msg);
    }
  };

  return (
    <div style={containerStyle}>
      <h2>Therapist Login</h2>
      {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <button type="submit" style={btnStyle}>Login</button>
      </form>

      <p style={{ marginTop: "1rem" }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

const containerStyle = {
  maxWidth: "400px",
  margin: "3rem auto",
  padding: "2rem",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  fontFamily: "sans-serif",
};

const formStyle = { display: "flex", flexDirection: "column", gap: "1rem" };
const inputStyle = { padding: "0.6rem", fontSize: "1rem", borderRadius: "4px", border: "1px solid #ccc" };
const btnStyle = { padding: "0.7rem", backgroundColor: "#16a34a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "1rem" };