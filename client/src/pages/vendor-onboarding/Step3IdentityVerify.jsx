import React from 'react';
import { Loader2, UploadCloud, CheckCircle } from 'lucide-react';
import { useStep3Form } from '../../hooks/vendor-onboarding/useStep3Form';

const Step3IdentityVerify = ({ onBack, onSubmit, submitting }) => {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    loading,
    selectedDocType,
    setValue,
    previewName,
    handleFileChange,
  } = useStep3Form(onSubmit);

  const documentTypes = [
    { id: 'aadhar', label: 'Aadhar Card' },
    { id: 'pan', label: 'PAN Card' },
    { id: 'driving_license', label: 'Driving License' },
    { id: 'passport', label: 'Passport' },
    { id: 'voter_id', label: 'Voter ID' },
  ];

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="font-headline-sm mb-1">Identity Verification</h2>
          <p className="text-on-surface-variant font-body-sm">Verify your identity to unlock vendor features.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-label-md text-on-surface">Document Type *</label>
            <div className="flex flex-wrap gap-2">
              {documentTypes.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setValue('documentType', doc.id, { shouldValidate: true })}
                  className={`px-4 py-2 rounded-full cursor-pointer text-sm font-label-md transition-all ${
                    selectedDocType === doc.id 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  {doc.label}
                </div>
              ))}
            </div>
            {errors.documentType && <p className="text-error text-xs mt-1">{errors.documentType.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-label-md text-on-surface">
              {documentTypes.find(d => d.id === selectedDocType)?.label} Number *
            </label>
            <input
              type="text"
              {...register('documentNumber')}
              className={`w-full px-4 py-2 rounded-xl border bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition uppercase ${errors.documentNumber ? 'border-error' : 'border-outline-variant'}`}
              placeholder="Enter document number"
            />
            {errors.documentNumber && <p className="text-error text-xs mt-1">{errors.documentNumber.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-label-md text-on-surface">Upload Identity Document *</label>
            <div className="mt-2 w-full border-2 border-dashed border-outline hover:border-primary transition-colors rounded-2xl bg-surface-container-lowest flex flex-col items-center justify-center p-8 relative group">
               <input 
                 type="file" 
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                 accept=".pdf,.jpg,.jpeg,.png"
                 onChange={handleFileChange}
               />
               
               {previewName ? (
                 <div className="flex flex-col items-center text-success">
                   <CheckCircle className="w-10 h-10 mb-2" />
                   <p className="font-label-md text-center max-w-xs truncate">{previewName}</p>
                   <p className="text-xs text-on-surface-variant mt-1">Click or drag to replace</p>
                 </div>
               ) : (
                 <div className="flex flex-col items-center text-on-surface-variant group-hover:text-primary transition-colors">
                   <UploadCloud className="w-10 h-10 mb-2" />
                   <p className="font-label-md">Drag & drop your file here</p>
                   <p className="text-xs mt-1">Supported: PDF, JPG, PNG (Max 10MB)</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-outline-variant flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting || isSubmitting}
          className="px-6 py-2 bg-surface border border-outline-variant text-on-surface rounded-xl font-label-lg hover:bg-surface-container-low transition shadow-sm disabled:opacity-70"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={submitting || isSubmitting}
          className="px-6 py-2 bg-primary text-white rounded-xl font-label-lg hover:bg-primary/90 transition shadow-sm disabled:opacity-70 flex items-center space-x-2"
        >
          {(submitting || isSubmitting) && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Submit Application</span>
        </button>
      </div>
    </form>
  );
};

export default Step3IdentityVerify;

