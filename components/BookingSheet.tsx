"use client"

import React, { useState } from 'react'
import { X, Calendar, Users, MessageSquare } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface BookingSheetProps {
  isOpen: boolean
  onClose: () => void
  destinationId: number
  destinationName: string
}

export default function BookingSheet({ isOpen, onClose, destinationId, destinationName }: BookingSheetProps) {
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    check_in_date: new Date(),
    check_out_date: new Date(),
    number_of_guests: 1,
    special_requests: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const getThemeClasses = () => {
    if (theme === 'light') {
      return 'bg-white text-gray-900 border-gray-200'
    } else if (theme === 'dim') {
      return 'bg-slate-800 text-slate-100 border-slate-700'
    } else {
      return 'bg-gray-900 text-gray-100 border-gray-700'
    }
  }

  const getOverlayClasses = () => {
    if (theme === 'light') {
      return 'bg-black/20'
    } else {
      return 'bg-black/50'
    }
  }

  const getInputClasses = () => {
    if (theme === 'light') {
      return 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
    } else if (theme === 'dim') {
      return 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400'
    } else {
      return 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Get token from localStorage
      const token = localStorage.getItem('authToken')
      
      const response = await fetch('http://localhost:8000/api/v1/destination-bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          destination_id: destinationId,
          check_in_date: formData.check_in_date instanceof Date ? formData.check_in_date.toISOString().split('T')[0] : formData.check_in_date,
          check_out_date: formData.check_out_date instanceof Date ? formData.check_out_date.toISOString().split('T')[0] : formData.check_out_date,
          number_of_guests: formData.number_of_guests,
          special_requests: formData.special_requests || ''
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess('Booking created successfully!')
        // Reset form
        setFormData({
          check_in_date: new Date(),
          check_out_date: new Date(),
          number_of_guests: 1,
          special_requests: ''
        })
        // Close sheet after 2 seconds
        setTimeout(() => {
          onClose()
          setSuccess('')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || errorData.error || 'Failed to create booking')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'number_of_guests' ? parseInt(value) || 1 : value
    }))
  }

  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      [name]: date || new Date()
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div 
        className={`absolute inset-0 ${getOverlayClasses()} transition-opacity duration-300`}
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className={`relative ml-auto h-full w-full max-w-md shadow-xl ${getThemeClasses()} transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'light' ? 'border-gray-200' : theme === 'dim' ? 'border-slate-700' : 'border-gray-700'}`}>
          <div>
            <h2 className="text-xl font-semibold">Book Destination</h2>
            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : theme === 'dim' ? 'text-slate-400' : 'text-gray-400'}`}>
              {destinationName}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${theme === 'light' ? 'hover:bg-gray-100' : theme === 'dim' ? 'hover:bg-slate-700' : 'hover:bg-gray-800'}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Check-in Date */}
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
              <Calendar className="h-4 w-4" />
              Check-in Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left ${getInputClasses()} focus:outline-none focus:ring-2`}
                >
                  <span className={formData.check_in_date ? '' : 'opacity-60'}>
                    {formData.check_in_date instanceof Date 
                      ? formData.check_in_date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Select check-in date'
                    }
                  </span>
                  <Calendar className="h-4 w-4 opacity-60" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.check_in_date}
                  onSelect={(date) => handleDateChange('check_in_date', date)}
                  disabled={(date) => date < new Date()}
                  className="rounded-lg border"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-out Date */}
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
              <Calendar className="h-4 w-4" />
              Check-out Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left ${getInputClasses()} focus:outline-none focus:ring-2`}
                >
                  <span className={formData.check_out_date ? '' : 'opacity-60'}>
                    {formData.check_out_date instanceof Date 
                      ? formData.check_out_date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Select check-out date'
                    }
                  </span>
                  <Calendar className="h-4 w-4 opacity-60" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.check_out_date}
                  onSelect={(date) => handleDateChange('check_out_date', date)}
                  disabled={(date) => date < new Date() || date < formData.check_in_date}
                  className="rounded-lg border"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Number of Guests */}
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
              <Users className="h-4 w-4" />
              Number of Guests
            </label>
            <input
              type="number"
              name="number_of_guests"
              value={formData.number_of_guests}
              onChange={handleInputChange}
              min="1"
              max="10"
              required
              className={`w-full rounded-lg border px-4 py-3 ${getInputClasses()} focus:outline-none focus:ring-2`}
            />
          </div>

          {/* Special Requests */}
          <div>
            <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
              <MessageSquare className="h-4 w-4" />
              Special Requests (Optional)
            </label>
            <textarea
              name="special_requests"
              value={formData.special_requests}
              onChange={handleInputChange}
              rows={4}
              placeholder="Any special requests or preferences..."
              className={`w-full rounded-lg border px-4 py-3 ${getInputClasses()} focus:outline-none focus:ring-2 resize-none`}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-100 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 rounded-lg bg-green-100 border border-green-200 text-green-700">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Creating Booking...' : 'Book Now'}
          </button>
        </form>
      </div>
    </div>
  )
}
