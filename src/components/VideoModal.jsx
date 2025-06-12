// src/components/VideoModal.jsx
import React from "react";

function VideoModal({ videoData, onClose }) {
  if (!videoData) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "12px",
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <video
          src={videoData.cloudinaryUrl}
          controls
          autoPlay
          style={{
            maxWidth: "100%",
            maxHeight: "60vh",
            borderRadius: "8px",
          }}
        />
        <h2 style={{ color: "#003366", marginTop: "20px" }}>{videoData.topic}</h2>
        <p>{videoData.description}</p>
        <p style={{ color: "#777", fontSize: "14px" }}>
          <strong>KEF ID:</strong> {videoData.KEF_ID} | <strong>Grade:</strong> {videoData.grade}
        </p>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "#003366",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            marginTop: "20px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default VideoModal;
