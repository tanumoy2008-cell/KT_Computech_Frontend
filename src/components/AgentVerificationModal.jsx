import { motion } from "framer-motion";
import {
  MdVerifiedUser,
  MdUploadFile,
  MdHourglassTop,
  MdCancel,
  MdCameraAlt,
  MdReplay,
} from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import axios from "../config/axios";
import { toast } from "react-toastify";
import Processing from '../assets/Processing.json'
import Lottie from "lottie-react";

const AgentVerificationModal = ({
  status, // pending | processing | reupload | rejected | approved
  onClose,
  rejectionReason,
  reuploadReason,
}) => {
  const [faceImage, setFaceImage] = useState(null);
  const [aadhaarPdf, setAadhaarPdf] = useState(null);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const canUpload = status === "pending" || status === "reupload";

  /* ======================================================
     OPEN CAMERA (ONLY GET STREAM)
  ====================================================== */
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch (err) {
      console.error(err);
      toast.error(err.name || "Camera permission denied");
    }
  };

  /* ======================================================
     ATTACH STREAM AFTER VIDEO RENDERS
  ====================================================== */
  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;

      videoRef.current
        .play()
        .catch((err) => console.error("Video play error:", err));
    }
  }, [cameraOpen]);

  /* ======================================================
     CAPTURE PHOTO
  ====================================================== */
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], "face.jpg", { type: "image/jpeg" });
      setFaceImage(file);
      closeCamera();
    }, "image/jpeg");
  };

  /* ======================================================
     CLOSE CAMERA CLEANLY
  ====================================================== */
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  useEffect(() => {
    return () => closeCamera();
  }, []);

  /* ======================================================
     SUBMIT DOCUMENTS
  ====================================================== */
  const handleSubmit = async () => {
    if (!faceImage || !aadhaarPdf) {
      toast.error("Face photo and Aadhaar PDF are required");
      return;
    }

    try {
      setLoading(true);

      const faceForm = new FormData();
      faceForm.append("faceImage", faceImage);

      const aadhaarForm = new FormData();
      aadhaarForm.append("idProof", aadhaarPdf);

      await axios.post("/api/delivery/upload-face", faceForm);
      await axios.post("/api/delivery/upload-id", aadhaarForm);

      toast.success(
        status === "reupload"
          ? "Documents re-submitted successfully"
          : "Documents submitted successfully"
      );

      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center px-4">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-3xl rounded-3xl bg-zinc-900 text-white border border-white/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* LEFT */}
          <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 p-8">
            <MdVerifiedUser className="text-5xl text-black mb-6" />
            <h2 className="text-2xl font-bold text-black">
              Agent Verification
            </h2>
            <p className="text-black/80 text-sm mt-2">
              Required to activate delivery access
            </p>
          </div>

          {/* RIGHT */}
          <div className="p-8 md:col-span-2">
            {/* REUPLOAD REASON */}
            {status === "reupload" && (
              <div className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-400">
                <p className="font-semibold text-amber-300">
                  Re-upload required
                </p>
                <p className="text-sm text-amber-200 mt-1">
                  {reuploadReason}
                </p>
              </div>
            )}

            {/* UPLOAD */}
            {canUpload && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <MdUploadFile className="text-4xl text-emerald-400" />
                  <div>
                    <h3 className="text-xl font-bold">
                      {status === "reupload"
                        ? "Re-upload Documents"
                        : "Upload Documents"}
                    </h3>
                    <p className="text-white/60 text-sm">
                      Live face photo + Aadhaar PDF
                    </p>
                  </div>
                </div>

                {/* FACE */}
                <div className="mb-5">
                  {!faceImage ? (
                    <button
                      onClick={openCamera}
                      className="w-full py-3 rounded-xl bg-emerald-500 text-black font-semibold flex items-center justify-center gap-2"
                    >
                      <MdCameraAlt /> Open Camera
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <img
                        src={URL.createObjectURL(faceImage)}
                        alt="face"
                        className="w-20 h-20 rounded-xl object-cover border"
                      />
                      <button
                        onClick={() => setFaceImage(null)}
                        className="text-red-400 flex items-center gap-1"
                      >
                        <MdReplay /> Retake
                      </button>
                    </div>
                  )}
                </div>

                {/* AADHAAR */}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setAadhaarPdf(e.target.files[0])}
                  className="w-full mb-6 rounded-xl bg-black/40 border px-4 py-3"
                />

                <button
                  disabled={loading}
                  onClick={handleSubmit}
                  className={`w-full py-4 rounded-xl font-bold ${
                    loading
                      ? "bg-zinc-600"
                      : "bg-emerald-500 hover:bg-emerald-400 text-black"
                  }`}
                >
                  {loading
                    ? "Uploading..."
                    : status === "reupload"
                    ? "Re-submit Documents"
                    : "Submit Documents"}
                </button>
              </>
            )}

            {/* PROCESSING */}
            {status === "processing" && (
                <div className="flex flex-col items-center justify-center text-emerald-400">
                  <h1 className="text-2xl font-bold">Your Data is on Processing...</h1>
                  <Lottie
                  animationData={Processing}
                  loop={true}
                  className="w-48 h-48"
                />
                </div>
            )}

            {/* REJECTED */}
            {status === "rejected" && (
              <div className="text-center py-10 text-red-400">
                <MdCancel className="text-6xl mb-4" />
                <p>{rejectionReason}</p>
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-10 w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700"
            >
              Close & Exit
            </button>
          </div>
        </div>

        {/* CAMERA OVERLAY */}
        {cameraOpen && (
          <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-72 h-96 rounded-xl object-cover rotate-y-180"
            />
            <canvas ref={canvasRef} className="hidden" />
            <button
              onClick={capturePhoto}
              className="mt-6 px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold"
            >
              Capture Photo
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AgentVerificationModal;
