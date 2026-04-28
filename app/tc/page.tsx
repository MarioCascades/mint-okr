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
  // % INTO PERIOD
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

  // =========================
  // FETCH DATA TRIGGER
  // =========================

  useEffect(() => {
    fetchData()
  }, [selectedMonth])

  // =========================
  // FETCH DATA (TEAM TOTALS)
  // =========================

  const fetchData = async () => {

    const reportingDate = formatDate(selectedMonth)

  const getTargetWithCarryForward = async (user: string, krTitle: string) => {

  const { data: row } = await supabase
    .from('dashboard_okr_data')
    .select('key_result_id')
    .eq('user_name', user)
    .eq('key_result_title', krTitle)
    .maybeSingle()

  if (!row) return 0

  const { data: current } = await supabase
    .from('key_result_updates')
    .select('target_value')
    .eq('key_result_id', row.key_result_id)
    .eq('reporting_month', formatDate(selectedMonth))
    .maybeSingle()

  if (current?.target_value !== null && current?.target_value !== undefined) {
    return Number(current.target_value)
  }

  const { data: prev } = await supabase
    .from('key_result_updates')
    .select('target_value')
    .eq('key_result_id', row.key_result_id)
    .lt('reporting_month', formatDate(selectedMonth))
    .not('target_value', 'is', null)
    .order('reporting_month', { ascending: false })
    .limit(1)
    .maybeSingle()

  return Number(prev?.target_value ?? 0)
}
   

    // =========================
    // GET VALUE HELPER
    // =========================

    const getValue = async (user: string, krTitle: string) => {
  
      const { data: row } = await supabase
        .from('dashboard_okr_data')
        .select('key_result_id')
        .eq('user_name', user)
        .eq('key_result_title', krTitle)
        .maybeSingle()

      if (!row) return 0

      const { data: update } = await supabase
        .from('key_result_updates')
        .select('value')
        .eq('key_result_id', row.key_result_id)
        .eq('reporting_month', reportingDate)
        .maybeSingle()

      return Number(update?.value ?? 0)
    }
    // =========================
// GET PREVIOUS VALUE
// =========================

const getPrevValue = async (user: string, krTitle: string) => {

  const prevDate = new Date(selectedMonth)
  prevDate.setMonth(prevDate.getMonth() - 1)

  const prevReportingDate = formatDate(prevDate)

  const { data: row } = await supabase
    .from('dashboard_okr_data')
    .select('key_result_id')
    .eq('user_name', user)
    .eq('key_result_title', krTitle)
    .maybeSingle()

  if (!row) return 0

  const { data: update } = await supabase
    .from('key_result_updates')
    .select('value')
    .eq('key_result_id', row.key_result_id)
    .eq('reporting_month', prevReportingDate)
    .maybeSingle()

  return Number(update?.value ?? 0)
}

    // =========================
    // TOTAL STARTS
    // =========================

    const jordynStarts = await getValue('Jordyn', 'Total Starts (Individual)')
    const oliviaStarts = await getValue('Olivia', 'Total Starts (Individual)')

    setTotalStarts(jordynStarts + oliviaStarts)

    const prevJStarts = await getPrevValue('Jordyn', 'Total Starts (Individual)')
    const prevOStarts = await getPrevValue('Olivia', 'Total Starts (Individual)')

    console.log("PREV JORDYN:", prevJStarts)
    console.log("PREV OLIVIA:", prevOStarts)

    setPrevStarts(prevJStarts + prevOStarts)


const jordynStartsTarget = await getTargetWithCarryForward(
  'Jordyn',
  labelMap["Total Starts (Individual)"]
)

const oliviaStartsTarget = await getTargetWithCarryForward(
  'Olivia',
  labelMap["Total Starts (Individual)"]
)

setStartsTarget(jordynStartsTarget + oliviaStartsTarget)
    // =========================
    // TOTAL PRODUCTION
    // =========================

    const jordynProduction = await getValue('Jordyn', 'Total Production (Individual)')
    const oliviaProduction = await getValue('Olivia', 'Total Production (Individual)')

    setTotalProduction(jordynProduction + oliviaProduction)
    const prevJProduction = await getPrevValue('Jordyn', 'Total Production (Individual)')
    const prevOProduction = await getPrevValue('Olivia', 'Total Production (Individual)')

    setPrevProduction(prevJProduction + prevOProduction)

  

const jordynProdTarget = await getTargetWithCarryForward('Jordyn', 'Total Production (Individual)')
const oliviaProdTarget = await getTargetWithCarryForward('Olivia', 'Total Production (Individual)')

setProductionTarget(jordynProdTarget + oliviaProdTarget)

    // =========================
    // SCHEDULED NEW PATIENTS
    // =========================

    const jordynScheduled = await getValue('Jordyn', labelMap["Scheduled New Patients"])
const oliviaScheduled = await getValue('Olivia', labelMap["Scheduled New Patients"])

    setScheduled(jordynScheduled + oliviaScheduled)

    const prevJScheduled = await getPrevValue('Jordyn', labelMap["Scheduled New Patients"])
const prevOScheduled = await getPrevValue('Olivia', labelMap["Scheduled New Patients"])

    setPrevScheduled(prevJScheduled + prevOScheduled)

    const scheduledTargetValue = await getTargetWithCarryForward(
  'Jordyn',
  labelMap["Scheduled New Patients"]
)

setScheduledTarget(scheduledTargetValue)

    // =========================
    // KEPT NEW PATIENTS
    // =========================

    const jordynKept = await getValue('Jordyn', labelMap['Kept New Patients'])
    const oliviaKept = await getValue('Olivia', labelMap['Kept New Patients'])

    setKept(jordynKept + oliviaKept)

    const prevJKept = await getPrevValue('Jordyn', labelMap["Kept New Patients"])
    const prevOKept = await getPrevValue('Olivia', labelMap["Kept New Patients"])

    setPrevKept(prevJKept + prevOKept)

    const jordynKeptTarget = await getTargetWithCarryForward('Jordyn', labelMap["Kept New Patients"])
    const oliviaKeptTarget = await getTargetWithCarryForward('Olivia', labelMap["Kept New Patients"])

    setKeptTarget(jordynKeptTarget + oliviaKeptTarget)

    // =========================
    // CONVERSION RATE
    // =========================

      const prevConversionValue = (prevJScheduled + prevOScheduled)
  ? ((prevJKept + prevOKept) / (prevJScheduled + prevOScheduled)) * 100
  : 0
      setPrevConversion(prevConversionValue)

     const jordynConversionTarget = await getTargetWithCarryForward(
  'Jordyn',
  labelMap["Conversion Rate"]
)

const oliviaConversionTarget = await getTargetWithCarryForward(
  'Olivia',
  labelMap["Conversion Rate"]
)

setConversionTarget(
  (jordynConversionTarget + oliviaConversionTarget) / 2
)

      const jordynKits = await getValue('Jordyn', labelMap["Whitening Kits"])
      const oliviaKits = await getValue('Olivia', labelMap["Whitening Kits"])

    setKits(jordynKits + oliviaKits)

     

     // =========================
    // TOTAL WHITENING KITS
    // =========================
    

    const prevJKits = await getPrevValue('Jordyn', labelMap["Whitening Kits"])
    const prevOKits = await getPrevValue('Olivia', labelMap["Whitening Kits"])

    setPrevKits(prevJKits + prevOKits)

      const jordynKitsTarget = await getTargetWithCarryForward(
  'Jordyn',
  labelMap["Whitening Kits"]
)

const oliviaKitsTarget = await getTargetWithCarryForward(
  'Olivia',
  labelMap["Whitening Kits"]
)

setKitsTarget(jordynKitsTarget + oliviaKitsTarget)
  }
  
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

 const conversion = scheduledTarget ? (kept / scheduledTarget) * 100 : 0
 console.log("Conversion label:", labelMap["Conversion Rate"])

  // =========================
  // UI
  // =========================

  return (
    <div style={container}>
      <TopNav />

      {/* HEADER */}
      <div style={headerBar}>

        <div style={headerTop}>
          <h1 style={headerTitle}>
            Treatment Coordinator Team Overview
          </h1>

          <button style={backButton} onClick={() => router.push('/')}>
            ← Back to Main
          </button>
        </div>

        <div style={headerMeta}>

          <div style={metaBlock}>
            <label>Date Updated</label>
            <div style={metaInput}>{lastUpdated || '—'}</div>
          </div>

          <div style={metaBlock}>
            <label>% Into Period</label>
            <input value={percentIntoPeriod} readOnly style={metaInput} />
          </div>

          <div style={metaBlock}>
            <label>OKR Time Frame</label>
            <div style={monthSelector}>
              <button onClick={() => changeMonth(-1)}>←</button>
              <span>{formatMonth(selectedMonth)}</span>
              <button onClick={() => changeMonth(1)}>→</button>
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

const Card = ({ title, value, prev = 0, target = 0 }: any) =>
  <div style={card}>
    <div style={cardTitle}>{title}</div>
    <div style={cardValue}>{value}</div>

   <div style={bottomRow}>
  <div>
    <span style={smallLabel}>Previous</span>
    <div style={smallBox}>{prev}</div>
  </div>

  <div>
    <span style={smallLabel}>Target</span>

  <div style={{ ...smallBox, width: 100 }}>
  {target}
</div>
  </div>
</div>
  </div>

const container: React.CSSProperties = {
  backgroundColor: '#ecececd5',
  minHeight: '100vh',
  color: '#1E266D'
}

const headerBar: React.CSSProperties = {
  position: 'sticky',
  top: 60,
  zIndex: 10,
  background: 'linear-gradient(90deg, #F26C2F 0%, #F58220 100%)',
  padding: 24,
  borderBottom: '1px solid #F6A27A',
  borderRadius: 16,
  margin: 16,
  boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
}

const headerTop: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20
}

