import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState, useEffect } from 'react';
import { vendorApi } from '../../api/vendor-api/vendorApi';
import { toast } from 'sonner';

const schema = yup.object().shape({
  fullName: yup.string().required('Full Name is required'),
  phone: yup.string().matches(/^[0-9+ ]+$/, 'Phone number must contain only numbers and + symbol').required('Primary Phone is required'),
  alternatePhone: yup.string()
    .matches(/^[0-9+ ]+$/, 'Phone number must contain only numbers and + symbol')
    .notOneOf([yup.ref('phone'), null], 'Alternate number must be different from primary number')
    .required('Alternate Phone is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  dateOfBirth: yup.date().typeError('Please enter a valid date').required('Date of Birth is required'),
  gender: yup.string().required('Gender is required'),
});

export const useStep1Form = (user, onNext) => {
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: '',
      phone: '',
      alternatePhone: '',
      email: user?.email || '',
      dateOfBirth: null,
      gender: '',
    },
  });

  useEffect(() => {
    fetchExistingData();
  }, [user]);

  const fetchExistingData = async () => {
    try {
      const profile = await vendorApi.getProfile();
      if (profile) {
        reset({
          fullName: profile.fullName || (profile.firstName + ' ' + (profile.lastName || '')).trim() || '',
          phone: profile.phone || '',
          alternatePhone: profile.alternatePhone || '',
          email: profile.email || user?.email || '',
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
          gender: profile.gender || '',
        });
        if (profile.profileImage && profile.profileImage !== 'default.jpg') {
          setPreviewImage(profile.profileImage);
        }
      }
    } catch (err) {
      reset({ email: user?.email || '' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    try {
      const submitData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key]) submitData.append(key, data[key]);
      });
      if (profileImage) {
        submitData.append('profileImage', profileImage);
      }

      await vendorApi.saveStep1(submitData);
      toast.success('Personal info saved');
      onNext();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save personal info');
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
    loading,
    previewImage,
    handleImageChange,
  };
};
