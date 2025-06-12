import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ImageDetailsPage() {
  const { kefId } = useParams();
  const navigate = useNavigate();
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/metadata.json")
      .then((res) => res.json())
      .then((data) => {
        const match = data.find((item) => item.KEF_ID === kefId);
        setImageData(match);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch metadata:", err);
        setLoading(false);
      });
  }, [kefId]);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading content...</p>;
  }

  if (!imageData) {
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Content not found.</p>;
  }

  // Remove extension (e.g. .jpg, .mp4)
  const fileId = imageData.fileName.replace(/\.[^/.]+$/, "");
  const baseURL = "https://res.cloudinary.com/dwk1jl1bs";

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "30px 20px" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          backgroundColor: "#003366",
          color: "white",
          padding: "10px 18px",
          borderRadius: "8px",
          fontWeight: "bold",
          cursor: "pointer",
          border: "none",
          marginBottom: "20px",
        }}
      >
        ← Back
      </button>

      <div
        style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        {imageData.type_of_implementation === "Video" ? (
          <video
            src={`${baseURL}/video/upload/${fileId}.mp4`}
            controls
            muted
            style={{
              width: "100%",
              maxHeight: "500px",
              objectFit: "contain",
              backgroundColor: "#f4f4f4",
            }}
          />
        ) : (
          <img
            src={`${baseURL}/image/upload/${fileId}.jpg`}
            alt={imageData.topic}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `${baseURL}/image/upload/${fileId}.png`;
            }}
            style={{
              width: "100%",
              maxHeight: "500px",
              objectFit: "contain",
              backgroundColor: "#f4f4f4",
            }}
          />
        )}

        <div style={{ padding: "20px" }}>
          <h2 style={{ color: "#003366" }}>{imageData.topic}</h2>
          <p style={{ fontSize: "16px", margin: "10px 0" }}>{imageData.description}</p>
          <p style={{ color: "#777", fontSize: "14px" }}>
            <strong>KEF ID:</strong> {imageData.KEF_ID} | <strong>Grade:</strong>{" "}
            {imageData.grade}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ImageDetailsPage;
