import React from 'react'
import { FiCheck } from 'react-icons/fi'

const steps = [
  { label: 'Basic Information',     short: 'Step 1' },
  { label: 'Location & Media',      short: 'Step 2' },
  { label: 'Booking Configuration', short: 'Step 3' },
  { label: 'Pricing & Review',      short: 'Step 4' },
]

const StepIndicator = ({ currentStep }) => {
  return (
    <div className="flex items-start w-full max-w-3xl mx-auto mb-10 gap-0">
      {steps.map((step, index) => {
        const isActive    = index === currentStep
        const isCompleted = index < currentStep
        const isLast      = index === steps.length - 1

        return (
          <div key={step.label} className="flex items-start flex-1">
            {/* Step block */}
            <div className="flex flex-col items-start flex-1 min-w-0">
              {/* Bar */}
              <div className={`w-full h-1.5 rounded-full mb-3 transition-all duration-300 ${
                isCompleted ? 'bg-primary'
                : isActive  ? 'bg-primary'
                : 'bg-gray-200'
              }`} />
              {/* Circle + Label row */}
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all duration-300 ${
                  isCompleted ? 'bg-primary text-white'
                  : isActive  ? 'bg-primary text-white ring-4 ring-red-100'
                  : 'bg-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? <FiCheck className="w-3 h-3" /> : index + 1}
                </div>
                <span className={`text-[11px] font-bold leading-tight hidden sm:block transition-colors ${
                  isActive    ? 'text-primary'
                  : isCompleted ? 'text-gray-600'
                  : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            </div>

            {/* Connector line between steps */}
            {!isLast && (
              <div className={`h-px w-4 mt-[2px] flex-shrink-0 self-start mt-[2.5px] mx-1 transition-colors ${
                isCompleted ? 'bg-primary' : 'bg-gray-200'
              }`} style={{ marginTop: '2px' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default StepIndicator
