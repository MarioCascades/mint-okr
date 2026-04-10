import { supabase } from '@/lib/supabase'

export async function getKeyResultData({
  keyResultId,
  currentDate,
  baseValue,
}: {
  keyResultId: string
  currentDate: string
  baseValue?: number
}) {
  // 1. current month
  const { data: current } = await supabase
    .from('key_result_updates')
    .select('value, target_value')
    .eq('key_result_id', keyResultId)
    .eq('reporting_month', currentDate)
    .maybeSingle()

  // 2. previous month (latest before current)
  const { data: previous } = await supabase
    .from('key_result_updates')
    .select('target_value')
    .eq('key_result_id', keyResultId)
    .lt('reporting_month', currentDate)
    .order('reporting_month', { ascending: false })
    .limit(1)
    .maybeSingle()

  const value = Number(current?.value ?? baseValue ?? 0)

  const target = Number(
    current?.target_value ??
    previous?.target_value ??
    0
  )

  return {
    value,
    target,
  }
}