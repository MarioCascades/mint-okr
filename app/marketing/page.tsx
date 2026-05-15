'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import { supabase } from '../../lib/supabase'
import { COLORS } from '@/lib/colors'
import {
  isAdmin,
  isMember,
  canEditSelectedMonth
} from '@/lib/auth'

const MARKETING_LABEL_MAP: Record<string, string> = {
  mirrored_np_this: '# New Patients Scheduled This Month',
  mirrored_np_next: '# New Patients Scheduled Next Month',

  mkt_dentist_referrals: 'MKT Dentist Referrals',
  mkt_referring_dentists: 'MKT Referring Dentists',
  mkt_patient_referrals: 'MKT Patient Referrals',
  mkt_digital_marketing: 'MKT Digital Marketing',
  mkt_community: 'MKT Community',

  mkt_sponsorships: 'MKT Sponsorships',
  mkt_sponsorship_dollars: 'MKT Sponsorship Dollars',
  mkt_community_events: 'MKT Community Events',
  mkt_np_community_referrals: 'MKT NP Community Referrals',
  mkt_gp_deliveries: 'MKT GP Deliveries',

  mkt_social_posts: 'MKT Social Posts',
  mkt_google_reviews: 'MKT Google Reviews',
  mkt_bright_referral: 'MKT Bright Referral',
}
const DISPLAY_ONLY_KRS = new Set([
  'mkt_dentist_referrals',
  'mkt_community',
  'mkt_sponsorships',
  'mkt_np_community_referrals',
  'mkt_gp_deliveries',
  'mkt_bright_referral',
])
const DELTA_SCORE_KRS = new Set([
  'mkt_sponsorship_dollars',
  'mkt_social_posts',
])
const MIRRORED_KRS = new Set([
  'mirrored_np_this',
  'mirrored_np_next',
])
const LEGACY_DIGITAL_KRS = new Set([
  'mkt_social_posts',
  'mkt_google_reviews',
  'mkt_bright_referral',
])
const MIRRORED_TEMPLATE_IDS = {
  mirrored_np_this: 'f2024a62-4588-4bdd-a8b4-66c77c775290',
  mirrored_np_next: '5d61dae9-c93b-4403-9da2-88007cde2a65',
}

function formatMonth(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

function changeMonth(current: Date, offset: number) {
  const next = new Date(current)
  next.setMonth(next.getMonth() + offset)
  return next
}

function isFutureMonth(selectedMonth: Date) {
  const now = new Date()

  return (
    selectedMonth.getFullYear() > now.getFullYear() ||
    (
      selectedMonth.getFullYear() === now.getFullYear() &&
      selectedMonth.getMonth() > now.getMonth()
    )
  )
}

function getPercentIntoPeriod(selectedMonth: Date) {
  const now = new Date()

  const isCurrentMonth =
    now.getMonth() === selectedMonth.getMonth() &&
    now.getFullYear() === selectedMonth.getFullYear()

  if (!isCurrentMonth) return 100

  const daysInMonth = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    0
  ).getDate()

  return Math.round((now.getDate() / daysInMonth) * 100)
}

function showLegacyDigital(selectedMonth: Date) {
  return (
    selectedMonth.getFullYear() < 2026 ||
    (
      selectedMonth.getFullYear() === 2026 &&
      selectedMonth.getMonth() <= 3
    )
  )
}

type MarketingKR = {
  key: string
  label: string
  previous: number
  target: number
  current: number
  score: string
  mirrored?: boolean
}
export default function MarketingPage() {
const router = useRouter()

const [selectedMonth, setSelectedMonth] = useState(new Date())
const [editing, setEditing] = useState(false)
const [currentUser, setCurrentUser] = useState<string | null>(null)
const [lastUpdated, setLastUpdated] = useState('')
const [mirroredRows, setMirroredRows] = useState({

  mirrored_np_this: {
    previous: 0,
    target: 0,
    current: 0,
    score: '—'
  },
  mirrored_np_next: {
    previous: 0,
    target: 0,
    current: 0,
    score: '—'
  }
})



useEffect(() => {
  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setCurrentUser(user.id)

    const reportingMonth = new Date(
  selectedMonth.getFullYear(),
  selectedMonth.getMonth(),
  1
).toISOString().split('T')[0]

const previousMonth = new Date(
  selectedMonth.getFullYear(),
  selectedMonth.getMonth() - 1,
  1
).toISOString().split('T')[0]

const templateIds = Object.values(MIRRORED_TEMPLATE_IDS)

const { data: mirroredKRs } = await supabase
  .from('key_results')
  .select('id, key_result_template_id, target_value, current_value')
  .in('key_result_template_id', templateIds)

if (!mirroredKRs) return
const krIds = mirroredKRs.map((kr) => kr.id)

const { data: currentUpdates } = await supabase
  .from('key_result_updates')
  .select('key_result_id, current_value')
  .eq('reporting_month', reportingMonth)
  .in('key_result_id', krIds)

const { data: previousUpdates } = await supabase
  .from('key_result_updates')
  .select('key_result_id, current_value')
  .eq('reporting_month', previousMonth)
  .in('key_result_id', krIds)
  const nextMirroredState = {
  mirrored_np_this: {
    previous: 0,
    target: 0,
    current: 0,
    score: '—'
  },
  mirrored_np_next: {
    previous: 0,
    target: 0,
    current: 0,
    score: '—'
  }
}

for (const kr of mirroredKRs) {
  const currentUpdate = currentUpdates?.find(
    (u) => u.key_result_id === kr.id
  )

  const previousUpdate = previousUpdates?.find(
    (u) => u.key_result_id === kr.id
  )

  const currentValue = Number(currentUpdate?.current_value || 0)
  const previousValue = Number(previousUpdate?.current_value || 0)
  const targetValue = Number(kr.target_value || 0)

  const key =
    kr.key_result_template_id === MIRRORED_TEMPLATE_IDS.mirrored_np_this
      ? 'mirrored_np_this'
      : 'mirrored_np_next'

  nextMirroredState[key] = {
    previous: previousValue,
    target: targetValue,
    current: currentValue,
    score: targetValue > 0
      ? `${Math.round((currentValue / targetValue) * 100)}%`
      : '—'
  }
}

setMirroredRows(nextMirroredState)
  }

  init()
}, [router, selectedMonth])

