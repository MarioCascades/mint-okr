'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/TopNav'
import { supabase } from '@/lib/supabase'

type KRRow = {
  id: string
  label: string
  previous: string
  target: string
  current: string
  score: string
  editable: boolean
  mirrored?: boolean
  displayOnly?: boolean
  delta?: boolean
}

type Objective = {
  id: string
  title: string
  rows: KRRow[]
}

const MARKETING_DESCRIPTION =
  'Marketing performance tracking and OKR visibility across referral growth, community engagement, and digital performance.'

const DISPLAY_ONLY_KRS = new Set([
  'MKT Dentist Referrals',
  'MKT Community',
  'MKT Sponsorships',
  'MKT NP Community Referrals',
  'MKT GP Deliveries',
  'MKT Bright Referral',
])

const DELTA_SCORE_KRS = new Set([
  'MKT Sponsorship Dollars',
  'MKT Social Posts',
])

function formatMonth(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

function getPercentIntoPeriod(selectedMonth: Date) {
  const now = new Date()

  const isCurrentMonth =
    now.getMonth() === selectedMonth.getMonth() &&
    now.getFullYear() === selectedMonth.getFullYear()

  if (!isCurrentMonth) {
    return 100
  }

  const daysInMonth = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    0
  ).getDate()

  return Math.round((now.getDate() / daysInMonth) * 100)
}

function isFutureMonth(selectedMonth: Date) {
  const now = new Date()

  return (
    selectedMonth.getFullYear() > now.getFullYear() ||
    (selectedMonth.getFullYear() === now.getFullYear() &&
      selectedMonth.getMonth() > now.getMonth())
  )
}

function changeMonth(current: Date, offset: number) {
  const next = new Date(current)
  next.setMonth(next.getMonth() + offset)
  return next
}

function showLegacyDigital(selectedMonth: Date) {
  return (
    selectedMonth.getFullYear() < 2026 ||
    (selectedMonth.getFullYear() === 2026 &&
      selectedMonth.getMonth() <= 3)
  )
}

function ScoreBadge({ score }: { score: string }) {
  const numeric = parseInt(score)

  let bg = 'bg-red-100 text-red-700'

  if (score === '—') {
    bg = 'bg-gray-100 text-gray-500'
  } else if (!isNaN(numeric) && numeric >= 100) {
    bg = 'bg-green-100 text-green-700'
  } else if (!isNaN(numeric) && numeric >= 90) {
    bg = 'bg-yellow-100 text-yellow-700'
  }

  return (
    <div
      className={`px-3 py-2 rounded-lg text-sm font-semibold min-w-[70px] text-center ${bg}`}
    >
      {score}
    </div>
  )
}

function KRRowComponent({
  row,
  isEditing,
}: {
  row: KRRow
  isEditing: boolean
}) {
  const locked = !row.editable || row.mirrored || row.displayOnly

  return (
    <div className="grid grid-cols-5 gap-3 items-center py-3 border-b border-gray-100">
      <div className="font-medium text-gray-800">{row.label}</div>

      <div className="bg-gray-100 px-3 py-2 rounded-lg text-center">
        {row.previous}
      </div>

      <div className="bg-blue-100 px-3 py-2 rounded-lg text-center">
        {row.target}
      </div>

      <div>
        <input
          value={row.current}
          disabled={!isEditing || locked}
          readOnly={!isEditing || locked}
          className="w-full border rounded-lg px-3 py-2 text-center disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <ScoreBadge score={row.score} />
    </div>
  )
}

function ObjectiveCard({
  objective,
  isEditing,
}: {
  objective: Objective
  isEditing: boolean
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-5">{objective.title}</h2>

      <div className="grid grid-cols-5 gap-3 mb-3 text-sm font-semibold text-gray-500">
        <div>Key Results</div>
        <div className="text-center">Last Month</div>
        <div className="text-center">Target</div>
        <div className="text-center">This Month</div>
        <div className="text-center">Score</div>
      </div>

      {objective.rows.map((row) => (
        <KRRowComponent
          key={row.id}
          row={row}
          isEditing={isEditing}
        />
      ))}
    </div>
  )
}

