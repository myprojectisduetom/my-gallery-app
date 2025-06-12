import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ImageModal from "../components/ImageModal";
import VideoModal from "../components/VideoModal";

const cloudName = "dwk1jl1bs"; // Your Cloudinary cloud name

function GalleryPage() {
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const subject = queryParams.get("subject");

  const [media, setMedia] = useState([]);
  const [mediaType, setMediaType] = useState("Photos"); // Photos | Videos | All
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [availableGrades, setAvailableGrades] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("/data/metadata.json").then((res) => res.json()),
      fetch("/data/recoveredPublicIdMap.json").then((res) => res.json()),
    ])
      .then(([metadata, publicIdMap]) => {
        const filtered = metadata
        .map((item) => {
          const fileName = item.fileName?.replace(/\.(jpg|jpeg|png|webp|mp4|webm|mov)$/i, "");
          const publicId = publicIdMap[fileName];
          const isVideo = ["mp4", "webm", "mov"].some((ext) =>
            item.fileName?.toLowerCase().endsWith(ext)
        );
        if (
          item.subjects !== subject ||
          !fileName ||
          !publicId ||
          !item.topic ||
          !item.description
        ) {
          return null;
        }
        
        const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/${
          isVideo ? "video" : "image"
        }/upload/${publicId}`;
        return {
          ...item,
          cloudinaryUrl,
        };
      })
      
      .filter(Boolean); // remove nulls

        const grades = Array.from(new Set(filtered.map((item) => item.grade))).sort();
        setAvailableGrades(["All", ...grades]);
        setMedia(filtered);
      })
      .catch((err) => console.error("Failed to load data:", err));
  }, [subject]);

  const filteredMedia = media.filter((item) => {
    const isPhoto = ["jpg", "jpeg", "png", "webp"].some((ext) =>
      item.fileName.toLowerCase().endsWith(ext)
    );
    const isVideo = ["mp4", "webm", "mov"].some((ext) =>
      item.fileName.toLowerCase().endsWith(ext)
    );
    const matchesMediaType =
      mediaType === "All" ||
      (mediaType === "Photos" && isPhoto) ||
      (mediaType === "Videos" && isVideo);
    const matchesGrade = selectedGrade === "All" || item.grade === selectedGrade;
    return matchesMediaType && matchesGrade;
  });

  return (
    <div style={{ padding: "30px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <button onClick={() => navigate("/")} style={buttonStyle("#003366")}>
          ← Back to Home
        </button>
        <div>
          <label htmlFor="gradeFilter" style={{ marginRight: "10px", fontWeight: "bold" }}>
            Grade:
          </label>
          <select
            id="gradeFilter"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              fontWeight: "bold",
              border: "1px solid #ccc",
            }}
          >
            {availableGrades.map((grade, idx) => (
              <option key={idx} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={scrollTopStyle}
          title="Scroll to top"
        >
          ↑
        </button>
      </div>

      {/* Title */}
      <h1 style={{ textAlign: "center", color: "#003366", marginBottom: "20px" }}>
        {subject} Gallery
      </h1>

      {/* Filter Tabs */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        {["Photos", "Videos", "All"].map((type) => (
          <button
            key={type}
            onClick={() => setMediaType(type)}
            style={{
              ...buttonStyle(mediaType === type ? "#004080" : "#ccc"),
              color: mediaType === type ? "white" : "black",
              margin: "0 10px",
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredMedia.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "40px" }}>
          No {mediaType.toLowerCase()} found for this subject.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "24px",
            justifyItems: "center",
          }}
        >
          {filteredMedia.map((item, idx) => {
            if (
              !item ||
              !item.fileName ||
              !item.cloudinaryUrl ||
              !item.grade ||
              !item.topic
            ) {
              console.warn("Skipping invalid media item:", item);
              return null;
            }
            
            const isVideo = ["mp4", "webm", "mov"].some((ext) =>
              item.fileName.toLowerCase().endsWith(ext)
          );
          
          return (
          <div
          key={idx}
          onClick={() =>
            isVideo ? setSelectedVideo(item) : setSelectedImage(item)
          }
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          style={{
            ...cardStyle,
            transform: hoveredIndex === idx ? "translateY(-6px)" : "none",
            boxShadow:
            hoveredIndex === idx
            ? "0 6px 18px rgba(0, 0, 0, 0.15)"
            : cardStyle.boxShadow,
          }}
          >
                {isVideo ? (
                  <video
                    src={item.cloudinaryUrl}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                    }}
                    muted
                    loop
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={item.cloudinaryUrl}
                    alt={item.topic}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                    }}
                  />
                )}
                <div style={{ padding: "12px", textAlign: "center" }}>
                  <strong>
                    {item.KEF_ID} | Grade: {item.grade}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedImage && (
        <ImageModal
          imageData={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {selectedVideo && (
        <VideoModal
          videoData={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}

const buttonStyle = (bg) => ({
  background: bg,
  color: "white",
  padding: "10px 18px",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
  border: "none",
  margin: "10px",
});

const scrollTopStyle = {
  position: "fixed",
  bottom: "30px",
  right: "30px",
  backgroundColor: "#0077cc",
  color: "white",
  border: "none",
  borderRadius: "50%",
  width: "48px",
  height: "48px",
  fontSize: "22px",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  zIndex: 999,
};

const cardStyle = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  cursor: "pointer",
  overflow: "hidden",
  width: "100%",
  maxWidth: "260px",
  transition: "transform 0.3s",
};

export default GalleryPage;
