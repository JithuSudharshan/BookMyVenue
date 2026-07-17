import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FiArrowLeft, FiCheck, FiClock, FiCalendar,
  FiMapPin, FiUsers, FiTag, FiDollarSign, FiFileText,
  FiInfo
} from 'react-icons/fi'
import StepIndicator from '../../components/vendor/form/StepIndicator'
import ImageUploader from '../../components/vendor/form/ImageUploader'
import { toast } from 'sonner'
import { 
  getVendorVenueById, 
  createVenue, 
  saveDraft, 
  updateDraft, 
  updateVenue,
  submitVenue,
  getCategories
} from '../../api/vendor-api/vendorApi'

// ─── Constants ───────────────────────────────────────────────────────────────
const AMENITIES_LIST = [
  'WiFi', 'Parking', 'Air Conditioning', 'Catering',
  'A/V Equipment', 'Stage & Lighting', 'Outdoor Space',
  'Private Restrooms', 'Kitchen', 'PA System', 'Dance Floor',
  'Valet Parking', 'Bridal Suite', 'Generator Backup',
  'Photography Allowed', 'Security', 'First Aid', 'Pool',
]

const KERALA_CITIES = [
  'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur',
  'Kollam', 'Alappuzha', 'Palakkad', 'Malappuram',
  'Kottayam', 'Kannur', 'Kasaragod', 'Pathanamthitta',
  'Idukki', 'Wayanad', 'Ernakulam',
]

// ─── Initial Form State ───────────────────────────────────────────────────────
const INITIAL_FORM = {
  // Step 1
  name: '',
  description: '',
  category: '',
  subcategory: '',
  capacity: '',
  amenities: [],
  // Step 2
  address: '',
  city: '',
  state: 'Kerala',
  pincode: '',
  images: [],
  // Step 3
  bookingModel: 'daily',
  openingTime: '09:00',
  closingTime: '21:00',
  // Step 4
  price: '',
  rules: '',
}

// ─── Reusable field components ────────────────────────────────────────────────
const Field = ({ label, hint, error, children }) => (
  <div>
    <label className="block text-sm font-bold text-dark mb-1.5">{label}</label>
    {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
    {children}
    {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
  </div>
)

const inputCls = (err) =>
  `w-full border ${err ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-primary focus:ring-red-100'}
  rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all text-sm placeholder-gray-400 bg-white`

// ─── Step 1: Basic Information ────────────────────────────────────────────────
const Step1 = ({ form, setForm, errors, categoriesData }) => {
  const selectedCat = categoriesData?.find(c => (c._id || c.id) === form.category)
  const subcategories = selectedCat?.subcategories || []

  const toggleAmenity = (a) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a]
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-dark">Basic Information</h2>
        <p className="text-sm text-gray-400 mt-1">Tell guests about your space — what makes it special.</p>
      </div>
      <div className="w-full h-px bg-gray-100" />

      <Field label="Venue Name" error={errors.name}
        hint="Use a clear, descriptive name that highlights your space's unique appeal.">
        <input
          type="text"
          placeholder="e.g., The Grand Pavilion"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className={inputCls(errors.name)}
        />
      </Field>

      <Field label="Description" error={errors.description}
        hint="Describe the vibe, history, and primary uses of your space.">
        <textarea
          rows={4}
          placeholder="Describe your venue's atmosphere, features and what makes it perfect for events..."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className={`${inputCls(errors.description)} resize-none`}
        />
        <p className="text-right text-[11px] text-gray-400 mt-1">{form.description.length}/2000</p>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Category" error={errors.category}>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: '' }))}
            className={inputCls(errors.category)}
          >
            <option value="">Select a primary category</option>
            {categoriesData?.map(c => (
              <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Subcategory" error={errors.subcategory}>
          <select
            value={form.subcategory}
            onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
            disabled={!form.category}
            className={`${inputCls(errors.subcategory)} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">Select subcategory</option>
            {subcategories.map(s => (
              <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Maximum Capacity" error={errors.capacity}
        hint="How many guests can your venue accommodate?">
        <div className="relative">
          <FiUsers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="number"
            min="1"
            placeholder="e.g., 200"
            value={form.capacity}
            onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
            className={`${inputCls(errors.capacity)} pl-10`}
          />
        </div>
      </Field>

      <Field label="Amenities"
        hint="Select all amenities available at your venue.">
        <div className="flex flex-wrap gap-2 mt-1">
          {AMENITIES_LIST.map(a => {
            const selected = form.amenities.includes(a)
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selected
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                }`}
              >
                {selected && <FiCheck className="inline w-3 h-3 mr-1" />}
                {a}
              </button>
            )
          })}
        </div>
        {form.amenities.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">{form.amenities.length} ameniti{form.amenities.length !== 1 ? 'es' : 'y'} selected</p>
        )}
      </Field>
    </div>
  )
}

