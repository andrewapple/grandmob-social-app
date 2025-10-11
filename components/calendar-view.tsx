"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { AddEventDialog } from "./add-event-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CalendarEvent {
  id: string
  user_id: string
  event_name: string
  event_date: string
  event_time: string | null
  profiles: {
    name: string
  }
}

interface CalendarViewProps {
  userId: string
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const YEARS = Array.from({ length: 151 }, (_, i) => 1900 + i) // 1900-2050

export function CalendarView({ userId }: CalendarViewProps) {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [selectedMonth, selectedYear])

  const fetchEvents = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const startDate = new Date(selectedYear, selectedMonth, 1)
    const endDate = new Date(selectedYear, selectedMonth + 1, 0)

    const { data, error } = await supabase
      .from("calendar_events")
      .select(`
        *,
        profiles:user_id (name)
      `)
      .gte("event_date", startDate.toISOString().split("T")[0])
      .lte("event_date", endDate.toISOString().split("T")[0])
      .order("event_date", { ascending: true })

    if (error) {
      console.error("Error fetching events:", error)
    } else {
      setEvents(data || [])
    }
    setIsLoading(false)
  }

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((event) => event.event_date === dateStr)
  }

  const formatTime = (time: string | null) => {
    if (!time) return null
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  return (
    <div className="space-y-6">
      <Card className="border-amber-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-amber-900">Family Calendar</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number.parseInt(v))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={month} value={String(index)}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number.parseInt(v))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <AddEventDialog userId={userId} onEventAdded={fetchEvents} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-amber-600 text-center py-8">Loading calendar...</p>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center font-semibold text-amber-900 py-2 text-sm">
                  {day}
                </div>
              ))}

              {emptyDays.map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {days.map((day) => {
                const dayEvents = getEventsForDate(day)
                const isToday =
                  day === currentDate.getDate() &&
                  selectedMonth === currentDate.getMonth() &&
                  selectedYear === currentDate.getFullYear()

                return (
                  <div
                    key={day}
                    className={`aspect-square border rounded-lg p-1 ${
                      isToday ? "border-amber-500 bg-amber-100" : "border-amber-200 bg-white"
                    }`}
                  >
                    <div className="text-xs font-semibold text-amber-900 mb-1">{day}</div>
                    <div className="space-y-1 overflow-y-auto max-h-20">
                      {dayEvents.map((event) => (
                        <TooltipProvider key={event.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-xs bg-amber-600 text-white px-1 py-0.5 rounded truncate cursor-default">
                                {event.event_name}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm">
                                <p className="font-semibold">{event.event_name}</p>
                                <p className="text-xs text-gray-500">By: {event.profiles.name}</p>
                                {event.event_time && <p className="text-xs">{formatTime(event.event_time)}</p>}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
