import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MentorSchedule() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    return { daysInMonth, startingDay };
  };

  // Format month and year
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Go to today
  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startingDay }, (_, i) => i);

  // Weekday headers
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-[#070A0F] p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header with navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/app/mentor')}
            className="text-white/40 hover:text-white/60 flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">Schedule Sessions</h1>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>

        {/* Main Calendar Card */}
        <div className="border border-white/10 bg-white/5 rounded-3xl p-6">
          
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              {formatMonthYear(currentMonth)}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={goToToday}
                className="px-4 py-2 rounded-xl border border-white/10 bg-black/25 text-white/80 text-sm hover:bg-white/10"
              >
                Today
              </button>
              <button
                onClick={goToPreviousMonth}
                className="w-10 h-10 rounded-xl border border-white/10 bg-black/25 text-white/80 hover:bg-white/10"
              >
                ←
              </button>
              <button
                onClick={goToNextMonth}
                className="w-10 h-10 rounded-xl border border-white/10 bg-black/25 text-white/80 hover:bg-white/10"
              >
                →
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekdays.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-white/40 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank days for start of month */}
            {blanks.map(blank => (
              <div key={`blank-${blank}`} className="aspect-square p-2" />
            ))}

            {/* Actual days */}
            {days.map(day => {
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              
              // Mock data - in real app, this would come from API
              const hasSessions = false; // Will be true when sessions exist
              const sessionCount = 0;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    aspect-square p-2 rounded-xl border transition-all
                    ${isSelected 
                      ? 'border-[#C7000B] bg-[#C7000B]/20' 
                      : isToday
                        ? 'border-[#C7000B]/50 bg-[#C7000B]/10'
                        : 'border-white/10 bg-black/25 hover:bg-white/5'
                    }
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span className={`
                      text-sm font-semibold
                      ${isSelected ? 'text-white' : isToday ? 'text-[#C7000B]' : 'text-white/60'}
                    `}>
                      {day}
                    </span>
                    
                    {/* Session indicator - will appear when sessions exist */}
                    {hasSessions && (
                      <div className="mt-auto flex justify-center">
                        <span className="text-[10px] bg-[#C7000B] text-white px-1.5 py-0.5 rounded-full">
                          {sessionCount}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center gap-4 text-xs text-white/40">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#C7000B]/20 border border-[#C7000B]/50"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#C7000B]/20 border border-[#C7000B]"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white/10 border border-white/10"></div>
              <span>No sessions</span>
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="mt-6 border border-white/10 bg-white/5 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>

            {/* Empty state - will be replaced with actual sessions */}
            <div className="border border-white/10 bg-black/25 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-white/40 mb-2">No sessions scheduled</p>
              <p className="text-white/30 text-sm">
                Sessions will appear here when entrepreneurs book time with you
              </p>
              
              {/* Availability note */}
              <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-left">
                <h4 className="text-sm font-semibold text-blue-300 mb-2">Set Your Availability</h4>
                <p className="text-xs text-blue-200/80 mb-3">
                  Let entrepreneurs know when you're available for sessions. This helps them book time that works for both of you.
                </p>
                <button className="text-sm text-[#C7000B] hover:underline">
                  Configure Availability →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-white/10 bg-white/5 rounded-2xl p-4">
            <div className="text-xs text-white/40 mb-1">Upcoming Sessions</div>
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-xs text-white/40 mt-1">No sessions scheduled</div>
          </div>
          <div className="border border-white/10 bg-white/5 rounded-2xl p-4">
            <div className="text-xs text-white/40 mb-1">Available Slots</div>
            <div className="text-2xl font-bold text-white">--</div>
            <div className="text-xs text-white/40 mt-1">Set your availability</div>
          </div>
          <div className="border border-white/10 bg-white/5 rounded-2xl p-4">
            <div className="text-xs text-white/40 mb-1">Total Hours</div>
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-xs text-white/40 mt-1">This month</div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <p className="text-xs text-purple-300">
            <span className="font-semibold">📘 How it works:</span> When entrepreneurs request sessions, they'll appear on your calendar. 
            You can accept, reschedule, or decline requests. After each session, you'll add notes and vouch for their progress.
          </p>
        </div>
      </div>
    </div>
  );
}