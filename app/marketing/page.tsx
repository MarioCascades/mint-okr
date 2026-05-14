'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'

type KRRow = {
  id: string
  label: string
  previous: string
  target: string
  current: string
  score: string
  editable?: boolean
  mirrored?: boolean
  displayOnly?: boolean
}

type Objective = {
  id: string
  title: string
  rows: KRRow[]
}

const MARKETING_DESCRIPTION =
  'Marketing performance tracking and OKR visibility across referral growth, community engagement, and digital performance.'

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
    (selectedMonth.getFullYear() === now.getFullYear() &&
      selectedMonth.getMonth() > now.getMonth())
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
    (selectedMonth.getFullYear() === 2026 && selectedMonth.getMonth() <= 3)
  )
}

function ScoreBadge({ score }: { score: string }) {
  let background = '#fee2e2'
  let color = '#b91c1c'

  if (score === '—') {
    background = '#f1f5f9'
    color = '#64748b'
  } else if (score.startsWith('10') || score === '100%') {
    background = '#dcfce7'
    color = '#166534'
  } else if (score.startsWith('9')) {
    background = '#fef3c7'
    color = '#92400e'
  }

  return (
    <div
      style={{
        backgroundColor: background,
        color,
        borderRadius: '12px',
        padding: '10px',
        textAlign: 'center',
        fontWeight: 700,
      }}
    >
      {score}
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px',
  },
  stickyHeader: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
    backgroundColor: '#f8fafc',
    paddingBottom: '20px',
  },
  topSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '8px',
  },
  description: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '16px',
  },
  metaRow: {
    display: 'flex',
    gap: '24px',
    color: '#475569',
    fontSize: '14px',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
  },
  backButton: {
    padding: '10px 18px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  editButton: {
    padding: '10px 18px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#f97316',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
  },
  monthSelector: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '32px',
  },
  arrowButton: {
    fontSize: '28px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
  objective: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    marginBottom: '28px',
  },
  objectiveTitle: {
    fontSize: '22px',
    fontWeight: 700,
    marginBottom: '18px',
    color: '#1e293b',
  },
  headerRow: {
    display: 'grid',
    gridTemplateColumns: '2.4fr 1fr 1fr 1fr 1fr',
    gap: '12px',
    fontSize: '13px',
    fontWeight: 700,
    color: '#64748b',
    marginBottom: '12px',
  },
  krRow: {
    display: 'grid',
    gridTemplateColumns: '2.4fr 1fr 1fr 1fr 1fr',
    gap: '12px',
    alignItems: 'center',
    padding: '12px 0',
    borderTop: '1px solid #f1f5f9',
  },
  valueCell: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '10px',
    textAlign: 'center' as const,
    border: '1px solid #e2e8f0',
  },
  targetCell: {
    backgroundColor: '#dbeafe',
    borderRadius: '12px',
    padding: '10px',
    textAlign: 'center' as const,
    border: '1px solid #bfdbfe',
  },
  inputCell: {
    width: '100%',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    padding: '10px',
    textAlign: 'center' as const,
    fontSize: '14px',
  },
}