useEffect(() => {
  const fetchLastUpdated = async () => {
    const { data } = await supabase
      .from('key_result_updates')
      .select('last_updated_at')
      .order('last_updated_at', { ascending: false })
      .limit(1)

    if (data && data.length > 0) {
      setLastUpdated(
        new Date(data[0].last_updated_at).toLocaleString()
      )
    }
  }

  fetchLastUpdated()
}, [])

const percentIntoPeriod = getPercentIntoPeriod(selectedMonth)


const tenState = '10 State'

return (
  <div style={container}>
    <TopNav />

    <div style={content}>
          
    <div style={stickyHeader}>
  <h1 style={title}>Marketing</h1>

  <p style={description}>
    Marketing performance tracking and OKR visibility across referral growth,
    community engagement, and digital performance.
  </p>

  <div style={topSection}>
  
    <div style={leftMeta}>
      <div style={metaItem}>
        <label style={label}>Date Updated</label>
        <div style={inputSmall}>{lastUpdated || '—'}</div>
        <input
          type="text"
          placeholder="10 State"
          style={inputSmall}
        />
      </div>
  
      <div style={metaItem}>
        <label style={label}>% Into Period</label>
        <input
          style={inputSmall}
          value={(percentIntoPeriod || 0).toFixed(2) + '%'}
          readOnly
        />
      </div>
  
      <div style={metaItem}>
        <label style={label}>OKR Time Frame</label>
  
        <div style={monthSelector}>
          <button
            style={arrowButton}

           onClick={() =>
  setSelectedMonth(changeMonth(selectedMonth, -1))
}
          >
            ←
          </button>
  
          <span style={monthText}>
            {formatMonth(selectedMonth)}
          </span>
  
          <button
            style={{
  ...arrowButton,
  opacity: isFutureMonth(changeMonth(selectedMonth, 1))
    ? 0.3
    : 1
}}
            disabled={isFutureMonth(changeMonth(selectedMonth, 1))}
            onClick={() =>
  setSelectedMonth(changeMonth(selectedMonth, 1))
}
          >
            →
          </button>
        </div>
      </div>
    </div>
  
    <div style={rightMeta}>
  
      <button
        style={backButton}
        onClick={() => router.push('/')}
      >
        ← Back to Main
      </button>


  
  {(isAdmin() || canEditSelectedMonth(selectedMonth)) && (
  <button
    style={editButton}
    onClick={() => setEditing(!editing)}
  >
    {editing ? 'Save' : 'Edit'}
  </button>
)}
  
    </div>
  
  </div>
        </div>
  

<div style={objective}>
  <div style={objectiveTitle}>
    Top of New Patient Funnel
  </div>

  <div style={headerRow}>
    <div>Key Result</div>
    <div>Previous</div>
    <div>Target</div>
    <div>Current</div>
    <div>Score</div>
    <div>Actions</div>
  </div>

  <div style={row}>
    <div># New Patients Scheduled This Month</div>

    <div style={prevCell}>
      {mirroredRows.mirrored_np_this.previous}
    </div>

    <div style={targetCell}>
      {mirroredRows.mirrored_np_this.target}
    </div>

    <input
      value={String(mirroredRows.mirrored_np_this.current)}
      readOnly
      style={currentCell}
    />

    <div style={cell}>
      {mirroredRows.mirrored_np_this.score}
    </div>

    <button style={button}>
      Mirrored
    </button>
  </div>

  <div style={row}>
    <div># New Patients Scheduled Next Month</div>

    <div style={prevCell}>
      {mirroredRows.mirrored_np_next.previous}
    </div>

    <div style={targetCell}>
      {mirroredRows.mirrored_np_next.target}
    </div>

    <input
      value={String(mirroredRows.mirrored_np_next.current)}
      readOnly
      style={currentCell}
    />

    <div style={cell}>
      {mirroredRows.mirrored_np_next.score}
    </div>

    <button style={button}>
      Mirrored
    </button>
  </div>
</div>

    </div>
  </div>
    
  )
  }


