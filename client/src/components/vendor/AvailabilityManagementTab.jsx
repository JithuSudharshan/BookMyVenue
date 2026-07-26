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
import { Calendar as CalendarIcon, Info, CheckCircle2, Clock, Settings, LayoutGrid } from 'lucide-react';
import BookingConfigForm from './form/BookingConfigForm';
import AvailabilityRow from './slot/AvailabilityRow';
import { updateVenue } from '../../api/vendor-api/vendorApi';

import { VENDOR_SLOT_REASONS as REASONS } from '../../utils/venueConstants';

const AvailabilityManagementTab = ({ venueId, bookingModel, bookingConfig, hasAcknowledgedSlots, onAcknowledged }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('calendar'); // 'calendar' or 'settings'
  const [localConfig, setLocalConfig] = useState(bookingConfig || {});

  useEffect(() => {
    setLocalConfig(bookingConfig || {});
  }, [bookingConfig]);
  const [savingConfig, setSavingConfig] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState(null); 
  
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [dailyReason, setDailyReason] = useState('Maintenance');
  
  const [hourlyReason, setHourlyReason] = useState('Maintenance');
  const [selectedHourlySlots, setSelectedHourlySlots] = useState([]);
  
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
    setSelectedHourlySlots([]);
  };

  const toggleTimeSlot = async (slotTime, isBlocked, blockInfo) => {
    if (isBlocked) {
      if (blockInfo.reason === 'Customer Booking') {
        return toast.error("You cannot manually unblock a customer's booking here.");
      }
      try {
        await removeSlotOverride(venueId, { date: selectedDateStr, slotIndex: blockInfo.index });
        toast.success('Time slot unblocked');
        fetchOverview(year, month);
      } catch (err) {
        toast.error('Failed to update time slot');
      }
    } else {
      setSelectedHourlySlots(prev => 
        prev.includes(slotTime) ? prev.filter(t => t !== slotTime) : [...prev, slotTime]
      );
    }
  };

  const applyHourlyBlocks = async () => {
    if (selectedHourlySlots.length === 0) return;
    try {
      const interval = bookingConfig?.bookingInterval || 60;
      await Promise.all(selectedHourlySlots.map(time => {
        const [h, m] = time.split(':').map(Number);
        const endM = h * 60 + m + interval;
        const endH = Math.floor(endM / 60).toString().padStart(2, '0');
        const endMin = (endM % 60).toString().padStart(2, '0');
        const toTimeStr = `${endH}:${endMin}`;
        
        return blockHourlySlot(venueId, { date: selectedDateStr, fromTime: time, toTime: toTimeStr, reason: hourlyReason });
      }));
      toast.success('Selected time slots blocked successfully');
      setSelectedHourlySlots([]);
      fetchOverview(year, month);
    } catch (err) {
      toast.error('Failed to block some time slots');
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
      if (onAcknowledged) onAcknowledged(); // Trigger parent to fetch latest DB data
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
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  useEffect(() => {
    if (bookingModel === 'hourly' && selectedDateStr) {
      const [y, m, day] = selectedDateStr.split('-');
      const d = new Date(Number(y), Number(m) - 1, Number(day));
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

  // Calculate KPIs
  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();
  const totalDays = getDaysInMonth(year, month);
  let openDaysCount = 0;
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month - 1, d);
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dateObj.getDay()];
    if (bookingConfig?.operatingHours?.[dayName]?.isOpen) {
      openDaysCount++;
    }
  }

  const fullyBlockedDatesCount = overrides.filter(o => o.isFullDayBlocked).length;
  const partialBlockedCount = overrides.filter(o => !o.isFullDayBlocked && o.blocks && o.blocks.length > 0).length;
  const totalBlocks = fullyBlockedDatesCount + partialBlockedCount;

  return (
    <div className="space-y-6 animate-fadeIn w-full px-6 lg:px-10 py-6">
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

      {/* KPI Stat Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Booking Window</span>
          <span className="text-xl font-bold text-gray-900">{bookingConfig?.bookingInterval || 60} <span className="text-sm font-medium text-gray-500">mins</span></span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Open Days</span>
          <span className="text-xl font-bold text-gray-900">{openDaysCount} <span className="text-sm font-medium text-gray-500">/ {totalDays}</span></span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Overrides</span>
          <span className="text-xl font-bold text-gray-900">{totalBlocks} <span className="text-sm font-medium text-gray-500">dates affected</span></span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Prep Time</span>
          <span className="text-xl font-bold text-gray-900">{bookingConfig?.preparationTime || 0} <span className="text-sm font-medium text-gray-500">mins</span></span>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex mb-6">
        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`w-[240px] justify-center px-5 py-2 font-semibold text-sm rounded-md transition-all flex items-center gap-2 ${
              activeSubTab === 'calendar' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Calendar & Blocks
          </button>
          {bookingModel === 'hourly' && (
            <button
              onClick={() => setActiveSubTab('settings')}
              className={`w-[240px] justify-center px-5 py-2 font-semibold text-sm rounded-md transition-all flex items-center gap-2 ${
                activeSubTab === 'settings' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4" /> Operating Hours & Rules
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'settings' && bookingModel === 'hourly' && (
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          <div className="flex-1 w-full bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
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
          
          <div className="w-full lg:w-[420px] shrink-0 sticky top-6 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Settings className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Operating Hours & Rules</h3>
              <p className="text-sm text-gray-500 mb-6">Set your standard weekly operating schedule. Any times outside these hours will automatically be blocked for customers.</p>
              
              <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Configuration Tips</p>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="font-medium shrink-0">Booking Interval:</span> Determines the length of each time slot customers can book.
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="font-medium shrink-0">Preparation Time:</span> Automatically blocks out time between back-to-back bookings for cleaning and setup.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'calendar' && (
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        <div className="flex-1 w-full">
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
        
        <div className="w-full lg:w-[420px] shrink-0 sticky top-6 space-y-4">
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
              <div className="p-5 border-b border-gray-200 bg-gray-50">
                <h3 className="font-bold text-dark text-lg mb-1">
                  {new Date(selectedDateStr).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" /> 
                  {!dayOperatingHours.isOpen 
                    ? 'Closed' 
                    : `${formatTime(dayOperatingHours.openTime)} – ${formatTime(dayOperatingHours.closeTime)} · ${dayTimeSlots.length} windows`
                  }
                </div>
              </div>
              
              <div className="p-5 flex-1 bg-white">
                {!dayOperatingHours.isOpen ? (
                  <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-red-700 font-medium">Venue is closed on this day.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-5 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">1. Select Block Reason</label>
                      <select 
                        className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-dark bg-white" 
                        value={hourlyReason} 
                        onChange={e=>setHourlyReason(e.target.value)}
                      >
                        {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <p className="text-xs text-gray-400 mt-2">2. Click any open row below to immediately apply this block.</p>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center gap-4 mb-4 text-xs font-medium text-gray-600 px-1">
                       <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Open</div>
                       <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Booked</div>
                       <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Blocked</div>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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
                          : (selectedHourlySlots.includes(time) ? 'selected' : 'available');

                        return (
                          <AvailabilityRow
                            key={time}
                            startTime={time}
                            endTime={endTime}
                            status={status}
                            onClick={() => toggleTimeSlot(time, isBlocked, blockInfo)}
                          />
                        );
                      })}
                    </div>
                    {selectedHourlySlots.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between animate-fadeIn">
                        <span className="text-sm font-semibold text-gray-700">{selectedHourlySlots.length} slot(s) selected</span>
                        <button 
                          onClick={applyHourlyBlocks}
                          className="px-6 py-2 bg-on-surface hover:bg-black text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
                        >
                          Apply Block
                        </button>
                      </div>
                    )}
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
