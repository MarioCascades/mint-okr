'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import KPI from '../components/KPI'
import { supabase } from '../lib/supabase'

// ================= LABEL MAP =================

const labelMap: Record<string, string> = {
  "Total Starts (Individual)": "Total Starts (Individual)",
  "Total Production (Individual)": "Total Production (Individual)",
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

 

  useEffect(() => {
    fetchData()
  }, [selectedMonth])

  const fetchData = async () => {

    const reportingDate = formatDate(selectedMonth)

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

    const getTarget = async (user: string, krTitle: string) => {
      const { data: row } = await supabase
        .from('dashboard_okr_data')
        .select('key_result_id')
        .eq('user_name', user)
        .eq('key_result_title', krTitle)
        .maybeSingle()

      if (!row) return 0

      const { data: kr } = await supabase
        .from('key_results')
        .select('target_value')
        .eq('id', row.key_result_id)
        .maybeSingle()

      return Number(kr?.target_value ?? 0)
    }
    // =========================
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

    const jt = await getTarget('Jordyn', 'Total Starts (Individual)')
    const ot = await getTarget('Olivia', 'Total Starts (Individual)')

    setStartsTarget(jt + ot)

    // PRODUCTION
    const jProd = await getValue('Jordyn', 'Total Production (Individual)')
    const oProd = await getValue('Olivia', 'Total Production (Individual)')
    setProduction(jProd + oProd)

    const pjProd = await getPrevValue('Jordyn', 'Total Production (Individual)')
    const poProd = await getPrevValue('Olivia', 'Total Production (Individual)')
    setPrevProduction(pjProd + poProd)

    const jtProd = await getTarget('Jordyn', 'Total Production (Individual)')
    const otProd = await getTarget('Olivia', 'Total Production (Individual)')
    setProductionTarget(jtProd + otProd)

    // SCHEDULED
    const jScheduled = await getValue('Jordyn', 'TC Scheduled New Patients')
    const oScheduled = await getValue('Olivia', 'TC Scheduled New Patients')
    setScheduled(jScheduled + oScheduled)

    const pjScheduled = await getPrevValue('Jordyn', 'TC Scheduled New Patients')
    const poScheduled = await getPrevValue('Olivia', 'TC Scheduled New Patients')
    setPrevScheduled(pjScheduled + poScheduled)

    // KEPT
    const jKept = await getValue('Jordyn', labelMap["Kept New Patients"])
    const oKept = await getValue('Olivia', labelMap["Kept New Patients"])
    setKept(jKept + oKept)

    const pjKept = await getPrevValue('Jordyn', labelMap["Kept New Patients"])
    const poKept = await getPrevValue('Olivia', labelMap["Kept New Patients"])
    setPrevKept(pjKept + poKept)

    const jtKept = await getTarget('Jordyn', labelMap["Kept New Patients"])
    const otKept = await getTarget('Olivia', labelMap["Kept New Patients"])
    setKeptTarget(jtKept + otKept)
  }

const macroConversion =
  kept > 0 ? (starts / kept) * 100 : 0

const prevConversion =
  prevKept > 0 ? (prevStarts / prevKept) * 100 : 0

const conversionTarget =
  keptTarget > 0 ? (startsTarget / keptTarget) * 100 : 0

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
          <div>
            <div style={label}>OKR Timeframe</div>
            <div style={monthSelector}>
              <button onClick={() => changeMonth(-1)}>←</button>
              <span>{formatMonth(selectedMonth)}</span>
              <button onClick={() => changeMonth(1)}>→</button>
            </div>
          </div>

          <div>
           <div style={label}>Last Updated</div>
            <div style={input}>{lastUpdated || '—'}</div>
            </div>

          <div>
            <div style={label}>% Into Period</div>
            <input value={percentIntoPeriod} readOnly style={input} />
          </div>
        </div>
      </div>

      {/* KPI */}
      <div style={kpiGrid}>
        <KPI label="Total TC Starts" value={starts} prev={prevStarts} target={startsTarget} />
        <KPI label="Total Production" value={production} prev={prevProduction} target={productionTarget} isCurrency />
        <KPI label="Consults Kept" value={kept} prev={prevKept} target={keptTarget} />
        <KPI
            label="Macro Conversion Rate"
            value={macroConversion}
            prev={prevConversion}
            target={conversionTarget}
            isPercent
/>
      </div>
      {/* ================= ANNOUNCEMENTS ================= */}
<div style={notesBlock}>
  <div style={notesTitle}>Announcements</div>
  <textarea
    style={textarea}
    placeholder="Enter announcements..."
  />
</div>

{/* ================= REMARKS ================= */}
<div style={notesBlock}>
  <div style={notesTitle}>Remarks / Notes</div>
  <textarea
    style={textarea}
    placeholder="Enter notes..."
  />
</div>

    </div>
    
  )
}


// ================= STYLES =================

const container : React.CSSProperties = { backgroundColor: '#000', color: '#fff', minHeight: '100vh' }

const topBar : React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 20px',
  backgroundColor: '#000',
  borderBottom: '1px solid #1F2937'
}

const logoLeft : React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10 }
const logoImg : React.CSSProperties = { height: 40 }
const brandText : React.CSSProperties = { fontSize: 18, fontWeight: 700 }

const selectorRow : React.CSSProperties = { display: 'flex', gap: 6, flexWrap: 'wrap' }

const selectorButton : React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid #333',
  borderRadius: 6,
  color: '#fff',
  backgroundColor: '#111'
}

const activeTab : React.CSSProperties = { backgroundColor: '#E65A3C' }

const headerBox : React.CSSProperties = { backgroundColor: '#E65A3C', padding: 20, marginBottom: 20 }

const mainTitle : React.CSSProperties = { fontSize: 36, fontWeight: 800, marginBottom: 10 }

const metaRow : React.CSSProperties = { display: 'flex', gap: 20 }

const label : React.CSSProperties = { fontSize: 12 }

const input : React.CSSProperties = { padding: 6, backgroundColor: '#111', color: '#fff', border: '1px solid #333' }

const monthSelector : React.CSSProperties = { display: 'flex', gap: 10 }

const kpiGrid : React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 20,
  padding: '0 20px'
}
const notesBlock : React.CSSProperties = {
  marginTop: 25,
  padding: '0 20px'
}

const notesTitle : React.CSSProperties = {
  marginBottom: 5,
  fontWeight: 600
}

const textarea : React.CSSProperties = {
  width: '100%',
  minHeight: 100,
  backgroundColor: '#111',
  color: '#fff',
  border: '1px solid #333',
  padding: 8
}