'use client'

import TopNav from '@/components/TopNav'
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

    const productionData = [
  { month: 'Jan', y2024: 210000, y2025: 245000, y2026: 260000 },
  { month: 'Feb', y2024: 225000, y2025: 250000, y2026: 270000 },
  { month: 'Mar', y2024: 240000, y2025: 265000, y2026: 285000 },
  { month: 'Apr', y2024: 230000, y2025: 275000, y2026: 295000 }
]
    
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
          <ResponsiveContainer width="100%" height={320}>
  <LineChart data={productionData}>
    <CartesianGrid strokeDasharray="3 3" />
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
          <p>Collections graph goes here</p>
        </div>
      </div>

      <div style={startsWrapper}>
        <div style={chartCard}>
          <h2 style={sectionTitle}>Starts</h2>
          <p>Starts graph goes here</p>
        </div>
      </div>
    </div>
  )
}

const container: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#f5f5f5'
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
  padding: 24,
  borderRadius: 16,
  border: '1px solid #E5E7EB',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
}

const sectionTitle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
  color: '#1E266D',
  marginBottom: 16
}