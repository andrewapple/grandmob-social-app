"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AddEventDialogProps {
  userId: string
  onEventAdded: () => void
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

export function AddEventDialog({ userId, onEventAdded }: AddEventDialogProps) {
  const [open, setOpen] = useState(false)
  const [eventName, setEventName] = useState("")
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[currentDate.getMonth()])
  const [selectedDay, setSelectedDay] = useState(String(currentDate.getDate()))
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))
  const [selectedHour, setSelectedHour] = useState("")
  const [selectedMinute, setSelectedMinute] = useState("")
  const [selectedAmPm, setSelectedAmPm] = useState("AM")
  const [includeTime, setIncludeTime] = useState(false)
  const [includeEndTime, setIncludeEndTime] = useState(false)
  const [endHour, setEndHour] = useState("")
  const [endMinute, setEndMinute] = useState("")
  const [endAmPm, setEndAmPm] = useState("AM")
  const [addToFeed, setAddToFeed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const getDaysInMonth = () => {
    if (!selectedMonth || !selectedYear) return []
    const monthIndex = MONTHS.indexOf(selectedMonth)
    const daysCount = new Date(Number.parseInt(selectedYear), monthIndex + 1, 0).getDate()
    return Array.from({ length: daysCount }, (_, i) => i + 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!eventName.trim() || !selectedMonth || !selectedDay || !selectedYear) {
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

      const { error } = await supabase.from("calendar_events").insert({
        user_id: userId,
        event_name: eventName.trim(),
        event_date: dateStr,
        event_time: timeStr,
        end_time: endTimeStr,
      })

      if (error) throw error

      if (addToFeed) {
        const formattedDate = `${selectedMonth} ${String(selectedDay).padStart(2, "0")}, ${selectedYear}`
        let formattedTime = ""
        if (timeStr) {
          const [hours, minutes] = timeStr.split(":")
          const hour = Number.parseInt(hours)
          const ampm = hour >= 12 ? "PM" : "AM"
          const displayHour = hour % 12 || 12
          formattedTime = ` ${displayHour}:${minutes} ${ampm}`

          if (endTimeStr) {
            const [endHours, endMinutes] = endTimeStr.split(":")
            const endHourNum = Number.parseInt(endHours)
            const endAmpm = endHourNum >= 12 ? "PM" : "AM"
            const endDisplayHour = endHourNum % 12 || 12
            formattedTime += ` - ${endDisplayHour}:${endMinutes} ${endAmpm}`
          }
        }

        const postContent = `Event Added: ${eventName.trim()} - ${formattedDate}${formattedTime}`

        const { error: postError } = await supabase.from("posts").insert({
          author_id: userId,
          content: postContent,
          image_url: null,
          video_url: null,
        })

        if (postError) {
          console.error("Error creating post:", postError)
        }
      }

      setEventName("")
      setSelectedMonth("")
      setSelectedDay("")
      setSelectedYear("")
      setSelectedHour("")
      setSelectedMinute("")
      setSelectedAmPm("AM")
      setIncludeTime(false)
      setIncludeEndTime(false)
      setEndHour("")
      setEndMinute("")
      setEndAmPm("AM")
      setAddToFeed(false)
      setOpen(false)
      onEventAdded()
    } catch (error) {
      console.error("Error adding event:", error)
      alert("Failed to add event")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-600 hover:bg-amber-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-900">Add Calendar Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="add-to-feed"
                checked={addToFeed}
                onChange={(e) => setAddToFeed(e.target.checked)}
                className="rounded border-amber-300"
              />
              <Label htmlFor="add-to-feed" className="text-amber-900 cursor-pointer">
                Add to feed
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
              {isLoading ? "Adding..." : "Add Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
