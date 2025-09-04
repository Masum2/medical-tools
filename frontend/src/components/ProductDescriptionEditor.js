import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const ProductDescriptionEditor = ({ description, setDescription }) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Enter product description",
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ align: [] }],
            ["link", "image"],
            ["clean"],
          ],
        },
      });

      // Listen for changes
      quillRef.current.on("text-change", () => {
        setDescription(quillRef.current.root.innerHTML);
      });
    }
  }, [setDescription]);

  // 🔑 যখনই description prop আপডেট হবে, editor এ সেট করে দিব
  useEffect(() => {
    if (quillRef.current && description !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = description || "";
    }
  }, [description]);

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div ref={editorRef} style={{ height: "200px" }} />
    </div>
  );
};

export default ProductDescriptionEditor;
