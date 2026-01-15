"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [fileName, setFileName] = useState("")

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setFileName(selectedFile.name)
      setStatus("idle")
      setErrorMessage("")
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const droppedFile = event.dataTransfer.files?.[0]
    if (droppedFile) {
      setFile(droppedFile)
      setFileName(droppedFile.name)
      setStatus("idle")
      setErrorMessage("")
    }
  }

  const handleProcess = async () => {
    if (!file) return

    setIsProcessing(true)
    setStatus("loading")
    setErrorMessage("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Simulate brief loading state before actual processing
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStatus("processing")

      const response = await fetch("/api/reformat", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to process file")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "reformatted_data.xlsx"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setStatus("success")
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-4xl font-bold">Saavi's Data Kitchen</CardTitle>
          <CardDescription className="text-purple-100">
            Upload your Excel file and let's cook some reformatted data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="border-b pb-6">
            <label className="text-sm font-semibold block mb-4">Status</label>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-6 flex flex-col items-center gap-4">
              <div className="h-24 w-24 relative rounded-lg overflow-hidden shadow-md border-4 border-white dark:border-slate-600">
                {status === "idle" && !file && (
                  <img src="/images/wtf.jpg" alt="Ready - WTF expression" className="w-full h-full object-cover" />
                )}
                {status === "idle" && file && (
                  <img src="/images/relax.jpg" alt="Ready to cook - Relaxing" className="w-full h-full object-cover" />
                )}
                {status === "loading" && (
                  <img src="/images/relax.jpg" alt="Loading - Relaxing" className="w-full h-full object-cover" />
                )}
                {status === "processing" && (
                  <img src="/images/relax.jpg" alt="Processing - Relaxing" className="w-full h-full object-cover" />
                )}
                {status === "success" && (
                  <img src="/images/happy.jpg" alt="Success - Happy" className="w-full h-full object-cover" />
                )}
                {status === "error" && (
                  <img src="/images/wtf.jpg" alt="Error - WTF expression" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="text-center">
                {status === "idle" && !file && (
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Ready to cook your data</p>
                )}
                {status === "idle" && file && (
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    File ready, hit the button to start cooking!
                  </p>
                )}
                {status === "loading" && (
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Getting ready...</p>
                )}
                {status === "processing" && (
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Cooking... sit back and relax</p>
                )}
                {status === "success" && (
                  <p className="font-semibold text-green-600 dark:text-green-400">Data is ready!</p>
                )}
                {status === "error" && (
                  <p className="font-semibold text-red-600 dark:text-red-400">Oops! Something went wrong</p>
                )}
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Step 1: Upload Your File</label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" id="file-input" />
              <label htmlFor="file-input" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-purple-600 dark:text-purple-400 mb-2" />
                <p className="text-sm font-medium">
                  {fileName ? `Selected: ${fileName}` : "Drag and drop your file here"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
              </label>
            </div>
          </div>

          {/* Status Messages */}
          {status === "success" && (
            <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-800 dark:text-green-200">
                File processed successfully! Your download should start automatically.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
            </div>
          )}

          {/* Process Button */}
          <Button
            onClick={handleProcess}
            disabled={!file || isProcessing}
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cooking...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Start Cooking
              </>
            )}
          </Button>

          {/* Info Section */}
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground">
              <strong>What this does:</strong> Reformats your Excel file by extracting specific columns and organizing
              data into repeating blocks. Your original file will not be modified.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
