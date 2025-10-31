"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CalendarEvent {
  id: string
  user_id: string
  event_name: string
  event_date: string
  event_time: string | null
  end_time: string | null
  profiles: {
    name: string
  }
}

interface EventDetailsDialogProps {
  event: CalendarEvent | null
  currentUserId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventUpdated: () => void
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

const YEARS = Array.from({ length: 151 }, (_, i) => 1900 + i)

export function EventDetailsDialog({
  event,
  currentUserId,
  open,
  onOpenChange,
  onEventUpdated,
}: EventDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [eventName, setEventName] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedDay, setSelectedDay] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedHour, setSelectedHour] = useState("")
  const [selectedMinute, setSelectedMinute] = useState("")
  const [selectedAmPm, setSelectedAmPm] = useState("AM")
  const [includeTime, setIncludeTime] = useState(false)
  const [includeEndTime, setIncludeEndTime] = useState(false)
  const [endHour, setEndHour] = useState("")
  const [endMinute, setEndMinute] = useState("")
  const [endAmPm, setEndAmPm] = useState("AM")
  const [isLoading, setIsLoading] = useState(false)

  const isOwner = event?.user_id === currentUserId

  // Initialize form when event changes or editing starts
  useEffect(() => {
    if (event && isEditing) {
      setEventName(event.event_name)

      const [year, month, day] = event.event_date.split("-")
      setSelectedMonth(MONTHS[Number.parseInt(month) - 1])
      setSelectedDay(day)
      setSelectedYear(year)

      if (event.event_time) {
        setIncludeTime(true)
        const [hours, minutes] = event.event_time.split(":")
        const hour = Number.parseInt(hours)
        const ampm = hour >= 12 ? "PM" : "AM"
        const displayHour = hour % 12 || 12
        setSelectedHour(String(displayHour))
        setSelectedMinute(minutes)
        setSelectedAmPm(ampm)
      } else {
        setIncludeTime(false)
        setSelectedHour("")
        setSelectedMinute("")
        setSelectedAmPm("AM")
      }

      if (event.end_time) {
        setIncludeEndTime(true)
        const [hours, minutes] = event.end_time.split(":")
        const hour = Number.parseInt(hours)
        const ampm = hour >= 12 ? "PM" : "AM"
        const displayHour = hour % 12 || 12
        setEndHour(String(displayHour))
        setEndMinute(minutes)
        setEndAmPm(ampm)
      } else {
        setIncludeEndTime(false)
        setEndHour("")
        setEndMinute("")
        setEndAmPm("AM")
      }
    }
  }, [event, isEditing])

  const getDaysInMonth = () => {
    if (!selectedMonth || !selectedYear) return []
    const monthIndex = MONTHS.indexOf(selectedMonth)
    const daysCount = new Date(Number.parseInt(selectedYear), monthIndex + 1, 0).getDate()
    return Array.from({ length: daysCount }, (_, i) => i + 1)
  }

  const formatTime = (time: string | null) => {
    if (!time) return null
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatTimeRange = (startTime: string | null, endTime: string | null) => {
    if (!startTime) return null
    const formattedStart = formatTime(startTime)
    if (!endTime) return formattedStart
    const formattedEnd = formatTime(endTime)
    return `${formattedStart} - ${formattedEnd}`
  }

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-")
    return `${MONTHS[Number.parseInt(month) - 1]} ${Number.parseInt(day)}, ${year}`
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!event || !eventName.trim() || !selectedMonth || !selectedDay || !selectedYear) {
      alert("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const monthIndex = MONTHS.indexOf(selectedMonth)
      const dateStr = `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`

      let timeStr = null
      if (includeTime && selectedHour && selectedMinute) {
        let hour = Number.parseInt(selectedHour)
        if (selectedAmPm === "PM" && hour !== 12) hour += 12
        if (selectedAmPm === "AM" && hour === 12) hour = 0
        timeStr = `${String(hour).padStart(2, "0")}:${selectedMinute}:00`
      }

      let endTimeStr = null
      if (includeEndTime && endHour && endMinute) {
        let hour = Number.parseInt(endHour)
        if (endAmPm === "PM" && hour !== 12) hour += 12
        if (endAmPm === "AM" && hour === 12) hour = 0
        endTimeStr = `${String(hour).padStart(2, "0")}:${endMinute}:00`
      }

      const { error } = await supabase
        .from("calendar_events")
        .update({
          event_name: eventName.trim(),
          event_date: dateStr,
          event_time: timeStr,
          end_time: endTimeStr,
        })
        .eq("id", event.id)

      if (error) throw error

      setIsEditing(false)
      onEventUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating event:", error)
      alert("Failed to update event")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!event) return

    if (!confirm("Are you sure you want to delete this event?")) {
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("calendar_events").delete().eq("id", event.id)

      if (error) throw error

      onEventUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting event:", error)
      alert("Failed to delete event")
    } finally {
      setIsLoading(false)
    }
  }

  if (!event) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-amber-900">{isEditing ? "Edit Event" : "Event Details"}</DialogTitle>
            {isOwner && !isEditing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {isEditing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="event-name" className="text-amber-900">
                Event *
              </Label>
              <Input
                id="event-name"
                placeholder="Event name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-amber-900">Date *</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedDay}
                  onValueChange={setSelectedDay}
                  required
                  disabled={!selectedMonth || !selectedYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDaysInMonth().map((day) => (
                      <SelectItem key={day} value={String(day)}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="include-time"
                  checked={includeTime}
                  onChange={(e) => {
                    setIncludeTime(e.target.checked)
                    if (!e.target.checked) {
                      setIncludeEndTime(false)
                    }
                  }}
                  className="rounded border-amber-300"
                />
                <Label htmlFor="include-time" className="text-amber-900 cursor-pointer">
                  Include time (optional)
                </Label>
              </div>

              {includeTime && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={selectedHour} onValueChange={setSelectedHour}>
                      <SelectTrigger>
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                          <SelectItem key={hour} value={String(hour)}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                      <SelectTrigger>
                        <SelectValue placeholder="Min" />
                      </SelectTrigger>
                      <SelectContent>
                        {["00", "15", "30", "45"].map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedAmPm} onValueChange={setSelectedAmPm}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="include-end-time"
                      checked={includeEndTime}
                      onChange={(e) => setIncludeEndTime(e.target.checked)}
                      className="rounded border-amber-300"
                    />
                    <Label htmlFor="include-end-time" className="text-amber-900 cursor-pointer">
                      Include end time (optional)
                    </Label>
                  </div>

                  {includeEndTime && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Select value={endHour} onValueChange={setEndHour}>
                        <SelectTrigger>
                          <SelectValue placeholder="Hour" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                            <SelectItem key={hour} value={String(hour)}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={endMinute} onValueChange={setEndMinute}>
                        <SelectTrigger>
                          <SelectValue placeholder="Min" />
                        </SelectTrigger>
                        <SelectContent>
                          {["00", "15", "30", "45"].map((minute) => (
                            <SelectItem key={minute} value={minute}>
                              {minute}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={endAmPm} onValueChange={setEndAmPm}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-amber-900">Event</Label>
              <p className="text-lg font-semibold">{event.event_name}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-amber-900">Date</Label>
              <p>{formatDate(event.event_date)}</p>
            </div>

            {event.event_time && (
              <div className="space-y-2">
                <Label className="text-amber-900">Time</Label>
                <p>{formatTimeRange(event.event_time, event.end_time)}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-amber-900">Created by</Label>
              <p>{event.profiles.name}</p>
            </div>

            {isOwner && (
              <div className="flex justify-end gap-2 pt-4 border-t border-amber-200">
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 bg-transparent"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Event
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
