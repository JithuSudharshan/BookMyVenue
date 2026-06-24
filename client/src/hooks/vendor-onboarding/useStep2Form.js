import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState, useEffect } from 'react';
import { vendorApi } from '../../api/vendor-api/vendorApi';
import { toast } from 'sonner';

const schema = yup.object().shape({
  address: yup.object().shape({
    line1: yup.string().required('Address Line 1 is required'),
    line2: yup.string().optional(),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    country: yup.string().required('Country is required'),
    pincode: yup.string().matches(/^[0-9]+$/, 'Pincode must be numbers').required('Pincode is required'),
  }),
  roleInBusiness: yup.string().required('Role in Business is required'),
});

export const useStep2Form = (onNext) => {
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
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
      },
      roleInBusiness: '',
    },
  });

  const selectedRole = watch('roleInBusiness');

  useEffect(() => {
    fetchExistingData();
  }, []);

  const fetchExistingData = async () => {
    try {
      const profile = await vendorApi.getProfile();
      if (profile) {
        reset({
          address: {
            line1: profile.address?.line1 || '',
            line2: profile.address?.line2 || '',
            city: profile.address?.city || '',
            state: profile.address?.state || '',
            country: profile.address?.country || 'India',
            pincode: profile.address?.pincode || '',
          },
          roleInBusiness: profile.roleInBusiness || '',
        });
      }
    } catch (err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (roleId) => {
    setValue('roleInBusiness', roleId, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      await vendorApi.saveStep2(data);
      toast.success('Address and role saved');
      onNext();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save details');
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
    loading,
    selectedRole,
    handleRoleSelect,
  };
};
