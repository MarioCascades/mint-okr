'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import TopNav from '@/components/TopNav'
import { COLORS } from '@/lib/colors'
type KeyResult = {
  id: string
  title: string
  current_value: number
  target_value: number
  start_value: number
  metric_type: string
  objective_id?: string
  key_result_template_id?: string
}

type Initiative = {
  id: string
  key_result_id: string
  title: string
  owner?: string
  due_date?: string
}

type Objective = {
  id: string
  title: string
  description?: string
  keyResults: KeyResult[]
}

const MARKETING_USER_ID = '564f76fd-a853-4bea-a2f1-a9fb6a75aa00'

const MARKETING_DESCRIPTION =
  'Ensure brand reputatation and experience consistency (across all sources and channels), Marketing strategy incorporates brand awareness and lead generation. New Patient inquiry targets are set and appropriate for hitting TC starts target (based on 70% completed consult to start conversion rate)'

const MIRRORED_KRS = [
  'FD NP Scheduled (GF)',
  'FD NP Scheduled Next Month'
]

const DISPLAY_ONLY_KRS = [
  'MKT Dentist Referrals',
  'MKT Community',
  'MKT Sponsorships',
  'MKT NP Community Referrals',
  'MKT GP Deliveries',
  'MKT Bright Referral'
]

const DELTA_SCORE_KRS = [
  'MKT Sponsorship Dollars',
  'MKT Social Posts'
]


export default function MarketingPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [mirroredAshleyData, setMirroredAshleyData] = useState<KeyResult[]>([])

const showLegacyDigital =
  selectedMonth.getFullYear() < 2026 ||
  (selectedMonth.getFullYear() === 2026 &&
    selectedMonth.getMonth() <= 3)