export default function MarketingPage() {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [isEditing, setIsEditing] = useState(false)

  const percentIntoPeriod = useMemo(
    () => getPercentIntoPeriod(selectedMonth),
    [selectedMonth]
  )

  const objectives: Objective[] = [
    {
      id: 'obj1',
      title: 'Top of New Patient Funnel',
      rows: [
        { id: '1', label: '# New Patients Scheduled This Month', previous: '0', target: '0', current: '0', score: '0%', mirrored: true },
        { id: '2', label: '# New Patients Scheduled Next Month', previous: '0', target: '0', current: '0', score: '0%', mirrored: true },
      ],
    },
    {
      id: 'obj2',
      title: 'Understanding Referral Mix',
      rows: [
        { id: '3', label: 'MKT Dentist Referrals', previous: '0', target: '0', current: '0', score: '—' },
        { id: '4', label: 'MKT Referring Dentists', previous: '0', target: '15', current: '0', score: '0%' },
        { id: '5', label: 'MKT Patient Referrals', previous: '0', target: '15', current: '0', score: '0%' },
        { id: '6', label: 'MKT Digital Marketing', previous: '0', target: '25', current: '0', score: '0%' },
        { id: '7', label: 'MKT Community', previous: '0', target: '0', current: '0', score: '—' },
      ],
    },
    {
      id: 'obj3',
      title: 'Community',
      rows: [
        { id: '8', label: 'MKT Sponsorships', previous: '0', target: '0', current: '0', score: '—' },
        { id: '9', label: 'MKT Sponsorship Dollars', previous: '$0', target: '$10,000', current: '$0', score: '0%' },
        { id: '10', label: 'MKT Community Events', previous: '0', target: '1', current: '0', score: '0%' },
        { id: '11', label: 'MKT NP Community Referrals', previous: '0', target: '0', current: '0', score: '—' },
        { id: '12', label: 'MKT GP Deliveries', previous: '0', target: '0', current: '0', score: '—' },
      ],
    },
  ]

  if (showLegacyDigital(selectedMonth)) {
    objectives.push({
      id: 'obj4',
      title: 'Digital Marketing',
      rows: [
        { id: '13', label: 'MKT Social Posts', previous: '0', target: '8', current: '0', score: '0%' },
        { id: '14', label: 'MKT Google Reviews', previous: '0', target: '10', current: '0', score: '0%' },
        { id: '15', label: 'MKT Bright Referral', previous: '0', target: '0', current: '0', score: '—' },
      ],
    })
  }

  return (
    <div style={styles.container}>
      <TopNav />
      <div style={styles.content}>
        <div style={styles.stickyHeader}>
          <div style={styles.topSection}>
            <div>
              <h1 style={styles.title}>Marketing</h1>
              <p style={styles.description}>{MARKETING_DESCRIPTION}</p>
              <div style={styles.metaRow}>
                <span>% Into Period: {percentIntoPeriod}%</span>
                <span>Date Updated: --</span>
              </div>
            </div>

            <div style={styles.buttonRow}>
              <button style={styles.backButton} onClick={() => router.push('/')}>
                Back to Main
              </button>
              <button style={styles.editButton} onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>

          <div style={styles.monthSelector}>
            <button
              style={styles.arrowButton}
              onClick={() => setSelectedMonth(changeMonth(selectedMonth, -1))}
            >
              ←
            </button>
            <div>{formatMonth(selectedMonth)}</div>
            <button
              style={styles.arrowButton}
              disabled={isFutureMonth(changeMonth(selectedMonth, 1))}
              onClick={() => setSelectedMonth(changeMonth(selectedMonth, 1))}
            >
              →
            </button>
          </div>
        </div>

        {objectives.map((obj) => (
          <div key={obj.id} style={styles.objective}>
            <div style={styles.objectiveTitle}>{obj.title}</div>
            <div style={styles.headerRow}>
              <div>Key Results</div>
              <div>Last Month</div>
              <div>Target</div>
              <div>This Month</div>
              <div>Score</div>
            </div>
            {obj.rows.map((row) => {
              const locked = row.mirrored || row.displayOnly

              return (
                <div key={row.id} style={styles.krRow}>
                  <div style={{ fontWeight: 500 }}>{row.label}</div>
                  <div style={styles.valueCell}>{row.previous}</div>
                  <div style={styles.targetCell}>{row.target}</div>
                  <div>
                    <input
                      value={row.current}
                      readOnly={!isEditing || locked}
                      style={{
                        ...styles.inputCell,
                        backgroundColor:
                          !isEditing || locked ? '#f8fafc' : '#ffffff',
                        color: !isEditing || locked ? '#64748b' : '#0f172a',
                      }}
                    />
                  </div>
                  <ScoreBadge score={row.score} />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
