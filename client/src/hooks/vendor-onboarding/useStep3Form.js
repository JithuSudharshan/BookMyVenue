import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState, useEffect } from 'react';
import { vendorApi } from '../../api/vendor-api/vendorApi';
import { toast } from 'sonner';

const schema = yup.object().shape({
  documentType: yup.string().required('Document Type is required'),
  documentNumber: yup.string().required('Document Number is required'),
});

export const useStep3Form = (onSubmitSuccess) => {
  const [documentFile, setDocumentFile] = useState(null);
  const [previewName, setPreviewName] = useState('');
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      documentType: 'aadhar',
      documentNumber: '',
    },
  });

  const selectedDocType = watch('documentType');

  useEffect(() => {
    fetchExistingData();
  }, []);

  const fetchExistingData = async () => {
    try {
      const profile = await vendorApi.getProfile();
      if (profile && profile.identity) {
        reset({
          documentType: profile.identity.documentType || 'aadhar',
          documentNumber: profile.identity.documentNumber || '',
        });
        if (profile.identity.documentUrl) {
          setPreviewName('Previously uploaded document exists');
        }
      }
    } catch (err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File must be less than 10MB');
        return;
      }
      setDocumentFile(file);
      setPreviewName(file.name);
    }
  };

  const onSubmit = async (data) => {
    if (!documentFile && previewName === '') {
      toast.error('Please upload your identity document');
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('documentType', data.documentType);
      submitData.append('documentNumber', data.documentNumber);
      if (documentFile) {
        submitData.append('identityDocument', documentFile);
      }

      await vendorApi.saveStep3(submitData);
      onSubmitSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save identity document');
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
    loading,
    selectedDocType,
    setValue,
    previewName,
    handleFileChange,
  };
};
