import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Card from './UI/Card'
import Button from './UI/Button'
import Input from './UI/Input'

export default function BuySell({ user }) {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageURL, setImageURL] = useState('')
  const [sentRequests, setSentRequests] = useState([])

  const fetchItems = async () => {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('is_sold', false)
      .order('created_at', { ascending: false })

    setItems(data || [])

    // Fetch sent contact requests for the current user
    const { data: requests } = await supabase
      .from('contact_requests')
      .select('item_id')
      .eq('buyer_username', user)

    setSentRequests(requests.map(r => r.item_id))
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handlePostItem = async () => {
    if (!title || !price) {
      alert('Title and Price are required')
      return
    }

    const { error } = await supabase.from('items').insert([{
      seller_username: user,
      title,
      description,
      price,
      image_url: imageURL
    }])

    if (error) {
      alert('Failed to post item')
    } else {
      alert('Item posted!')
      setTitle('')
      setDescription('')
      setPrice('')
      setImageURL('')
      fetchItems()
    }
  }

  const markAsSold = async (item_id) => {
    const { error } = await supabase
      .from('items')
      .update({ is_sold: true })
      .eq('item_id', item_id)

    if (error) {
      alert('Failed to mark as sold')
    } else {
      fetchItems()
    }
  }

  const handleContactSeller = async (item) => {
    // Fetch the buyer's (current user's) contact info
    const { data: userData, error } = await supabase
      .from('users')
      .select('phone_number, facebook_username')
      .eq('username', user)
      .single()

    if (error || !userData) {
      alert('Could not fetch your contact info.')
      return
    }

    const { phone_number, facebook_username } = userData

    if (!phone_number && !facebook_username) {
      alert('You need to have at least a phone number or Facebook username in your profile.')
      return
    }

    // Send contact request
    const { error: insertError } = await supabase.from('contact_requests').insert([{
      item_id: item.item_id,
      seller_username: item.seller_username,
      buyer_username: user
    }])

    if (insertError) {
      alert('Failed to send contact request.')
    } else {
      alert('Your contact info was sent to the seller!')
      setSentRequests(prev => [...prev, item.item_id])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Buy & Sell</h2>

          <h3 className="text-xl font-semibold mb-4 text-gray-700">Post New Item</h3>

          <Input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Price"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Image URL (optional)"
            value={imageURL}
            onChange={e => setImageURL(e.target.value)}
          />
          <Button color="green" onClick={handlePostItem}>Post Item</Button>
        </Card>

        <h3 className="text-2xl font-semibold my-6 text-gray-800">Available Items</h3>

        {items.length === 0 ? (
          <p className="text-center text-gray-500 italic">No items available right now.</p>
        ) : (
          <div className="grid gap-5">
            {items.map(item => (
              <Card key={item.item_id}>
                <h4 className="text-xl font-bold text-blue-700 mb-2">{item.title}</h4>
                {item.image_url && (
                  <img src={item.image_url} alt="Item"
                    className="w-full h-48 object-cover mb-3 rounded-xl shadow"
                  />
                )}
                <p className="mb-2 text-gray-700">{item.description}</p>
                <p className="text-green-600 font-bold mb-1">₹{item.price}</p>
                <p className="text-sm text-gray-500 mb-3">Seller: {item.seller_username}</p>

                {item.seller_username === user ? (
                  <Button color="red" onClick={() => markAsSold(item.item_id)}>Mark as Sold</Button>
                ) : (
                  sentRequests.includes(item.item_id) ? (
                    <p className="text-green-600 font-medium">Contact details sent already</p>
                  ) : (
                    <Button color="blue" onClick={() => handleContactSeller(item)}>Contact Seller</Button>
                  )
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
