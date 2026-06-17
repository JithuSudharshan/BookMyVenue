import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import StepIndicator from '../../components/vendor/form/StepIndicator'
import ImageUploader from '../../components/vendor/form/ImageUploader'

const AddVenue = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const navigate = useNavigate()

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1)
    else {
      // Submit logic
      navigate('/vendor/venues')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center py-10 px-4">
      
      {/* Top Header */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-12">
        <button 
          onClick={() => navigate('/vendor/venues')}
          className="flex items-center text-gray-500 hover:text-dark font-medium transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Cancel
        </button>
        <div className="text-primary font-extrabold text-xl tracking-tight">
          BookMyVenue
        </div>
        <div className="w-20"></div> {/* Spacer to center logo */}
      </div>

      {/* Main Content */}
      <div className="w-full max-w-3xl flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-dark mb-10 w-full text-center">Add New Venue</h1>
        
        <StepIndicator currentStep={currentStep} />

        {/* Form Container */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 mb-8">
          
          {/* STEP 0: Basic Details */}
          {currentStep === 0 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-dark mb-2">Basic Details</h2>
              <p className="text-gray-500 text-sm mb-8">Provide the foundational information about your space to help guests find exactly what they are looking for.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-dark mb-2">Venue Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., The Glasshouse Loft"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-2">Use a clear, descriptive name that highlights your space's unique appeal.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-dark mb-2">Category</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm text-gray-600 bg-white">
                    <option>Select a primary category</option>
                    <option>Banquet Hall</option>
                    <option>Outdoor/Barn</option>
                    <option>Meeting Room</option>
                    <option>Studio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-dark mb-2">Description</label>
                  <textarea 
                    rows={4}
                    placeholder="Describe the vibe, the history, and the primary uses for your space..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm placeholder-gray-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-dark mb-2">Media Upload</label>
                  <p className="text-xs text-gray-500 mb-4">High-quality photos increase booking chances by up to 40%. Include at least 5 images.</p>
                  <ImageUploader />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Location */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-dark mb-2">Location</h2>
              <p className="text-gray-500 text-sm mb-8">Where is your venue located?</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-dark mb-2">Address</label>
                  <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary text-sm" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Pricing */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-dark mb-2">Pricing</h2>
              <p className="text-gray-500 text-sm mb-8">Set your rates and fees.</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-dark mb-2">Base Price (Per Day)</label>
                  <input type="number" placeholder="$" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary text-sm" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-dark mb-2">Review & Submit</h2>
              <p className="text-gray-500 text-sm mb-8">Review your venue details before submitting for approval.</p>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-sm text-gray-600">Everything looks good! Your venue will be submitted to the admin team for approval.</p>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Actions */}
        <div className="w-full flex items-center justify-between">
          <div>
            {currentStep > 0 ? (
              <button 
                onClick={handleBack}
                className="text-gray-500 hover:text-dark font-bold text-sm transition-colors"
              >
                Back
              </button>
            ) : (
              <button className="text-gray-500 hover:text-dark font-bold text-sm transition-colors">
                Save as Draft
              </button>
            )}
          </div>
          
          <button 
            onClick={handleNext}
            className="bg-primary hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            {currentStep === 3 ? 'Submit for Approval' : 'Next Step →'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default AddVenue
