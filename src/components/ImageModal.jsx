import React from "react";

function ImageModal({ imageData, onClose }) {
  if (!imageData) return null;

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
        }}
      >
        <img
          src={imageData.cloudinaryUrl}
          alt={imageData.topic}
          style={{
            width: "100%",
            maxHeight: "400px",
            objectFit: "contain",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        />
        <div style={{ padding: "20px" }}>
          <h2 style={{ color: "#003366" }}>{imageData.topic}</h2>
          <p>{imageData.description}</p>
          <p style={{ color: "#777", fontSize: "14px" }}>
            <strong>KEF ID:</strong> {imageData.KEF_ID} |{" "}
            <strong>Grade:</strong> {imageData.grade}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "#003366",
            color: "white",
            padding: "10px 20px",
            borderRadius: "0 0 12px 12px",
            border: "none",
            width: "100%",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default ImageModal;
