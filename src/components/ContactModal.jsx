import { useState } from 'react'
import Card from './UI/Card'
import Input from './UI/Input'
import Button from './UI/Button'

export default function ContactModal({ show, onClose, onSubmit }) {
  const [phone, setPhone] = useState('')
  const [facebook, setFacebook] = useState('')

  const handleSend = () => {
    if (!phone && !facebook) {
      alert('Provide at least one contact method.')
      return
    }
    onSubmit({ phone, facebook })
    setPhone('')
    setFacebook('')
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <h3 className="text-xl font-bold mb-4 text-center">Contact Seller</h3>

        <Input
          type="text"
          placeholder="Your Phone Number (optional)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Your Facebook Username (optional)"
          value={facebook}
          onChange={e => setFacebook(e.target.value)}
        />

        <div className="flex justify-between mt-4">
          <Button color="red" onClick={onClose}>Cancel</Button>
          <Button color="green" onClick={handleSend}>Send Contact</Button>
        </div>
      </Card>
    </div>
  )
}