import React from 'react'
import { SpellIdView } from '../../_views/SpellIdView'

const page = ({params}:{params:{spellId:string}}) => {
  return (
  <SpellIdView spellId={params.spellId} />
  )
}

export default page