// =========
// STYLES
// =========


const container: React.CSSProperties = {
  backgroundColor: COLORS.grayAppBackground,
  minHeight: '100vh',
  color: COLORS.navy
}

const stickyHeader: React.CSSProperties = {
  position: 'sticky',
  top: 60,
  zIndex: 10,
  background: `linear-gradient(90deg, ${COLORS.orangePrimary} 0%, ${COLORS.orangeSoft} 100%)`,
  padding: 24,
  borderBottom: `1px solid ${COLORS.orangeSoft}`,
  borderRadius: 20,
  margin: 16,
  boxShadow: COLORS.shadowMedium
}

const content: React.CSSProperties = {
  padding: 20,
  overflowX: 'auto'
}

const title: React.CSSProperties = {
  fontSize: 38,
  fontWeight: 700,
  color: COLORS.white,
  marginBottom: 8
}

const description: React.CSSProperties = {
  fontSize: 16,
  color: COLORS.white,
  marginBottom: 24,
  maxWidth: 900,
  lineHeight: 1.5
}

const topSection: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 24,
  alignItems: 'flex-start'
}

const leftMeta: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  gap: 16,
  flexWrap: 'wrap',
  alignItems: 'flex-end'
}

const rightMeta: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  alignItems: 'stretch',
  minWidth: 220
}

const metaItem: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 220
}

const label: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: COLORS.white,
  marginBottom: 6
}

const inputSmall: React.CSSProperties = {
  height: 44,
  padding: '10px 14px',
  borderRadius: 10,
  border: `1px solid ${COLORS.orangeSoft}`,
  backgroundColor: COLORS.white,
  color: COLORS.navy,
  fontSize: 15,
  fontWeight: 500
}

const monthSelector: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 8,
  borderRadius: 12,
  backgroundColor: COLORS.orangeAccent
}

const arrowButton: React.CSSProperties = {
  backgroundColor: COLORS.navy,
  border: 'none',
  padding: '10px 14px',
  borderRadius: 10,
  color: COLORS.white,
  cursor: 'pointer',
  fontWeight: 600
}

const editButton: React.CSSProperties = {
  backgroundColor: COLORS.navy,
  border: 'none',
  padding: '12px 20px',
  borderRadius: 10,
  color: COLORS.white,
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 15,
  width: '100%',
  height: 52
}

const backButton: React.CSSProperties = {
  backgroundColor: COLORS.navy,
  border: 'none',
  padding: '12px 20px',
  borderRadius: 10,
  color: COLORS.white,
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 15,
  width: '100%',
  height: 52
}

const monthText: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: COLORS.navy,
  minWidth: 120,
  textAlign: 'center'
}

const objective: React.CSSProperties = {
  marginBottom: 32,
  backgroundColor: COLORS.grayPanel,
  border: `1px solid ${COLORS.orangeSoft}`,
  borderRadius: 20,
  padding: 24,
  boxShadow: COLORS.shadowSoft,
  overflow: 'hidden'
}

const objectiveTitle: React.CSSProperties = {
  color: COLORS.navy,
  fontSize: 30,
  fontWeight: 800,
  marginBottom: 18,
  paddingBottom: 12,
  borderBottom: `2px solid ${COLORS.orangeSoft}`
}

const headerRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
  gap: 10,
  marginBottom: 14,
  padding: '0 6px',
  fontWeight: 600,
  color: COLORS.textHeaderMuted,
  fontSize: 14
}

const row: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
  gap: 10,
  marginBottom: 10,
  padding: 12,
  backgroundColor: COLORS.white,
  border: `1px solid ${COLORS.orangeSoft}`,
  borderRadius: 14,
  alignItems: 'center'
}

const cell: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  backgroundColor: COLORS.white,
  border: `1px solid ${COLORS.orangeSoft}`,
  borderRadius: 10,
  color: COLORS.textPrimary,
  fontSize: 14,
  fontWeight: 500,
  textAlign: 'center',
  outline: 'none'
}

const prevCell: React.CSSProperties = {
  ...cell,
  backgroundColor: COLORS.grayMuted
}

const targetCell: React.CSSProperties = {
  ...cell,
  backgroundColor: COLORS.inputBlue
}

const currentCell: React.CSSProperties = {
  ...cell,
  backgroundColor: COLORS.white
}

const button: React.CSSProperties = {
  backgroundColor: COLORS.orangePrimary,
  border: 'none',
  borderRadius: 10,
  padding: '10px 14px',
  cursor: 'pointer',
  color: COLORS.white,
  fontWeight: 600,
  fontSize: 13
}

const initiativeRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 10,
  marginTop: 10,
  padding: 12,
  backgroundColor: COLORS.orangeTint,
  borderRadius: 12,
  border: `1px solid ${COLORS.orangeSoft}`
}