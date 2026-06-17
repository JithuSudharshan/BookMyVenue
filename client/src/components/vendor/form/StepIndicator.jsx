import React from 'react'

const steps = [
  'Basic Details',
  'Location',
  'Pricing',
  'Review'
]

const StepIndicator = ({ currentStep }) => {
  return (
    <div className="flex items-center space-x-2 mb-10 w-full max-w-3xl mx-auto">
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep

        return (
          <React.Fragment key={step}>
            <div className="flex-1 flex flex-col items-start relative">
              <div 
                className={`w-full h-1.5 rounded-full mb-3 transition-colors ${
                  isActive || isCompleted ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
              <span className={`text-[10px] md:text-xs font-bold transition-colors ${
                isActive ? 'text-primary' : isCompleted ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {step}
              </span>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default StepIndicator
