import React, { useState } from 'react';
import { vendorApi } from '../../../api/vendor-api/vendorApi';
import { toast } from 'sonner';

export const VendorPersonalEdit = ({ profile, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: profile.fullName || '',
    phone: profile.phone || '',
    alternatePhone: profile.alternatePhone || '',
    gender: profile.gender || '',
    dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create a clean payload (removing empty optional fields)
      const payload = {
        personalInfo: {
          fullName: formData.fullName,
          phone: formData.phone,
        }
      };
      if (formData.alternatePhone) payload.personalInfo.alternatePhone = formData.alternatePhone;
      if (formData.gender) payload.personalInfo.gender = formData.gender;
      if (formData.dateOfBirth) payload.personalInfo.dateOfBirth = formData.dateOfBirth;

      await vendorApi.updateProfile(payload);
      toast.success('Personal information updated successfully');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update personal info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-on-surface-variant/80 mb-1">Full Name</label>
        <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest" />
      </div>
      <div>
        <label className="block text-sm font-medium text-on-surface-variant/80 mb-1">Phone Number</label>
        <input required type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest" />
      </div>
      <div>
        <label className="block text-sm font-medium text-on-surface-variant/80 mb-1">Alternate Phone</label>
        <input type="text" name="alternatePhone" value={formData.alternatePhone} onChange={handleChange} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest" />
      </div>
      <div>
        <label className="block text-sm font-medium text-on-surface-variant/80 mb-1">Date of Birth</label>
        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest" />
      </div>
      <div>
        <label className="block text-sm font-medium text-on-surface-variant/80 mb-1">Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest">
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </div>
      <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/30">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant bg-surface-variant/50 hover:bg-surface-variant/80 transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export const VendorBusinessEdit = ({ profile, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    line1: profile.address?.line1 || '',
    line2: profile.address?.line2 || '',
    city: profile.address?.city || '',
    state: profile.address?.state || '',
    pincode: profile.address?.pincode || '',
    country: profile.address?.country || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { address: { ...formData } };
      if (!payload.address.line2) delete payload.address.line2;

      await vendorApi.updateProfile(payload);
      toast.success('Business address updated successfully');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update business details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-on-surface-variant/80 mb-1">Address Line 1</label>
        <input required type="text" name="line1" value={formData.line1} onChange={handleChange} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-on-surface-variant/80 mb-1">Address Line 2 (Optional)</label>
        <input type="text" name="line2" value={formData.line2} onChange={handleChange} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest" />
      </div>
      <div>
        <label className="block text-sm font-medium text-on-surface-variant/80 mb-1">City</label>
        <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest" />
      </div>
      <div>
        <label className="block text-sm font-medium text-on-surface-variant/80 mb-1">State / Province</label>
        <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest" />
      </div>
      <div>
        <label className="block text-sm font-medium text-on-surface-variant/80 mb-1">Country</label>
        <input required type="text" name="country" value={formData.country} onChange={handleChange} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest" />
      </div>
      <div>
        <label className="block text-sm font-medium text-on-surface-variant/80 mb-1">Postal Code</label>
        <input required type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest" />
      </div>
      <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/30">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant bg-surface-variant/50 hover:bg-surface-variant/80 transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export const VendorIdentityEdit = ({ profile, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    roleInBusiness: profile.roleInBusiness || '',
    documentType: profile.identity?.documentType || '',
    documentNumber: profile.identity?.documentNumber || '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('roleInBusiness', formData.roleInBusiness);
      data.append('documentType', formData.documentType);
      data.append('documentNumber', formData.documentNumber);
      if (file) {
        data.append('identityDocument', file);
      }

      await vendorApi.updateIdentity(data);
      toast.success('Identity verification updated successfully');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update identity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-on-surface-variant/80 mb-1">Role in Business</label>
        <select required name="roleInBusiness" value={formData.roleInBusiness} onChange={handleChange} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest">
          <option value="">Select Role</option>
          <option value="owner">Owner</option>
          <option value="co-owner">Co-Owner</option>
          <option value="partner">Partner</option>
          <option value="manager">Manager</option>
          <option value="authorized_representative">Authorized Representative</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-on-surface-variant/80 mb-1">Document Type</label>
        <select required name="documentType" value={formData.documentType} onChange={handleChange} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest">
          <option value="">Select Document</option>
          <option value="aadhar">Aadhar Card</option>
          <option value="pan">PAN Card</option>
          <option value="driving_license">Driving License</option>
          <option value="passport">Passport</option>
          <option value="voter_id">Voter ID</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-on-surface-variant/80 mb-1">Document Number</label>
        <input required type="text" name="documentNumber" value={formData.documentNumber} onChange={handleChange} className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-on-surface-variant/80 mb-1">Upload New Document (Optional)</label>
        <input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" />
        <p className="text-xs text-on-surface-variant mt-1">Leave empty to keep your existing document.</p>
      </div>
      
      <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/30">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant bg-surface-variant/50 hover:bg-surface-variant/80 transition-colors">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};
