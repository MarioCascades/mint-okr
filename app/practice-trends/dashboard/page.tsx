'use client'

import { useEffect, useState } from 'react'
import TopNav from '@/components/TopNav'
import { supabase } from '../../../lib/supabase'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

export default function PracticeTrendsDashboardPage() {
  const [productionData, setProductionData] = useState<any[]>([])
  const [collectionsData, setCollectionsData] = useState<any[]>([])
  const [startsData, setStartsData] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data, error } = await supabase
        .from('practice_trends_data')
        .select('*')

      if (error) {
        console.error('Dashboard Fetch Error:', error)
        return
      }

      const productionMap: any = {}
      const collectionsMap: any = {}
      const startsMap: any = {}

      data.forEach((row) => {
        const month = row.month_name
        const yearKey = `y${row.year_value}`

        if (row.metric_type === 'Production') {
          if (!productionMap[month]) {
            productionMap[month] = { month }
          }

          productionMap[month][yearKey] = Number(row.metric_value)
        }

        if (row.metric_type === 'Collections') {
          if (!collectionsMap[month]) {
            collectionsMap[month] = { month }
          }

          collectionsMap[month][yearKey] = Number(row.metric_value)
        }

        if (row.metric_type === 'Starts') {
          if (!startsMap[month]) {
            startsMap[month] = { month }
          }

          startsMap[month][yearKey] = Number(row.metric_value)
        }
      })

      setProductionData(Object.values(productionMap))
      setCollectionsData(Object.values(collectionsMap))
      setStartsData(Object.values(startsMap))
    }

    fetchDashboardData()
  }, [])

  return (
    <div style={container}>
      <TopNav />

      <div style={headerBar}>
        <h1 style={headerTitle}>
          Practice Trends Dashboard
        </h1>

        <p style={headerSubtitle}>
          Visual performance tracking for Production, Collections, and Starts
        </p>
      </div>

      <div style={topRowGrid}>
        <div style={chartCard}>
          <h2 style={sectionTitle}>Production</h2>

          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={productionData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={true}
                horizontal={true}
              />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="y2024"
                stroke="#1E266D"
                strokeWidth={3}
                name="2024"
              />

              <Line
                type="monotone"
                dataKey="y2025"
                stroke="#F26C2F"
                strokeWidth={3}
                name="2025"
              />

              <Line
                type="monotone"
                dataKey="y2026"
                stroke="#10B981"
                strokeWidth={3}
                name="2026"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={chartCard}>
          <h2 style={sectionTitle}>Collections</h2>

          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={collectionsData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={true}
                horizontal={true}
              />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="y2024"
                stroke="#1E266D"
                strokeWidth={3}
                name="2024"
              />

              <Line
                type="monotone"
                dataKey="y2025"
                stroke="#F26C2F"
                strokeWidth={3}
                name="2025"
              />

              <Line
                type="monotone"
                dataKey="y2026"
                stroke="#10B981"
                strokeWidth={3}
                name="2026"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={startsWrapper}>
        <div style={chartCard}>
          <h2 style={sectionTitle}>Starts</h2>

          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={startsData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={true}
                horizontal={true}
              />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="y2024"
                stroke="#1E266D"
                strokeWidth={3}
                name="2024"
              />

              <Line
                type="monotone"
                dataKey="y2025"
                stroke="#F26C2F"
                strokeWidth={3}
                name="2025"
              />

              <Line
                type="monotone"
                dataKey="y2026"
                stroke="#10B981"
                strokeWidth={3}
                name="2026"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

const container: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#f5f5f5cc'
}

const headerBar: React.CSSProperties = {
  backgroundColor: '#F26C2F',
  padding: 24,
  margin: 20,
  borderRadius: 14,
  boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
}

const headerTitle: React.CSSProperties = {
  fontSize: 40,
  fontWeight: 800,
  color: '#FFFFFF',
  marginBottom: 6
}

const headerSubtitle: React.CSSProperties = {
  color: '#FFFFFF',
  fontSize: 15,
  opacity: 0.95
}

const topRowGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 24,
  margin: '0 20px 32px 20px',
  alignItems: 'start'
}

const startsWrapper: React.CSSProperties = {
  width: '72%',
  margin: '0 auto 48px auto',
  display: 'flex',
  justifyContent: 'center'
}

const chartCard: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  width: '100%',
  padding: 28,
  borderRadius: 18,
  border: '2px solid #D1D5DB',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  minHeight: 500
}

const sectionTitle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
  color: '#1E266D',
  marginBottom: 16
}