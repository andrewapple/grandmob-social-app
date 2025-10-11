"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Gift } from "lucide-react"

interface WishlistDialogProps {
  onSubmit: (item: string, description: string, link: string) => Promise<void>
  trigger?: React.ReactNode
}

export function WishlistDialog({ onSubmit, trigger }: WishlistDialogProps) {
  const [open, setOpen] = useState(false)
  const [item, setItem] = useState("")
  const [description, setDescription] = useState("")
  const [link, setLink] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!item.trim()) {
      alert("Please enter an item name")
      return
    }

    setIsLoading(true)
    try {
      await onSubmit(item.trim(), description.trim(), link.trim())
      setItem("")
      setDescription("")
      setLink("")
      setOpen(false)
    } catch (error) {
      console.error("Error adding wishlist item:", error)
      alert("Failed to add wishlist item")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-900 hover:bg-amber-50 bg-transparent"
          >
            <Gift className="h-4 w-4 mr-2" />
            Add Wishlist Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-900">Add to Wishlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item" className="text-amber-900">
              Item *
            </Label>
            <Input
              id="item"
              placeholder="What do you wish for?"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-amber-900">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add details about the item..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link" className="text-amber-900">
              Link
            </Label>
            <Input
              id="link"
              type="url"
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
              {isLoading ? "Adding..." : "Add to Wishlist"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
