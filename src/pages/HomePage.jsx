import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { getTeacherStats } from "../utils/teacherStats";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "./HomePage.css";

export default function HomePage() {
  const [data, setData] = useState([]);
  const [publicIdMap, setPublicIdMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [teacherStats, setTeacherStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/data/metadata.json")
      .then((res) => res.json())
      .then((json) => {
        const cleaned = json
          .filter(
            (item) =>
              item.filePath &&
              item.topic &&
              item.description &&
              ["Photos", "Video"].includes(item.type_of_implementation)
          )
          .map((item) => ({
            ...item,
            subjects:
              !item.subjects || item.subjects.trim().toLowerCase() === "nan"
                ? "Miscellaneous"
                : item.subjects.trim(),
          }));

        setData(cleaned);
        const stats = getTeacherStats(cleaned);
        setTeacherStats(stats);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load metadata.json:", err);
        setLoading(false);
      });

    fetch("/data/recoveredPublicIdMap.json")
      .then((res) => res.json())
      .then((map) => setPublicIdMap(map))
      .catch((err) => console.error("Failed to load recoveredPublicIdMap:", err));
  }, []);

  const groupBySubject = (items) =>
    items.reduce((acc, item) => {
      const subj = item.subjects.trim();
      if (!acc[subj]) acc[subj] = [];
      acc[subj].push(item);
      return acc;
    }, {});

  const groupedBySubject = groupBySubject(data);

  const goToGallery = (subject) => {
    navigate(`/gallery?subject=${encodeURIComponent(subject)}`);
  };

  if (loading || !teacherStats)
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading Homepage...</p>;

  const { categoryCount, topTeacher, maxCount } = teacherStats;

  const baseURL = "https://res.cloudinary.com/dwk1jl1bs";

  const renderCarousels = (grouped) => (
  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2rem", padding: "1rem" }}>
    {Object.entries(grouped).map(([subject, items], idx) => {
      const filteredItems = items.filter((item) => {
        const filename = item.filePath.split("/").pop().replace(/\.[^/.]+$/, "");
        return publicIdMap[filename];
      });

      if (filteredItems.length === 0) return null;

      return (
        <div
          key={idx}
          style={{
            width: "300px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 0 8px rgba(0, 0, 0, 0.12)",
            padding: "10px",
            cursor: "pointer",
          }}
          onClick={() => goToGallery(subject)}
        >
          <h2 style={{ textAlign: "center" }}>{subject}</h2>
          <Swiper
            slidesPerView={1}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop
            navigation
            modules={[Autoplay, Navigation]}
            style={{ width: "100%", height: "220px" }}
          >
            {filteredItems.map((item, idx2) => {
              const filename = item.filePath.split("/").pop().replace(/\.[^/.]+$/, "");
              const publicId = publicIdMap[filename];

              return (
                <SwiperSlide key={idx2}>
                  {item.type_of_implementation === "Video" ? (
                    <video
                      src={`${baseURL}/video/upload/${publicId}.mp4`}
                      muted
                      controls
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <img
                      src={`${baseURL}/image/upload/${publicId}.jpg`}
                      alt={item.topic}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `${baseURL}/image/upload/${publicId}.png`;
                      }}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      );
    })}
  </div>
);
  return (
    <div>
      <nav className="navbar">
        <div className="navbar-logo">Kotak Education Foundation</div>
        <ul className="navbar-links">
          <li onClick={() => document.getElementById("top").scrollIntoView({ behavior: "smooth" })}>Home</li>
          <li onClick={() => document.getElementById("summary").scrollIntoView({ behavior: "smooth" })}>Summary</li>
          <li onClick={() => document.getElementById("contact").scrollIntoView({ behavior: "smooth" })}>Contact</li>
        </ul>
      </nav>

      <div id="top" className="hero-header">DLS Achievements ✨</div>

      {renderCarousels(groupedBySubject)}

      <div id="summary" className="summary-section">
        <h2>📊 Teacher Summary</h2>
        <div className="summary-cards">
          {[{ label: "Basic", count: categoryCount.Basic, color: "#b3e0ff" },
            { label: "Intermediate", count: categoryCount.Intermediate, color: "#99ccff" },
            { label: "Advanced", count: categoryCount.Advanced, color: "#80bfff" },
          ].map(({ label, count, color }) => (
            <div key={label} className="summary-card" style={{ backgroundColor: color }}>
              <div>{label}</div>
              <div>{count}</div>
            </div>
          ))}
        </div>

        <div className="top-implementer">
          <h3>🌟 Top Implementer</h3>
          <p><strong>{topTeacher}</strong> — {maxCount} implementations</p>
        </div>
      </div>

      <div id="contact" className="contact-section">
        <h2>Contact Us</h2>
        <div className="contact-wrapper">
          <div className="contact-info">
            <h3>Our Address</h3>
            <p>DLS Organization<br />Kotak Education Foundation, Ujagar Compound,<br />Opposite Deonar Bus Depot, Off Sion - Trombay Road,<br />MBPT Colony, Deonar, Chembur,<br />Mumbai, Maharashtra 400088</p>
            <h3>Email</h3>
            <p><a href="mailto:contact@kotakeducationfoundation.org">contact@kotakeducationfoundation.org</a></p>
            <h3>Phone</h3>
            <p><a href="tel:+911234567890">+91 12345 67890</a></p>
          </div>

          <form
          className="contact-form"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            fetch("https://script.google.com/macros/s/AKfycbxukCX_aS-zfnSxLnVOW9KdeEh2KMnNYR5t6QbYWGujihrCvomgE-GYMspGKUQN-2Jt/exec", {
              method: "POST",
              body: formData, // sending as form data (no need for headers or JSON)
              })
              .then((res) => res.json())
              .then((data) => {
                if (data.result === "success") {
                  alert("Message sent successfully!");
                  e.target.reset();
                } else {
                  alert("Something went wrong: " + (data.message || "Unknown error"));
                }
              })
              .catch((err) => {
                console.error(err);
                alert("Failed to send message. Try again later.");
              });
              }}
              >
                <input name="name" type="text" placeholder="Your Name" required />
                <input name="email" type="email" placeholder="Your Email" required />
                <textarea name="message" rows="5" placeholder="Your Message" required />
                <button type="submit">Send</button>
            </form>
        </div>
      </div>
    </div>
  );
}