/**
 * Generates an array of time strings (e.g. ['09:00', '10:00', ...]) 
 * between an opening and closing time in 60-minute intervals.
 * 
 * @param {string} openingTime - HH:mm format (e.g. '09:00')
 * @param {string} closingTime - HH:mm format (e.g. '21:00')
 * @returns {string[]} Array of time strings
 */
export const generateTimeOptions = (openingTime = '09:00', closingTime = '21:00') => {
  const opts = [];
  const parse = (t) => t ? t.split(':').map(Number) : [0, 0];
  const [startH, startM] = parse(openingTime);
  const [endH, endM] = parse(closingTime);
  
  let h = startH; 
  let m = startM;
  
  while (h < endH || (h === endH && m <= endM)) {
    opts.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    m += 60;
    if (m >= 60) { 
      h++; 
      m -= 60; 
    }
  }
  return opts;
};
