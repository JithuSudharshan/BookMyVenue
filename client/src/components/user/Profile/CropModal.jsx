import React, { useState } from 'react';
import Cropper from 'react-easy-crop';

function CropModal({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSave = () => {
    if (croppedAreaPixels) {
      onCropComplete(croppedAreaPixels);
    }
  };

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-container">
        <header className="crop-modal-header">
          <h3 className="headline-sm">Crop Profile Photo</h3>
        </header>
        
        <div className="crop-modal-body">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="crop-modal-controls">
          <div className="slider-group">
            <label htmlFor="zoom-slider">Zoom</label>
            <input
              type="range"
              id="zoom-slider"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="zoom-slider"
            />
          </div>

          <div className="crop-modal-actions">
            <button type="button" onClick={onCancel} className="crop-btn-cancel body-md">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="crop-btn-save body-md">
              Save & Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CropModal;
