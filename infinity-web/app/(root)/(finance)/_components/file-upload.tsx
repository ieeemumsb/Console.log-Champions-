"use client"

import { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useDropzone } from 'react-dropzone'
import { cn } from "@/lib/utils"

interface FileUploadProps {
    onDataProcessed: (data: any) => void
    useAI?: boolean
}

export function FileUpload({ onDataProcessed, useAI = false }: FileUploadProps) {
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const processFile = async (file: File) => {
        setIsProcessing(true)
        setStatus('processing')
        setProgress(10)
        setMessage('Reading Excel file...')

        try {
            const formData = new FormData()
            formData.append('file', file)

            setProgress(30)
            setMessage(useAI ? 'Cleaning data with OpenAI...' : 'Processing financial data...')

            const response = await fetch(`/api/process-data?useAI=${useAI}`, {
                method: 'POST',
                body: formData,
            })

            setProgress(70)

            if (!response.ok) {
                throw new Error('Failed to process file')
            }

            const result = await response.json()
            setProgress(90)
            setMessage('Finalizing dashboard data...')

            setTimeout(() => {
                setProgress(100)
                setStatus('success')
                setMessage(`Successfully processed ${result.recordCount} records from ${result.departmentCount} departments`)
                onDataProcessed(result.data)
            }, 500)

        } catch (error) {
            console.error('Error processing file:', error)
            setStatus('error')
            setMessage('Failed to process file. Please try again.')
        } finally {
            setIsProcessing(false)
            setTimeout(() => {
                setProgress(0)
                setStatus('idle')
                setMessage('')
            }, 3000)
        }
    }

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            await processFile(acceptedFiles[0])
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
        },
        maxFiles: 1,
        disabled: isProcessing
    })

    const getStatusIcon = () => {
        switch (status) {
            case 'processing':
                return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            case 'success':
                return <CheckCircle className="h-6 w-6 text-green-500" />
            case 'error':
                return <AlertCircle className="h-6 w-6 text-red-500" />
            default:
                return <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Financial Data
                </CardTitle>
                <CardDescription>
                    Upload your Stark Industries financial Excel file to generate the dashboard
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                        isProcessing && "cursor-not-allowed opacity-50"
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="space-y-4">
                        {getStatusIcon()}

                        {status === 'idle' && (
                            <>
                                <div>
                                    <p className="text-lg font-medium">
                                        {isDragActive ? "Drop the file here" : "Drag & drop your Excel file here"}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        or click to browse files
                                    </p>
                                </div>
                                <Button variant="outline" disabled={isProcessing}>
                                    Select File
                                </Button>
                            </>
                        )}

                        {(status === 'processing' || status === 'success' || status === 'error') && (
                            <div className="space-y-3">
                                <p className="text-sm font-medium">{message}</p>
                                {isProcessing && (
                                    <Progress value={progress} className="w-full" />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {useAI && (
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            <span className="font-medium">AI Enhanced:</span> Using OpenAI to clean and optimize your data
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
