import React, { useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['S','M','T','W','T','F','S']

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

const isSameDay = (a, b) => a && b && a.toDateString() === b.toDateString()
const isBetween = (date, start, end) => {
  if (!start || !end) return false
  const d = date.getTime()
  return d > start.getTime() && d < end.getTime()
}
const isPast = (date) => {
  const today = new Date(); today.setHours(0,0,0,0)
  return date < today
}

const formatDisplay = (date) => {
  if (!date) return null
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const DatePanel = ({ dateRange, onChange, onClose }) => {
  const today = new Date()
  const [baseMonth, setBaseMonth] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [flexMode, setFlexMode] = useState('dates') // 'dates' | 'flexible'
  const [hoverDate, setHoverDate] = useState(null)

  const nextMonthDate = { year: baseMonth.month === 11 ? baseMonth.year + 1 : baseMonth.year, month: (baseMonth.month + 1) % 12 }

  const handleDayClick = (date) => {
    if (isPast(date)) return
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      onChange({ start: date, end: null })
    } else {
      if (date < dateRange.start) {
        onChange({ start: date, end: dateRange.start })
      } else {
        onChange({ start: dateRange.start, end: date })
        onClose()
      }
    }
  }

  const renderMonth = ({ year, month }) => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const cells = []

    for (let i = 0; i < firstDay; i++) cells.push(<div key={`e-${i}`} />)

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const isStart = isSameDay(date, dateRange.start)
      const isEnd = isSameDay(date, dateRange.end)
      const inRange = isBetween(date, dateRange.start, dateRange.end || hoverDate)
      const past = isPast(date)

      cells.push(
        <button
          key={d}
          disabled={past}
          onClick={() => handleDayClick(date)}
          onMouseEnter={() => setHoverDate(date)}
          onMouseLeave={() => setHoverDate(null)}
          className={`
            relative h-9 w-9 text-sm font-medium rounded-full transition-colors
            flex items-center justify-center mx-auto
            ${past ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
            ${isStart || isEnd ? 'bg-dark text-white hover:bg-gray-800' : ''}
            ${inRange && !isStart && !isEnd ? 'bg-rose-100 text-dark rounded-none' : ''}
          `}
        >
          {d}
        </button>
      )
    }

    return (
      <div className="flex-1">
        <p className="text-center font-semibold text-dark mb-4">
          {MONTHS[month]} {year}
        </p>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {DAYS.map((d, i) => (
            <div key={i} className="text-xs font-medium text-gray-400 pb-2">{d}</div>
          ))}
          {cells}
        </div>
      </div>
    )
  }

  const prevMonth = () => {
    setBaseMonth(prev => ({
      year: prev.month === 0 ? prev.year - 1 : prev.year,
      month: prev.month === 0 ? 11 : prev.month - 1
    }))
  }
  const nextMonth = () => {
    setBaseMonth(prev => ({
      year: prev.month === 11 ? prev.year + 1 : prev.year,
      month: (prev.month + 1) % 12
    }))
  }

  return (
    <div className="absolute left-0 top-[calc(100%+12px)] bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 z-50 w-[700px] max-w-[calc(100vw-2rem)] animate-fade-in-up">

      {/* Dates / Flexible Toggle */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 rounded-full p-1 gap-1">
          {['dates', 'flexible'].map(mode => (
            <button
              key={mode}
              onClick={() => setFlexMode(mode)}
              className={`px-6 py-1.5 rounded-full text-sm font-medium transition-colors capitalize
                ${flexMode === mode ? 'bg-white text-dark shadow-sm' : 'text-gray-500 hover:text-dark'}`}
            >
              {mode === 'dates' ? 'Dates' : 'Flexible'}
            </button>
          ))}
        </div>
      </div>

      {flexMode === 'dates' ? (
        <>
          {/* Calendar navigation */}
          <div className="flex items-start gap-8 relative">
            <button onClick={prevMonth}
              className="absolute -left-2 top-1 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
              <FiChevronLeft className="w-4 h-4" />
            </button>

            {renderMonth(baseMonth)}

            <div className="w-px bg-gray-100 self-stretch"></div>

            {renderMonth(nextMonthDate)}

            <button onClick={nextMonth}
              className="absolute -right-2 top-1 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Flexibility chips */}
          <div className="flex items-center gap-2 mt-6 flex-wrap">
            {['Exact dates', '± 1 day', '± 2 days', '± 7 days', '± 14 days'].map((label, i) => (
              <button key={i}
                className="px-4 py-1.5 border border-gray-300 rounded-full text-sm font-medium hover:border-dark transition-colors">
                {label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="py-8 text-center text-gray-400 text-sm">
          Flexible date options coming soon
        </div>
      )}

      {/* Selected range summary */}
      {(dateRange.start || dateRange.end) && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {formatDisplay(dateRange.start)}
            {dateRange.end ? ` → ${formatDisplay(dateRange.end)}` : ' → Select end date'}
          </p>
          <button
            onClick={() => onChange({ start: null, end: null })}
            className="text-sm font-medium text-dark underline hover:no-underline"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}

export default DatePanel
