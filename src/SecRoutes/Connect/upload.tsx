
//05
import React, { useState, useEffect, useRef } from "react";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { ref as dbRef, update } from "firebase/database";
import { storage, db } from "../../firebase"; // Import initialized Firebase services
import "./connect.css";

type ImageUploadProps = {
  telegramUserId: string; // Pass in Telegram user ID
};

export function ImageUpload({ telegramUserId }: ImageUploadProps) {
  const [images, setImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [pending, setPending] = useState<boolean>(() => {
    const storedPending = localStorage.getItem(`pending_${telegramUserId}`);
    return storedPending ? JSON.parse(storedPending) : false;
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null); // Reference to the hidden file input

  useEffect(() => {
    localStorage.setItem(`pending_${telegramUserId}`, JSON.stringify(pending));
  }, [pending, telegramUserId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedImages = Array.from(e.target.files);
      if (selectedImages.length > 1) {
        alert("You can only upload a maximum of 2 images.");
        return;
      }
      setImages(selectedImages);
      setPending(false);
    }
  };

  const handleUpload = async () => {
    if (images.length < 3) {
      alert("Please upload at least 3 images.");
      return;
    }

    setIsUploading(true);
    const uploadProgressArr: number[] = Array(images.length).fill(0);

    const uploadTasks = images.map((image, index) => {
      const imgRef = storageRef(storage, `images/${telegramUserId}/image${index + 1}`);

      const uploadTask = uploadBytesResumable(imgRef, image);

      return new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            uploadProgressArr[index] = progress;
            setUploadProgress([...uploadProgressArr]);
          },
          (error) => {
            console.error("Upload failed:", error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await saveImageData(telegramUserId, downloadURL, index);
            resolve();
          }
        );
      });
    });

    Promise.all(uploadTasks)
      .then(() => {
        console.log("All uploads completed.");
        setIsUploading(false);
        setPending(true);
      })
      .catch((error) => {
        console.error("Error in uploading:", error);
        setIsUploading(false);
      });
  };

  const saveImageData = async (telegramUserId: string, downloadURL: string, index: number) => {
    const imageKey = `image${index + 1}`;
    const userImagesRef = dbRef(db, `users/${telegramUserId}/images`);

    await update(userImagesRef, {
      [imageKey]: downloadURL,
      imageverified: false
    });
  };

  const handleReupload = () => {
    setPending(false);
    setUploadProgress([]);
    setImages([]);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the hidden file input
    }
  };

  return (
    <div className="upload">
      {!pending ? (
        <>
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            disabled={isUploading}
            ref={fileInputRef}
            // className="hidden-input" // Hidden input styling
          />

          {/* Custom button or SVG to trigger file input */}
          <button
            className="custom-upload-button"
            onClick={triggerFileInput}
            disabled={isUploading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="upload-icon"
            >
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
              <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z"/>
            </svg>
            {isUploading ? "Uploading..." : "Upload Images"}
          </button>

          <button onClick={handleUpload} disabled={isUploading || images.length < 1}  className="custom-upload-submit">
             {isUploading ? "Uploading..." : "Submit"}
          </button>

          {/* Progress display */}
          {uploadProgress.length > 0 && (
            <div>
              {uploadProgress.map((progress, index) => (
                <p key={index}>Image {index + 1}: {progress}% uploaded</p>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <p className="custom-upload-pending">Pending</p>
          <button onClick={handleReupload} className="custom-upload-submit">Reupload</button>
        </div>
      )}
    </div>
  );
}