const headerTitle: React.CSSProperties = {
  fontSize: 36,
  fontWeight: 700,
  color: '#FFFFFF'
}

const backButton: React.CSSProperties = {
  backgroundColor: '#1E266D',
  border: 'none',
  padding: '12px 20px',
  borderRadius: 10,
  color: '#FFFFFF',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 15,
  height: 52
}

const headerMeta: React.CSSProperties = {
  display: 'flex',
  gap: 20,
  flexWrap: 'wrap',
  alignItems: 'flex-end'
}

const metaBlock: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 220
}

const metaInput: React.CSSProperties = {
  height: 44,
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #F6A27A',
  backgroundColor: '#FFFFFF',
  color: '#1E266D',
  fontSize: 15,
  fontWeight: 500
}

const monthSelector: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 8,
  borderRadius: 12,
  backgroundColor: '#F6A27A'
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 24,
  padding: 20
}

const card: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '2px solid #F6A27A',
  borderRadius: 18,
  padding: 24,
  boxShadow: '0 10px 24px rgba(0,0,0,0.06)',
  overflow: 'hidden'
}

const cardTitle: React.CSSProperties = {
  color: '#1E266D',
  fontSize: 24,
  fontWeight: 800,
  marginBottom: 16,
  paddingBottom: 10,
  borderBottom: '2px solid #F6A27A'
}

