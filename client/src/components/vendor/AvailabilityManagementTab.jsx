import React, { useState, useEffect } from 'react';
import MonthlyCalendarGrid from './slot/MonthlyCalendarGrid';
import BaseModal from '../ui/BaseModal';
import { toast } from 'sonner';
import { 
  getSlotMonthOverview, 
  acknowledgeSlots, 
  blockDailySlots, 
  blockHourlySlot, 
  removeSlotOverride 
} from '../../api/vendor-api/vendorApi';
import { generateTimeOptions } from '../../utils/timeUtils';
import { generateTimeOptions } from '../../utils/timeUtils';
import { Calendar as CalendarIcon, Info, CheckCircle2, Clock, Settings, LayoutGrid } from 'lucide-react';
import BookingConfigForm from './form/BookingConfigForm';
import TimeSlotPill from '../common/Slot/TimeSlotPill';
import { updateVenue } from '../../api/vendor-api/vendorApi';

import { VENDOR_SLOT_REASONS as REASONS } from '../../utils/venueConstants';

const AvailabilityManagementTab = ({ venueId, bookingModel, bookingConfig, hasAcknowledgedSlots, onAcknowledged }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('calendar'); // 'calendar' or 'settings'
  const [localConfig, setLocalConfig] = useState(bookingConfig || {});
  const [savingConfig, setSavingConfig] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState(null); 
  
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [dailyReason, setDailyReason] = useState('Maintenance');
  
  const [hourlyReason, setHourlyReason] = useState('Maintenance');
  
  // For time pill grid
  const [dayOperatingHours, setDayOperatingHours] = useState({ openTime: '00:00', closeTime: '23:59' });
  const [dayTimeSlots, setDayTimeSlots] = useState([]);

  const fetchOverview = async (y, m) => {
    setLoading(true);
    try {
      const data = await getSlotMonthOverview(venueId, y, m);
      setOverrides(data || []);
    } catch (err) {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview(year, month);
  }, [year, month, venueId]);

  const handleMonthChange = (newYear, newMonth) => {
    setYear(newYear);
    setMonth(newMonth);
    setSelectedDates([]);
    setSelectedDateStr(null);
  };

  const handleAcknowledge = async () => {
    try {
      await acknowledgeSlots(venueId);
      toast.success('Slot settings confirmed. Venue can now go live.');
      if (onAcknowledged) onAcknowledged();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to acknowledge slots');
    }
  };

  const handleDateClickDaily = (dateStr) => {
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(prev => prev.filter(d => d !== dateStr));
    } else {
      setSelectedDates(prev => [...prev, dateStr]);
    }
  };

  const submitDailyBlocks = async () => {
    if (selectedDates.length === 0) return;
    try {
      await blockDailySlots(venueId, { dates: selectedDates, reason: dailyReason });
      toast.success('Dates marked as unavailable');
      setShowDailyModal(false);
      setSelectedDates([]);
      fetchOverview(year, month);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to block dates');
    }
  };

  const handleDateClickHourly = (dateStr) => {
    setSelectedDateStr(dateStr);
    setSelectedDates([dateStr]);
  };

  const toggleTimeSlot = async (slotTime, isBlocked, blockInfo) => {
    try {
      if (isBlocked) {
        if (blockInfo.reason === 'Customer Booking') {
          return toast.error("You cannot manually unblock a customer's booking here.");
        }
        await removeSlotOverride(venueId, { date: selectedDateStr, slotIndex: blockInfo.index });
        toast.success('Time slot unblocked');
      } else {
        const interval = bookingConfig?.bookingInterval || 60;
        const [h, m] = slotTime.split(':').map(Number);
        const endM = h * 60 + m + interval;
        const endH = Math.floor(endM / 60).toString().padStart(2, '0');
        const endMin = (endM % 60).toString().padStart(2, '0');
        const toTimeStr = `${endH}:${endMin}`;

        await blockHourlySlot(venueId, { date: selectedDateStr, fromTime: slotTime, toTime: toTimeStr, reason: hourlyReason });
        toast.success('Time slot blocked');
      }
      fetchOverview(year, month);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update time slot');
    }
  };

  const handleRemoveOverride = async (dateStr, payload) => {
    try {
      await removeSlotOverride(venueId, { date: dateStr, ...payload });
      toast.success('Block removed');
      fetchOverview(year, month);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove block');
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await updateVenue(venueId, { bookingConfig: localConfig });
      toast.success('Availability settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSavingConfig(false);
    }
  };

  const selectedDateOverride = selectedDateStr ? overrides.find(o => o.date === selectedDateStr) : null;
  const timeToMinutes = (t) => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  useEffect(() => {
    if (bookingModel === 'hourly' && selectedDateStr) {
      const d = new Date(selectedDateStr);
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = days[d.getDay()];
      
      const opHours = bookingConfig?.operatingHours?.[dayName] || { isOpen: true, openTime: '00:00', closeTime: '23:30' };
      setDayOperatingHours(opHours);
      
      if (opHours.isOpen) {
        const interval = bookingConfig?.bookingInterval || 60;
        const startMin = timeToMinutes(opHours.openTime);
        const endMin = timeToMinutes(opHours.closeTime);
        
        let slots = [];
        for (let current = startMin; current < endMin; current += interval) {
          const h = Math.floor(current / 60).toString().padStart(2, '0');
          const m = (current % 60).toString().padStart(2, '0');
          const nextMin = current + interval;
          const endH = Math.floor(nextMin / 60).toString().padStart(2, '0');
          const endM = (nextMin % 60).toString().padStart(2, '0');
          slots.push({ start: `${h}:${m}`, end: `${endH}:${endM}` });
        }
        setDayTimeSlots(slots);
      } else {
        setDayTimeSlots([]);
      }
    }
  }, [selectedDateStr, bookingConfig, bookingModel]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-[1120px] mx-auto px-6 lg:px-10 py-6">
      {!hasAcknowledgedSlots && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-blue-900 font-semibold text-lg">Confirm Slot Management</h4>
            <p className="text-blue-800 text-sm mt-1">Please review your availability. Once you confirm, your venue can be published and go live for customer bookings.</p>
          </div>
          <button 
            onClick={handleAcknowledge}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors shrink-0"
          >
            Save / Confirm
          </button>
        </div>
      )}

      {/* Sub Navigation */}
      <div className="flex border-b border-gray-200 mt-2 mb-6 gap-6">
        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`pb-3 font-semibold text-sm transition-colors flex items-center gap-2 ${
            activeSubTab === 'calendar' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-dark'
          }`}
        >
          <LayoutGrid className="w-4 h-4" /> Calendar & Blocks
        </button>
        {bookingModel === 'hourly' && (
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`pb-3 font-semibold text-sm transition-colors flex items-center gap-2 ${
              activeSubTab === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-dark'
            }`}
          >
            <Settings className="w-4 h-4" /> Operating Hours & Rules
          </button>
        )}
      </div>

      {activeSubTab === 'settings' && bookingModel === 'hourly' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <BookingConfigForm 
            isHourly={true}
            config={localConfig}
            onChange={setLocalConfig}
          />
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="px-6 py-2.5 bg-on-surface hover:bg-black text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {savingConfig ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'calendar' && (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        <div className="w-full">
          <MonthlyCalendarGrid 
            year={year} 
            month={month} 
            overrides={overrides} 
            bookingModel={bookingModel}
            selectedDates={selectedDates}
            onDateClick={bookingModel === 'daily' ? handleDateClickDaily : handleDateClickHourly}
            onMonthChange={handleMonthChange}
          />
        </div>
        
        <div className="sticky top-6 space-y-4">
          {/* Idle Hint State */}
          {bookingModel === 'daily' && selectedDates.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <CalendarIcon className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Manage Availability</h3>
              <p className="text-sm text-gray-500 mb-6">Click on any dates on the calendar to mark them as unavailable or view existing blocks.</p>
              
              <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Calendar Legend</p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-green-500 border border-green-500"></div> 
                  Available
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div> 
                  Customer Booking
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div> 
                  Blocked by you
                </div>
              </div>
            </div>
          )}

          {bookingModel === 'hourly' && !selectedDateStr && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <CalendarIcon className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Manage Time Slots</h3>
              <p className="text-sm text-gray-500">Click on any date to manage hourly blocks or view existing customer bookings for that day.</p>
            </div>
          )}

          {/* Daily Mode Action Panel */}
          {bookingModel === 'daily' && selectedDates.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm animate-fadeIn">
              <h3 className="font-semibold text-dark mb-2">Selected Dates ({selectedDates.length})</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedDates.map(date => (
                  <span key={date} className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-md text-xs font-medium text-gray-600">
                    {date}
                  </span>
                ))}
              </div>
              
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Reason</label>
                <select 
                  className="w-full py-2.5 text-sm border-gray-300 rounded-md focus:ring-dark focus:border-dark"
                  value={dailyReason} 
                  onChange={e => setDailyReason(e.target.value)}
                >
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              
              <button 
                onClick={submitDailyBlocks}
                className="w-full py-2 bg-on-surface hover:bg-black text-white rounded-md font-medium transition-colors text-sm"
              >
                Mark Unavailable
              </button>
            </div>
          )}

          {bookingModel === 'hourly' && selectedDateStr && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col animate-fadeIn">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-dark">Slots for {new Date(selectedDateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</h3>
              </div>
              
              <div className="p-5 flex-1">
                {!dayOperatingHours.isOpen ? (
                  <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-red-700 font-medium">Venue is closed on this day.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Block Reason (For new blocks)</label>
                      <select 
                        className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-dark" 
                        value={hourlyReason} 
                        onChange={e=>setHourlyReason(e.target.value)}
                      >
                        {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Time Grid (Click to toggle)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                      {dayTimeSlots.map(slotObj => {
                        const time = slotObj.start;
                        const endTime = slotObj.end;
                        const slotMin = timeToMinutes(time);
                        let isBlocked = false;
                        let blockInfo = null;

                        if (selectedDateOverride?.isFullDayBlocked) {
                          isBlocked = true;
                          blockInfo = { reason: selectedDateOverride.fullDayReason };
                        } else if (selectedDateOverride?.blocks) {
                          const blockIndex = selectedDateOverride.blocks.findIndex(b => {
                            const bStart = timeToMinutes(b.fromTime);
                            const bEnd = timeToMinutes(b.toTime);
                            return slotMin >= bStart && slotMin < bEnd;
                          });
                          if (blockIndex !== -1) {
                            isBlocked = true;
                            blockInfo = { ...selectedDateOverride.blocks[blockIndex], index: blockIndex };
                          }
                        }

                        let status = isBlocked 
                          ? (blockInfo.reason === 'Customer Booking' ? 'customer_booking' : 'blocked')
                          : 'available';

                        return (
                          <TimeSlotPill
                            key={time}
                            startTime={time}
                            endTime={endTime}
                            status={status}
                            subtitle={isBlocked && blockInfo.reason !== 'Customer Booking' ? (blockInfo.reason === 'Maintenance' ? 'Maint' : 'Block') : undefined}
                            onClick={() => toggleTimeSlot(time, isBlocked, blockInfo)}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Blocked Dates Overview (Daily) */}
          {bookingModel === 'daily' && (
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mt-4">
              <h3 className="font-semibold text-dark mb-3">Blocked Dates Overview</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {overrides.filter(o => o.isFullDayBlocked).length === 0 && (
                  <p className="text-sm text-gray-400 italic">No blocked dates this month.</p>
                )}
                {overrides.filter(o => o.isFullDayBlocked).map(o => (
                  <div key={o.date} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded border border-gray-100">
                    <div>
                      <span className="font-medium text-dark">{o.date}</span>
                      <span className="ml-2 text-xs text-gray-500">{o.fullDayReason}</span>
                    </div>
                    {o.fullDayReason !== 'Customer Booking' && (
                      <button 
                        onClick={() => handleRemoveOverride(o.date, {})}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove block"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default AvailabilityManagementTab;