const formatMonth = (date: Date) => {

    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  const previousMonth = () => {
    const next = new Date(selectedMonth)
    next.setMonth(next.getMonth() - 1)
    setSelectedMonth(next)
  }

  const nextMonth = () => {
    const next = new Date(selectedMonth)
    next.setMonth(next.getMonth() + 1)
    setSelectedMonth(next)
  }

  const calculateScore = (
    kr: KeyResult,
    previousValue?: number
  ) => {
    if (DISPLAY_ONLY_KRS.includes(kr.title)) {
      return '—'
    }

    if (DELTA_SCORE_KRS.includes(kr.title)) {
      if (
        previousValue === undefined ||
        kr.target_value === previousValue
      ) {
        return '—'
      }

      const score =
        ((kr.current_value - previousValue) /
          (kr.target_value - previousValue)) *
        100

      return `${Math.max(0, Math.round(score))}%`
    }

    if (!kr.target_value || kr.target_value === 0) {
      return '—'
    }

    const score =
      (kr.current_value / kr.target_value) * 100

    return `${Math.max(0, Math.round(score))}%`
  }

const canEdit = () => {
  return currentUserId === MARKETING_USER_ID
}
const saveChanges = async () => {
  for (const objective of objectives) {
    for (const kr of objective.keyResults) {
      if (MIRRORED_KRS.includes(kr.title)) {
        continue
      }

      await supabase
        .from('key_results')
        .update({
          current_value: kr.current_value,
          target_value: kr.target_value
        })
        .eq('id', kr.id)
    }
  }

  setIsEditing(false)
}
useEffect(() => {

    const fetchData = async () => {
      setLoading(true)

      const { data: authData } = await supabase.auth.getUser()

      if (!authData.user) {
        router.push('/login')
        return
      }

      setCurrentUserId(authData.user.id)

      const { data: marketingKrs } = await supabase
        .from('key_results')
        .select(`
          *,
          key_result_templates (
            title
          ),
          objectives (
            id,
            title
          )
        `)
        .eq('owner_id', MARKETING_USER_ID)

      const { data: ashleyUser } = await supabase
        .from('users')
        .select('id')
        .eq('full_name', 'Ashley')
        .single()

      let mirroredData: KeyResult[] = []

      if (ashleyUser) {
        const { data: ashleyKrs } = await supabase
          .from('key_results')
          .select(`
            *,
            key_result_templates (
              title
            )
          `)
          .eq('owner_id', ashleyUser.id)

        mirroredData =
          ashleyKrs
            ?.filter((kr: any) =>
              MIRRORED_KRS.includes(
                kr.key_result_templates?.title
              )
            )
            .map((kr: any) => ({
              ...kr,
              title: kr.key_result_templates.title
            })) || []

        setMirroredAshleyData(mirroredData)
      }

      const groupedObjectives: Record<string, Objective> = {}

      marketingKrs?.forEach((kr: any) => {
        const objectiveId = kr.objectives?.id
        const objectiveTitle = kr.objectives?.title

        if (!objectiveId || !objectiveTitle) return

        if (!groupedObjectives[objectiveId]) {
          groupedObjectives[objectiveId] = {
            id: objectiveId,
            title: objectiveTitle,
            keyResults: []
          }
        }

        groupedObjectives[objectiveId].keyResults.push({
          ...kr,
          title: kr.key_result_templates?.title || 'Untitled'
        })
      })

      const builtObjectives = [
        {
          id: 'mirrored',
          title: 'Top of New Patient Funnel',
          keyResults: mirroredData
        },
        ...Object.values(groupedObjectives)
      ]

      setObjectives(
        builtObjectives.filter((obj) => {
          if (
            obj.title === 'Digital Marketing' &&
            !showLegacyDigital
          ) {
            return false
          }

          return true
        })
      )

      setLoading(false)
    }

    fetchData()
  }, [selectedMonth])
    if (loading) {
    return (
      <div style={styles.container}>
        <TopNav />
        <div style={styles.content}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <TopNav />

      <div style={styles.stickyHeader}>
        <div style={styles.title}>Marketing</div>

        <div style={styles.description}>
          {MARKETING_DESCRIPTION}
        </div>

        <div style={styles.topSection}>
          <div style={styles.leftMeta}>
            <div style={styles.monthSelector}>
              <button
                style={styles.arrowButton}
                onClick={previousMonth}
              >
                ←
              </button>

              <div style={styles.monthText}>
                {formatMonth(selectedMonth)}
              </div>

              <button
                style={styles.arrowButton}
                onClick={nextMonth}
              >
                →
              </button>
            </div>
          </div>

          <div style={styles.rightMeta}>
            {canEdit() && (

             <button
  style={styles.editButton}
  onClick={() => {
    if (isEditing) {
      saveChanges()
    } else {
      setIsEditing(true)
    }
  }}
>
  {isEditing ? 'Save Changes' : 'Edit'}
</button>
            )}
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {objectives.map((objective) => (
          <div
            key={objective.id}
            style={styles.objective}
          >
            <div style={styles.objectiveTitle}>
              {objective.title}
            </div>

            {objective.keyResults.map((kr) => (
  <div
    key={kr.id}
    style={{
      padding: 16,
      marginBottom: 12,
      border: `1px solid ${COLORS.orangeSoft}`,
      borderRadius: 12,
      backgroundColor: COLORS.white
    }}
  >
    <div
      style={{
        fontWeight: 700,
        marginBottom: 10
      }}
    >
      {kr.title}
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 12
      }}
    >
      <div>
        <div style={{ fontSize: 12 }}>Current</div>

        {isEditing &&
        !MIRRORED_KRS.includes(kr.title) ? (
          <input
            type="number"
            value={kr.current_value}
            onChange={(e) => {
              setObjectives((prev) =>
                prev.map((obj) => ({
                  ...obj,
                  keyResults: obj.keyResults.map((item) =>
                    item.id === kr.id
                      ? {
                          ...item,
                          current_value:
                            Number(e.target.value)
                        }
                      : item
                  )
                }))
              )
            }}
            style={styles.inputSmall}
          />
        ) : (
          <div>{kr.current_value}</div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 12 }}>Target</div>

        {isEditing &&
        !DISPLAY_ONLY_KRS.includes(kr.title) &&
        !MIRRORED_KRS.includes(kr.title) ? (
          <input
            type="number"
            value={kr.target_value}
            onChange={(e) => {
              setObjectives((prev) =>
                prev.map((obj) => ({
                  ...obj,
                  keyResults: obj.keyResults.map((item) =>
                    item.id === kr.id
                      ? {
                          ...item,
                          target_value:
                            Number(e.target.value)
                        }
                      : item
                  )
                }))
              )
            }}
            style={styles.inputSmall}
          />
        ) : (
          <div>{kr.target_value || '—'}</div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 12 }}>Score</div>
        <div>{calculateScore(kr)}</div>
      </div>
    </div>
  </div>
))}
          </div>
        ))}
      </div>
    </div>
  )
}
const styles = {
  container: {
    backgroundColor: COLORS.grayAppBackground,
    minHeight: '100vh',
    color: COLORS.navy
  },

  stickyHeader: {
    position: 'sticky' as const,
    top: 60,
    zIndex: 10,
    background: `linear-gradient(90deg, ${COLORS.orangePrimary} 0%, ${COLORS.orangeSoft} 100%)`,
    padding: 24,
    borderBottom: `1px solid ${COLORS.orangeSoft}`,
    borderRadius: 16,
    margin: 16,
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
  },

  content: {
    padding: 20,
    overflowX: 'auto' as const
  },

  title: {
    fontSize: 38,
    fontWeight: 700,
    color: COLORS.white,
    marginBottom: 8
  },

  description: {
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 24,
    maxWidth: 900,
    lineHeight: 1.5
  },

  topSection: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 24,
    alignItems: 'flex-start'
  },

  leftMeta: {
    display: 'flex',
    flexDirection: 'row' as const,
    gap: 16,
    flexWrap: 'wrap' as const,
    alignItems: 'flex-end'
  },

  rightMeta: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 14,
    alignItems: 'stretch',
    minWidth: 220
  },

  metaItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 220
  },

  label: {
    fontSize: 13,
    fontWeight: 600,
    color: COLORS.white,
    marginBottom: 6
  },

  inputSmall: {
    height: 44,
    padding: '10px 14px',
    borderRadius: 10,
    border: `1px solid ${COLORS.orangeSoft}`,
    backgroundColor: COLORS.white,
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: 500
  },

  monthSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.orangeSoft
  },

  arrowButton: {
    backgroundColor: COLORS.navy,
    border: 'none',
    padding: '10px 14px',
    borderRadius: 8,
    color: COLORS.white,
    cursor: 'pointer'
  },

  editButton: {
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
  },

  monthText: {
    fontSize: 18,
    fontWeight: 700,
    color: COLORS.navy,
    minWidth: 120,
    textAlign: 'center' as const
  },

  objective: {
    marginBottom: 32,
    backgroundColor: COLORS.white,
    border: `2px solid ${COLORS.orangeSoft}`,
    borderRadius: 18,
    padding: 24,
    boxShadow: '0 10px 24px rgba(0,0,0,0.06)'
  },

  objectiveTitle: {
    color: COLORS.navy,
    fontSize: 30,
    fontWeight: 800,
    marginBottom: 18,
    paddingBottom: 12,
    borderBottom: `2px solid ${COLORS.orangeSoft}`
  }
}