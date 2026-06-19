import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  toEthiopic,
  toGregorian,
  parseIsoDateLocal,
  formatGregorianIso,
  getDaysInEthiopianMonth,
  AT_MONTHS_EN,
  AT_MONTHS_AM,
} from '../lib/calendarUtils';
import { Language } from '../types';

interface EthiopianDateInputProps {
  value: string;
  onChange: (value: string) => void;
  lang: Language;
  label?: string;
  className?: string;
  preferredCalendar?: 'gregorian' | 'ethiopian';
}

export default function EthiopianDateInput({
  value,
  onChange,
  lang,
  label,
  className = '',
  preferredCalendar = 'gregorian',
}: EthiopianDateInputProps) {
  const [calendarType, setCalendarType] = useState<'gregorian' | 'ethiopian'>(preferredCalendar);

  const [ethYear, setEthYear] = useState(0);
  const [ethMonth, setEthMonth] = useState(0);
  const [ethDay, setEthDay] = useState(0);

  useEffect(() => {
    setCalendarType(preferredCalendar);
  }, [preferredCalendar]);

  useEffect(() => {
    if (!value || calendarType !== 'ethiopian') return;
    const date = parseIsoDateLocal(value);
    if (!date) return;
    const eth = toEthiopic(date);
    if (eth.year !== ethYear || eth.month !== ethMonth || eth.day !== ethDay) {
      setEthYear(eth.year);
      setEthMonth(eth.month);
      setEthDay(eth.day);
    }
  }, [value, calendarType]);

  const handleEthChange = (y: number, m: number, d: number) => {
    if (y > 0 && m > 0 && d > 0 && d <= getDaysInEthiopianMonth(y, m)) {
      try {
        onChange(formatGregorianIso(toGregorian(y, m, d)));
      } catch (e) {
        console.error('Invalid Ethiopic date', e);
      }
    }
  };

  const months = lang === 'en' ? AT_MONTHS_EN : AT_MONTHS_AM;
  const maxEthDay =
    ethMonth > 0 && ethYear > 0 ? getDaysInEthiopianMonth(ethYear, ethMonth) : 30;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex justify-between items-center">
        {label && <label className="block text-xs font-semibold text-zinc-500">{label}</label>}
        <button
          type="button"
          onClick={() =>
            setCalendarType(calendarType === 'gregorian' ? 'ethiopian' : 'gregorian')
          }
          className="text-[10px] flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:underline font-bold"
        >
          <CalendarIcon className="w-3 h-3" />
          {calendarType === 'gregorian'
            ? lang === 'en'
              ? 'Use Ethiopian Calendar'
              : 'የኢትዮጵያ ዘመን አቆጣጠር ተጠቀም'
            : lang === 'en'
              ? 'Use Gregorian Calendar'
              : 'የፈረንጆች ዘመን አቆጣጠር ተጠቀም'}
        </button>
      </div>

      {calendarType === 'gregorian' ? (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-sm rounded outline-none focus:ring-1 focus:ring-orange-500 text-zinc-900 dark:text-zinc-100"
        />
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <select
            value={ethMonth}
            onChange={(e) => {
              const m = parseInt(e.target.value, 10);
              const maxDay = ethYear > 0 ? getDaysInEthiopianMonth(ethYear, m) : 30;
              const d = ethDay > maxDay ? maxDay : ethDay;
              setEthMonth(m);
              if (d !== ethDay) setEthDay(d);
              handleEthChange(ethYear, m, d);
            }}
            className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-xs rounded outline-none focus:ring-1 focus:ring-orange-500 text-zinc-900 dark:text-zinc-100"
          >
            <option value="0">{lang === 'en' ? 'Month' : 'ወር'}</option>
            {months.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={ethDay}
            onChange={(e) => {
              const d = parseInt(e.target.value, 10);
              setEthDay(d);
              handleEthChange(ethYear, ethMonth, d);
            }}
            className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-xs rounded outline-none focus:ring-1 focus:ring-orange-500 text-zinc-900 dark:text-zinc-100"
          >
            <option value="0">{lang === 'en' ? 'Day' : 'ቀን'}</option>
            {[...Array(maxEthDay)].map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={lang === 'en' ? 'Year' : 'ዓ.ም'}
            value={ethYear || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              const y = parseInt(val, 10) || 0;
              const maxDay =
                ethMonth > 0 && y > 0 ? getDaysInEthiopianMonth(y, ethMonth) : 30;
              const d = ethDay > maxDay ? maxDay : ethDay;
              setEthYear(y);
              if (d !== ethDay) setEthDay(d);
              handleEthChange(y, ethMonth, d);
            }}
            className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 text-xs rounded outline-none focus:ring-1 focus:ring-orange-500 text-zinc-900 dark:text-zinc-100 text-center"
            maxLength={4}
          />
        </div>
      )}
    </div>
  );
}