export default function MarketingPage() {
  const router = useRouter()

  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [isEditing, setIsEditing] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserEmail(user.email ?? null)
    }

    getUser()
  }, [router])

  const percentIntoPeriod = useMemo(
    () => getPercentIntoPeriod(selectedMonth),
    [selectedMonth]
  )

  const objectives: Objective[] = [
    {
      id: 'obj1',
      title: 'Top of New Patient Funnel',
      rows: [
        {
          id: '1',
          label: '# New Patients Scheduled This Month',
          previous: '0',
          target: '0',
          current: '0',
          score: '0%',
          editable: false,
          mirrored: true,
        },
        {
          id: '2',
          label: '# New Patients Scheduled Next Month',
          previous: '0',
          target: '0',
          current: '0',
          score: '0%',
          editable: false,
          mirrored: true,
        },
      ],
    },
    {
      id: 'obj2',
      title: 'Understanding Referral Mix',
      rows: [
        {
          id: '3',
          label: 'MKT Dentist Referrals',
          previous: '0',
          target: '0',
          current: '0',
          score: '—',
          editable: false,
          displayOnly: true,
        },
        {
          id: '4',
          label: 'MKT Referring Dentists',
          previous: '0',
          target: '15',
          current: '0',
          score: '0%',
          editable: true,
        },
        {
          id: '5',
          label: 'MKT Patient Referrals',
          previous: '0',
          target: '15',
          current: '0',
          score: '0%',
          editable: true,
        },
        {
          id: '6',
          label: 'MKT Digital Marketing',
          previous: '0',
          target: '25',
          current: '0',
          score: '0%',
          editable: true,
        },
        {
          id: '7',
          label: 'MKT Community',
          previous: '0',
          target: '0',
          current: '0',
          score: '—',
          editable: false,
          displayOnly: true,
        },
      ],
    },
    {
      id: 'obj3',
      title: 'Community',
      rows: [
        {
          id: '8',
          label: 'MKT Sponsorships',
          previous: '0',
          target: '0',
          current: '0',
          score: '—',
          editable: false,
          displayOnly: true,
        },
        {
          id: '9',
          label: 'MKT Sponsorship Dollars',
          previous: '$0',
          target: '$10,000',
          current: '$0',
          score: '0%',
          editable: true,
          delta: true,
        },
        {
          id: '10',
          label: 'MKT Community Events',
          previous: '0',
          target: '1',
          current: '0',
          score: '0%',
          editable: true,
        },
        {
          id: '11',
          label: 'MKT NP Community Referrals',
          previous: '0',
          target: '0',
          current: '0',
          score: '—',
          editable: false,
          displayOnly: true,
        },
        {
          id: '12',
          label: 'MKT GP Deliveries',
          previous: '0',
          target: '0',
          current: '0',
          score: '—',
          editable: false,
          displayOnly: true,
        },
      ],
    },
  ]

  if (showLegacyDigital(selectedMonth)) {
    objectives.push({
      id: 'obj4',
      title: 'Digital Marketing',
      rows: [
        {
          id: '13',
          label: 'MKT Social Posts',
          previous: '0',
          target: '8',
          current: '0',
          score: '0%',
          editable: true,
          delta: true,
        },
        {
          id: '14',
          label: 'MKT Google Reviews',
          previous: '0',
          target: '10',
          current: '0',
          score: '0%',
          editable: true,
        },
        {
          id: '15',
          label: 'MKT Bright Referral',
          previous: '0',
          target: '0',
          current: '0',
          score: '—',
          editable: false,
          displayOnly: true,
        },
      ],
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Marketing
              </h1>
              <p className="text-gray-600 mt-2">
                {MARKETING_DESCRIPTION}
              </p>

              <div className="flex gap-6 mt-5 text-sm text-gray-600">
                <div>% Into Period: {percentIntoPeriod}%</div>
                <div>Date Updated: --</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
              >
                Back to Main
              </button>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
              >
                {isEditing ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>

          <div className="flex justify-center items-center gap-6 mt-8">
            <button
              onClick={() =>
                setSelectedMonth(changeMonth(selectedMonth, -1))
              }
              className="text-2xl"
            >
              ←
            </button>

            <div className="text-lg font-semibold">
              {formatMonth(selectedMonth)}
            </div>

            <button
              disabled={isFutureMonth(changeMonth(selectedMonth, 1))}
              onClick={() =>
                setSelectedMonth(changeMonth(selectedMonth, 1))
              }
              className="text-2xl disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {objectives.map((objective) => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
              isEditing={isEditing}
            />
          ))}
        </div>
      </main>
    </div>
  )
}