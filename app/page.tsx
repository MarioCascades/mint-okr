'use client'

export const dynamic = 'force-dynamic'


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import KPI from '../components/KPI'
import { supabase } from '../lib/supabase'

// ================= LABEL MAP =================

const labelMap: Record<string, string> = {
  "Total Starts": "TC Total Starts",
  "Total Production": "TC Total Production after Discounts",
  "Kept New Patients": "TC Kept New Patients"
}

const formatDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`

export default function Home() {

  const router = useRouter()

  const [selectedUser, setSelectedUser] = useState('Jordyn')

  const users = [
    'Mari','Emily','TC Team','Jordyn','Olivia','Ashley','Alli','Kelle','Ashlynn','Eric'
  ]

  const handleNavigation = (user: string) => {
    setSelectedUser(user)

    const pathMap: any = {
      'Mari': '/mari','Emily': '/emily','TC Team': '/tc','Jordyn': '/jordyn',
      'Olivia': '/olivia','Ashley': '/ashley', 'Alli': '/alli','Kelle': '/kelle','Ashlynn': '/ashlynn','Eric': '/eric',
    }

    router.push(pathMap[user])
  }

  // ================= DATE =================

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const [today, setToday] = useState('')
  const [percentIntoPeriod, setPercentIntoPeriod] = useState('')

  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0])
  }, [])

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

  const changeMonth = (offset: number) => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + offset)
      return newDate
    })
  }

  const formatMonth = (date: Date) =>
    date.toLocaleString('default', { month: 'short', year: 'numeric' })

  // ================= DATA =================

  const [starts, setStarts] = useState(0)
  const [lastUpdated, setLastUpdated] = useState('')
  const [prevStarts, setPrevStarts] = useState(0)
  const [startsTarget, setStartsTarget] = useState(0)

  const [production, setProduction] = useState(0)
  const [prevProduction, setPrevProduction] = useState(0)
  const [productionTarget, setProductionTarget] = useState(0)

  const [kept, setKept] = useState(0)
  const [prevKept, setPrevKept] = useState(0)
  const [keptTarget, setKeptTarget] = useState(0)

  const [scheduled, setScheduled] = useState(0)
  const [prevScheduled, setPrevScheduled] = useState(0)
const [announcements, setAnnouncements] = useState('')
const [remarks, setRemarks] = useState('')
const [kpiInitiatives, setKpiInitiatives] = useState<
  Record<string, string[]>
>({
  'Total TC Starts': ['', '', ''],
  'Total Production': ['', '', ''],
  'Consults Kept': ['', '', ''],
  'Macro Conversion Rate': ['', '', '']
})
 
const fetchMainPageNote = async (
  noteType: string
) => {
  const reportingDate = formatDate(selectedMonth)

  // STEP 1: current month first
  const { data: current } = await supabase
    .from('main_page_notes')
    .select('content')
    .eq('reporting_month', reportingDate)
    .eq('note_type', noteType)
    .maybeSingle()

  if (current?.content) {
    return current.content
  }

  // STEP 2: latest previous note (not just last month)
  const { data: previous } = await supabase
    .from('main_page_notes')
    .select('content, reporting_month')
    .eq('note_type', noteType)
    .lt('reporting_month', reportingDate)
    .not('content', 'is', null)
    .order('reporting_month', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (previous?.content) {
    await supabase
      .from('main_page_notes')
      .upsert(
        {
          reporting_month: reportingDate,
          note_type: noteType,
          content: previous.content
        },
        {
          onConflict: 'reporting_month,note_type'
        }
      )

    return previous.content
  }

  return ''
}
const saveMainPageNote = async (
  noteType: string,
  content: string
) => {
  const reportingDate = formatDate(selectedMonth)

  await supabase
    .from('main_page_notes')
    .upsert(
      {
        reporting_month: reportingDate,
        note_type: noteType,
        content
      },
      {
        onConflict: 'reporting_month,note_type'
      }
    )
}
const fetchKpiInitiatives = async (
  metricName: string
) => {
  const reportingDate = formatDate(selectedMonth)

  const { data: current } = await supabase
    .from('main_page_initiatives')
    .select('initiative_index, text')
    .eq('reporting_month', reportingDate)
    .eq('metric_name', metricName)
    .order('initiative_index', { ascending: true })

  let loaded = ['', '', '']

  if (current && current.length > 0) {
    current.forEach((row) => {
      if (
        row.initiative_index >= 1 &&
        row.initiative_index <= 3
      ) {
        loaded[row.initiative_index - 1] =
          row.text || ''
      }
    })

    return loaded
  }

  const { data: previous } = await supabase
    .from('main_page_initiatives')
    .select('initiative_index, text, reporting_month')
    .eq('metric_name', metricName)
    .lt('reporting_month', reportingDate)
    .order('reporting_month', {
      ascending: false
    })

  if (previous && previous.length > 0) {
    const latestMonth =
      previous[0].reporting_month

    previous
      .filter(
        (row) =>
          row.reporting_month === latestMonth
      )
      .forEach((row) => {
        if (
          row.initiative_index >= 1 &&
          row.initiative_index <= 3
        ) {
          loaded[row.initiative_index - 1] =
            row.text || ''
        }
      })

    for (let i = 0; i < 3; i++) {
      await supabase
        .from('main_page_initiatives')
        .upsert(
          {
            reporting_month: reportingDate,
            metric_name: metricName,
            initiative_index: i + 1,
            text: loaded[i]
          },
          {
            onConflict:
              'reporting_month,metric_name,initiative_index'
          }
        )
    }
  }

  return loaded
}
const saveKpiInitiative = async (
  metricName: string,
  index: number,
  text: string
) => {
  const reportingDate = formatDate(selectedMonth)

  await supabase
    .from('main_page_initiatives')
    .upsert(
      {
        reporting_month: reportingDate,
        metric_name: metricName,
        initiative_index: index,
        text
      },
      {
        onConflict:
          'reporting_month,metric_name,initiative_index'
      }
    )
}

  useEffect(() => {
    fetchData()
  }, [selectedMonth])

  const fetchData = async () => {

    const reportingDate = formatDate(selectedMonth)
    const metricNames = [
  'Total TC Starts',
  'Total Production',
  'Consults Kept',
  'Macro Conversion Rate'
]

for (const metric of metricNames) {
  const loaded =
    await fetchKpiInitiatives(metric)

  setKpiInitiatives(prev => ({
    ...prev,
    [metric]: loaded
  }))
}
    const loadedAnnouncements =
  await fetchMainPageNote('announcements')

const loadedRemarks =
  await fetchMainPageNote('remarks')

setAnnouncements(loadedAnnouncements)
setRemarks(loadedRemarks)

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
const getTargetWithCarryForward = async (user: string, krTitle: string) => {

  const { data: row } = await supabase
    .from('dashboard_okr_data')
    .select('key_result_id')
    .eq('user_name', user)
    .eq('key_result_title', krTitle)
    .maybeSingle()

  if (!row) return 0

  const start = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1)
  const end = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1)

  const { data: current } = await supabase
    .from('key_result_updates')
    .select('target_value')
    .eq('key_result_id', row.key_result_id)
    .gte('reporting_month', start.toISOString())
    .lt('reporting_month', end.toISOString())
    .maybeSingle()

  if (current?.target_value !== null && current?.target_value !== undefined) {
    return Number(current.target_value)
  }

  const prevStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1)

  const { data: prev } = await supabase
    .from('key_result_updates')
    .select('target_value')
    .eq('key_result_id', row.key_result_id)
    .gte('reporting_month', prevStart.toISOString())
    .lt('reporting_month', start.toISOString())
    .maybeSingle()

  return Number(prev?.target_value ?? 0)
}
    //=======
    // LAST UPDATED (GLOBAL)
    // =========================

      const { data: updates } = await supabase
      .from('key_result_updates')
      .select('last_updated_at')
      .order('last_updated_at', { ascending: false })
      .limit(1)

      if (updates && updates.length > 0) {
      const formatted = new Date(updates[0].last_updated_at).toLocaleString()
      setLastUpdated(formatted)
}

    // STARTS
    const jStarts = await getValue('Jordyn', 'Total Starts (Individual)')
    const oStarts = await getValue('Olivia', 'Total Starts (Individual)')
    setStarts(jStarts + oStarts)

    const pjStarts = await getPrevValue('Jordyn', 'Total Starts (Individual)')
    const poStarts = await getPrevValue('Olivia', 'Total Starts (Individual)')
    setPrevStarts(pjStarts + poStarts)

    const jt = await getTargetWithCarryForward('Jordyn', 'Total Starts (Individual)')
    const ot = await getTargetWithCarryForward('Olivia', 'Total Starts (Individual)')

    setStartsTarget(jt + ot)

    // PRODUCTION
    const jProd = await getValue('Jordyn', 'Total Production (Individual)')
    const oProd = await getValue('Olivia', 'Total Production (Individual)')
    setProduction(jProd + oProd)

    const pjProd = await getPrevValue('Jordyn', 'Total Production (Individual)')
    const poProd = await getPrevValue('Olivia', 'Total Production (Individual)')
    setPrevProduction(pjProd + poProd)

    const jtProd = await getTargetWithCarryForward('Jordyn', 'Total Production (Individual)')
    const otProd = await getTargetWithCarryForward('Olivia', 'Total Production (Individual)')
    setProductionTarget(jtProd + otProd)

    // SCHEDULED
    const jScheduled = await getValue('Jordyn', 'TC Scheduled New Patients')
    const oScheduled = await getValue('Olivia', 'TC Scheduled New Patients')
    setScheduled(jScheduled + oScheduled)

    const pjScheduled = await getPrevValue('Jordyn', 'TC Scheduled New Patients')
    const poScheduled = await getPrevValue('Olivia', 'TC Scheduled New Patients')
    setPrevScheduled(pjScheduled + poScheduled)
    const scheduledTarget = await getTargetWithCarryForward('Jordyn','TC Scheduled New Patients')

    // KEPT
    const jKept = await getValue('Jordyn', labelMap["Kept New Patients"])
    const oKept = await getValue('Olivia', labelMap["Kept New Patients"])
    setKept(jKept + oKept)

    const pjKept = await getPrevValue('Jordyn', labelMap["Kept New Patients"])
    const poKept = await getPrevValue('Olivia', labelMap["Kept New Patients"])
    setPrevKept(pjKept + poKept)

    const jtKept = await getTargetWithCarryForward('Jordyn', labelMap["Kept New Patients"])
    const otKept = await getTargetWithCarryForward('Olivia', labelMap["Kept New Patients"])
    setKeptTarget(jtKept + otKept)

  
  }

const macroConversion =
  starts > 0 ? (kept / starts) * 100 : 0

const prevConversion =
  prevStarts > 0 ? (prevKept / prevStarts) * 100 : 0

const conversionTarget =
  keptTarget > 0 ? ( startsTarget / keptTarget) * 100 : 0 

  return (
    <div style={container}>

      {/* TOP BAR */}
      <div style={topBar}>
        <div style={logoLeft}>
          <img src="/mint.png" style={logoImg} />
          <span style={brandText}>Mint Orthodontics</span>
        </div>

        <div style={selectorRow}>
          {users.map((user) => (
            <button
              key={user}
              style={{
                ...selectorButton,
                ...(selectedUser === user ? activeTab : {})
              }}
              onClick={() => handleNavigation(user)}
            >
              {user}
            </button>
          ))}
        </div>

        <img src="/ce.png" style={logoImg} />
      </div>

      {/* HEADER */}
      <div style={headerBox}>
        <h1 style={mainTitle}>Overall Practice Performance</h1>

        <div style={metaRow}>

  {/* LEFT SIDE */}
  <div
    style={{
      display: 'flex',
      gap: 24,
      alignItems: 'flex-start'
    }}
  >
    <div>
      <div style={label}>Last Updated</div>
      <div style={input}>{lastUpdated || '—'}</div>
    </div>

    <div>
      <div style={label}>% Into Period</div>
      <input
        value={percentIntoPeriod}
        readOnly
        style={input}
      />
    </div>
  </div>

  {/* RIGHT SIDE */}
  <div>
    <div style={label}>OKR Timeframe</div>

    <div style={monthSelector}>
      <button
        style={monthButton}
        onClick={() => changeMonth(-1)}
      >
        ←
      </button>

      <span
        style={{
          fontWeight: 800,
          fontSize: 18,
          color: '#FFFFFF',
          minWidth: 110,
          textAlign: 'center'
        }}
      >
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

      {/* KPI */}
   <div style={kpiGrid}>

  <KPI
    label="Total TC Starts"
    value={starts}
    prev={prevStarts}
    target={startsTarget}
    initiatives={
      kpiInitiatives['Total TC Starts']
    }
    setInitiatives={(vals: string[]) =>
      setKpiInitiatives(prev => ({
        ...prev,
        'Total TC Starts': vals
      }))
    }
    saveInitiative={saveKpiInitiative}
  />

  <KPI
    label="Total Production"
    value={production}
    prev={prevProduction}
    target={productionTarget}
    isCurrency
    initiatives={
      kpiInitiatives['Total Production']
    }
    setInitiatives={(vals: string[]) =>
      setKpiInitiatives(prev => ({
        ...prev,
        'Total Production': vals
      }))
    }
    saveInitiative={saveKpiInitiative}
  />

  <KPI
    label="Consults Kept"
    value={kept}
    prev={prevKept}
    target={keptTarget}
    initiatives={
      kpiInitiatives['Consults Kept']
    }
    setInitiatives={(vals: string[]) =>
      setKpiInitiatives(prev => ({
        ...prev,
        'Consults Kept': vals
      }))
    }
    saveInitiative={saveKpiInitiative}
  />

  <KPI
    label="Macro Conversion Rate"
    value={macroConversion}
    prev={prevConversion}
    target={conversionTarget}
    isPercent
    initiatives={
      kpiInitiatives['Macro Conversion Rate']
    }
    setInitiatives={(vals: string[]) =>
      setKpiInitiatives(prev => ({
        ...prev,
        'Macro Conversion Rate': vals
      }))
    }
    saveInitiative={saveKpiInitiative}
  />

</div>
      {/* ================= ANNOUNCEMENTS ================= */}
<div style={notesBlock}>
  <div style={notesTitle}>Announcements</div>
  <textarea
  style={textarea}
  placeholder="Enter announcements..."
  value={announcements}
  onChange={(e) =>
    setAnnouncements(e.target.value)
  }
  onBlur={(e) =>
  saveMainPageNote(
    'announcements',
    e.target.value
  )
}
/>
</div>

{/* ================= REMARKS ================= */}
<div style={notesBlock}>
  <div style={notesTitle}>Remarks / Notes</div>
 <textarea
  style={textarea}
  placeholder="Enter notes..."
  value={remarks}
  onChange={(e) =>
    setRemarks(e.target.value)
  }
onBlur={(e) =>
  saveMainPageNote(
    'remarks',
    e.target.value
  )
}
/>
</div>

    </div>
    
  )
}


// ================= STYLES =================


const COLORS = {
  navy: '#1E266D',
  blue: '#A9C9D8',
  orange: '#F26C2F',
  softOrange: '#F6A27A',
  lightOrange: '#FFD2B8',
  paleOrange: '#FFE6D8',
  white: '#FFFFFF',
  lightGray: '#f5f5f5d5',
  gray: '#e5e5e5c4',
  border: '#D1D5DB',
  text: '#1F2937',
  muted: '#6B7280'
}

const container: React.CSSProperties = {
  backgroundColor: COLORS.lightGray,
  color: COLORS.text,
  minHeight: '100vh'
}

const topBar: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 24px',
  backgroundColor: COLORS.white,
  borderBottom: `1px solid ${COLORS.border}`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
}

const logoLeft: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10
}

const logoImg: React.CSSProperties = {
  height: 42
}

const brandText: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: COLORS.navy
}

const selectorRow: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap'
}

const selectorButton: React.CSSProperties = {
  padding: '8px 14px',
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  backgroundColor: COLORS.white,
  color: COLORS.navy,
  fontWeight: 600,
  cursor: 'pointer'
}

const activeTab: React.CSSProperties = {
  backgroundColor: COLORS.orange,
  color: COLORS.white,
  border: `1px solid ${COLORS.orange}`
}

const headerBox: React.CSSProperties = {
  backgroundColor: COLORS.orange,
  padding: 24,
  margin: 20,
  borderRadius: 14,
  boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
}

const mainTitle: React.CSSProperties = {
  fontSize: 42,
  fontWeight: 800,
  color: COLORS.white,
  marginBottom: 18
}

const metaRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 24,
  flexWrap: 'wrap'
}

const label: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: COLORS.white,
  marginBottom: 6
}

const input: React.CSSProperties = {
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

const kpiGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 20,
  padding: '0 20px'
}

const notesBlock: React.CSSProperties = {
  backgroundColor: '#E5E5E5',
  padding: 24,
  borderRadius: 18,
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow: '0 10px 24px rgba(0,0,0,0.08)'
}

const notesTitle: React.CSSProperties = {
  marginBottom: 8,
  fontWeight: 700,
  fontSize: 16,
  color: COLORS.navy
}

const textarea: React.CSSProperties = {
  width: '100%',
  minHeight: 120,
  padding: 18,
  fontSize: 16,
  fontWeight: 500,
  color: '#1E266D',
  backgroundColor: '#F8FAFC',
  border: '1px solid #D6DCE5',
  borderRadius: 14,
  outline: 'none',
  resize: 'vertical',
  fontFamily: 'inherit'
}