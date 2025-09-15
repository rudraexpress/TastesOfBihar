import React from 'react'

export default function SimplePage({ title, children }) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  )
}
