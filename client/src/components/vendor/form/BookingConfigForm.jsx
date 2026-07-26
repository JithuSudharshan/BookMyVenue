import React from 'react';

const inputCls = (err) =>
  `w-full border ${err ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-primary focus:ring-red-100'}
  rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all text-sm placeholder-gray-400 bg-white`;

const Field = ({ label, hint, error, children }) => (
  <div>
    <label className="block text-sm font-bold text-dark mb-1.5">{label}</label>
    {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
    {children}
    {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
  </div>
);

const BookingConfigForm = ({ config, onChange, isHourly }) => {
  if (!isHourly) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Weekly Operating Hours */}
      <div>
        <label className="block text-sm font-bold text-dark mb-1.5">Weekly Operating Hours</label>
        <p className="text-xs text-gray-400 mb-3">Set your regular open and close times for each day of the week.</p>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {Object.keys(config.operatingHours || {}).map((day) => {
            const dayData = config.operatingHours[day];
            return (
              <div key={day} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 bg-white">
                <div className="flex items-center gap-3 w-1/3">
                  <input
                    type="checkbox"
                    checked={dayData.isOpen}
                    onChange={(e) => onChange({
                      ...config,
                      operatingHours: {
                        ...config.operatingHours,
                        [day]: { ...dayData, isOpen: e.target.checked }
                      }
                    })}
                    className="w-4 h-4 text-primary accent-primary rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium capitalize">{day}</span>
                </div>
                {dayData.isOpen ? (
                  <div className="flex items-center gap-2 w-2/3">
                    <input
                      type="time"
                      value={dayData.openTime}
                      onChange={(e) => onChange({
                        ...config,
                        operatingHours: { ...config.operatingHours, [day]: { ...dayData, openTime: e.target.value } }
                      })}
                      className={`${inputCls(false)} !py-1.5`}
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <input
                      type="time"
                      value={dayData.closeTime}
                      onChange={(e) => onChange({
                        ...config,
                        operatingHours: { ...config.operatingHours, [day]: { ...dayData, closeTime: e.target.value } }
                      })}
                      className={`${inputCls(false)} !py-1.5`}
                    />
                  </div>
                ) : (
                  <div className="w-2/3 text-sm text-gray-400 italic px-2">Closed</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Booking Interval" hint="Granularity of start times (e.g., every 30 mins or 1 hour).">
          <select
            value={config.bookingInterval}
            onChange={(e) => onChange({ ...config, bookingInterval: Number(e.target.value) })}
            className={inputCls(false)}
          >
            <option value={30}>30 Minutes</option>
            <option value={60}>1 Hour</option>
            <option value={120}>2 Hours</option>
          </select>
        </Field>
        <Field label="Preparation Time" hint="Time blocked automatically after each booking.">
          <select
            value={config.preparationTime}
            onChange={(e) => onChange({ ...config, preparationTime: Number(e.target.value) })}
            className={inputCls(false)}
          >
            <option value={0}>None</option>
            <option value={15}>15 Minutes</option>
            <option value={30}>30 Minutes</option>
            <option value={45}>45 Minutes</option>
            <option value={60}>1 Hour</option>
          </select>
        </Field>

      </div>
    </div>
  );
};

export default BookingConfigForm;
