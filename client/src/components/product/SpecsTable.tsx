'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ProductSpec } from '@/types'

export default function SpecsTable({ specs }: { specs: ProductSpec[] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? specs : specs.slice(0, 6)

  if (!specs.length) return null

  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Specifications</h2>
      <table className="w-full text-sm">
        <tbody>
          {visible.map((spec, i) => (
            <tr key={spec.id} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="py-2 px-3 text-gray-500 font-medium w-40 align-top">{spec.specKey}</td>
              <td className="py-2 px-3 text-gray-800">{spec.specValue}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {specs.length > 6 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-3 text-[#2874f0] text-sm font-medium flex items-center gap-1 hover:underline"
        >
          {expanded ? <><ChevronUp size={16} /> Show Less</> : <><ChevronDown size={16} /> View All {specs.length} Specifications</>}
        </button>
      )}
    </div>
  )
}
