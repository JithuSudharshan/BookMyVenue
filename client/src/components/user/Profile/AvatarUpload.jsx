import React, { useState, useRef } from 'react';
import CropModal from './CropModal';
import { getCroppedImg } from '../../../utils/cropImage';
import { toast } from 'sonner';

function AvatarUpload({
  profileImage,
  firstName,
  lastName,
  businessName,
  onUploadSuccess,

  uploadApiFn,
  deleteApiFn,
}) {
  const [isHovered, setIsHovered]             = useState(false);
  const [isDragOver, setIsDragOver]           = useState(false);
  const [uploadProgress, setUploadProgress]   = useState(null);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const [selectedFile, setSelectedFile]       = useState(null);
  const [isCropping, setIsCropping]           = useState(false);
  const fileInputRef = useRef(null);

  const getInitials = () => {
    if (businessName) {
      const words = businessName.trim().split(/\s+/);
      return words.length > 1
        ? `${words[0][0]}${words[1][0]}`.toUpperCase()
        : businessName.slice(0, 2).toUpperCase();
    }
    const f = firstName ? firstName[0].toUpperCase() : '';
    const l = lastName  ? lastName[0].toUpperCase()  : '';
    return `${f}${l}` || '?';
  };

  const handleAvatarClick = () => {
    if (uploadProgress !== null) return;
    fileInputRef.current.click();
  };

  const processFileSelection = (file) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PNG, JPG, JPEG, and WEBP formats are supported.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image file size must be less than 2MB.');
      return;
    }
    setSelectedFile(file);
    setSelectedImageSrc(URL.createObjectURL(file));
    setIsCropping(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFileSelection(file);
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    if (selectedImageSrc) URL.revokeObjectURL(selectedImageSrc);
    setSelectedImageSrc(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropComplete = async (pixelCrop) => {
    setIsCropping(false);
    try {
      const croppedFile = await getCroppedImg(
        selectedImageSrc,
        pixelCrop,
        selectedFile?.name || 'cropped-avatar.png'
      );
      if (selectedImageSrc) URL.revokeObjectURL(selectedImageSrc);
      setSelectedImageSrc(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await performImageUpload(croppedFile);
    } catch (err) {
      toast.error(err.message || 'Failed to crop image.');
    }
  };

  const performImageUpload = async (file) => {
    try {
      setUploadProgress(10);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null || prev >= 90) { clearInterval(interval); return prev; }
          return prev + 15;
        });
      }, 80);

      const result = await uploadApiFn(file);
      clearInterval(interval);
      setUploadProgress(100);

      setTimeout(() => {
        setUploadProgress(null);
        onUploadSuccess(result.data?.profileImage || result.profileImage);
        toast.success('Profile picture updated!');
      }, 200);
    } catch (err) {
      setUploadProgress(null);
      toast.error(err.message || 'Failed to upload image.');
    }
  };

  const handleRemoveAvatar = async () => {
    if (uploadProgress !== null || !deleteApiFn) return;
    try {
      setUploadProgress(20);
      await deleteApiFn();
      setUploadProgress(null);
      onUploadSuccess('');
      toast.success('Profile picture removed.');
    } catch (err) {
      setUploadProgress(null);
      toast.error(err.message || 'Failed to remove profile picture.');
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); if (uploadProgress === null) setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (uploadProgress !== null) return;
    const file = e.dataTransfer.files[0];
    if (file) processFileSelection(file);
  };

  const showOverlay = (isHovered || isDragOver) && uploadProgress === null;

  return (
    <>
      {/* Avatar circle */}
      <div
        className={`pf-avatar-ring${isDragOver ? ' drag-active' : ''}`}
        onClick={handleAvatarClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        aria-label="Upload profile picture"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') handleAvatarClick(); }}
        style={{ outline: 'none' }}
      >
        {profileImage && profileImage !== 'default.jpg' ? (
          <img src={profileImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span className="pf-avatar-initials-lg">{getInitials()}</span>
        )}

        {/* Hover overlay */}
        {showOverlay && (
          <div className="pf-avatar-overlay">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span className="pf-avatar-overlay-text">{isDragOver ? 'Drop' : 'Change'}</span>
          </div>
        )}

        {/* Upload progress overlay */}
        {uploadProgress !== null && (
          <div className="pf-avatar-upload-progress">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div className="pf-avatar-spinner" />
              <span style={{ fontSize: 11, fontWeight: 700 }}>{uploadProgress}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Camera badge */}
      <div className="pf-avatar-badge">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        style={{ display: 'none' }}
      />

      {/* Action buttons below hero avatar */}
      <div className="pf-hero-actions">
        <button
          type="button"
          className="pf-photo-action-btn"
          onClick={handleAvatarClick}
          disabled={uploadProgress !== null}
        >
          Change Photo
        </button>
        {profileImage && profileImage !== 'default.jpg' && deleteApiFn && (
          <button
            type="button"
            className="pf-photo-action-btn remove"
            onClick={handleRemoveAvatar}
            disabled={uploadProgress !== null}
          >
            Remove
          </button>
        )}
      </div>

      {/* Crop modal */}
      {isCropping && (
        <CropModal
          imageSrc={selectedImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}

export default AvatarUpload;
