import React, { useState, useRef } from 'react';
import CropModal from './CropModal';
import { getCroppedImg } from '../../../utils/cropImage';

function AvatarUpload({
  profileImage,
  firstName,
  lastName,
  businessName,
  onUploadSuccess,
  onToast,
  uploadApiFn,
  deleteApiFn,
  instructions = 'Drag and drop or click to change. Max size 2MB (PNG, JPG, WEBP).'
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const fileInputRef = useRef(null);

  const getInitials = () => {
    if (businessName) {
      const words = businessName.trim().split(/\s+/);
      if (words.length > 1) {
        return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
      }
      return businessName.slice(0, 2).toUpperCase();
    }
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${first}${last}` || '?';
  };

  const handleAvatarClick = () => {
    if (uploadProgress !== null) return;
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFileSelection(file);
    }
  };

  const processFileSelection = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      onToast('Only PNG, JPG, JPEG, and WEBP formats are supported.', 'error');
      return;
    }

    const maxBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxBytes) {
      onToast('Image file size must be less than 2MB.', 'error');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setSelectedImageSrc(objectUrl);
    setIsCropping(true);
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    if (selectedImageSrc) {
      URL.revokeObjectURL(selectedImageSrc);
    }
    setSelectedImageSrc(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (pixelCrop) => {
    setIsCropping(false);
    try {
      const croppedFile = await getCroppedImg(
        selectedImageSrc,
        pixelCrop,
        selectedFile?.name || 'cropped-avatar.png'
      );

      if (selectedImageSrc) {
        URL.revokeObjectURL(selectedImageSrc);
      }
      setSelectedImageSrc(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      await performImageUpload(croppedFile);
    } catch (err) {
      onToast(err.message || 'Failed to crop image.', 'error');
    }
  };

  const performImageUpload = async (file) => {
    try {
      setUploadProgress(10);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null) {
            clearInterval(progressInterval);
            return null;
          }
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 15;
        });
      }, 80);

      const result = await uploadApiFn(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setUploadProgress(null);
        const newImgUrl = result.data?.profileImage || result.profileImage;
        onUploadSuccess(newImgUrl);
        onToast('Profile picture updated successfully!', 'success');
      }, 200);

    } catch (err) {
      setUploadProgress(null);
      onToast(err.message || 'Failed to upload image.', 'error');
    }
  };

  const handleRemoveAvatar = async () => {
    if (uploadProgress !== null || !deleteApiFn) return;
    try {
      setUploadProgress(20);
      await deleteApiFn();
      setUploadProgress(null);
      onUploadSuccess('');
      onToast('Profile picture removed successfully!', 'success');
    } catch (err) {
      setUploadProgress(null);
      onToast(err.message || 'Failed to remove profile picture.', 'error');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (uploadProgress !== null) return;
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (uploadProgress !== null) return;
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFileSelection(file);
    }
  };

  return (
    <div className="avatar-upload-wrapper">
      <div 
        className={`avatar-circle-container ${isDragOver ? 'drag-active' : ''}`}
        onClick={handleAvatarClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        aria-label="Upload profile picture"
        tabIndex="0"
        onKeyDown={(e) => { if (e.key === 'Enter') handleAvatarClick(); }}
      >
        {profileImage ? (
          <img src={profileImage} alt={businessName || `${firstName} ${lastName}`} className="avatar-image" />
        ) : (
          <div className="avatar-initials">
            {getInitials()}
          </div>
        )}

        {(isHovered || isDragOver) && uploadProgress === null && (
          <div className="avatar-hover-overlay">
            <svg className="camera-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="overlay-text">{isDragOver ? 'Drop Image' : 'Change Photo'}</span>
          </div>
        )}

        {uploadProgress !== null && (
          <div className="avatar-loading-overlay">
            <div className="progress-ring-container">
              <div className="spinner"></div>
              <span className="progress-percent">{uploadProgress}%</span>
            </div>
          </div>
        )}
      </div>

      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        style={{ display: 'none' }}
      />
      
      <div className="avatar-actions-row">
        <button 
          type="button" 
          className="change-photo-btn body-sm"
          onClick={handleAvatarClick}
          disabled={uploadProgress !== null}
        >
          Change Photo
        </button>
        {profileImage && deleteApiFn && (
          <button 
            type="button" 
            className="remove-photo-btn body-sm"
            onClick={handleRemoveAvatar}
            disabled={uploadProgress !== null}
          >
            Remove Photo
          </button>
        )}
      </div>

      <p className="avatar-instructions body-sm" style={{ marginTop: '12px' }}>
        {instructions}
      </p>

      {isCropping && (
        <CropModal
          imageSrc={selectedImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}

export default AvatarUpload;
