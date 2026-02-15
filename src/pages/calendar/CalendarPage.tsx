import { useState, useEffect } from 'react';
import { calendarService, CalendarEvent } from '../../api/calendarService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';

const CalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  useEffect(() => {
    fetchEvents();
  }, [currentDate, view]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();
      const response = await calendarService.getEvents(startDate, endDate);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    if (view === 'month') {
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      return { startDate, endDate };
    } else {
      // Week view
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return {
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: endOfWeek.toISOString().split('T')[0],
      };
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const previousPeriod = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  const nextPeriod = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'EXPENSE': return 'bg-red-100 text-red-800 border-red-300';
      case 'INCOME': return 'bg-green-100 text-green-800 border-green-300';
      case 'RECURRING': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const days = getDaysInMonth();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark-200">Calendar View</h1>
        <div className="flex gap-2">
          <select
            value={view}
            onChange={(e) => setView(e.target.value as 'month' | 'week')}
            className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-200"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
          </select>
        </div>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <Button onClick={previousPeriod}>Previous</Button>
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <Button onClick={nextPeriod}>Next</Button>
        </div>

        {view === 'month' && (
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="font-semibold text-center p-2 bg-dark-700 text-dark-200">
                {day}
              </div>
            ))}
            
            {days.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              return (
                <div
                  key={index}
                  className={`min-h-24 border border-dark-700 p-2 ${!date ? 'bg-dark-900' : 'bg-dark-800 hover:bg-dark-700'}`}
                >
                  {date && (
                    <>
                      <div className="font-semibold text-sm mb-1 text-dark-200">{date.getDate()}</div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded border ${getEventColor(event.type)}`}
                            title={`${event.title} - ${formatCurrency(event.amount)}`}
                          >
                            <div className="truncate">{event.title}</div>
                            <div className="font-semibold">{formatCurrency(event.amount)}</div>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-dark-400">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">All Events This Period</h3>
        <div className="space-y-2">
          {events.length === 0 ? (
            <p className="text-dark-400">No transactions in this period</p>
          ) : (
            events.map(event => (
              <div key={event.id} className="flex justify-between items-center p-3 bg-dark-700 rounded">
                <div>
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-sm text-dark-400">
                    {new Date(event.date).toLocaleDateString()} • {event.categoryName}
                  </div>
                </div>
                <div className={`font-semibold ${event.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'}`}>
                  {event.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(event.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default CalendarPage;