const cardValue: React.CSSProperties = {
  fontSize: 38,
  fontWeight: 800,
  color: '#1E266D',
  marginBottom: 20
}

const bottomRow: React.CSSProperties = {
  display: 'flex',
  gap: 20
}

const smallLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#6B7280'
}

const smallBox: React.CSSProperties = {
  border: '1px solid #F6A27A',
  padding: '10px 12px',
  marginTop: 6,
  backgroundColor: '#FFFFFF',
  borderRadius: 8,
  color: '#1E266D',
  minWidth: 100,
  textAlign: 'center',
  fontWeight: 500
}

const notesSection: React.CSSProperties = {
  margin: 20,
  backgroundColor: '#FFFFFF',
  border: '2px solid #F6A27A',
  borderRadius: 18,
  padding: 24,
  boxShadow: '0 10px 24px rgba(0,0,0,0.06)'
}

const notesInput: React.CSSProperties = {
  width: '100%',
  minHeight: 160,
  padding: 20,
  fontSize: 16,
  fontWeight: 500,
  color: '#1E266D',
  backgroundColor: '#FFFFFF',
  border: '1px solid #F6A27A',
  borderRadius: 16,
  outline: 'none',
  resize: 'vertical',
  fontFamily: 'inherit',
  lineHeight: 1.6
}