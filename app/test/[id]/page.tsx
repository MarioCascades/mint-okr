
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type OKRData = {
  user_name: string
  objective_title: string
  objective_score: number | null
  key_result_title: string
}

export default function Home() {
  const [data, setData] = useState<OKRData[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data, error } = await supabase
      .from('dashboard_okr_data')
      .select('*')

    if (error) {
      console.error('Error:', error)
    } else {
      setData(data as OKRData[])
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>My OKRs</h1>

      {data.map((item, index) => (
        <div key={index} style={{ marginBottom: '20px' }}>
          <h3>{item.user_name}</h3>
          <p><strong>Objective:</strong> {item.objective_title}</p>
          <p><strong>Score:</strong> {item.objective_score ?? 'N/A'}</p>
          <p><strong>KR:</strong> {item.key_result_title}</p>
        </div>
      ))}
    </div>
  )
}