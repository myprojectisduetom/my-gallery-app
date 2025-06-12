import os
import pandas as pd
import json

# === CONFIGURATION ===
photo_dir = "public/Downloaded_Photos"
video_dir = "public/Downloaded_Videos"
excel_path = "CopyTA.xlsx"  # 🔁 Replace with your actual Excel file path

# === LOAD AND CLEAN EXCEL ===
df = pd.read_excel(excel_path)
df.columns = [str(col).strip() for col in df.columns]
df = df.replace(["NA", "na", "Na", "n/a", "N/A", ""], None)

# Build metadata lookup by KEF_ID
metadata_map = {
    str(row["KEF_ID"]).strip(): row
    for _, row in df.iterrows()
    if pd.notna(row["KEF_ID"])
}

# === FUNCTION TO BUILD CLEAN METADATA OBJECT ===
def build_metadata(file_name, is_photo=True):
    parts = file_name.split("_")
    if len(parts) < 3:
        return None
    kef_id = "_".join(parts[:3])

    base = {
        "KEF_ID": kef_id,
        "fileName": file_name,
        "filePath": f"{'Downloaded_Photos' if is_photo else 'Downloaded_Videos'}/{file_name}"
    }

    meta = metadata_map.get(kef_id, {})

    field_mappings = {
        "Type of Implementation": "type_of_implementation",
        "Implementation Link": "implementation_link",
        "Grade": "grade",
        "Subjects": "subjects",
        "Topic": "topic",
        "Description": "description",
        "Teacher Category": "teacher_category"
    }

    for source, dest in field_mappings.items():
        value = meta.get(source)
        if value and str(value).strip().lower() != "na":
            base[dest] = str(value).strip()

    return base

# === BUILD FINAL JSON LIST ===
final_metadata = []

# Photos
for fname in os.listdir(photo_dir):
    if fname.lower().endswith((".jpg", ".jpeg", ".png")):
        entry = build_metadata(fname, is_photo=True)
        if entry:
            final_metadata.append(entry)

# Videos
for fname in os.listdir(video_dir):
    if fname.lower().endswith((".mp4", ".mov", ".avi")):
        entry = build_metadata(fname, is_photo=False)
        if entry:
            final_metadata.append(entry)

# === EXPORT TO JSON ===
with open("metadata.json", "w", encoding="utf-8") as f:
    json.dump(final_metadata, f, ensure_ascii=False, indent=2)

print(f"✅ metadata.json created with {len(final_metadata)} entries.")
