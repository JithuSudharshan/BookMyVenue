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

const REASONS = ['Maintenance', 'Offline Booking', 'Other'];

const SlotManagementTab = ({ venueId, bookingModel, bookingConfig, hasAcknowledgedSlots, onAcknowledged }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState(null); 
  
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [dailyReason, setDailyReason] = useState('Maintenance');
  
  const [hourlyReason, setHourlyReason] = useState('Maintenance');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');

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

  const submitHourlyBlock = async () => {
    if (!fromTime || !toTime) return toast.error('Please select both from and to times');
    try {
      await blockHourlySlot(venueId, { date: selectedDateStr, fromTime, toTime, reason: hourlyReason });
      toast.success('Time slot blocked successfully');
      setFromTime('');
      setToTime('');
      fetchOverview(year, month);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to block time slot');
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

  const generateTimeOptions = () => {
    const opts = [];
    const parse = (t) => t ? t.split(':').map(Number) : [0,0];
    const [startH, startM] = parse(bookingConfig?.openingTime || '09:00');
    const [endH, endM] = parse(bookingConfig?.closingTime || '21:00');
    let h = startH; let m = startM;
    while(h < endH || (h === endH && m <= endM)) {
      opts.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      m += 60;
      if(m >= 60) { h++; m -= 60; }
    }
    return opts;
  };
  const timeOptions = generateTimeOptions();

  const selectedDateOverride = selectedDateStr ? overrides.find(o => o.date === selectedDateStr) : null;

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

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="xl:w-2/3">
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
        
        <div className="xl:w-1/3 space-y-4">
          {bookingModel === 'daily' && selectedDates.length > 0 && (
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
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
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-dark">Manage Slots: {selectedDateStr}</h3>
              </div>
              
              <div className="p-4 overflow-y-auto flex-1 space-y-3">
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Current Blocks</h4>
                {(!selectedDateOverride?.blockedSlots || selectedDateOverride.blockedSlots.length === 0) && (
                  <p className="text-sm text-gray-400 italic">No slots blocked for this date.</p>
                )}
                {selectedDateOverride?.blockedSlots?.map((slot, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100">
                    <div>
                      <div className="font-medium text-sm text-dark">{slot.fromTime} - {slot.toTime}</div>
                      <div className="text-xs text-gray-500">{slot.reason}</div>
                    </div>
                    {slot.reason !== 'Customer Booking' && (
                      <button 
                        onClick={() => handleRemoveOverride(selectedDateStr, { slotIndex: idx })}
                        className="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded"
                        title="Remove block"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Add Block</h4>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">From</label>
                    <select className="w-full py-2.5 text-sm border-gray-300 rounded-md focus:ring-dark focus:border-dark" value={fromTime} onChange={e=>setFromTime(e.target.value)}>
                      <option value="">Select</option>
                      {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">To</label>
                    <select className="w-full py-2.5 text-sm border-gray-300 rounded-md focus:ring-dark focus:border-dark" value={toTime} onChange={e=>setToTime(e.target.value)}>
                      <option value="">Select</option>
                      {(fromTime ? timeOptions.slice(timeOptions.indexOf(fromTime) + 1) : timeOptions).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Reason</label>
                  <select className="w-full py-2.5 text-sm border-gray-300 rounded-md focus:ring-dark focus:border-dark" value={hourlyReason} onChange={e=>setHourlyReason(e.target.value)}>
                    {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <button 
                  onClick={submitHourlyBlock}
                  className="w-full py-2 bg-on-surface hover:bg-black text-white rounded-md font-medium transition-colors text-sm"
                >
                  Block This Time
                </button>
              </div>
            </div>
          )}

          {bookingModel === 'daily' && (
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mt-4">
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


    </div>
  );
};

export default SlotManagementTab;