// ─── Step 2: Location & Media ─────────────────────────────────────────────────
const Step2 = ({ form, setForm, errors }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-extrabold text-dark">Location & Media</h2>
      <p className="text-sm text-gray-400 mt-1">Where is your venue located and how does it look?</p>
    </div>
    <div className="w-full h-px bg-gray-100" />

    <Field label="Address" error={errors.address}>
      <div className="relative">
        <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Building name, street, area..."
          value={form.address}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          className={`${inputCls(errors.address)} pl-10`}
        />
      </div>
    </Field>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Field label="City" error={errors.city}>
        <select
          value={form.city}
          onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
          className={inputCls(errors.city)}
        >
          <option value="">Select city</option>
          {KERALA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>

      <Field label="State" error={errors.state}>
        <input
          type="text"
          value={form.state}
          onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
          className={inputCls(errors.state)}
        />
      </Field>

      <Field label="Pincode" error={errors.pincode}>
        <input
          type="text"
          placeholder="e.g., 673001"
          maxLength={6}
          value={form.pincode}
          onChange={e => setForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, '') }))}
          className={inputCls(errors.pincode)}
        />
      </Field>
    </div>

    <Field label="Upload Images"
      hint="High-quality photos increase booking chances by up to 40%. Add at least 3 images.">
      <ImageUploader
        images={form.images}
        onChange={imgs => setForm(f => ({ ...f, images: imgs }))}
      />
      {errors.images && <p className="text-xs text-red-500 mt-1.5">{errors.images}</p>}
    </Field>
  </div>
)

