import React, { useState } from 'react'
import { FiUploadCloud, FiX } from 'react-icons/fi'

const MOCK_IMAGE = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2070&auto=format&fit=crop'

const ImageUploader = () => {
  const [images, setImages] = useState([])

  const handleUploadClick = () => {
    // Mocking an upload
    if (images.length < 5) {
      setImages([...images, MOCK_IMAGE])
    }
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <div className="w-full">
      <div 
        onClick={handleUploadClick}
        className="w-full border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-primary transition-all group"
      >
        <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <FiUploadCloud className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-bold text-dark mb-1">Drag and drop your images/videos here</p>
        <p className="text-xs text-gray-500">or click to browse files (JPEG, PNG, MP4)</p>
      </div>

      {images.length > 0 && (
        <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden shadow-sm group">
              <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
              <button 
                onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageUploader
