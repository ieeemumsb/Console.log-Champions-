"use client"

import { createContext, useContext, useState, ReactNode } from 'react'
import { DepartmentSummary, AlertItem } from './type'

interface DataStore {
    dashboardData: DepartmentSummary[]
    alerts: AlertItem[]
    setDashboardData: (data: DepartmentSummary[]) => void
    setAlerts: (alerts: AlertItem[]) => void
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
}

const DataContext = createContext<DataStore | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
    const [dashboardData, setDashboardData] = useState<DepartmentSummary[]>([])
    const [alerts, setAlerts] = useState<AlertItem[]>([])
    const [isLoading, setIsLoading] = useState(false)

    return (
        <DataContext.Provider value={{
            dashboardData,
            alerts,
            setDashboardData,
            setAlerts,
            isLoading,
            setIsLoading
        }}>
            {children}
        </DataContext.Provider>
    )
}

export function useDataStore() {
    const context = useContext(DataContext)
    if (context === undefined) {
        throw new Error('useDataStore must be used within a DataProvider')
    }
    return context
}
