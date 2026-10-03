import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const { slug } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/auth/profile/${slug}`
        );
        setTherapist(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchTherapist();
  }, [slug]);

  if (loading) return <div style={pageStyle}><p>Loading profile...</p></div>;
  if (error) return <div style={pageStyle}><p style={{ color: "red" }}>{error}</p></div>;

  return (
    <div style={pageStyle}>
      <header style={heroStyle}>
        <h1>{therapist.name}</h1>
        <p style={{ color: "#64748b" }}>Licensed Practitioner</p>
      </header>

      <section style={cardStyle}>
        <h3>About Me</h3>
        <p>{therapist.bio || "Welcome to my profile."}</p>
      </section>

      <footer style={{ marginTop: "2rem", textAlign: "center" }}>
        <Link to="/login" style={{ color: "#2563eb" }}>Therapist Login</Link>
      </footer>
    </div>
  );
}

const pageStyle = { maxWidth: "600px", margin: "2rem auto", padding: "1rem", fontFamily: "sans-serif" };
const heroStyle = { padding: "1.5rem", background: "#f1f5f9", borderRadius: "8px", textAlign: "center" };
const cardStyle = { border: "1px solid #e2e8f0", borderRadius: "8px", padding: "1.5rem", marginTop: "1rem" };