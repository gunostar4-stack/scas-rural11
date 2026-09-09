import { useState } from 'react'
import { MapPinned, Plus } from 'lucide-react'
import type { Field } from '../db/schema'
import { getFieldsForFarm, insertField, loadFields } from '../db/storage'

const demoFarmId = 'farm-demo'

export function FieldManager() {
  const [fields, setFields] = useState<Field[]>(() => getFieldsForFarm(demoFarmId))
  const [name, setName] = useState('')
  const [area, setArea] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  function addField(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const areaHectares = Number(area)
    if (!name.trim() || !Number.isFinite(areaHectares) || areaHectares <= 0) {
      setNotice('Enter a field name and an area greater than zero.')
      return
    }
    try {
      const id = `field-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
      const field = insertField({ id, farmId: demoFarmId, name: name.trim(), areaHectares })
      setFields(loadFields().filter((item) => item.farmId === demoFarmId))
      setName('')
      setArea('')
      setNotice(`${field.name} was added to your field register.`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to add field.')
    }
  }

  return <section id="fields" aria-labelledby="fields-title" className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-700">FIELD MANAGER</p><h2 id="fields-title" className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">Your field register</h2><p className="mt-1 text-sm text-stone-600">Add fields before capturing soil observations and crop seasons.</p></div><MapPinned aria-hidden="true" className="size-7 text-emerald-700" /></div>
    <div className="mt-5 overflow-hidden rounded-xl border border-stone-200"><table className="w-full text-left text-sm"><thead className="bg-stone-50 text-stone-600"><tr><th scope="col" className="px-4 py-3 font-semibold">Field</th><th scope="col" className="px-4 py-3 font-semibold">Farm</th><th scope="col" className="px-4 py-3 text-right font-semibold">Area</th></tr></thead><tbody>{fields.length > 0 ? fields.map((field) => <tr key={field.id} className="border-t border-stone-200"><td className="px-4 py-3 font-medium text-stone-900">{field.name}</td><td className="px-4 py-3 text-stone-600">Demo Farm</td><td className="px-4 py-3 text-right text-stone-700">{field.areaHectares} ha</td></tr>) : <tr><td colSpan={3} className="px-4 py-6 text-center text-stone-500">No fields recorded yet.</td></tr>}</tbody></table></div>
    <form onSubmit={addField} className="mt-5 grid gap-3 rounded-xl bg-stone-50 p-4 sm:grid-cols-[1fr_10rem_auto]" aria-label="Add field"><label className="text-sm font-medium text-stone-700">Field name<input value={name} onChange={(event) => setName(event.target.value)} required className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900" /></label><label className="text-sm font-medium text-stone-700">Area (ha)<input value={area} onChange={(event) => setArea(event.target.value)} required min="0.01" step="0.01" type="number" className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900" /></label><button type="submit" className="self-end rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800"><Plus aria-hidden="true" className="mr-1 inline size-4" />Add field</button></form>
    {notice && <p role="status" className="mt-3 text-sm text-emerald-800">{notice}</p>}
  </section>
}