// ─── Step 3: Booking Configuration ───────────────────────────────────────────
const Step3 = ({ form, setForm }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-extrabold text-dark">Booking Configuration</h2>
      <p className="text-sm text-gray-400 mt-1">Choose how customers book your venue.</p>
    </div>
    <div className="w-full h-px bg-gray-100" />

    <Field label="Booking Model"
      hint="Select how your venue is rented — by full day or by the hour.">
      <div className="flex gap-4 mt-1">
        {/* Daily option */}
        <button
          type="button"
          onClick={() => setForm(f => ({ ...f, bookingModel: 'daily' }))}
          className={`flex-1 flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
            form.bookingModel === 'daily'
              ? 'border-primary bg-red-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            form.bookingModel === 'daily' ? 'border-primary' : 'border-gray-300'
          }`}>
            {form.bookingModel === 'daily' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <FiCalendar className={`w-4 h-4 ${form.bookingModel === 'daily' ? 'text-primary' : 'text-gray-400'}`} />
              <p className={`font-bold text-sm ${form.bookingModel === 'daily' ? 'text-primary' : 'text-dark'}`}>Daily</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Guests book by the full day. Best for events, weddings, corporate days.</p>
          </div>
        </button>

        {/* Hourly option */}
        <button
          type="button"
          onClick={() => setForm(f => ({ ...f, bookingModel: 'hourly' }))}
          className={`flex-1 flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
            form.bookingModel === 'hourly'
              ? 'border-primary bg-red-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            form.bookingModel === 'hourly' ? 'border-primary' : 'border-gray-300'
          }`}>
            {form.bookingModel === 'hourly' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <FiClock className={`w-4 h-4 ${form.bookingModel === 'hourly' ? 'text-primary' : 'text-gray-400'}`} />
              <p className={`font-bold text-sm ${form.bookingModel === 'hourly' ? 'text-primary' : 'text-dark'}`}>Hourly</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Guests book by the hour. Best for meetings, shoots, small gatherings.</p>
          </div>
        </button>
      </div>
    </Field>

    {/* Info box */}
    <div className={`rounded-xl px-5 py-4 border flex items-start gap-3 transition-all ${
      form.bookingModel === 'daily'
        ? 'bg-green-50 border-green-200'
        : 'bg-blue-50 border-blue-200'
    }`}>
      <FiInfo className={`w-4 h-4 mt-0.5 flex-shrink-0 ${form.bookingModel === 'daily' ? 'text-green-600' : 'text-blue-600'}`} />
      <p className={`text-sm font-medium ${form.bookingModel === 'daily' ? 'text-green-700' : 'text-blue-700'}`}>
        {form.bookingModel === 'daily'
          ? 'This venue is configured for daily bookings. Guests can select full day dates.'
          : 'This venue is configured for hourly bookings. Set your operating hours below.'}
      </p>
    </div>

    {/* Hourly: show time pickers */}
    {form.bookingModel === 'hourly' && (
      <div className="grid grid-cols-2 gap-5 animate-fade-in">
        <Field label="Opening Time">
          <div className="relative">
            <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="time"
              value={form.openingTime}
              onChange={e => setForm(f => ({ ...f, openingTime: e.target.value }))}
              className={`${inputCls(false)} pl-10`}
            />
          </div>
        </Field>
        <Field label="Closing Time">
          <div className="relative">
            <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="time"
              value={form.closingTime}
              onChange={e => setForm(f => ({ ...f, closingTime: e.target.value }))}
              className={`${inputCls(false)} pl-10`}
            />
          </div>
        </Field>
      </div>
    )}
  </div>
)

// ─── Step 4: Pricing & Review ─────────────────────────────────────────────────
const ReviewRow = ({ label, value }) => (
  <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36 flex-shrink-0">{label}</span>
    <span className="text-sm text-dark font-medium text-right flex-1 break-words">{value || <span className="text-gray-300 italic">—</span>}</span>
  </div>
)

const Step4 = ({ form, setForm, errors, categoriesData }) => {
  const selectedCat = categoriesData?.find(c => (c._id || c.id) === form.category)
  const selectedSub = selectedCat?.subcategories?.find(s => (s._id || s.id) === form.subcategory)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-dark">Pricing & Review</h2>
        <p className="text-sm text-gray-400 mt-1">Set your price, add rules, and review everything before submitting.</p>
      </div>
      <div className="w-full h-px bg-gray-100" />

      <Field label="Price" error={errors.price}
        hint={`Price per ${form.bookingModel === 'daily' ? 'day / event' : 'hour'} in INR`}>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
          <input
            type="number"
            min="0"
            placeholder="e.g., 25000"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            className={`${inputCls(errors.price)} pl-8`}
          />
        </div>
      </Field>

      <Field label="Rules & Policies"
        hint="Add cancellation policy, house rules, restrictions, etc.">
        <textarea
          rows={4}
          placeholder="e.g., 50% refund if cancelled 7+ days before event. No outside food allowed. No smoking on premises..."
          value={form.rules}
          onChange={e => setForm(f => ({ ...f, rules: e.target.value }))}
          className={`${inputCls(false)} resize-none`}
        />
      </Field>

      {/* Review Summary */}
      <div>
        <h3 className="text-base font-extrabold text-dark mb-3 flex items-center gap-2">
          <FiFileText className="w-4 h-4 text-gray-400" />
          Review Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Basic Info card */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Basic Information</p>
            <ReviewRow label="Venue Name"   value={form.name} />
            <ReviewRow label="Category"     value={selectedCat?.name || form.category} />
            <ReviewRow label="Subcategory"  value={selectedSub?.name || form.subcategory} />
            <ReviewRow label="Capacity"     value={form.capacity ? `Up to ${form.capacity} guests` : null} />
            <ReviewRow label="Amenities"    value={form.amenities.length > 0 ? form.amenities.join(', ') : null} />
          </div>

          {/* Location card */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Location & Media</p>
            <ReviewRow label="Address"  value={form.address} />
            <ReviewRow label="City"     value={form.city} />
            <ReviewRow label="State"    value={form.state} />
            <ReviewRow label="Pincode"  value={form.pincode} />
            <ReviewRow label="Images"   value={form.images.length > 0 ? `${form.images.length} image${form.images.length !== 1 ? 's' : ''} uploaded` : null} />
          </div>

          {/* Booking card */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Booking Configuration</p>
            <ReviewRow label="Booking Model" value={form.bookingModel === 'daily' ? '📅 Daily' : '⏱ Hourly'} />
            {form.bookingModel === 'hourly' && (
              <>
                <ReviewRow label="Opening Time" value={form.openingTime} />
                <ReviewRow label="Closing Time" value={form.closingTime} />
              </>
            )}
          </div>

          {/* Pricing card */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Pricing & Rules</p>
            <ReviewRow label="Price" value={form.price ? `₹${Number(form.price).toLocaleString('en-IN')} / ${form.bookingModel === 'daily' ? 'Event' : 'Hour'}` : null} />
            <ReviewRow label="Currency" value="INR (Indian Rupee)" />
            <ReviewRow label="Rules" value={form.rules ? `${form.rules.slice(0, 80)}${form.rules.length > 80 ? '...' : ''}` : null} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Validation ───────────────────────────────────────────────────────────────
const validate = (step, form) => {
  const errs = {}
  if (step === 0) {
    const name = form.name.trim();
    if (!name) {
      errs.name = 'Venue name is required';
    } else if (name.length < 3 || name.length > 200) {
      errs.name = 'Venue name must be between 3 and 200 characters';
    } else if (!/^[a-zA-Z0-9\s-&']+$/.test(name)) {
      errs.name = 'Venue name can only contain letters, numbers, spaces, hyphens, ampersands, and apostrophes';
    }

    if (!form.description.trim()) {
      errs.description = 'Description is required';
    } else if (form.description.length > 2000) {
      errs.description = 'Description cannot exceed 2000 characters';
    }

    if (!form.category)           errs.category    = 'Please select a category';
    if (!form.subcategory)        errs.subcategory = 'Please select a subcategory';
    
    if (!form.capacity) {
      errs.capacity = 'Capacity is required';
    } else if (Number(form.capacity) < 1) {
      errs.capacity = 'Capacity must be at least 1';
    }
  }
  if (step === 1) {
    if (!form.address.trim())     errs.address  = 'Address is required';
    if (!form.city)               errs.city     = 'City is required';
    if (!form.state.trim())       errs.state    = 'State is required';
    if (!form.pincode.trim() || form.pincode.length !== 6) {
      errs.pincode  = 'Valid 6-digit pincode required';
    }
    if (form.images.length < 3)   errs.images   = 'Please upload at least 3 images';
  }
  if (step === 3) {
    if (!form.price || Number(form.price) < 0) {
      errs.price = 'Please enter a valid price (0 or higher)';
    }
  }
  return errs
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AddVenue = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  
  const [currentStep, setCurrentStep] = useState(0)
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [pageLoading, setPageLoading] = useState(true) // Start true to fetch categories
  const [categoriesData, setCategoriesData] = useState([])

  useEffect(() => {
    const init = async () => {
      try {
        const catData = await getCategories()
        setCategoriesData(catData || [])
        if (isEditMode) {
          await loadVenueDetails()
        }
      } catch (err) {
        console.error('Failed to initialize:', err)
      } finally {
        setPageLoading(false)
      }
    }
    init()
  }, [isEditMode, id])

  const loadVenueDetails = async () => {
    try {
      const data = await getVendorVenueById(id)
      
      const catId = data.categoryId || (typeof data.category === 'object' ? (data.category?._id || data.category?.id) : data.category)
      const subcatId = data.subcategoryId || (typeof data.subcategory === 'object' ? (data.subcategory?._id || data.subcategory?.id) : data.subcategory)
      const mappedImages = (data.images || []).map(img => img.url || img)
      
      setForm({
        name: data.name || '',
        description: data.description || '',
        category: catId || '',
        subcategory: subcatId || '',
        capacity: data.capacity || '',
        amenities: data.amenities || [],
        address: data.location?.address || '',
        city: data.location?.city || '',
        state: data.location?.state || 'Kerala',
        pincode: data.location?.pincode || '',
        images: mappedImages,
        bookingModel: data.bookingModel || 'daily',
        openingTime: data.bookingConfig?.openingTime || data.operatingHours?.start || '09:00',
        closingTime: data.bookingConfig?.closingTime || data.operatingHours?.end || '21:00',
        price: data.price || '',
        rules: (Array.isArray(data.rules) ? data.rules.join('\n') : data.rules) || '',
      })
    } catch (err) {
      console.error('Failed to load venue details:', err)
    }
  }

  const handleNext = () => {
    const errs = validate(currentStep, form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      const el = document.querySelector('[data-error]')
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setErrors({})
    setCurrentStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setErrors({})
    setCurrentStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const buildPayload = () => {
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('description', form.description)
    formData.append('categoryId', form.category)
    formData.append('subcategoryId', form.subcategory)
    formData.append('capacity', Number(form.capacity))
    formData.append('bookingModel', form.bookingModel)
    formData.append('price', Number(form.price))
    formData.append('rules', form.rules)
    
    formData.append('amenities', JSON.stringify(form.amenities))
    formData.append('location', JSON.stringify({
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode
    }))
    
    if (form.bookingModel === 'hourly') {
      formData.append('operatingHours', JSON.stringify({
        start: form.openingTime,
        end: form.closingTime
      }))
    }

    const existingImages = []
    form.images.forEach((img, i) => {
      if (typeof img === 'string') {
        existingImages.push({ url: img, isPrimary: i === 0 })
      } else {
        formData.append('images', img)
      }
    })
    
    if (existingImages.length > 0) {
      formData.append('images', JSON.stringify(existingImages))
    }
    
    return formData
  }

  const handleSaveDraft = async () => {
    try {
      setSubmitting(true)
      const payload = buildPayload()
      if (isEditMode) {
        await updateDraft(id, payload)
        toast.success('Draft updated successfully')
      } else {
        await saveDraft(payload)
        toast.success('Draft saved successfully')
      }
      navigate('/vendor/venues')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save draft')
      console.error('Save draft failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    const errs = validate(3, form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSubmitting(true)
    try {
      const payload = buildPayload()
      if (isEditMode) {
        await updateVenue(id, payload)
        await submitVenue(id) // Attempt to submit directly after updating if it's an edit
        toast.success('Venue updated successfully')
      } else {
        await createVenue(payload)
        toast.success('Venue submitted successfully')
      }
      navigate('/vendor/venues')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit venue')
      console.error('Submit failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const stepComponents = [
    <Step1 key={0} form={form} setForm={setForm} errors={errors} categoriesData={categoriesData} />,
    <Step2 key={1} form={form} setForm={setForm} errors={errors} />,
    <Step3 key={2} form={form} setForm={setForm} />,
    <Step4 key={3} form={form} setForm={setForm} errors={errors} categoriesData={categoriesData} />,
  ]

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">

      {/* ── Top Bar ──────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/vendor/venues')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-dark font-semibold transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" /> Cancel
          </button>
          <span className="font-extrabold text-primary text-lg">BookMyVenue</span>
          <div className="text-xs text-gray-400 font-medium">Step {currentStep + 1} of 4</div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-10">

        <h1 className="text-3xl font-extrabold text-dark text-center mb-8">{isEditMode ? 'Edit Venue Details' : 'Add New Venue'}</h1>

        <StepIndicator currentStep={currentStep} />

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 mb-8">
          <div className="animate-fade-in">
            {stepComponents[currentStep]}
          </div>
        </div>

        {/* ── Bottom Actions ─────────────────────────────────── */}
        <div className="flex items-center justify-between">
          {/* Left button */}
          {currentStep === 0 ? (
            <button
              onClick={handleSaveDraft}
              disabled={submitting}
              className="text-sm font-bold text-gray-500 hover:text-dark transition-colors underline underline-offset-2 disabled:opacity-50"
            >
              Save as Draft
            </button>
          ) : (
            <button
              onClick={handleBack}
              disabled={submitting}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-dark transition-colors disabled:opacity-50"
            >
              <FiArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          <div className="flex items-center gap-3">
            {/* Save draft always visible from step 1+ */}
            {currentStep > 0 && currentStep < 3 && (
              <button
                onClick={handleSaveDraft}
                disabled={submitting}
                className="text-sm font-bold text-gray-500 hover:text-dark transition-colors border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                Save Draft
              </button>
            )}

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={submitting}
                className="bg-primary hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
              >
                Next Step →
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={submitting}
                  className="border border-gray-300 text-dark px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-primary hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      {isEditMode ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Venue' : 'Submit For Approval'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddVenue
