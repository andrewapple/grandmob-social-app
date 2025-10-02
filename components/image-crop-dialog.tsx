"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut } from "lucide-react"

interface ImageCropDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
  onCropComplete: (croppedBlob: Blob) => void
}

export function ImageCropDialog({ open, onOpenChange, imageUrl, onCropComplete }: ImageCropDialogProps) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    },
    [isDragging, dragStart],
  )

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleCrop = async () => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to desired output (400x400 for profile photos)
    const size = 400
    canvas.width = size
    canvas.height = size

    // Calculate the crop area
    const containerWidth = 300 // Preview container size
    const scale = image.naturalWidth / (containerWidth * zoom)
    const centerX = containerWidth / 2
    const centerY = containerWidth / 2

    // Calculate source coordinates
    const sourceX = (centerX - position.x) * scale
    const sourceY = (centerY - position.y) * scale
    const sourceSize = size * scale

    // Draw the cropped image
    ctx.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size)

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob)
          onOpenChange(false)
        }
      },
      "image/jpeg",
      0.9,
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Profile Photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            ref={containerRef}
            className="relative w-[300px] h-[300px] mx-auto bg-gray-100 rounded-lg overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Circular overlay to show crop area */}
            <div className="absolute inset-0 pointer-events-none">
              <svg width="300" height="300" className="absolute inset-0">
                <defs>
                  <mask id="circleMask">
                    <rect width="300" height="300" fill="white" />
                    <circle cx="150" cy="150" r="140" fill="black" />
                  </mask>
                </defs>
                <rect width="300" height="300" fill="black" fillOpacity="0.5" mask="url(#circleMask)" />
                <circle cx="150" cy="150" r="140" fill="none" stroke="white" strokeWidth="2" />
              </svg>
            </div>

            {/* Image */}
            <img
              ref={imageRef}
              src={imageUrl || "/placeholder.svg"}
              alt="Crop preview"
              className="absolute select-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transformOrigin: "center",
                maxWidth: "none",
                width: "300px",
                height: "auto",
              }}
              draggable={false}
            />
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-3">
            <ZoomOut className="h-4 w-4 text-gray-500" />
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={0.5}
              max={3}
              step={0.1}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 text-gray-500" />
          </div>

          <p className="text-sm text-center text-gray-600">Drag to reposition, use slider to zoom</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCrop} className="bg-amber-600 hover:bg-amber-700">
            Crop & Save
          </Button>
        </DialogFooter>

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}
