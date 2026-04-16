'use client'

export const dynamic = 'force-dynamic'


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import { supabase } from '../../lib/supabase'

// =========================
// HELPERS
// =========================

const formatPercent = (val: number) =>
  `${val.toFixed(2)}%`

// =========================
// PAGE
// =========================

export default function Page() {

  const router = useRouter()

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const isAprilOrLater = () => {
  const cutoff = new Date(2026, 3, 1) // April = 3
  return selectedMonth >= cutoff
}

  const [lastUpdated, setLastUpdated] = useState('')
  const [percentIntoPeriod, setPercentIntoPeriod] = useState('')
  const [isEditing, setIsEditing] = useState(false)

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
        setLastUpdated(new Date(data[0].last_updated_at).toLocaleString())
      }
    }

    fetchLastUpdated()
  }, [])

  const formatMonth = (date: Date) =>
    date.toLocaleString('default', { month: 'short', year: 'numeric' })

  const changeMonth = (offset: number) => {
    setSelectedMonth(prev => {
      const d = new Date(prev)
      d.setMonth(prev.getMonth() + offset)
      return d
    })
  }

  const isFutureMonth = () => {
    const now = new Date()
    return selectedMonth > new Date(now.getFullYear(), now.getMonth(), 1)
  }

  return (
    <div style={container}>
     <TopNav /> 

      <div style={stickyHeader}>
        <h1 style={title}>Kelle - New Patient Intake + Experience Coordinator</h1>

        <p style={description}>
          The New Patient Intake & Experience Coordinator is responsible for ensuring every new patient is fully prepared prior to their appointment. This role owns the accuracy, completeness, and organization of all new patient information—eliminating friction, reducing delays, and creating a seamless, high-quality first visit experience.
        </p>

        <div style={topSection}>

          <div style={leftMeta}>
            <div style={metaItem}>
              <label style={label}>Date Updated</label>
              <div style={inputSmall}>{lastUpdated || '—'}</div>
              <input type="text" placeholder="10 State" style={inputSmall} />
            </div>

            <div style={metaItem}>
              <label style={label}>% Into Period</label>
              <input style={inputSmall} value={percentIntoPeriod} readOnly />
            </div>
          </div>

          <div style={rightMeta}>

            <button style={backButton} onClick={() => router.push('/')}>
              ← Back to Main
            </button>

            <label style={label}>OKR Time Frame</label>

            <div style={monthSelector}>
              <button style={arrowButton} onClick={() => changeMonth(-1)}>←</button>
              <span style={monthText}>{formatMonth(selectedMonth)}</span>
              <button
                style={{ ...arrowButton, opacity: isFutureMonth() ? 0.3 : 1 }}
                disabled={isFutureMonth()}
                onClick={() => changeMonth(1)}
              >
                →
              </button>

            </div>

            <button style={editButton} onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Save' : 'Edit'}
            </button>

          </div>
        </div>
      </div>


  
  <div style={content}>

  {isAprilOrLater() ? (
    <>
      {/* ========================= */}
      {/* NEW OKRs (APRIL+) */}
      {/* ========================= */}

      <Objective title="Objective 1: New Patient Process">
        <KeyResult label="# NP Scheduled" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="# NP Scheduled Next Month" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="# New Patients - NSC" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="# of New Patients Missing Information (EOD NP Prep)" selectedMonth={selectedMonth} isEditing={isEditing} />
      </Objective>

      <Objective title="Objective 2: DM Engage">
        <KeyResult label="DM Engage" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Reception Rate (inquiry to booked) for DM Engage" selectedMonth={selectedMonth} isEditing={isEditing} />
      </Objective>

      <Objective title="Objective 3: Bright Referral">
        <KeyResult label="Bright Referral" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Reception Rate (inquiry to booked) for Bright Referral" selectedMonth={selectedMonth} isEditing={isEditing} />
      </Objective>

      <Objective title="Objective 4: Understanding Referral Mix">
        <KeyResult label="Patient Referral" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Dental Referrals" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="# of Dentists Referred" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Digital Marketing" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Community" selectedMonth={selectedMonth} isEditing={isEditing} />
      </Objective>

      <Objective title="Objective 5: Office Efficiency">
        <KeyResult label="Call Answer Rate" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="# of Missed Calls" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="# of patients waited 10+ minutes" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="# of tasks in Lead Sigma" selectedMonth={selectedMonth} isEditing={isEditing} />
      </Objective>
    </>
  ) : (
    <>
      {/* ========================= */}
      {/* OLD OKRs (PRE-APRIL) */}
      {/* ========================= */}

      <Objective title="Objective 1: Understanding Referral Mix">
        <KeyResult label="Patient Referral" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Dental Referrals" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="# of Dentists Referred" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Digital Marketing" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Community" selectedMonth={selectedMonth} isEditing={isEditing} />
      </Objective>

      <Objective title="Objective 2: Inquiry Tracking">
        <KeyResult label="DM Engage" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Reception Rate (inquiry to booked) for DM Engage" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Bright Referral" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="Reception Rate (inquiry to booked) for Bright Referral" selectedMonth={selectedMonth} isEditing={isEditing} />
      </Objective>

      <Objective title="Objective 3: New Patient Process">
        <KeyResult label="NP Scheduled (GF) include consult inquiries" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="NP Incomplete Appointment" selectedMonth={selectedMonth} isEditing={isEditing} />
      </Objective>

      <Objective title="Objective 4: Phone/SMS Engagement">
        <KeyResult label="Call Answer Rate" selectedMonth={selectedMonth} isEditing={isEditing} />
        <KeyResult label="# of Missed Calls" selectedMonth={selectedMonth} isEditing={isEditing} />
      </Objective>

      <Objective title="Objective 5: Tasks Tracking">
        <KeyResult label="# of tasks in Lead Sigma" selectedMonth={selectedMonth} isEditing={isEditing} />
      </Objective>
    </>
  )}

</div>
</div>
  )}
  
