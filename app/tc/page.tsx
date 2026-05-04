'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import TopNav from '@/components/TopNav'

//LABELMAP

const labelMap: Record<string, string> = {
  "Starts @ Home": "TC Start at Home",
  "Total Starts (Individual)": "Total Starts (Individual)",
  "SDS": "TC SDS",
  "Total Production (Individual)": "Total Production (Individual)",
  "Collections from Starts": "TC Collections from Starts",
  "Scheduled New Patients": "TC Scheduled New Patients",
  "Kept New Patients": "TC Kept New Patients",
  "Conversion Rate": "TC Conversion Rate",
  "Whitening Kits": "TC Whitening Kits",
  "Total Starts": "Total TC Starts",
  "Total Production": "TC Total Production after Discounts",
  "Total Whitening Kits": "TC Total Whitening Kits"
}
// =========================
// HELPERS
// =========================

const formatDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`

// =========================
// PAGE
// =========================

export default function Page() {

  const router = useRouter()

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const [kitsTarget, setKitsTarget] = useState(0)

  const [lastUpdated, setLastUpdated] = useState('')
  const [percentIntoPeriod, setPercentIntoPeriod] = useState('')

  const [totalStarts, setTotalStarts] = useState(0)
  const [prevStarts, setPrevStarts] = useState(0)
  const [startsTarget, setStartsTarget] = useState(0)
  const [totalProduction, setTotalProduction] = useState(0)
  const [prevProduction, setPrevProduction] = useState(0)
  const [productionTarget, setProductionTarget] = useState(0)
  const [scheduled, setScheduled] = useState(0)
  const [prevScheduled, setPrevScheduled] = useState(0)
  const [scheduledTarget, setScheduledTarget] = useState(0)
  const [kept, setKept] = useState(0)
  const [prevKept, setPrevKept] = useState(0)
  const [keptTarget, setKeptTarget] = useState(0)
  const [prevConversion, setPrevConversion] = useState(0)
  const [conversionTarget, setConversionTarget] = useState(0)
  const [kits, setKits] = useState(0)
  const [prevKits, setPrevKits] = useState(0)
  
// =========================
// CORE VARIABLES
// =========================

const reportingDate = formatDate(selectedMonth)

const isAfterMarch2026 =
  selectedMonth.getFullYear() > 2026 ||
  (selectedMonth.getFullYear() === 2026 && selectedMonth.getMonth() > 2)

const secondTC = isAfterMarch2026 ? 'Heather' : 'Olivia'


// =========================
// HELPERS (CLEAN)
// =========================

const getValue = async (user: string, title: string) => {

  const { data: row } = await supabase
    .from('dashboard_okr_data')
    .select('key_result_id')
    .eq('user_name', user)
    .eq('key_result_title', title)
    .maybeSingle()

  if (!row) return 0

  const { data } = await supabase
    .from('key_result_updates')
    .select('value')
    .eq('key_result_id', row.key_result_id)
    .eq('reporting_month', reportingDate)
    .maybeSingle()

  return Number(data?.value ?? 0)
}

const getSharedValue = async (title: string) => {

  const { data: row } = await supabase
    .from('dashboard_okr_data')
    .select('key_result_id')
    .eq('key_result_title', title)
    .maybeSingle()

  if (!row) return 0

  const { data } = await supabase
    .from('key_result_updates')
    .select('value')
    .eq('key_result_id', row.key_result_id)
    .eq('reporting_month', reportingDate)
    .maybeSingle()

  return Number(data?.value ?? 0)
}

const getSharedPrevValue = async (title: string) => {

  const prevDate = new Date(selectedMonth)
  prevDate.setMonth(prevDate.getMonth() - 1)

  const prevReportingDate = formatDate(prevDate)

  const { data: row } = await supabase
    .from('dashboard_okr_data')
    .select('key_result_id')
    .eq('key_result_title', title)
    .maybeSingle()

  if (!row) return 0

  const { data } = await supabase
    .from('key_result_updates')
    .select('value')
    .eq('key_result_id', row.key_result_id)
    .eq('reporting_month', prevReportingDate)
    .maybeSingle()

  return Number(data?.value ?? 0)
}

const getSharedTarget = async (title: string) => {

  const { data: row } = await supabase
    .from('dashboard_okr_data')
    .select('key_result_id')
    .eq('key_result_title', title)
    .maybeSingle()

  if (!row) return 0

  const { data } = await supabase
    .from('key_result_updates')
    .select('target_value')
    .eq('key_result_id', row.key_result_id)
    .eq('reporting_month', reportingDate)
    .maybeSingle()

  return Number(data?.target_value ?? 0)
}

// =========================
// PREVIOUS VALUE (USER)
// =========================
const getPrevValue = async (user: string, title: string) => {

  const prevDate = new Date(selectedMonth)
  prevDate.setMonth(prevDate.getMonth() - 1)

  const prevReportingDate = formatDate(prevDate)

  const { data: row } = await supabase
    .from('dashboard_okr_data')
    .select('key_result_id')
    .eq('user_name', user)
    .eq('key_result_title', title)
    .maybeSingle()

  if (!row) return 0

  const { data } = await supabase
    .from('key_result_updates')
    .select('value')
    .eq('key_result_id', row.key_result_id)
    .eq('reporting_month', prevReportingDate)
    .maybeSingle()

  return Number(data?.value ?? 0)
}

// =========================
// TARGET (CARRY FORWARD)
// =========================
const getTargetWithCarryForward = async (user: string, title: string) => {

  const { data: row } = await supabase
    .from('dashboard_okr_data')
    .select('key_result_id')
    .eq('user_name', user)
    .eq('key_result_title', title)
    .maybeSingle()

  if (!row) return 0

  const { data: current } = await supabase
    .from('key_result_updates')
    .select('target_value')
    .eq('key_result_id', row.key_result_id)
    .eq('reporting_month', reportingDate)
    .maybeSingle()

  if (current?.target_value !== null && current?.target_value !== undefined) {
    return Number(current.target_value)
  }

  const { data: prev } = await supabase
    .from('key_result_updates')
    .select('target_value')
    .eq('key_result_id', row.key_result_id)
    .lt('reporting_month', reportingDate)
    .not('target_value', 'is', null)
    .order('reporting_month', { ascending: false })
    .limit(1)
    .maybeSingle()

  return Number(prev?.target_value ?? 0)
}


const fetchData = async () => {

// =========================
// TOTAL STARTS (TEAM COMPUTED)
// =========================

const jordynStarts = await getValue(
  'Jordyn',
  labelMap["Total Starts (Individual)"]
)

const secondStarts = await getValue(
  secondTC,
  labelMap["Total Starts (Individual)"]
)

const totalStartsValue = jordynStarts + secondStarts

const prevJordynStarts = await getPrevValue(
  'Jordyn',
  labelMap["Total Starts (Individual)"]
)

const prevSecondStarts = await getPrevValue(
  secondTC,
  labelMap["Total Starts (Individual)"]
)

const prevStartsValue = prevJordynStarts + prevSecondStarts

const startsTargetValue = await getTargetWithCarryForward(
  'Jordyn',
  labelMap["Total Starts"]
)

setTotalStarts(totalStartsValue)
setPrevStarts(prevStartsValue)
setStartsTarget(startsTargetValue)
// =========================
// TOTAL PRODUCTION (TEAM COMPUTED)
// =========================

const jordynProduction = await getValue(
  'Jordyn',
  labelMap["Total Production (Individual)"]
)

const secondProduction = await getValue(
  secondTC,
  labelMap["Total Production (Individual)"]
)

const totalProductionValue = jordynProduction + secondProduction

const prevJordynProduction = await getPrevValue(
  'Jordyn',
  labelMap["Total Production (Individual)"]
)

const prevSecondProduction = await getPrevValue(
  secondTC,
  labelMap["Total Production (Individual)"]
)

const prevProductionValue = prevJordynProduction + prevSecondProduction

const productionTargetValue = await getTargetWithCarryForward(
  'Jordyn',
  labelMap["Total Production"]
)

setTotalProduction(totalProductionValue)
setPrevProduction(prevProductionValue)
setProductionTarget(productionTargetValue)

// =========================
// SCHEDULED NEW PATIENTS (JORDYN)
// =========================

const scheduledValue = await getValue(
  'Jordyn',
  labelMap["Scheduled New Patients"]
)

const prevScheduledValue = await getPrevValue(
  'Jordyn',
  labelMap["Scheduled New Patients"]
)

const scheduledTargetValue = await getTargetWithCarryForward(
  'Jordyn',
  labelMap["Scheduled New Patients"]
)

setScheduled(scheduledValue)
setPrevScheduled(prevScheduledValue)
setScheduledTarget(scheduledTargetValue)

// =========================
// KEPT NEW PATIENTS (TEAM SUM)
// =========================

const jordynKept = await getValue(
  'Jordyn',
  labelMap["Kept New Patients"]
)

const secondKept = await getValue(
  secondTC,
  labelMap["Kept New Patients"]
)

const keptValue = jordynKept + secondKept

const prevJordynKept = await getPrevValue(
  'Jordyn',
  labelMap["Kept New Patients"]
)

const prevSecondKept = await getPrevValue(
  secondTC,
  labelMap["Kept New Patients"]
)

const prevKeptValue = prevJordynKept + prevSecondKept

const keptTargetValue = 
  (await getTargetWithCarryForward('Jordyn', labelMap["Kept New Patients"])) +
  (await getTargetWithCarryForward(secondTC, labelMap["Kept New Patients"]))

setKept(keptValue)
setPrevKept(prevKeptValue)
setKeptTarget(keptTargetValue)

// =========================
// CONVERSION RATE (TEAM AVG)
// =========================

const jordynConversion = await getValue(
  'Jordyn',
  labelMap["Conversion Rate"]
)

const secondConversion = await getValue(
  secondTC,
  labelMap["Conversion Rate"]
)

const conversionValue = (jordynConversion + secondConversion) / 2

const prevJordynConversion = await getPrevValue(
  'Jordyn',
  labelMap["Conversion Rate"]
)

const prevSecondConversion = await getPrevValue(
  secondTC,
  labelMap["Conversion Rate"]
)

const prevConversionValue =
  (prevJordynConversion + prevSecondConversion) / 2

const conversionTargetValue =
  (
    (await getTargetWithCarryForward('Jordyn', labelMap["Conversion Rate"])) +
    (await getTargetWithCarryForward(secondTC, labelMap["Conversion Rate"]))
  ) / 2

setPrevConversion(prevConversionValue)
setConversionTarget(conversionTargetValue)

// IMPORTANT: DO NOT set "conversion" here
// your UI already calculates it below

// =========================
// TOTAL WHITENING KITS (TEAM COMPUTED)
// =========================

const jordynKits = await getValue(
  'Jordyn',
  labelMap["Whitening Kits"]
)

const secondKits = await getValue(
  secondTC,
  labelMap["Whitening Kits"]
)

const kitsValue = jordynKits + secondKits

const prevJordynKits = await getPrevValue(
  'Jordyn',
  labelMap["Whitening Kits"]
)

const prevSecondKits = await getPrevValue(
  secondTC,
  labelMap["Whitening Kits"]
)

const prevKitsValue = prevJordynKits + prevSecondKits

const kitsTargetValue = await getTargetWithCarryForward(
  'Jordyn',
  labelMap["Total Whitening Kits"]
)

setKits(kitsValue)
setPrevKits(prevKitsValue)
setKitsTarget(kitsTargetValue)

// =========================
// EFFECTS (CORRECT LOCATION)
// =========================

useEffect(() => {
  const today = new Date()
  const year = selectedMonth.getFullYear()
  const month = selectedMonth.getMonth()
  const endOfMonth = new Date(year, month + 1, 0)

  let percent = 0

  if (today.getFullYear() === year && today.getMonth() === month) {
    percent = (today.getDate() / endOfMonth.getDate()) * 100
  } else if (today > endOfMonth) {
    percent = 100
  }

  setPercentIntoPeriod(Math.round(percent) + '%')
}, [selectedMonth])

useEffect(() => {
  const fetchLastUpdated = async () => {
    const { data } = await supabase
      .from('key_result_updates')
      .select('last_updated_at')
      .order('last_updated_at', { ascending: false })
      .limit(1)

    if (data && data.length > 0) {
      const formatted = new Date(data[0].last_updated_at).toLocaleString()
      setLastUpdated(formatted)
    }
  }

  fetchLastUpdated()
}, [])

useEffect(() => {
  fetchData()
}, [selectedMonth])

  // =========================
  // MONTH NAV
  // =========================

  const changeMonth = (offset: number) => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + offset)
      return newDate
    })
  }

  const formatMonth = (date: Date) =>
    date.toLocaleString('default', { month: 'short', year: 'numeric' })

const conversion =
  scheduled > 0
    ? (kept / scheduled) * 100
    : 0

 console.log("Conversion label:", labelMap["Conversion Rate"])

  // =========================
  // UI
  // =========================

  return (
    <div style={container}>
      <TopNav />
{/* HEADER */}
<div style={headerBar}>

  <h1 style={headerTitle}>
    Treatment Coordinator Team Overview
  </h1>

  <div style={headerMeta}>

    {/* LEFT SIDE */}
    <div
      style={{
        display: 'flex',
        gap: 24,
        alignItems: 'flex-start'
      }}
    >
      <div>
        <div style={headerLabel}>Date Updated</div>
        <div style={metaInput}>{lastUpdated || '—'}</div>
      </div>

      <div>
        <div style={headerLabel}>% Into Period</div>
        <input
          value={percentIntoPeriod}
          readOnly
          style={metaInput}
        />
      </div>
    </div>

    {/* RIGHT SIDE */}
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 12
      }}
    >
      <button
        style={backButton}
        onClick={() => router.push('/')}
      >
        ← Back to Main
      </button>

      <div>
        <div style={headerLabel}>OKR Timeframe</div>

        <div style={monthSelector}>
          <button
            style={monthButton}
            onClick={() => changeMonth(-1)}
          >
            ←
          </button>

          <span style={monthText}>
            {formatMonth(selectedMonth)}
          </span>

          <button
            style={monthButton}
            onClick={() => changeMonth(1)}
          >
            →
          </button>
        </div>
      </div>
    </div>

  </div>
</div>

      {/* CARDS */}
      <div style={grid}>

        <Card 
  title="Total Start Performance" 
  value={totalStarts} 
  prev={prevStarts}
  target={startsTarget}
  setTarget={setStartsTarget}
 
/>
        <Card
  title="Total Production"
  value={`$${Number(totalProduction || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
  prev={`$${Number(prevProduction || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
  target={productionTarget}
  setTarget={setProductionTarget}
 

/>
        <Card 
  title="Scheduled New Patients" 
  value={scheduled}
  prev={prevScheduled}
  target={scheduledTarget}
  setTarget={setScheduledTarget}
  

/>
        <Card 
  title="Kept New Patients" 
  value={kept}
  prev={prevKept}
  target={keptTarget}
  setTarget={setKeptTarget}
  

/>

        <Card 
  title="New Patient Conversion" 
  value={`${conversion.toFixed(0)}%`}
  prev={`${prevConversion.toFixed(0)}%`}
  target={conversionTarget}
  setTarget={setConversionTarget}
  
/>
        <Card 
  title="Total Whitening Kits" 
  value={kits}
  prev={prevKits}
  target={kitsTarget}
  setTarget={setKitsTarget}

/>

      </div>

      {/* NOTES */}
      <div style={notesSection}>
        <label>Notes / Remarks</label>
        <textarea style={notesInput} />
      </div>

    </div>
  )
}

// =========================
// CARD
// =========================
const Card = ({ title, value, prev = 0, target = 0 }: any) => {
  
  const isCurrency = title.toLowerCase().includes('production')
const isPercent = title.toLowerCase().includes('conversion')

const formatValue = (val: any) => {
  const parsed = Number(val)
  const num = isNaN(parsed) ? 0 : parsed

  if (isCurrency) {
    return '$' + num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  if (isPercent) {
    return `${Math.round(num)}%`
  }

  return num
}
const cleaned = Number(
  String(value).replace(/[^0-9.-]+/g, '')
)

const numericValue = isNaN(cleaned) ? 0 : cleaned

  const percent =
    Number(target) > 0
      ? (numericValue / Number(target)) * 100
      : 0

  const getResultBackground = () => {
    if (percent >= 100) {
      return '#acf3c3d7' // green
    }

    if (percent >= 90) {
      return '#fff4ccf3' // yellow
    }

    return '#f3b8b8d8' // red
  }

  return (
    <div style={card}>
      <div style={cardTitle}>{title}</div>

      <div style={cardHeader}>
        <span>Prev</span>
        <span>Target</span>
        <span>Current</span>
        <span>Result</span>
      </div>

      <div style={cardRow}>
        <input
          style={prevCardCell}
          value={formatValue(prev)}
          readOnly
        />

        <input
          style={targetCardCell}
          value={formatValue(target)}
          readOnly
        />

        <input
          style={currentCardCell}
          value={formatValue(value)}
          readOnly
        />

        <input
          style={{
            ...cardCell,
            backgroundColor: getResultBackground(),
            fontWeight: 800,
            color: '#1E266D'
          }}
          value={
            Number(target) > 0
              ? `${Math.round(percent)}%`
              : ''
          }
          readOnly
        />
      </div>
    </div>
  )
}
  

// ================= STYLES =================

const COLORS = {
  navy: '#1E266D',
  orange: '#F26C2F',
  white: '#FFFFFF',
  lightGray: '#f5f5f5d5',
  border: '#F6A27A',
  text: '#1F2937',
  muted: '#6B7280'
}

const container: React.CSSProperties = {
  backgroundColor: COLORS.lightGray,
  color: COLORS.text,
  minHeight: '100vh'
}

const headerBar: React.CSSProperties = {
  backgroundColor: COLORS.orange,
  padding: 24,
  margin: 20,
  borderRadius: 14,
  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
  position: 'sticky',
  top: 60,
  zIndex: 50
}


const headerTitle: React.CSSProperties = {
  fontSize: 42,
  fontWeight: 800,
  color: COLORS.white
}

const backButton: React.CSSProperties = {
  backgroundColor: '#1F2937',
  border: 'none',
  borderRadius: 10,
  padding: '10px 18px',
  color: COLORS.white,
  fontWeight: 700,
  cursor: 'pointer'
}

const headerMeta: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 24,
  flexWrap: 'wrap'
}


const metaInput: React.CSSProperties = {
  padding: 10,
  backgroundColor: COLORS.white,
  color: COLORS.text,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  minWidth: 160
}

const monthSelector: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  backgroundColor: 'rgba(255,255,255,0.18)',
  padding: '10px 18px',
  borderRadius: 12,
  width: 'fit-content'
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 20,
  padding: '0 20px'
}

const card: React.CSSProperties = {
  backgroundColor: '#E5E5E5',
  padding: 20,
  borderRadius: 18,
  border: '1px solid #F6A27A',
  boxShadow: '0 12px 30px rgba(0,0,0,0.10)'
}

const cardTitle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: 18,
  fontWeight: 800,
  fontSize: 30,
  color: COLORS.navy
}

const cardHeader: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 8,
  fontSize: 13,
  fontWeight: 700,
  color: COLORS.muted,
  marginBottom: 10,
  textAlign: 'center'
}

const cardRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 8
}

const cardCell: React.CSSProperties = {
  width: '100%',
  padding: 12,
  backgroundColor: '#F8FAFC',
  color: COLORS.text,
  border: '1px solid #F6A27A',
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 600,
  textAlign: 'center'
}
const prevCardCell: React.CSSProperties = {
  ...cardCell,
  backgroundColor: '#cacacada'
}

const targetCardCell: React.CSSProperties = {
  ...cardCell,
  backgroundColor: '#9c9dfd'
}

const currentCardCell: React.CSSProperties = {
  ...cardCell,
  backgroundColor: '#FFFFFF'
}

const notesSection: React.CSSProperties = {
  backgroundColor: '#E5E5E5',
  padding: 28,
  margin: 20,
  marginTop: 24,
  borderRadius: 20,
  border: '1px solid #F6A27A'
}

const notesInput: React.CSSProperties = {
  width: '100%',
  minHeight: 160,
  padding: 20,
  fontSize: 16,
  color: COLORS.navy,
  backgroundColor: '#F8FAFC',
  border: '1px solid #F6A27A',
  borderRadius: 16,
  resize: 'vertical'
}
const headerLabel: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: COLORS.white,
  marginBottom: 6
}

const monthButton: React.CSSProperties = {
  backgroundColor: '#1E266D',
  border: 'none',
  borderRadius: 10,
  width: 40,
  height: 40,
  cursor: 'pointer',
  fontWeight: 800,
  fontSize: 18,
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const monthText: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 18,
  color: '#FFFFFF',
  minWidth: 110,
  textAlign: 'center'
}