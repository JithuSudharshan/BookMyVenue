import React, { useState } from 'react';
import Cropper from 'react-easy-crop';

function CropModal({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleSave = () => {
    if (croppedAreaPixels) onCropComplete(croppedAreaPixels);
  };

  return (
    <div className="pf-crop-backdrop">
      <div className="pf-crop-modal">
        <div className="pf-crop-header">
          <h3 className="pf-crop-title">Crop Profile Photo</h3>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#717171', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="pf-crop-area">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
          />
        </div>

        {/* Zoom slider */}
        <div style={{ padding: '14px 22px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#717171', fontWeight: 600, minWidth: 36 }}>Zoom</span>
          <input
            type="range"
            min={1} max={3} step={0.1}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#ff385c' }}
          />
        </div>

        <div className="pf-crop-footer">
          <button type="button" className="pf-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="pf-edit-primary" onClick={handleSave}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Save & Upload
          </button>
        </div>
      </div>
    </div>
  );
}

export default CropModal;