// =========================
// OBJECTIVE
// =========================

const Objective = ({ title, children }: any) => (
  <div style={objective}>
    <h2 style={objectiveTitle}>{title}</h2>

    <div style={headerRow}>
      <span>Key Results</span>
      <span>Last Month</span>
      <span>Target</span>
      <span>This Month</span>
      <span>Score</span>
      <span></span>
    </div>

    {children}
  </div>
)
// =========================
// KEY RESULT
// =========================

const KeyResult = ({ label, selectedMonth, isEditing, isPercent = false }: any) => {

  const KR_MAP: Record<string, string> = {
  "Patient Referral": "10354c03-f5f2-44be-9768-c67403aed3d7",
  "Dental Referrals": "d55a033b-3ab5-40fe-af0a-b269156e3513",
  "# of Dentists Referred": "dad83ca3-4fab-4b73-86a4-d873ea0ca2c",
  "Digital Marketing": "3b6b1a4e-25f4-41e4-849b-676d7bb4154",
  "Community": "e3de00cf-b1f5-4ac3-99c5-b3354f0ababb",

  "DM Engage": "8775d9b2-7c5a-4751-8e6a-839a7248bab1",
  "Reception Rate (inquiry to booked) for DM Engage": "bcbd6805-e373-4b39-ac7b-25ea3e122c09",
  "Bright Referral": "f73bb83b-a651-4788-96ee-c8b82aeb4ff4",
  "Reception Rate (inquiry to booked) for Bright Referral": "e7e5deb0-5ddf-482b-a50d-18e20476946c",

  "NP Scheduled (GF) include consult inquiries": "cd8194e4-f8cf-479c-91a9-fb013aa4cc9a",
  "NP Incomplete Appointment": "e215acd1-f73c-4d58-926e-444dcb3eeeae",

  "Call Answer Rate": "4902ee9f-d94d-474f-9a37-14c4d976902",
  "# of Missed Calls": "ccf6cf73-8e37-48b6-9c9f-bcc8e0235b3c",

  "# of tasks in Lead Sigma": "0ab7f27a-8cab-46b9-a8a1-671960a68c68"
}

  const [value, setValue] = useState('')
  const [lastMonth, setLastMonth] = useState('')
  const [target, setTarget] = useState('')
  const [score, setScore] = useState('')
  const [keyResultId, setKeyResultId] = useState<string | null>(null)
  const format = (v: number) => {
      if (isPercent) return formatPercent(v)
      return v.toString()
    }

  const getScoreColor = () => {
  const num = Number(score.replace('%', ''))
  if (isNaN(num)) return '#fff'
  return num >= 100 ? '#22c55e' : '#c2410c'
}

  const handleSave = async () => {

  if (!keyResultId) return

  const y = selectedMonth.getFullYear()
  const m = String(selectedMonth.getMonth() + 1).padStart(2, '0')
  const reportingDate = `${y}-${m}-01`

  await supabase.from('key_result_updates').upsert(
    {
      key_result_id: keyResultId,
      reporting_month: reportingDate,
      value: Number(value),
    },
    { onConflict: 'key_result_id,reporting_month' }
  )
}
useEffect(() => {

  const fetchData = async () => {

    let base = null

    // ✅ STEP 1 — try ID match
    const keyResultId = KR_MAP[label]

    if (keyResultId) {
      const { data } = await supabase
        .from('dashboard_okr_data')
        .select('*')
        .eq('key_result_id', keyResultId)
        .maybeSingle()

      if (data) base = data
    }

    // ✅ STEP 2 — fallback
    if (!base) {
      const { data } = await supabase
        .from('dashboard_okr_data')
        .select('*')
        .eq('user_name', 'Kelle')

      if (!data) return

      base = data.find(item =>
        item.key_result_title.toLowerCase().includes(
          label.toLowerCase().replace('referal', 'referral')
        )
      )
    }

    if (!base) return

    setKeyResultId(base.key_result_id)

    const prev = new Date(selectedMonth)
prev.setMonth(prev.getMonth() - 1)

const formatDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`

const { data: prevData } = await supabase
  .from('key_result_updates')
  .select('value')
  .eq('key_result_id', base.key_result_id)
  .eq('reporting_month', formatDate(prev))
  .maybeSingle()

const prevVal = Number(prevData?.value ?? 0)
setLastMonth(format(prevVal))

    let t = Number(base.target_value ?? 0)

    if (!t || t === 0) {
      const { data: kr } = await supabase
        .from('key_results')
        .select('target_value')
        .eq('id', base.key_result_id)
        .maybeSingle()

      t = Number(kr?.target_value ?? 0)
    }

    // =========================
    // CURRENT MONTH VALUE 
    // =========================


const currentDate = formatDate(selectedMonth)

const { data: currentData } = await supabase
  .from('key_result_updates')
  .select('value')
  .eq('key_result_id', base.key_result_id)
  .eq('reporting_month', currentDate)
  .maybeSingle()

const c = Number(currentData?.value ?? 0)

    

    setTarget(format(t))
    setValue(format(c))

    if (t > 0) {
      const percent = Math.round((c / t) * 100)
      setScore(percent + '%')
    } else {
      setScore('—')
    }
  }

  fetchData()

}, [label, selectedMonth])


  return (
    <div style={{ marginBottom: 10 }}>
      <div style={row}>
        <span>{label}</span>

        <input style={cell} value={lastMonth} readOnly />
        <input style={cell} value={target} readOnly />

        <input
            style={cell}
            value={value}
            readOnly={!isEditing}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
/>

        <input
  style={{
    ...cell,
    color: getScoreColor(),
    fontWeight: 600
  }}
  value={score}
  readOnly
/>

        <button style={button}>+ Initiatives</button>
      </div>
    </div>
  )
}

// =========================
// STYLES 
// =========================

const container : React.CSSProperties = { backgroundColor: '#000', minHeight: '100vh', color: '#fff' }
const stickyHeader : React.CSSProperties = {
  position: 'sticky',
  top: 60,
  zIndex: 10,
  backgroundColor: '#000',
  padding: 20,
  borderBottom: '1px solid #1F2937'
}
const content : React.CSSProperties  = { padding: 20 }
const title : React.CSSProperties = { fontSize: 24, fontWeight: 700 }
const description : React.CSSProperties = { fontSize: 14, color: '#9CA3AF', marginBottom: 20 }
const topSection : React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 20 }
const leftMeta : React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10 }
const rightMeta : React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10 }
const metaItem : React.CSSProperties = { display: 'flex', flexDirection: 'column' }
const label : React.CSSProperties = { fontSize: 12, color: '#9CA3AF' }
const inputSmall : React.CSSProperties = { height: 36, padding: '6px 10px', borderRadius: 6, border: '1px solid #1F2937', backgroundColor: '#0A0A0A', color: '#fff' }
const monthSelector : React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10 }
const arrowButton : React.CSSProperties = { backgroundColor: '#1F2937', border: 'none', padding: '6px 10px', borderRadius: 6, color: '#fff' }
const editButton : React.CSSProperties = { backgroundColor: '#00AEEF', border: 'none', padding: '6px 12px', borderRadius: 6, color: '#000', fontWeight: 600 }
const backButton : React.CSSProperties = { backgroundColor: '#1F2937', border: 'none', padding: '6px 12px', borderRadius: 6, color: '#fff' }
const monthText : React.CSSProperties = { fontSize: 14, fontWeight: 600 }
const objective : React.CSSProperties = { marginBottom: 40 }
const objectiveTitle : React.CSSProperties = { color: '#00AEEF' }
const headerRow : React.CSSProperties = { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: 8 }
const row : React.CSSProperties = { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: 8 }
const cell : React.CSSProperties = { background: '#0A0A0A', border: '1px solid #1F2937', borderRadius: 6, color: '#fff' }
const button : React.CSSProperties = { backgroundColor: '#00AEEF', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#000' }