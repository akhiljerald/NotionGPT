import { Button } from '@mui/material'
import React from 'react'

export default function CustomButton({ ButtonName, onclickfunction }) {
  return (
    <>
      <Button
        variant="outlined"
        onClick={onclickfunction}
      >
        {ButtonName}
      </Button>
    </>
  )
}
