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

    // ✅ ADD THIS HERE (TOP OF fetchData)
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

const { data: row } = await supabase
  .from('dashboard_okr_data')
  .select('key_result_id')
  .eq('user_name', 'Jordyn')
  .eq('key_result_title', labelMap["Total Starts (Individual)"])
  .maybeSingle()

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

      const conversionTargetValue = await getTargetWithCarryForward(
  'Jordyn',
  labelMap["Conversion Rate"]
)
    setConversionTarget(conversionTargetValue)


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
  onSave={() => {
  saveTarget('Jordyn', 'Total Starts (Individual)', startsTarget / 2, selectedMonth)
  saveTarget('Olivia', 'Total Starts (Individual)', startsTarget / 2, selectedMonth)
}}
/>
        <Card
  title="Total Production"
  value={`$${Number(totalProduction || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
  prev={`$${Number(prevProduction || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
  target={productionTarget}
  setTarget={setProductionTarget}
  onSave={() => {
    saveTarget('Jordyn', 'Total Production (Individual)', productionTarget / 2, selectedMonth)
    saveTarget('Olivia', 'Total Production (Individual)', productionTarget / 2, selectedMonth)
  }}
/>
        <Card 
  title="Scheduled New Patients" 
  value={scheduled}
  prev={prevScheduled}
  target={scheduledTarget}
  setTarget={setScheduledTarget}
 onSave={() => {
  saveTarget(
    'Jordyn',
    labelMap["Scheduled New Patients"],
    scheduledTarget,
    selectedMonth
  )
}}
/>
        <Card 
  title="Kept New Patients" 
  value={kept}
  prev={prevKept}
  target={keptTarget}
  setTarget={setKeptTarget}
  onSave={() => {
    saveTarget('Jordyn', labelMap["Kept New Patients"], keptTarget / 2, selectedMonth)
    saveTarget('Olivia', labelMap["Kept New Patients"], keptTarget / 2, selectedMonth)
  }}
/>

        <Card 
  title="New Patient Conversion" 
  value={`${conversion.toFixed(0)}%`}
  prev={`${prevConversion.toFixed(0)}%`}
  target={conversionTarget}
  setTarget={setConversionTarget}
  onSave={() => {
  saveTarget(
    'Jordyn',
    labelMap["Conversion Rate"],
    conversionTarget,
    selectedMonth
  )
}}
/>
        <Card 
  title="Total Whitening Kits" 
  value={kits}
  prev={prevKits}
  target={kitsTarget}
  setTarget={setKitsTarget}
  onSave={() => {
    saveTarget('Jordyn', labelMap["Whitening Kits"], kitsTarget / 2, selectedMonth)
    saveTarget('Olivia', labelMap["Whitening Kits"], kitsTarget / 2, selectedMonth)
  }}
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

const Card = ({ title, value, prev = 0, target = 0, setTarget, onSave }: any) => (
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

    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        style={{ ...smallBox, width: 100 }}
        value={target}
        onChange={(e) => {
          const val = e.target.value.replace(/[^0-9]/g, '')
          setTarget(Number(val))
        }}
      />

      {/* ✅ SAVE BUTTON */}
      <button
        style={{
          background: '#0F766E',
          border: 'none',
          padding: '6px 10px',
          cursor: 'pointer',
          color: '#fff',
          borderRadius: 6,
          fontWeight: 600
        }}
        onClick={onSave}
      >
        ✓
      </button>
    </div>
  </div>
</div>
  </div>
)
const saveTarget = async (
  user: string,
  krTitle: string,
  targetValue: number,
  selectedMonth: Date
) => {

  const reportingMonth = formatDate(selectedMonth)

  // get key_result_id
  const { data: row } = await supabase
    .from('dashboard_okr_data')
    .select('key_result_id')
    .eq('user_name', user)
    .eq('key_result_title', krTitle)
    .maybeSingle()

  if (!row) {
    console.log('no key_result_id found')
    return
  }

  // check if record exists
  const { data: existing } = await supabase
    .from('key_result_updates')
    .select('id')
    .eq('key_result_id', row.key_result_id)
    .eq('reporting_month', reportingMonth)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('key_result_updates')
      .update({
        target_value: targetValue
      })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('key_result_updates')
      .insert({
        key_result_id: row.key_result_id,
        reporting_month: reportingMonth,
        target_value: targetValue
      })
  }

  console.log('saved target', { user, krTitle, targetValue, reportingMonth })
}

// =========================
// STYLES
// =========================

const container : React.CSSProperties = { 
  background: '#F9FAFB', // light gray
  minHeight: '100vh', 
  color: '#111827' // dark text
}
const headerBar : React.CSSProperties = { 
  background: '#E4572E', 
  padding: 20,
  position: 'sticky',
  top: 60, // BELOW TopNav
  zIndex: 50 // LOWER than TopNav
}
const headerTop : React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
const headerTitle : React.CSSProperties = { fontSize: 28, fontWeight: 700 }
const backButton : React.CSSProperties = { background: '#000', color: '#fff', border: 'none', padding: '6px 10px' }

const headerMeta : React.CSSProperties = { display: 'flex', gap: 20, marginTop: 15 }
const metaBlock : React.CSSProperties = { display: 'flex', flexDirection: 'column' }
const metaInput : React.CSSProperties = { 
  background: '#FFFFFF',
  color: '#111827',
  border: '1px solid #E5E7EB',
  padding: 6
}
const monthSelector : React.CSSProperties = { display: 'flex', gap: 10 }

const grid : React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: 20 }


const card : React.CSSProperties = { 
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: 16,
  padding: 20,

  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',

  transition: 'all 0.2s ease'
}

const cardTitle : React.CSSProperties = { fontSize: 16, marginBottom: 10 }
const cardValue : React.CSSProperties = { fontSize: 40, fontWeight: 800, marginBottom: 20 }

const bottomRow : React.CSSProperties = { display: 'flex', gap: 20 }
const smallLabel : React.CSSProperties = { fontSize: 10, color: '#9CA3AF' }
const smallBox : React.CSSProperties = { 
  border: '1px solid #E5E7EB',
  padding: 6,
  marginTop: 4,
  backgroundColor: '#FFFFFF',
  color: '#111827'
}
const notesSection : React.CSSProperties = { padding: 20 }
const notesInput : React.CSSProperties = { width: '100%', height: 100, background: '#0A0A0A', border: '1px solid #1F2937', color: '#fff' }