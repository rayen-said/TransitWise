import React from 'react'
import { Input } from './ui/input'

const Navbar = () => {
  return (
    <div className='flex justify-between items-center min-h-12 w-full px-6'>
        <div className='gap-6 flex items-center'>
            
            <h1 className='text-3xl font-semibold'>TransitWise</h1>
            <Input placeholder='Search for a route' className='w-96' />
        </div>
    </div>
  )
}

export default Navbar