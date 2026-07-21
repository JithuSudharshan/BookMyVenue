import React, { useRef } from 'react'
import { FiUploadCloud, FiX, FiImage } from 'react-icons/fi'

/**
 * ImageUploader — real file input with drag-and-drop UI and preview grid.
 * Props:
 *   images   : File[]            — array of File objects (state lives in parent)
 *   onChange : (files: File[]) => void  — called whenever images change
 */
const ImageUploader = ({ images = [], onChange }) => {
  const inputRef = useRef(null)

  const handleFiles = (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'))
    onChange([...images, ...valid].slice(0, 10)) // cap at 10 images
  }

  const handleInputChange = (e) => {
    handleFiles(e.target.files)
    // reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="w-full border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 hover:border-primary transition-all group"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
        <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <FiUploadCloud className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-bold text-dark mb-1">Drag & drop images here</p>
        <p className="text-xs text-gray-400">or <span className="text-primary font-semibold underline">browse files</span> · JPEG, PNG, WebP (max 10)</p>
        {images.length > 0 && (
          <span className="mt-3 text-xs text-gray-500 font-medium bg-white border border-gray-200 rounded-lg px-3 py-1">
            {images.length} image{images.length !== 1 ? 's' : ''} selected
          </span>
        )}
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="mt-5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((file, index) => {
            const url = typeof file === 'string' ? file : URL.createObjectURL(file)
            return (
              <div
                key={index}
                className="relative aspect-square rounded-xl overflow-hidden shadow-sm group border border-gray-100"
              >
                {index === 0 && (
                  <span className="absolute top-1.5 left-1.5 z-10 text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-md">
                    Cover
                  </span>
                )}
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(index) }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-white rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-50"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
          {/* Add more tile */}
          {images.length < 10 && (
            <div
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-red-50 transition-all"
            >
              <FiImage className="w-5 h-5 text-gray-400 mb-1" />
              <span className="text-[10px] text-gray-400 font-medium">Add more</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ImageUploader

